import type { Pool, PoolClient } from 'pg';
import { MarketingError } from '@agntia/contracts';
import type { Ctx } from '@agntia/core';

/**
 * MKT-C06 · Persistencia del estado de un tenant (etapa 1).
 *
 * El dominio es síncrono (`MemoryStore`), así que aquí no se reimplementa nada:
 * se **exporta** la parte del store que pertenece a un tenant a un documento
 * JSONB, se **importa** antes de correr el dominio y se vuelve a escribir en la
 * misma transacción que abrió el cerrojo. El documento es la verdad; la memoria
 * es la caché de un turno.
 *
 * Invariantes:
 * - Un solo escritor por tenant: `select … for update` sobre `tenant_state`
 *   abarca toda la operación, incluido el efecto. Sin actualizaciones perdidas.
 * - Nada se escribe si el efecto falla: la transacción se revierte y la copia en
 *   memoria queda inservible para la petición siguiente, que vuelve a cargar.
 * - El tenant sale del principal verificado; la policy RLS y `app.tenant_id`
 *   impiden leer o escribir el documento de otro tenant.
 */

/** Colecciones de `MemoryStore` con forma `{ tenantId }`. */
const COLLECTIONS = [
  'memberships',
  'contacts',
  'twins',
  'briefs',
  'snapshots',
  'creatives',
  'claims',
  'approvals',
  'campaigns',
  'intents',
  'receipts',
  'connections',
  'observations',
  'conversions',
  'experiments',
  'budgets',
  'reports',
  'privacyRequests',
  'handoffs',
  'contactPolicies',
  'journeys',
  'journeyEnrollments',
  'landings',
  'events',
] as const;

type TenantRow = { tenantId: string };
type Document = Record<string, unknown>;

/** Copia del estado del tenant, lista para `jsonb`. */
export function exportTenantState(ctx: Ctx, tenantId: string): Document {
  const store = ctx.store as unknown as Record<string, unknown>;
  const doc: Document = {};
  for (const key of COLLECTIONS) {
    const rows = (store[key] as TenantRow[] | undefined) ?? [];
    doc[key] = structuredClone(rows.filter((row) => row.tenantId === tenantId));
  }
  const tenant = ctx.store.tenants.get(tenantId);
  doc.tenants = tenant ? [structuredClone(tenant)] : [];

  // La caché de idempotencia también viaja: repetir una petición tras un
  // reinicio devuelve el resultado anterior en vez de reaplicar el efecto.
  const operations: Document = {};
  for (const [key, value] of ctx.store.operations) {
    if (key.startsWith(`${tenantId}|`)) operations[key] = structuredClone(value);
  }
  doc.operations = operations;
  doc.audit = structuredClone(ctx.store.audit.filter((entry) => entry.tenantId === tenantId));
  return doc;
}

/** Reemplaza en el store la parte del tenant; el resto queda intacto. */
export function importTenantState(ctx: Ctx, tenantId: string, doc: Document): void {
  const store = ctx.store as unknown as Record<string, unknown>;
  for (const key of COLLECTIONS) {
    const rows = store[key] as TenantRow[];
    const kept = rows.filter((row) => row.tenantId !== tenantId);
    const loaded = (doc[key] as TenantRow[] | undefined) ?? [];
    rows.length = 0;
    rows.push(...kept, ...loaded);
  }

  const tenant = (doc.tenants as Array<{ id: string }> | undefined)?.[0];
  if (tenant) ctx.store.tenants.set(tenantId, structuredClone(tenant) as never);
  else ctx.store.tenants.delete(tenantId);

  for (const key of [...ctx.store.operations.keys()]) {
    if (key.startsWith(`${tenantId}|`)) ctx.store.operations.delete(key);
  }
  for (const [key, value] of Object.entries((doc.operations as Record<string, never>) ?? {})) {
    ctx.store.operations.set(key, value);
  }

  const auditKept = ctx.store.audit.filter((entry) => entry.tenantId !== tenantId);
  const auditLoaded = (doc.audit as typeof ctx.store.audit | undefined) ?? [];
  ctx.store.audit.length = 0;
  ctx.store.audit.push(...auditKept, ...auditLoaded);
}

export interface TenantStatePort {
  /** Operación que puede escribir: cerrojo, efecto y escritura en una transacción. */
  mutate<T>(tenantId: string, run: () => Promise<T>): Promise<T>;
  /** Operación de sólo lectura: carga bajo el mismo cerrojo para no pisar a un escritor. */
  read<T>(tenantId: string, run: () => Promise<T>): Promise<T>;
}

interface Loaded {
  version: number;
  doc: Document;
}

const STATE_COLUMNS = 'state, version';

function pgCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
}

export class PgTenantStateStore implements TenantStatePort {
  constructor(
    private readonly pool: Pool,
    private readonly ctx: Ctx,
  ) {}

  async read<T>(tenantId: string, run: () => Promise<T>): Promise<T> {
    return this.withLock(tenantId, 'read', run);
  }

  async mutate<T>(tenantId: string, run: () => Promise<T>): Promise<T> {
    return this.withLock(tenantId, 'mutate', run);
  }

  private async withLock<T>(tenantId: string, mode: 'read' | 'mutate', run: () => Promise<T>): Promise<T> {
    let client: PoolClient | undefined;
    let loaded = false;
    try {
      client = await this.pool.connect();
      await client.query('begin');
      await client.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
      try {
        // Las columnas de `tenant_state` sólo se leen con RLS aplicada.
        await client.query('set local role authenticated');
      } catch (error) {
        if (pgCode(error) === '42501') throw new MarketingError('DEPENDENCY_MISSING', 'authenticated_role_not_granted');
        throw error;
      }
      const state = await this.selectForUpdate(client, tenantId);
      importTenantState(this.ctx, tenantId, state.doc);
      loaded = true;

      const result = await run();

      if (mode === 'mutate') {
        const next = exportTenantState(this.ctx, tenantId);
        await client.query(
          'update tenant_state set state = $2::jsonb, version = version + 1, updated_at = now() where tenant_id = $1',
          [tenantId, JSON.stringify(next)],
        );
      }
      await client.query('commit');
      return result;
    } catch (error) {
      await client?.query('rollback').catch(() => undefined);
      // Si el efecto ya se aplicó en memoria y no se pudo escribir, la copia se
      // descarta: la petición siguiente vuelve a cargar el documento.
      if (loaded) this.clearTenant(tenantId);
      if (error instanceof MarketingError) throw error;
      throw new MarketingError('UNAVAILABLE', 'state_write_failed', { retryable: true, reconciliationRequired: true });
    } finally {
      client?.release();
    }
  }

  private async selectForUpdate(client: PoolClient, tenantId: string): Promise<Loaded> {
    const first = await client.query<{ state: Document; version: string }>(
      `select ${STATE_COLUMNS} from tenant_state where tenant_id = $1 for update`,
      [tenantId],
    );
    if (first.rowCount && first.rows[0]) {
      return { version: Number(first.rows[0].version), doc: first.rows[0].state ?? {} };
    }
    // Primer acceso del tenant: el documento nace vacío y ya queda bloqueado.
    await client.query("insert into tenant_state (tenant_id, state) values ($1, '{}'::jsonb) on conflict (tenant_id) do nothing", [
      tenantId,
    ]);
    const created = await client.query<{ state: Document; version: string }>(
      `select ${STATE_COLUMNS} from tenant_state where tenant_id = $1 for update`,
      [tenantId],
    );
    const row = created.rows[0];
    if (!row) throw new MarketingError('UNAVAILABLE', 'state_row_missing', { retryable: true });
    return { version: Number(row.version), doc: row.state ?? {} };
  }

  private clearTenant(tenantId: string): void {
    try {
      importTenantState(this.ctx, tenantId, {});
    } catch {
      // Si ni siquiera se puede limpiar, el siguiente acceso vuelve a importar.
    }
  }
}
