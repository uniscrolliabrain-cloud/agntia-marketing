import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createRegistry } from '@agntia/adapters';
import { createStore } from '@agntia/core';
import { PgAdminService } from '../../apps/api/src/admin';
import { createApp } from '../../apps/api/src/app';
import { createSupabaseJwtVerifier, signTestJwt } from '../../apps/api/src/auth';
import { createPgPrincipalResolver } from '../../apps/api/src/principals';
import { applyMigrations, DATABASE_URL, withSuperuser } from '../support/db';

/**
 * MKT-C02/C03/C06 · Autorización del API contra Postgres real.
 *
 * El `Ctx` que recibe la app está **vacío** a propósito: si algo pasa, el
 * tenant y la membership vinieron de `tenants`/`memberships`, no de memoria.
 * Sin `DATABASE_URL` la suite se SALTA: no hay PASS falso.
 */
const suite = DATABASE_URL ? describe : describe.skip;
const RUN = `ip_${Date.now().toString(36)}`;
const T = `tenant_prin_${RUN}`;
const OTHER = `tenant_prin_other_${RUN}`;
const ISS = 'https://test.supabase.co/auth/v1';
const AUD = 'authenticated';
const SECRET = 'test-secret-principals-0123456789abcdef';

type Json = Record<string, any>;

let pool: pg.Pool;
let app: ReturnType<typeof createApp>;
let tokens: {
  owner: string;
  operator: string;
  bot: string;
  scoped: string;
  revoked: string;
  otherOwner: string;
  ghostTenant: string;
  stranger: string;
  expired: string;
  unknownRole: string;
};

async function call(method: 'GET' | 'POST', path: string, token: string, body?: unknown, idempotencyKey?: string) {
  const res = await app.request(path, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: res.status, json: (await res.json()) as Json };
}

async function seed(): Promise<void> {
  await withSuperuser(DATABASE_URL!, async (c) => {
    await c.query('delete from tenants where id in ($1, $2)', [T, OTHER]);
    await c.query(`insert into tenants (id, name, plan) values ($1, 'Prin', 'sandbox'), ($2, 'Otra', 'sandbox')`, [T, OTHER]);
    await c.query(
      `insert into memberships (tenant_id, actor_id, roles, scopes, is_human)
       values ($1, 'owner_1', array['owner'], array['marketing.*'], true),
              ($1, 'operator_1', array['operator'], array['marketing.*'], true),
              ($1, 'bot_1', array['owner'], array['marketing.*'], false),
              ($1, 'scoped_1', array['owner'], array['marketing.context.read'], true),
              ($1, 'revoked_1', array['owner'], array['marketing.*'], true),
              ($1, 'unknown_1', array['admin_magic'], array['marketing.*'], true),
              ($2, 'other_owner', array['owner'], array['marketing.*'], true)`,
      [T, OTHER],
    );
  });
}

suite('MKT-C02 · tenant y membership leídos de Postgres en el borde del API', () => {
  beforeAll(async () => {
    await applyMigrations(DATABASE_URL!);
    await seed();

    pool = new pg.Pool({ connectionString: DATABASE_URL!, max: 4 });
    app = createApp({
      // Store vacío: nada de lo que sigue puede venir de memoria.
      ctx: createStore(),
      registry: createRegistry(),
      verifier: createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET }),
      admin: new PgAdminService(pool),
      principals: createPgPrincipalResolver(pool),
    });

    const token = (sub: string, tenantId: string, expiresInSeconds?: number) =>
      signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub, tenantId, ...(expiresInSeconds === undefined ? {} : { expiresInSeconds }) });
    tokens = {
      owner: await token('owner_1', T),
      operator: await token('operator_1', T),
      bot: await token('bot_1', T),
      scoped: await token('scoped_1', T),
      revoked: await token('revoked_1', T),
      otherOwner: await token('other_owner', OTHER),
      ghostTenant: await token('owner_1', `tenant_prin_ghost_${RUN}`),
      stranger: await token('stranger', T),
      expired: await token('owner_1', T, -60),
      unknownRole: await token('unknown_1', T),
    };
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await withSuperuser(DATABASE_URL!, (c) => c.query('delete from tenants where id in ($1, $2)', [T, OTHER]));
  });

  it('resuelve el principal con la membership de Postgres aunque el store esté vacío', async () => {
    const res = await call('GET', '/v1/marketing/me', tokens.owner);
    expect(res.status).toBe(200);
    expect(res.json).toMatchObject({ actorId: 'owner_1', tenantId: T, roles: ['owner'], isHuman: true });
    expect(res.json.capabilities).toEqual(['marketing.*']);
  }, 30_000);

  it('rechaza tenant inexistente, actor sin membership y rol que el dominio no conoce', async () => {
    const ghost = await call('GET', '/v1/marketing/me', tokens.ghostTenant);
    expect(ghost.status).toBe(401);
    expect(ghost.json.error.detail).toBe('tenant_unknown');

    const stranger = await call('GET', '/v1/marketing/me', tokens.stranger);
    expect(stranger.status).toBe(403);
    expect(stranger.json.error.detail).toBe('no_membership');

    // La fila existe en la base con un rol inventado: se descarta y se deniega.
    const unknown = await call('GET', '/v1/marketing/me', tokens.unknownRole);
    expect(unknown.status).toBe(403);
    expect(unknown.json.error.detail).toBe('role_not_allowed');
  }, 30_000);

  it('aplica scopes y expiración del token verificado', async () => {
    const scoped = await call(
      'POST',
      '/v1/marketing/admin/actions',
      tokens.scoped,
      { kind: 'audit.purge', ticket: `CHG-${RUN}-scope`, retentionDays: 365 },
      `idem-${RUN}-scope`,
    );
    expect(scoped.status).toBe(403);
    expect(scoped.json.error.detail).toBe('capability_not_granted');

    const expired = await call('GET', '/v1/marketing/me', tokens.expired);
    expect(expired.status).toBe(401);
    expect(expired.json.error.detail).toBe('token_invalid');
  }, 30_000);

  it('revocar la membership en la base surte efecto en la petición siguiente', async () => {
    const before = await call('GET', '/v1/marketing/me', tokens.revoked);
    expect(before.status).toBe(200);

    await withSuperuser(DATABASE_URL!, (c) =>
      c.query('delete from memberships where tenant_id = $1 and actor_id = $2', [T, 'revoked_1']),
    );

    const after = await call('GET', '/v1/marketing/me', tokens.revoked);
    expect(after.status).toBe(403);
    expect(after.json.error.detail).toBe('no_membership');
  }, 30_000);

  it('la vía administrativa completa funciona sin sembrar memoria y sólo sobre su tenant', async () => {
    const plan = await call(
      'POST',
      '/v1/marketing/admin/actions',
      tokens.owner,
      { kind: 'tenant.set-plan', ticket: `CHG-${RUN}-plan`, plan: 'pilot' },
      `idem-${RUN}-plan`,
    );
    expect(plan.status).toBe(200);
    expect(plan.json.payload).toMatchObject({ action: 'tenant.plan_change', affected: 1 });

    const denial = await call(
      'POST',
      '/v1/marketing/admin/actions',
      tokens.operator,
      { kind: 'tenant.set-plan', ticket: `CHG-${RUN}-operator`, plan: 'production' },
      `idem-${RUN}-operator`,
    );
    expect(denial.status).toBe(403);
    expect(denial.json.error.detail).toBe('role_not_allowed');

    const bot = await call(
      'POST',
      '/v1/marketing/admin/actions',
      tokens.bot,
      { kind: 'tenant.set-plan', ticket: `CHG-${RUN}-bot`, plan: 'production' },
      `idem-${RUN}-bot`,
    );
    expect(bot.status).toBe(403);
    expect(bot.json.error.detail).toBe('effect_requires_human');

    const state = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ plan: string }>('select plan from tenants where id = $1', [T]),
    );
    expect(state.rows[0]!.plan).toBe('pilot');

    // El owner del otro tenant no puede escribir en T ni ver su historia: la
    // sesión fija app.tenant_id desde el JWT verificado y RLS se aplica.
    const foreign = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ n: number }>('select count(*)::int as n from admin_actions where tenant_id = $1 and ticket like $2', [T, `CHG-${RUN}%`]),
    );
    expect(foreign.rows[0]!.n).toBe(1);
  }, 30_000);

  it('falla cerrado si la base no responde: 503, no autorización con datos viejos', async () => {
    const broken = new pg.Pool({ connectionString: DATABASE_URL!, max: 1 });
    await broken.end();
    const appBroken = createApp({
      ctx: createStore(),
      registry: createRegistry(),
      verifier: createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET }),
      admin: new PgAdminService(broken),
      principals: createPgPrincipalResolver(broken),
    });
    const res = await appBroken.request('/v1/marketing/me', {
      headers: { authorization: `Bearer ${tokens.owner}` },
    });
    expect(res.status).toBe(503);
    expect(((await res.json()) as Json).error.detail).toBe('principal_lookup_failed');
  }, 30_000);
});
