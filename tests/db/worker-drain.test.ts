import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../apps/api/src/app';
import { createSupabaseJwtVerifier, signTestJwt } from '../../apps/api/src/auth';
import { createPgPrincipalResolver } from '../../apps/api/src/principals';
import { exportTenantState, PgTenantStateStore } from '../../apps/api/src/state';
import { drainOnce, runWorkerLoop, type WorkerConfig } from '../../apps/worker/src/client';
import { createStore } from '@agntia/core';
import { applyMigrations, DATABASE_URL, withSuperuser } from '../support/db';
import { AUD, ISS, makeHarness, SECRET, setupApprovedCampaign, TENANT_A, TENANT_B } from '../support/harness';

/**
 * MKT-C22 · El worker de outbox como proceso real sobre Postgres.
 *
 * Cada «worker» es una app con su propio pool y su propio store: lo más parecido
 * a dos procesos sin levantar dos procesos. Reclaman por la misma ruta interna
 * del API, que corre el dominio dentro del cerrojo del tenant y escribe el
 * resultado en `tenant_state`.
 *
 * Sin `DATABASE_URL` la suite se SALTA: no hay PASS falso.
 */
const suite = DATABASE_URL ? describe : describe.skip;
const CLOCK = '2026-11-14T10:00:00Z';

type Json = Record<string, any>;

let poolA: pg.Pool;
let poolB: pg.Pool;
let fixture: Awaited<ReturnType<typeof makeHarness>>;
let campaignId: string;
let approvalRef: string;
let queued = 0;
let aliceToken = '';
let workerToken = '';

function buildWorker(pool: pg.Pool) {
  const ctx = createStore(() => new Date(CLOCK));
  const app = createApp({
    ctx,
    registry: fixture.registry,
    verifier: createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET }),
    principals: createPgPrincipalResolver(pool),
    state: new PgTenantStateStore(pool, ctx),
  });
  // El worker habla HTTP; en la prueba el «transporte» es la propia app.
  const asFetch = async (url: string, init: RequestInit) => {
    const parsed = new URL(url);
    return app.request(`${parsed.pathname}${parsed.search}`, init);
  };
  return { app, asFetch };
}

async function post(app: ReturnType<typeof createApp>, path: string, bearer: string, body: unknown) {
  const res = await app.request(path, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${bearer}`,
      'content-type': 'application/json',
      'idempotency-key': `idem-${Math.random().toString(36).slice(2, 12)}`,
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as Json };
}

function workerConfig(workerId: string): WorkerConfig {
  return { apiBaseUrl: 'http://api.test', token: workerToken, workerId };
}

/** Harness con el API durable: preparar por HTTP escribe en `tenant_state`. */
function durableHarness() {
  const worker = buildWorker(poolA);
  return { ...fixture, app: worker.app };
}

suite('MKT-C22 · worker de outbox sobre Postgres real', () => {
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
                ($1, 'worker_int', array['worker'], array['marketing.*'], false)`,
        [TENANT_A],
      );
      // Tenant B tiene su propio owner: existe, pero sin trabajo de este tenant.
      await c.query(`insert into memberships (tenant_id, actor_id, roles, scopes, is_human) values ($1, 'bob', array['owner'], array['marketing.*'], true)`, [
        TENANT_B,
      ]);
    });

    // Contactos y política salen del dominio real; el agregado se persiste tal
    // cual y a partir de ahí todo pasa por `tenant_state`.
    fixture = await makeHarness();
    const setup = await setupApprovedCampaign(fixture);
    campaignId = setup.campaignId;
    approvalRef = setup.approvalRef;
    await withSuperuser(DATABASE_URL!, (c) =>
      c.query(`insert into tenant_state (tenant_id, state) values ($1, $2::jsonb)`, [
        TENANT_A,
        JSON.stringify(exportTenantState(fixture.ctx, TENANT_A)),
      ]),
    );

    poolA = new pg.Pool({ connectionString: DATABASE_URL!, max: 4 });
    poolB = new pg.Pool({ connectionString: DATABASE_URL!, max: 4 });

    aliceToken = await signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub: 'alice', tenantId: TENANT_A });
    workerToken = await signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub: 'worker_int', tenantId: TENANT_A });

    const seed = buildWorker(poolA);
    const commit = await post(seed.app, `/v1/marketing/campaigns/${campaignId}/commit`, aliceToken, { approvalRef });
    expect(commit.status).toBe(200);
    queued = commit.json.payload.queued as number;
    expect(queued).toBeGreaterThan(0);
  }, 60_000);

  afterAll(async () => {
    await poolA?.end();
    await poolB?.end();
    await withSuperuser(DATABASE_URL!, (c) => c.query('delete from tenants where id in ($1, $2)', [TENANT_A, TENANT_B]));
  });

  it('dos workers contra el mismo tenant no entregan el mismo intent dos veces', async () => {
    const first = buildWorker(poolA);
    const second = buildWorker(poolB);

    const [a, b] = await Promise.all([
      drainOnce(workerConfig('worker_a'), { fetch: first.asFetch }),
      drainOnce(workerConfig('worker_b'), { fetch: second.asFetch }),
    ]);

    // El cerrojo por tenant serializa: entre los dos reclaman el trabajo una vez.
    expect(a.leased + b.leased).toBe(queued);
    expect(a.confirmed + b.confirmed).toBe(queued);
    expect(a.unknown + b.unknown).toBe(0);
    expect(a.failed + b.failed).toBe(0);

    const state = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ doc: Json }>('select state as doc from tenant_state where tenant_id = $1', [TENANT_A]),
    );
    const doc = state.rows[0]!.doc as Json;
    const intents = (doc.intents as Array<{ id: string; state: string; campaignId: string }>).filter((i) => i.campaignId === campaignId);
    const receipts = (doc.receipts as Array<{ intentId: string }>).filter((r) => intents.some((i) => i.id === r.intentId));

    expect(intents).toHaveLength(queued);
    expect(intents.every((i) => i.state === 'confirmed')).toBe(true);
    // Un receipt por intent: ni doble envío ni entrega perdida.
    expect(receipts).toHaveLength(queued);
    expect(new Set(receipts.map((r) => r.intentId)).size).toBe(queued);
  }, 60_000);

  it('un worker que vuelve a reclamar después no repite el trabajo ya confirmado', async () => {
    const again = buildWorker(poolA);
    const idle = await drainOnce(workerConfig('worker_a'), { fetch: again.asFetch });
    expect(idle.leased).toBe(0);
  }, 30_000);

  it('el bucle del worker vacía la cola y para por falta de trabajo', async () => {
    // Campaña nueva preparada y confirmada por HTTP: todo escribe en el documento.
    const harness = durableHarness();
    const setup = await setupApprovedCampaign(harness);
    const commit = await post(harness.app, `/v1/marketing/campaigns/${setup.campaignId}/commit`, aliceToken, {
      approvalRef: setup.approvalRef,
    });
    expect(commit.status).toBe(200);
    const newQueued = commit.json.payload.queued as number;
    expect(newQueued).toBeGreaterThan(0);

    const worker = buildWorker(poolA);
    const report = await runWorkerLoop(workerConfig('worker_loop'), {
      fetch: worker.asFetch,
      idleRoundsToStop: 2,
      intervalMs: 1,
      sleep: async () => undefined,
    });

    expect(report).toMatchObject({ stopReason: 'idle', confirmed: newQueued, unknown: 0, failed: 0, requeued: 0 });
    expect(report.drained).toBe(newQueued);
  }, 60_000);

  it('un actor sin membership no entrega, y otro tenant no ve este trabajo', async () => {
    const foreign = buildWorker(poolB);

    const otherTenant = await signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub: 'bob', tenantId: TENANT_B });
    const result = await drainOnce({ apiBaseUrl: 'http://api.test', token: otherTenant, workerId: 'worker_x' }, {
      fetch: foreign.asFetch,
    });
    // Tenant B existe y no tiene trabajo: cero, no un error.
    expect(result.leased).toBe(0);

    // Sin membership en el tenant el borde responde 403, no 401: el token es
    // válido y el tenant existe; lo que falta es la autorización.
    const ghost = await signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub: 'nobody', tenantId: TENANT_A });
    await expect(
      drainOnce({ apiBaseUrl: 'http://api.test', token: ghost, workerId: 'worker_x' }, { fetch: foreign.asFetch }),
    ).rejects.toMatchObject({ status: 403, detail: 'no_membership' });
  }, 30_000);
});
