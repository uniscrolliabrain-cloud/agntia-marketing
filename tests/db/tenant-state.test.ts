import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../apps/api/src/app';
import { createSupabaseJwtVerifier, signTestJwt } from '../../apps/api/src/auth';
import { createPgPrincipalResolver } from '../../apps/api/src/principals';
import { exportTenantState, PgTenantStateStore } from '../../apps/api/src/state';
import type { AdapterRegistry } from '@agntia/adapters';
import { createStore } from '@agntia/core';
import { applyMigrations, DATABASE_URL, withSuperuser } from '../support/db';
import { AUD, ISS, makeHarness, SECRET, setupApprovedCampaign, TENANT_A, TENANT_B } from '../support/harness';

/**
 * MKT-C06 · El estado del tenant sobrevive al proceso.
 *
 * El dominio sigue siendo síncrono y en memoria; lo que se prueba aquí es que el
 * documento de `tenant_state` es la verdad: la app arranca con un store **vacío**
 * y aun así lee la campaña, la aprueba, la compromete, la entrega y, en un
 * proceso nuevo, la sigue viendo con sus receipts.
 *
 * Sin `DATABASE_URL` la suite se SALTA: no hay PASS falso.
 */
const suite = DATABASE_URL ? describe : describe.skip;
const CLOCK = '2026-11-14T10:00:00Z';

type Json = Record<string, any>;

let pool: pg.Pool;
let fixture: Awaited<ReturnType<typeof makeHarness>>;
let campaignId: string;
let approvalRef: string;
let token: string;
let otherToken: string;

let pool2: pg.Pool;

function buildApp(pool: pg.Pool, registry: AdapterRegistry) {
  const ctx = createStore(() => new Date(CLOCK));
  return createApp({
    ctx,
    registry,
    verifier: createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET }),
    principals: createPgPrincipalResolver(pool),
    state: new PgTenantStateStore(pool, ctx),
  });
}

async function call(app: ReturnType<typeof createApp>, method: 'GET' | 'POST', path: string, bearer: string, body?: unknown) {
  const res = await app.request(path, {
    method,
    headers: {
      authorization: `Bearer ${bearer}`,
      'content-type': 'application/json',
      'idempotency-key': `idem-${Math.random().toString(36).slice(2, 12)}`,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: res.status, json: (await res.json()) as Json };
}

suite('MKT-C06 · estado del tenant durable sobre Postgres real', () => {
  beforeAll(async () => {
    await applyMigrations(DATABASE_URL!);
    await withSuperuser(DATABASE_URL!, async (c) => {
      await c.query('delete from tenants where id in ($1, $2)', [TENANT_A, TENANT_B]);
      await c.query(`insert into tenants (id, name, plan) values ($1, 'Tenant A', 'sandbox'), ($2, 'Tenant B', 'sandbox')`, [
        TENANT_A,
        TENANT_B,
      ]);
      await c.query(
        `insert into memberships (tenant_id, actor_id, roles, scopes, is_human)
         values ($1, 'alice', array['owner'], array['marketing.*'], true),
                ($1, 'vic', array['viewer'], array['marketing.*'], true),
                ($2, 'bob', array['owner'], array['marketing.*'], true)`,
        [TENANT_A, TENANT_B],
      );
    });

    // La fixture se construye con el dominio real y el API en memoria; después
    // se persiste tal cual y el resto de la prueba corre contra Postgres con un
    // store vacío.
    fixture = await makeHarness();
    const setup = await setupApprovedCampaign(fixture);
    campaignId = setup.campaignId;
    approvalRef = setup.approvalRef;

    const doc = exportTenantState(fixture.ctx, TENANT_A);
    await withSuperuser(DATABASE_URL!, (c) =>
      c.query(
        `insert into tenant_state (tenant_id, state) values ($1, $2::jsonb)
         on conflict (tenant_id) do update set state = excluded.state, version = tenant_state.version + 1`,
        [TENANT_A, JSON.stringify(doc)],
      ),
    );

    pool = new pg.Pool({ connectionString: DATABASE_URL!, max: 4 });
    pool2 = new pg.Pool({ connectionString: DATABASE_URL!, max: 4 });
    token = await signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub: 'alice', tenantId: TENANT_A });
    otherToken = await signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub: 'bob', tenantId: TENANT_B });
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await pool2?.end();
    await withSuperuser(DATABASE_URL!, (c) => c.query('delete from tenants where id in ($1, $2)', [TENANT_A, TENANT_B]));
  });

  it('una app con el store vacío lee la campaña del documento de Postgres', async () => {
    const app = buildApp(pool, fixture.registry);
    const res = await call(app, 'GET', `/v1/marketing/campaigns/${campaignId}`, token);
    expect(res.status).toBe(200);
    expect(res.json).toMatchObject({ id: campaignId, state: 'approved', tenantId: TENANT_A });
  }, 30_000);

  it('commit y entrega escriben en el documento y sobreviven a un proceso nuevo', async () => {
    const app = buildApp(pool, fixture.registry);

    const commit = await call(app, 'POST', `/v1/marketing/campaigns/${campaignId}/commit`, token, { approvalRef });
    expect(commit.status).toBe(200);
    expect(commit.json.payload.queued).toBeGreaterThan(0);

    const deliver = await call(app, 'POST', '/v1/marketing/internal/deliver', token, {
      workerId: 'worker_test',
      limit: 10,
      provider: 'email_sandbox',
    });
    expect(deliver.status).toBe(200);
    const outcomes = deliver.json.payload as Array<{ state: string }>;
    expect(outcomes.length).toBeGreaterThan(0);
    expect(outcomes.every((o) => o.state === 'confirmed')).toBe(true);

    const delivered = await call(app, 'GET', `/v1/marketing/campaigns/${campaignId}/delivery`, token);
    expect(delivered.status).toBe(200);
    expect(delivered.json.counts.confirmed).toBe(outcomes.length);
    expect(delivered.json.total).toBe(commit.json.payload.queued);

    // Proceso nuevo: store vacío, pool nuevo, misma base.
    const restarted = buildApp(pool2, fixture.registry);
    const campaign = await call(restarted, 'GET', `/v1/marketing/campaigns/${campaignId}`, token);
    expect(campaign.status).toBe(200);
    expect(['sending', 'sent', 'reconciled']).toContain(campaign.json.state);

    const afterRestart = await call(restarted, 'GET', `/v1/marketing/campaigns/${campaignId}/delivery`, token);
    expect(afterRestart.json.counts.confirmed).toBe(outcomes.length);
    expect(afterRestart.json.reconciliationRequired).toEqual([]);
  }, 60_000);

  it('cada escritura sube la versión exactamente una vez y el estado no se lee desde otro tenant', async () => {
    const version = async () =>
      Number(
        (
          await withSuperuser(DATABASE_URL!, (c) =>
            c.query<{ version: string }>('select version from tenant_state where tenant_id = $1', [TENANT_A]),
          )
        ).rows[0]!.version,
      );

    const app = buildApp(pool, fixture.registry);
    const before = await version();
    const brief = await call(app, 'POST', '/v1/marketing/briefs', token, {
      title: 'Brief posterior al reinicio',
      objective: 'Comprobar que una escritura nueva sube la versión',
      hypothesis: 'La versión sube de uno en uno',
      offer: 'Diagnóstico',
      declaredAudience: 'Contactos con consentimiento',
      channels: ['email'],
      successDefinition: 'Una escritura',
      window: { from: '2026-11-15T00:00:00Z', to: '2026-11-30T00:00:00Z' },
      budget: { amount: '100.00', currency: 'EUR' },
      constraints: [],
      sources: [{ label: 'interno', ref: 'docs/09-medicion-y-evaluacion.md' }],
    });
    expect(brief.status).toBe(200);
    expect(await version()).toBe(before + 1);

    const foreign = await call(app, 'GET', `/v1/marketing/campaigns/${campaignId}`, otherToken);
    expect(foreign.status).toBe(404);
    expect(foreign.json.error.detail).toBe('campaign_not_found');
  }, 30_000);

  it('un efecto rechazado no toca el documento', async () => {
    const app = buildApp(pool, fixture.registry);
    const before = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ version: string; state: Json }>('select version, state from tenant_state where tenant_id = $1', [TENANT_A]),
    );

    const replay = await call(app, 'POST', `/v1/marketing/campaigns/${campaignId}/commit`, token, {
      approvalRef: 'apv_inventada',
    });
    expect(replay.status).toBe(409);

    const after = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ version: string }>('select version from tenant_state where tenant_id = $1', [TENANT_A]),
    );
    expect(Number(after.rows[0]!.version)).toBe(Number(before.rows[0]!.version));
  }, 30_000);
});
