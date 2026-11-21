import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { applyMigrations, asAuthenticated, asRole, DATABASE_URL, pgErrorCode, rejectionCode, withSuperuser } from '../support/db';

/**
 * MKT-C06/C22/C38 · Verificación real de Postgres 16.
 *
 * Requiere `DATABASE_URL` apuntando a una base donde el usuario pueda crear
 * roles/tablas. Sin esa variable la suite se SALTA: no hay PASS falso.
 */
const suite = DATABASE_URL ? describe : describe.skip;
const RUN = `it_${Date.now().toString(36)}`;
const A = `tenant_a_${RUN}`;
const B = `tenant_b_${RUN}`;

const TENANT_TABLES = [
  'memberships', 'contacts', 'twins', 'briefs', 'audience_snapshots', 'creatives', 'claims',
  'approvals', 'campaigns', 'outbound_intents', 'receipts', 'connections', 'observations',
  'conversions', 'reports', 'privacy_requests', 'handoffs', 'service_events', 'audit_log',
  'idempotency_keys', 'admin_actions', 'tenant_state',
];

suite('Postgres real · esquema, RLS y outbox', () => {
  beforeAll(async () => {
    await applyMigrations(DATABASE_URL!);
    await withSuperuser(DATABASE_URL!, async (c) => {
      await c.query('delete from tenants where id in ($1, $2)', [A, B]);
      await c.query(`insert into tenants (id, name, plan) values ($1, 'A', 'sandbox'), ($2, 'B', 'sandbox')`, [A, B]);
      for (const [tenant, suffix] of [[A, 'a'], [B, 'b']] as const) {
        await c.query(
          `insert into contacts (tenant_id, id, email_ref, country, locale, lifecycle_stage, interest_topic, consent)
           values ($1, $2, $3, 'ES', 'es', 'lead', 'growth', '{"marketing":true}'::jsonb)`,
          [tenant, `ct_${suffix}`, `ref_${suffix}`],
        );
        await c.query(
          `insert into briefs (tenant_id, id, version, status, body) values ($1, $2, 1, 'accepted', '{}'::jsonb)`,
          [tenant, `br_${suffix}`],
        );
        await c.query(
          `insert into audience_snapshots (tenant_id, id, rule_hash, rule, member_refs, eligible_count, excluded_count, members_hash, policy_version, source_watermark, expires_at)
           values ($1, $2, 'rh', '{}'::jsonb, '[]'::jsonb, 1, 0, 'mh', 'p1', 1, now() + interval '1 day')`,
          [tenant, `snap_${suffix}`],
        );
        await c.query(
          `insert into creatives (tenant_id, id, revision, body, hash) values ($1, $2, 1, '{}'::jsonb, 'h')`,
          [tenant, `cr_${suffix}`],
        );
        await c.query(
          `insert into approvals (tenant_id, approval_ref, approver_actor_id, approver_is_human, revision_hash, audience_max_hash, purpose, channel, cost_ceiling_amount, cost_ceiling_currency, policy_version, expires_at)
           values ($1, $2, 'alice', true, 'rh', 'mh', 'marketing', 'email', 0, 'EUR', 'p1', now() + interval '1 day')`,
          [tenant, `apv_${suffix}`],
        );
        await c.query(
          `insert into campaigns (tenant_id, id, name, brief_id, channel, revision, audience_snapshot_id, creative_id, approval_ref, cost_ceiling_amount, cost_ceiling_currency, state, version)
           values ($1, $2, 'Campaña', $3, 'email', 1, $4, $5, $6, 0, 'EUR', 'approved', 1)`,
          [tenant, `camp_${suffix}`, `br_${suffix}`, `snap_${suffix}`, `cr_${suffix}`, `apv_${suffix}`],
        );
        for (const n of [1, 2]) {
          // 0005 exige que subject_ref sea un contacto del mismo tenant.
          await c.query(
            `insert into contacts (tenant_id, id, email_ref, country, locale, lifecycle_stage, interest_topic, consent)
             values ($1, $2, $3, 'ES', 'es', 'lead', 'growth', '{"marketing":true}'::jsonb)`,
            [tenant, `ct_${suffix}_${n}`, `ref_${suffix}_${n}`],
          );
          await c.query(
            `insert into outbound_intents (tenant_id, id, operation_key, campaign_id, subject_ref, channel, payload_hash, approval_ref, audience_snapshot_id, eligibility_ref, state, scheduled_for)
             values ($1, $2, $3, $4, $5, 'email', 'ph', $6, $7, 'elig', 'queued', now())`,
            [tenant, `int_${suffix}_${n}`, `op_${suffix}_${n}`, `camp_${suffix}`, `ct_${suffix}_${n}`, `apv_${suffix}`, `snap_${suffix}`],
          );
        }
      }
    });
  }, 60_000);

  afterAll(async () => {
    await withSuperuser(DATABASE_URL!, async (c) => {
      await c.query('delete from tenants where id in ($1, $2)', [A, B]);
    });
  });

  it('aplica todas las migraciones en un Postgres limpio', async () => {
    const applied = await applyMigrations(DATABASE_URL!);
    expect(applied).toEqual([
      '0001_schema.sql',
      '0002_rls.sql',
      '0003_intent_scheduling.sql',
      '0004_rate_limit.sql',
      '0005_db_hardening.sql',
      '0006_admin_flows.sql',
      '0007_tenant_state.sql',
    ]);
  });

  it('tiene RLS habilitado y forzado en todas las tablas con tenant_id', async () => {
    const rows = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
        `select relname, relrowsecurity, relforcerowsecurity from pg_class
         where relname = any($1) order by relname`,
        [[...TENANT_TABLES, 'rate_limit_counters']],
      ),
    );
    expect(rows.rows).toHaveLength(TENANT_TABLES.length + 1);
    for (const row of rows.rows) {
      expect({ table: row.relname, rls: row.relrowsecurity, forced: row.relforcerowsecurity })
        .toEqual({ table: row.relname, rls: true, forced: true });
    }
  });

  it('falla cerrado cuando la sesión no fija app.tenant_id', async () => {
    const rows = await asAuthenticated(DATABASE_URL!, null, (c) => c.query('select id from contacts'));
    expect(rows.rows).toHaveLength(0);
  });

  it('aísla lecturas por tenant y no devuelve filas del otro', async () => {
    const a = await asAuthenticated(DATABASE_URL!, A, (c) => c.query<{ id: string; tenant_id: string }>('select id, tenant_id from contacts'));
    expect(a.rows.map((r) => r.id)).toEqual(['ct_a', 'ct_a_1', 'ct_a_2']);
    expect(a.rows.every((r) => r.tenant_id === A)).toBe(true);

    const b = await asAuthenticated(DATABASE_URL!, B, (c) => c.query<{ id: string }>('select id from contacts'));
    expect(b.rows.map((r) => r.id)).toEqual(['ct_b', 'ct_b_1', 'ct_b_2']);
  });

  it('rechaza una escritura con tenant_id ajeno aunque venga en el payload', async () => {
    let code: string | undefined;
    try {
      await asAuthenticated(DATABASE_URL!, A, (c) =>
        c.query(
          `insert into contacts (tenant_id, id, email_ref, country, locale, lifecycle_stage, interest_topic, consent)
           values ($1, 'ct_injected', 'ref_x', 'ES', 'es', 'lead', 'growth', '{}'::jsonb)`,
          [B],
        ),
      );
    } catch (error) {
      code = pgErrorCode(error);
    }
    expect(code).toBe('42501');
  });

  it('impide que una campaña de un tenant referencie un brief de otro', async () => {
    let code: string | undefined;
    try {
      await withSuperuser(DATABASE_URL!, (c) =>
        c.query(
          `insert into campaigns (tenant_id, id, name, brief_id, channel, revision, audience_snapshot_id, creative_id, cost_ceiling_amount, cost_ceiling_currency, state, version)
           values ($1, 'camp_cross', 'X', $2, 'email', 1, $3, $4, 0, 'EUR', 'draft', 1)`,
          [B, `br_a`, `snap_b`, `cr_b`],
        ),
      );
    } catch (error) {
      code = pgErrorCode(error);
    }
    expect(code).toBe('23503');
  });

  it('deduplica el operation_key del outbox', async () => {
    let code: string | undefined;
    try {
      await withSuperuser(DATABASE_URL!, (c) =>
        c.query(
          `insert into outbound_intents (tenant_id, id, operation_key, campaign_id, subject_ref, channel, payload_hash, approval_ref, audience_snapshot_id, eligibility_ref, state)
           values ($1, 'int_dup', $2, $3, 'ct_a', 'email', 'ph', $4, $5, 'elig', 'queued')`,
          [A, `op_a_1`, `camp_a`, `apv_a`, `snap_a`],
        ),
      );
    } catch (error) {
      code = pgErrorCode(error);
    }
    expect(code).toBe('23505');
  });

  it('permite varios pasos del mismo journey sin romper la unicidad', async () => {
    await withSuperuser(DATABASE_URL!, async (c) => {
      for (const step of ['step_1', 'step_2']) {
        await c.query(
          `insert into outbound_intents (tenant_id, id, operation_key, campaign_id, journey_step_id, subject_ref, channel, payload_hash, approval_ref, audience_snapshot_id, eligibility_ref, state, scheduled_for)
           values ($1, $2, $3, $4, $5, 'ct_a', 'email', 'ph', $6, $7, 'elig', 'queued', now() + interval '1 hour')`,
          [A, `int_${step}`, `op_${step}`, `camp_a`, step, `apv_a`, `snap_a`],
        );
      }
      const rows = await c.query<{ n: string }>(
        `select count(*)::text as n from outbound_intents where tenant_id = $1 and campaign_id = 'camp_a' and journey_step_id is not null`,
        [A],
      );
      expect(rows.rows[0]!.n).toBe('2');
    });
  });

  it('reparte los intents vencidos entre dos workers con SKIP LOCKED', async () => {
    const lease = async (worker: string): Promise<string[]> => {
      const client = new Client({ connectionString: DATABASE_URL! });
      await client.connect();
      try {
        await client.query('begin');
        await client.query('set local role authenticated');
        await client.query("select set_config('app.tenant_id', $1, true)", [A]);
        const rows = await client.query<{ id: string }>(
          `select id from outbound_intents
           where tenant_id = $1 and state = 'queued' and scheduled_for <= now()
           order by created_at, id
           for update skip locked limit 1`,
          [A],
        );
        if (rows.rows[0]) {
          await client.query(`update outbound_intents set state = 'leased', lease_fence = lease_fence + 1 where tenant_id = $1 and id = $2`, [
            A,
            rows.rows[0].id,
          ]);
        }
        // La transacción se mantiene abierta a propósito: el segundo worker debe
        // ver el lock del primero.
        await new Promise((resolve) => setTimeout(resolve, 50));
        await client.query('commit');
        return rows.rows.map((r) => r.id);
      } finally {
        await client.end();
      }
    };

    const [w1, w2] = await Promise.all([lease('w1'), lease('w2')]);
    expect(w1).toHaveLength(1);
    expect(w2).toHaveLength(1);
    expect(w1[0]).not.toBe(w2[0]);
    const fences = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ id: string; lease_fence: number }>(`select id, lease_fence from outbound_intents where id in ($1, $2)`, [w1[0], w2[0]]),
    );
    expect(fences.rows.every((r) => r.lease_fence === 1)).toBe(true);
  });

  it('una transacción revertida no deja rastro visible', async () => {
    await asAuthenticated(DATABASE_URL!, A, async (c) => {
      await c.query(
        `insert into contacts (tenant_id, id, email_ref, country, locale, lifecycle_stage, interest_topic, consent)
         values ($1, 'ct_rollback', 'ref_r', 'ES', 'es', 'lead', 'growth', '{}'::jsonb)`,
        [A],
      );
      const inside = await c.query(`select id from contacts where id = 'ct_rollback'`);
      expect(inside.rows).toHaveLength(1);
    });
    const after = await withSuperuser(DATABASE_URL!, (c) => c.query(`select id from contacts where id = 'ct_rollback'`));
    expect(after.rows).toHaveLength(0);
  });

  it('comparte el contador de rate limit entre conexiones concurrentes', async () => {
    const limit = 5;
    const now = new Date('2026-11-15T12:00:00Z');
    const consume = async (): Promise<boolean> => {
      const client = new Client({ connectionString: DATABASE_URL! });
      await client.connect();
      try {
        await client.query('begin');
        await client.query('set local role authenticated');
        await client.query("select set_config('app.tenant_id', $1, true)", [A]);
        const res = await client.query<{ allowed: boolean }>(
          'select allowed from consume_rate_limit($1, $2, $3)',
          [A, limit, now.toISOString()],
        );
        await client.query('commit');
        return res.rows[0]!.allowed;
      } finally {
        await client.end();
      }
    };
    const decisions = await Promise.all(Array.from({ length: 10 }, () => consume()));
    expect(decisions.filter(Boolean)).toHaveLength(limit);
  }, 30_000);

  it('no permite consumir el contador de otro tenant', async () => {
    let code: string | undefined;
    try {
      await asAuthenticated(DATABASE_URL!, A, (c) =>
        c.query('select allowed from consume_rate_limit($1, 10, now())', [B]),
      );
    } catch (error) {
      code = pgErrorCode(error);
    }
    expect(code).toBe('42501');
  });

  it('el rol de datos no administra: no purga auditoría ni toca membresías', async () => {
    expect(await rejectionCode(() => asAuthenticated(DATABASE_URL!, A, (c) => c.query('delete from audit_log')))).toBe('42501');
    expect(
      await rejectionCode(() =>
        asAuthenticated(DATABASE_URL!, A, (c) =>
          c.query(
            `insert into memberships (tenant_id, actor_id, roles, scopes)
             values ($1, 'actor_new', ARRAY['owner'], ARRAY['marketing.*'])`,
            [A],
          ),
        ),
      ),
    ).toBe('42501');
    expect(
      await rejectionCode(() =>
        asAuthenticated(DATABASE_URL!, A, (c) =>
          c.query(
            `insert into admin_actions (tenant_id, id, actor_id, action, ticket)
             values ($1, 'adm_forged', 'actor_new', 'membership.grant', 'tk')`,
            [A],
          ),
        ),
      ),
    ).toBe('42501');
  });

  it('el rol administrativo no purga sin ticket ni sin acción registrada', async () => {
    await withSuperuser(DATABASE_URL!, (c) =>
      c.query(
        `insert into audit_log (tenant_id, actor_id, action, detail, at)
         values ($1, 'seed', 'synthetic_old', 'viejo', now() - interval '400 days')`,
        [A],
      ),
    );
    const purge = (c: Client) => c.query(`delete from audit_log where tenant_id = $1 and at < now() - interval '365 days'`, [A]);
    const ticket = `tk_${RUN}_purge`;

    expect(await rejectionCode(() => asRole(DATABASE_URL!, 'marketing_admin', A, {}, purge))).toBe('42501');
    expect(await rejectionCode(() => asRole(DATABASE_URL!, 'marketing_admin', A, { 'app.admin_ticket': ticket }, purge))).toBe('42501');
    expect(
      await rejectionCode(() => asRole(DATABASE_URL!, 'marketing_admin', A, { 'app.admin_ticket': ticket, 'app.admin_actor': 'ops_1' }, purge)),
    ).toBe('42501');

    const kept = await withSuperuser(DATABASE_URL!, (c) =>
      c.query<{ n: number }>(`select count(*)::int as n from audit_log where tenant_id = $1 and action = 'synthetic_old'`, [A]),
    );
    expect(kept.rows[0]!.n).toBe(1);
  });

  it('la purga auditada borra sólo lo vencido y deja el registro inmutable', async () => {
    const ticket = `tk_${RUN}_audited`;
    const actionId = `adm_${RUN}_purge`;
    await withSuperuser(DATABASE_URL!, (c) =>
      c.query(
        `insert into audit_log (tenant_id, actor_id, action, detail, at)
         values ($1, 'seed', 'purge_target', 'vencido', now() - interval '400 days'),
                ($1, 'seed', 'synthetic_recent', 'reciente', now())`,
        [A],
      ),
    );
    const purged = await asRole(
      DATABASE_URL!,
      'marketing_admin',
      A,
      { 'app.admin_ticket': ticket, 'app.admin_actor': 'ops_1' },
      async (c) => {
        await c.query(
          `insert into admin_actions (tenant_id, id, actor_id, action, ticket, detail)
           values ($1, $2, 'ops_1', 'audit.purge', $3, '{"retention_days":365}'::jsonb)`,
          [A, actionId, ticket],
        );
        const res = await c.query<{ action: string }>(
          `delete from audit_log where tenant_id = $1 and at < now() - interval '365 days' returning action`,
          [A],
        );
        return res.rows.map((r) => r.action);
      },
      { commit: true },
    );
    expect(purged).toContain('purge_target');
    expect(purged).not.toContain('synthetic_recent');

    const state = await withSuperuser(DATABASE_URL!, async (c) => {
      const old = await c.query<{ n: number }>(`select count(*)::int as n from audit_log where tenant_id = $1 and action = 'purge_target'`, [A]);
      const fresh = await c.query<{ n: number }>(`select count(*)::int as n from audit_log where tenant_id = $1 and action = 'synthetic_recent'`, [A]);
      const actions = await c.query<{ action: string; actor_id: string; ticket: string }>(
        `select action, actor_id, ticket from admin_actions where tenant_id = $1 and id = $2`,
        [A, actionId],
      );
      return { old: old.rows[0]!.n, fresh: fresh.rows[0]!.n, actions: actions.rows };
    });
    expect(state.old).toBe(0);
    expect(state.fresh).toBe(1);
    expect(state.actions).toEqual([{ action: 'audit.purge', actor_id: 'ops_1', ticket }]);

    // El registro de la propia acción no se reescribe ni se borra.
    expect(
      await rejectionCode(() =>
        asRole(DATABASE_URL!, 'marketing_admin', A, {}, (c) => c.query(`update admin_actions set actor_id = 'otro' where id = $1`, [actionId])),
      ),
    ).toBe('42501');
    expect(
      await rejectionCode(() => asRole(DATABASE_URL!, 'marketing_admin', A, {}, (c) => c.query(`delete from admin_actions where id = $1`, [actionId]))),
    ).toBe('42501');
  });

  it('la membresía cambia sólo por el camino administrativo registrado', async () => {
    const ticket = `tk_${RUN}_member`;
    expect(
      await rejectionCode(() =>
        asRole(
          DATABASE_URL!,
          'marketing_admin',
          A,
          { 'app.admin_ticket': ticket, 'app.admin_actor': 'ops_1' },
          (c) =>
            c.query(
              `insert into memberships (tenant_id, actor_id, roles, scopes)
               values ($1, 'actor_ops', ARRAY['owner'], ARRAY['marketing.*'])`,
              [A],
            ),
        ),
      ),
    ).toBe('42501');

    await asRole(
      DATABASE_URL!,
      'marketing_admin',
      A,
      { 'app.admin_ticket': ticket, 'app.admin_actor': 'ops_1' },
      async (c) => {
        await c.query(
          `insert into admin_actions (tenant_id, id, actor_id, action, ticket, detail)
           values ($1, $2, 'ops_1', 'membership.grant', $3, '{"actor":"actor_ops"}'::jsonb)`,
          [A, `adm_${RUN}_member`, ticket],
        );
        await c.query(
          `insert into memberships (tenant_id, actor_id, roles, scopes)
           values ($1, 'actor_ops', ARRAY['owner'], ARRAY['marketing.*'])`,
          [A],
        );
      },
      { commit: true },
    );

    const seen = await asAuthenticated(DATABASE_URL!, A, (c) =>
      c.query<{ roles: string[] }>(`select roles from memberships where tenant_id = $1 and actor_id = 'actor_ops'`, [A]),
    );
    expect(seen.rows[0]!.roles).toEqual(['owner']);
    expect(
      await rejectionCode(() =>
        asAuthenticated(DATABASE_URL!, A, (c) => c.query(`update memberships set roles = ARRAY['viewer'] where actor_id = 'actor_ops'`)),
      ),
    ).toBe('42501');
  });

  it('un cambio de plan exige acción administrativa registrada', async () => {
    expect(
      await rejectionCode(() =>
        asRole(DATABASE_URL!, 'marketing_admin', A, { 'app.admin_ticket': 'tk_x', 'app.admin_actor': 'ops_1' }, (c) =>
          c.query(`update tenants set plan = 'production' where id = $1`, [A]),
        ),
      ),
    ).toBe('42501');
    expect(
      await rejectionCode(() => asAuthenticated(DATABASE_URL!, A, (c) => c.query(`update tenants set plan = 'production' where id = $1`, [A]))),
    ).toBe('42501');

    const ticket = `tk_${RUN}_plan`;
    await asRole(
      DATABASE_URL!,
      'marketing_admin',
      A,
      { 'app.admin_ticket': ticket, 'app.admin_actor': 'ops_1' },
      async (c) => {
        await c.query(
          `insert into admin_actions (tenant_id, id, actor_id, action, ticket, detail)
           values ($1, $2, 'ops_1', 'tenant.plan_change', $3, '{"to":"pilot"}'::jsonb)`,
          [A, `adm_${RUN}_plan`, ticket],
        );
        await c.query(`update tenants set plan = 'pilot' where id = $1`, [A]);
      },
      { commit: true },
    );

    const plan = await withSuperuser(DATABASE_URL!, (c) => c.query<{ plan: string }>(`select plan from tenants where id = $1`, [A]));
    expect(plan.rows[0]!.plan).toBe('pilot');
  });

  it('comparte el límite entre dos instancias del API', async () => {
    const pg = (await import('pg')).default;
    const { PgRateLimiter } = await import('../../apps/api/src/ratelimit-pg');
    const poolA = new pg.Pool({ connectionString: DATABASE_URL, max: 2 });
    const poolB = new pg.Pool({ connectionString: DATABASE_URL, max: 2 });
    try {
      const limiters = [new PgRateLimiter(poolA), new PgRateLimiter(poolB)];
      const at = Date.parse('2026-11-15T13:00:00Z');
      const results = await Promise.all(
        Array.from({ length: 6 }, (_, i) => limiters[i % 2]!.consume(A, 3, at)),
      );
      expect(results.filter((r) => r.allowed)).toHaveLength(3);
    } finally {
      await poolA.end();
      await poolB.end();
    }
  }, 30_000);
});
