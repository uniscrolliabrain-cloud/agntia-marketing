import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createRegistry } from '@agntia/adapters';
import { createStore } from '@agntia/core';
import { PgAdminService } from '../../apps/api/src/admin';
import { createApp } from '../../apps/api/src/app';
import { createSupabaseJwtVerifier, signTestJwt } from '../../apps/api/src/auth';
import { applyMigrations, DATABASE_URL, withSuperuser } from '../support/db';

/**
 * MKT-C06-G03 · Endpoint administrativo del API contra Postgres real.
 *
 * El flujo SQL de `0006` ya estaba probado; lo que faltaba era la vía del API.
 * Estas pruebas ejercen la ruta HTTP completa (JWT verificado → principal →
 * capability → `marketing_admin` → `admin_actions` → efecto) sobre una base
 * Postgres 16. Sin `DATABASE_URL` la suite se SALTA: no hay PASS falso.
 */
const suite = DATABASE_URL ? describe : describe.skip;
const RUN = `it_${Date.now().toString(36)}`;
const T = `tenant_admin_${RUN}`;
const OTHER = `tenant_admin_other_${RUN}`;
const ISS = 'https://test.supabase.co/auth/v1';
const AUD = 'authenticated';
const SECRET = 'test-secret-0123456789abcdef0123456789';

type Json = Record<string, any>;

let pool: pg.Pool;
let app: ReturnType<typeof createApp>;
let tokens: { owner: string; operator: string; viewer: string; bot: string; otherOwner: string };

async function post(token: string, body: unknown, idempotencyKey: string): Promise<{ status: number; json: Json }> {
  const res = await app.request('/v1/marketing/admin/actions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': idempotencyKey,
      'x-correlation-id': 'corr_admin',
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as Json };
}

async function seedAudit(tenantId: string, action: string, daysAgo: number): Promise<void> {
  await withSuperuser(DATABASE_URL!, (c) =>
    c.query(
      `insert into audit_log (tenant_id, actor_id, action, detail, at)
       values ($1, 'seed', $2, 'fila de prueba', now() - make_interval(days => $3::int))`,
      [tenantId, action, daysAgo],
    ),
  );
}

async function countAudit(tenantId: string, action: string): Promise<number> {
  const res = await withSuperuser(DATABASE_URL!, (c) =>
    c.query<{ n: number }>(`select count(*)::int as n from audit_log where tenant_id = $1 and action = $2`, [tenantId, action]),
  );
  return res.rows[0]!.n;
}

suite('MKT-C06-G03 · endpoint administrativo sobre Postgres real', () => {
  beforeAll(async () => {
    await applyMigrations(DATABASE_URL!);
    await withSuperuser(DATABASE_URL!, async (c) => {
      await c.query('delete from tenants where id in ($1, $2)', [T, OTHER]);
      await c.query(`insert into tenants (id, name, plan) values ($1, 'Admin', 'sandbox'), ($2, 'Otra', 'sandbox')`, [T, OTHER]);
      await c.query(
        `insert into memberships (tenant_id, actor_id, roles, scopes, is_human)
         values ($1, 'owner_1', array['owner'], array['marketing.*'], true),
                ($1, 'operator_1', array['operator'], array['marketing.*'], true),
                ($1, 'viewer_1', array['viewer'], array['marketing.*'], true),
                ($1, 'bot_1', array['owner'], array['marketing.*'], false),
                ($2, 'other_owner', array['owner'], array['marketing.*'], true)`,
        [T, OTHER],
      );
    });

    const ctx = createStore();
    for (const [id, name] of [
      [T, 'Admin'],
      [OTHER, 'Otra'],
    ] as const) {
      ctx.store.tenants.set(id, { id, name, plan: 'sandbox', createdAt: new Date('2026-11-01T00:00:00Z').toISOString() });
    }
    ctx.store.memberships.push(
      { tenantId: T, actorId: 'owner_1', roles: ['owner'], scopes: ['marketing.*'], isHuman: true },
      { tenantId: T, actorId: 'operator_1', roles: ['operator'], scopes: ['marketing.*'], isHuman: true },
      { tenantId: T, actorId: 'viewer_1', roles: ['viewer'], scopes: ['marketing.*'], isHuman: true },
      { tenantId: T, actorId: 'bot_1', roles: ['owner'], scopes: ['marketing.*'], isHuman: false },
      { tenantId: OTHER, actorId: 'other_owner', roles: ['owner'], scopes: ['marketing.*'], isHuman: true },
    );

    pool = new pg.Pool({ connectionString: DATABASE_URL!, max: 4 });
    app = createApp({
      ctx,
      registry: createRegistry(),
      verifier: createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET }),
      admin: new PgAdminService(pool),
    });

    const token = (sub: string, tenantId: string) => signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub, tenantId });
    tokens = {
      owner: await token('owner_1', T),
      operator: await token('operator_1', T),
      viewer: await token('viewer_1', T),
      bot: await token('bot_1', T),
      otherOwner: await token('other_owner', OTHER),
    };
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await withSuperuser(DATABASE_URL!, (c) => c.query('delete from tenants where id in ($1, $2)', [T, OTHER]));
  });

  it('purga sólo lo vencido del propio tenant y deja el registro con el actor verificado', async () => {
    const old = `purge_target_${RUN}`;
    const recent = `purge_recent_${RUN}`;
    const foreign = `other_target_${RUN}`;
    await seedAudit(T, old, 400);
    await seedAudit(T, recent, 0);
    await seedAudit(OTHER, foreign, 400);

    const res = await post(tokens.owner, { kind: 'audit.purge', ticket: `CHG-${RUN}-1`, retentionDays: 365 }, `idem-${RUN}-purge`);

    expect(res.status).toBe(200);
    expect(res.json.payload).toMatchObject({ action: 'audit.purge', replayed: false });
    expect(res.json.payload.affected).toBeGreaterThanOrEqual(1);
    expect(res.json.actualScope).toMatchObject({ tenantId: T, capability: 'marketing.tenant.admin' });

    expect(await countAudit(T, old)).toBe(0);
    expect(await countAudit(T, recent)).toBe(1);
    // El tenant vecino no se toca: la sesión fija app.tenant_id y RLS se aplica
    // incluso siendo `marketing_admin` (no tiene BYPASSRLS).
    expect(await countAudit(OTHER, foreign)).toBe(1);

    const actions = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ actor_id: string; ticket: string; action: string }>(
        `select actor_id, ticket, action from admin_actions where tenant_id = $1 and ticket = $2`,
        [T, `CHG-${RUN}-1`],
      ),
    );
    expect(actions.rows).toEqual([{ actor_id: 'owner_1', ticket: `CHG-${RUN}-1`, action: 'audit.purge' }]);
  }, 30_000);

  it('cambia membresía y plan por la vía registrada', async () => {
    const membership = await post(
      tokens.owner,
      {
        kind: 'membership.upsert',
        ticket: `CHG-${RUN}-2`,
        membership: { actorId: 'adm_target', roles: ['reviewer'], scopes: ['marketing.context.read'], isHuman: true },
      },
      `idem-${RUN}-member`,
    );
    expect(membership.status).toBe(200);
    expect(membership.json.payload).toMatchObject({ action: 'membership.upsert', affected: 1 });

    const plan = await post(
      tokens.owner,
      { kind: 'tenant.set-plan', ticket: `CHG-${RUN}-3`, plan: 'pilot', name: 'Admin pilot' },
      `idem-${RUN}-plan`,
    );
    expect(plan.status).toBe(200);
    expect(plan.json.payload).toMatchObject({ action: 'tenant.plan_change', affected: 1 });

    const state = await withSuperuser(DATABASE_URL!, async (c) => {
      const m = await c.query<{ roles: string[]; scopes: string[] }>(
        `select roles, scopes from memberships where tenant_id = $1 and actor_id = 'adm_target'`,
        [T],
      );
      const t = await c.query<{ plan: string; name: string }>(`select plan, name from tenants where id = $1`, [T]);
      return { m: m.rows[0], t: t.rows[0] };
    });
    expect(state.m).toEqual({ roles: ['reviewer'], scopes: ['marketing.context.read'] });
    expect(state.t).toEqual({ plan: 'pilot', name: 'Admin pilot' });
  }, 30_000);

  it('rechaza a quien no es owner humano y no escribe nada', async () => {
    const body = { kind: 'tenant.set-plan', ticket: `CHG-${RUN}-denied`, plan: 'production' };

    const operator = await post(tokens.operator, body, `idem-${RUN}-op`);
    expect(operator.status).toBe(403);
    expect(operator.json.error.detail).toBe('role_not_allowed');

    const viewer = await post(tokens.viewer, body, `idem-${RUN}-viewer`);
    expect(viewer.status).toBe(403);
    expect(viewer.json.error.detail).toBe('role_not_allowed');

    const bot = await post(tokens.bot, body, `idem-${RUN}-bot`);
    expect(bot.status).toBe(403);
    expect(bot.json.error.detail).toBe('effect_requires_human');

    const writes = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ n: number }>(`select count(*)::int as n from admin_actions where tenant_id = $1 and ticket = $2`, [
        T,
        `CHG-${RUN}-denied`,
      ]),
    );
    expect(writes.rows[0]!.n).toBe(0);
    const plan = await withSuperuser(DATABASE_URL!, (c) => c.query<{ plan: string }>(`select plan from tenants where id = $1`, [T]));
    expect(plan.rows[0]!.plan).toBe('pilot');
  }, 30_000);

  it('la misma clave de idempotencia no duplica la acción ni repite el efecto', async () => {
    const target = `replay_target_${RUN}`;
    await seedAudit(T, target, 400);
    const ticket = `CHG-${RUN}-replay`;
    const request = {
      tenantId: T,
      actorId: 'owner_1',
      ticket,
      idempotencyKey: `idem-${RUN}-replay`,
      action: { kind: 'audit.purge' as const, retentionDays: 365 },
    };
    const service = new PgAdminService(pool);

    const first = await service.execute(request);
    expect(first.replayed).toBe(false);
    expect(first.affected).toBeGreaterThanOrEqual(1);
    expect(await countAudit(T, target)).toBe(0);

    const second = await service.execute(request);
    expect(second).toMatchObject({ replayed: true, affected: 0, actionId: first.actionId });

    const rows = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ n: number }>(`select count(*)::int as n from admin_actions where tenant_id = $1 and ticket = $2`, [T, ticket]),
    );
    expect(rows.rows[0]!.n).toBe(1);

    // A nivel HTTP, la repetición devuelve el mismo resultado cacheado y no
    // crea una segunda fila.
    const viaHttp = await post(tokens.owner, { kind: 'audit.purge', ticket: `CHG-${RUN}-http`, retentionDays: 365 }, `idem-${RUN}-http`);
    const again = await post(tokens.owner, { kind: 'audit.purge', ticket: `CHG-${RUN}-http`, retentionDays: 365 }, `idem-${RUN}-http`);
    expect(viaHttp.status).toBe(200);
    expect(again.status).toBe(200);
    expect(again.json.operationId).toBe(viaHttp.json.operationId);
    const httpRows = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ n: number }>(`select count(*)::int as n from admin_actions where tenant_id = $1 and ticket = $2`, [T, `CHG-${RUN}-http`]),
    );
    expect(httpRows.rows[0]!.n).toBe(1);
  }, 30_000);

  it('falla cerrado: tenant ausente en Postgres no se escribe y el ticket inválido se rechaza', async () => {
    // El tenant existe en la memoria del API pero no en Postgres: la FK de
    // `admin_actions` lo rechaza (23503) y el API responde 404, no 200.
    const ghost = `tenant_admin_ghost_${RUN}`;
    const ghostCtx = createStore();
    ghostCtx.store.tenants.set(ghost, { id: ghost, name: 'ghost', plan: 'sandbox', createdAt: new Date().toISOString() });
    ghostCtx.store.memberships.push({ tenantId: ghost, actorId: 'ghost_owner', roles: ['owner'], scopes: ['marketing.*'], isHuman: true });
    const ghostApp = createApp({
      ctx: ghostCtx,
      registry: createRegistry(),
      verifier: createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET }),
      admin: new PgAdminService(pool),
    });
    const ghostToken = await signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub: 'ghost_owner', tenantId: ghost });
    const res = await ghostApp.request('/v1/marketing/admin/actions', {
      method: 'POST',
      headers: { authorization: `Bearer ${ghostToken}`, 'content-type': 'application/json', 'idempotency-key': `idem-${RUN}-ghost` },
      body: JSON.stringify({ kind: 'audit.purge', ticket: `CHG-${RUN}-ghost`, retentionDays: 365 }),
    });
    expect(res.status).toBe(404);
    expect(((await res.json()) as Json).error.detail).toBe('tenant_not_found');

    const badTicket = await post(tokens.owner, { kind: 'audit.purge', ticket: 'no vale', retentionDays: 365 }, `idem-${RUN}-bad`);
    expect(badTicket.status).toBe(422);
  }, 30_000);

  it('sin puerto administrativo el API no simula la operación', async () => {
    const ctx = createStore();
    ctx.store.tenants.set(T, { id: T, name: 'Admin', plan: 'sandbox', createdAt: new Date().toISOString() });
    ctx.store.memberships.push({ tenantId: T, actorId: 'owner_1', roles: ['owner'], scopes: ['marketing.*'], isHuman: true });
    const appWithoutAdmin = createApp({
      ctx,
      registry: createRegistry(),
      verifier: createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET }),
    });
    const res = await appWithoutAdmin.request('/v1/marketing/admin/actions', {
      method: 'POST',
      headers: { authorization: `Bearer ${tokens.owner}`, 'content-type': 'application/json', 'idempotency-key': `idem-${RUN}-noop` },
      body: JSON.stringify({ kind: 'audit.purge', ticket: `CHG-${RUN}-noop`, retentionDays: 365 }),
    });
    expect(res.status).toBe(424);
    expect(((await res.json()) as Json).error.detail).toBe('admin_persistence_unconfigured');
  });
});
