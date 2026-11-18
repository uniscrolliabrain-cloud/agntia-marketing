import type { Pool, PoolClient } from 'pg';
import { CapabilitySchema, MarketingError, type Capability } from '@agntia/contracts';
import { principalFromFacts, type Membership, type Principal, type VerifiedJwt } from '@agntia/core';

/**
 * MKT-C02/C03 · Borde asíncrono de autorización.
 *
 * `resolvePrincipal` lee tenant y membership del `Ctx` en memoria. Eso basta
 * para el dominio y para las pruebas, pero no para el proceso real: con
 * `createStore()` vacío ningún token pasaba de `tenant_unknown`, y la
 * membership que `0005`/`0006` administran en Postgres nunca se consultaba.
 *
 * Este puerto lee esos dos hechos de la base —`tenants` y `memberships`, como
 * rol `authenticated` con `app.tenant_id` fijado, así que RLS decide— y entrega
 * la decisión a `principalFromFacts`, la **misma** función que usa el dominio.
 * No hay reglas duplicadas ni caché: revocar una membership en la base surte
 * efecto en la petición siguiente.
 */
export interface PrincipalResolver {
  resolve(jwt: VerifiedJwt, capability: Capability): Promise<Principal>;
}

export interface PrincipalLookup {
  lookup(tenantId: string, actorId: string): Promise<{ tenantExists: boolean; membership: Membership | undefined }>;
}

const KNOWN_ROLES = new Set<Membership['roles'][number]>(['owner', 'operator', 'reviewer', 'viewer', 'worker']);

interface MembershipRow {
  tenant_id: string;
  actor_id: string | null;
  roles: string[] | null;
  scopes: string[] | null;
  is_human: boolean | null;
}

/**
 * Los valores salen de la base, pero no se aceptan a ciegas: un rol que el
 * dominio no conoce o un scope que no es una capacidad válida se descartan, y
 * entonces la autorización falla en vez de conceder algo por accidente.
 */
function normalizeMembership(row: MembershipRow): Membership | undefined {
  if (row.actor_id === null) return undefined;
  const roles = (row.roles ?? []).filter((r): r is Membership['roles'][number] => KNOWN_ROLES.has(r as Membership['roles'][number]));
  const scopes = (row.scopes ?? []).filter((s) => s === 'marketing.*' || CapabilitySchema.safeParse(s).success);
  return {
    tenantId: row.tenant_id,
    actorId: row.actor_id,
    roles,
    scopes,
    isHuman: row.is_human === true,
  };
}

function pgCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
}

export class PgPrincipalLookup implements PrincipalLookup {
  constructor(private readonly pool: Pool) {}

  async lookup(tenantId: string, actorId: string): Promise<{ tenantExists: boolean; membership: Membership | undefined }> {
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      await client.query('begin');
      await client.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
      try {
        await client.query('set local role authenticated');
      } catch (error) {
        // El rol de login debe poder asumir `authenticated`
        // (`grant authenticated to <rol>`); sin eso no hay lectura con RLS.
        if (pgCode(error) === '42501') throw new MarketingError('DEPENDENCY_MISSING', 'principal_role_not_assumable');
        throw error;
      }
      const result = await client.query<MembershipRow>(
        `select t.id as tenant_id, m.actor_id, m.roles, m.scopes, m.is_human
           from tenants t
           left join memberships m
             on m.tenant_id = t.id and m.actor_id = $2
          where t.id = $1`,
        [tenantId, actorId],
      );
      await client.query('commit');
      const row = result.rows[0];
      if (!row) return { tenantExists: false, membership: undefined };
      const membership = normalizeMembership(row);
      return { tenantExists: true, membership };
    } catch (error) {
      await client?.query('rollback').catch(() => undefined);
      if (error instanceof MarketingError) throw error;
      // Fail closed: si la base no responde no se autoriza con lo que haya (y
      // tampoco se cae con un error interno opaco: es dependencia, no bug).
      throw new MarketingError('UNAVAILABLE', 'principal_lookup_failed', { retryable: true });
    } finally {
      client?.release();
    }
  }
}

export function createPgPrincipalResolver(pool: Pool, options: { now?: () => Date; lookup?: PrincipalLookup } = {}): PrincipalResolver {
  const lookup = options.lookup ?? new PgPrincipalLookup(pool);
  const now = options.now ?? (() => new Date());
  return {
    async resolve(jwt, capability) {
      const facts = await lookup.lookup(jwt.tenantId, jwt.sub);
      return principalFromFacts({ now }, jwt, facts, capability);
    },
  };
}
