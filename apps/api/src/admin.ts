import { createHash } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { MarketingError } from '@agntia/contracts';

/**
 * MKT-C06/C19 · Puerto administrativo del API.
 *
 * `0005` quitó al rol de datos la capacidad de provisionar tenants, cambiar
 * membresías o purgar auditoría, y `0006` abrió la única vía legítima:
 * `marketing_admin` + una fila en `admin_actions` en la misma transacción. Este
 * módulo es el borde del API con esa vía, no una segunda regla: el API abre la
 * transacción, fija el tenant ya resuelto por el JWT y la membership de
 * servidor, deja el registro y ejecuta el efecto como `marketing_admin`. Si el
 * registro no existe, el trigger responde `42501` y no se escribe nada.
 *
 * El tenant y el actor **no** vienen del cuerpo de la petición: los pone el
 * llamador con el principal verificado.
 */
export type MembershipRole = 'owner' | 'operator' | 'reviewer' | 'viewer' | 'worker';

export type AdminAction =
  | { kind: 'audit.purge'; retentionDays: number }
  | {
      kind: 'membership.upsert';
      membership: { actorId: string; roles: MembershipRole[]; scopes: string[]; isHuman: boolean };
    }
  | { kind: 'tenant.set-plan'; plan: 'sandbox' | 'pilot' | 'production'; name?: string };

export interface AdminRequest {
  /** Tenant resuelto por el servidor (nunca un campo del cliente). */
  tenantId: string;
  /** Actor autenticado que queda como autor de la acción. */
  actorId: string;
  /** Ticket de cambio; el trigger exige que coincida con el de `admin_actions`. */
  ticket: string;
  /** Clave de idempotencia de la petición; hace durable la repetición. */
  idempotencyKey: string;
  action: AdminAction;
}

export interface AdminResult {
  actionId: string;
  action: string;
  ticket: string;
  /** `true` si la acción ya estaba registrada con esta misma clave. */
  replayed: boolean;
  /** Filas afectadas por el efecto (0 en una repetición). */
  affected: number;
  at: string;
}

export interface AdminPort {
  execute(request: AdminRequest): Promise<AdminResult>;
}

/** Etiqueta que se guarda en `admin_actions.action` y que el trigger compara. */
const ACTION_LABEL: Record<AdminAction['kind'], string> = {
  'audit.purge': 'audit.purge',
  'membership.upsert': 'membership.upsert',
  'tenant.set-plan': 'tenant.plan_change',
};

function actionIdFor(request: AdminRequest): string {
  const material = JSON.stringify([
    request.tenantId,
    request.actorId,
    request.ticket,
    request.idempotencyKey,
    request.action,
  ]);
  return `adm_${createHash('sha256').update(material).digest('hex').slice(0, 24)}`;
}

function detailFor(action: AdminAction): Record<string, unknown> {
  switch (action.kind) {
    case 'audit.purge':
      return { retention_days: action.retentionDays };
    case 'membership.upsert':
      return {
        actor: action.membership.actorId,
        roles: action.membership.roles,
        is_human: action.membership.isHuman,
      };
    case 'tenant.set-plan':
      return { to: action.plan, ...(action.name ? { name: action.name } : {}) };
  }
}

/**
 * Traduce el error de Postgres a un error de dominio seguro: nunca se devuelve
 * el mensaje de la base (puede contener nombres de objetos o valores).
 */
function mapPgError(error: unknown): never {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
  if (code === '23503') throw new MarketingError('NOT_FOUND', 'tenant_not_found');
  if (code === '23505') throw new MarketingError('CONFLICT', 'admin_action_duplicate');
  if (code === '42501') throw new MarketingError('FORBIDDEN', 'admin_action_rejected');
  throw new MarketingError('UNAVAILABLE', 'admin_write_failed', { retryable: true });
}

async function applyAction(client: PoolClient, tenantId: string, action: AdminAction): Promise<number> {
  switch (action.kind) {
    case 'audit.purge': {
      const result = await client.query(
        'delete from audit_log where tenant_id = $1 and at < now() - make_interval(days => $2::int)',
        [tenantId, action.retentionDays],
      );
      return result.rowCount ?? 0;
    }
    case 'membership.upsert': {
      const { actorId, roles, scopes, isHuman } = action.membership;
      const result = await client.query(
        `insert into memberships (tenant_id, actor_id, roles, scopes, is_human)
         values ($1, $2, $3, $4, $5)
         on conflict (tenant_id, actor_id)
         do update set roles = excluded.roles, scopes = excluded.scopes, is_human = excluded.is_human`,
        [tenantId, actorId, roles, scopes, isHuman],
      );
      return result.rowCount ?? 0;
    }
    case 'tenant.set-plan': {
      const result = await client.query(
        'update tenants set plan = $2, name = coalesce($3, name) where id = $1',
        [tenantId, action.plan, action.name ?? null],
      );
      return result.rowCount ?? 0;
    }
  }
}

export class PgAdminService implements AdminPort {
  constructor(private readonly pool: Pool) {}

  async execute(request: AdminRequest): Promise<AdminResult> {
    const label = ACTION_LABEL[request.action.kind];
    const actionId = actionIdFor(request);
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query("select set_config('app.tenant_id', $1, true)", [request.tenantId]);
      await client.query("select set_config('app.admin_ticket', $1, true)", [request.ticket]);
      await client.query("select set_config('app.admin_actor', $1, true)", [request.actorId]);
      try {
        await client.query('set local role marketing_admin');
      } catch (error) {
        // El rol de login del API debe ser miembro de `marketing_admin`
        // (`grant marketing_admin to <rol>`). Sin eso no hay vía administrativa.
        const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
        if (code === '42501') throw new MarketingError('DEPENDENCY_MISSING', 'admin_role_not_granted');
        throw error;
      }

      // El registro va primero: el trigger exige que exista en esta misma
      // transacción antes de tocar `memberships`, `tenants` o `audit_log`.
      const inserted = await client.query<{ at: Date }>(
        `insert into admin_actions (tenant_id, id, actor_id, action, ticket, detail)
         values ($1, $2, $3, $4, $5, $6::jsonb)
         on conflict (tenant_id, id) do nothing
         returning at`,
        [request.tenantId, actionId, request.actorId, label, request.ticket, JSON.stringify(detailFor(request.action))],
      );

      if (inserted.rowCount === 0) {
        const prior = await client.query<{ action: string; actor_id: string; ticket: string; at: Date }>(
          'select action, actor_id, ticket, at from admin_actions where tenant_id = $1 and id = $2',
          [request.tenantId, actionId],
        );
        const row = prior.rows[0];
        // Mismo identificador y contenido distinto significaría reutilizar la
        // clave de idempotencia para otra acción: es un conflicto, no un replay.
        if (!row || row.action !== label || row.actor_id !== request.actorId || row.ticket !== request.ticket) {
          throw new MarketingError('CONFLICT', 'idempotency_key_reused_with_different_payload');
        }
        await client.query('commit');
        return { actionId, action: label, ticket: request.ticket, replayed: true, affected: 0, at: new Date(row.at).toISOString() };
      }

      const affected = await applyAction(client, request.tenantId, request.action);
      await client.query('commit');
      return {
        actionId,
        action: label,
        ticket: request.ticket,
        replayed: false,
        affected,
        at: new Date(inserted.rows[0]!.at).toISOString(),
      };
    } catch (error) {
      await client.query('rollback').catch(() => undefined);
      if (error instanceof MarketingError) throw error;
      return mapPgError(error);
    } finally {
      client.release();
    }
  }
}
