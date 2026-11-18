import type { Pool } from 'pg';
import type { RateLimiter, RateLimitDecision } from '@agntia/core';

/**
 * MKT-C38 · Rate limit compartido en Postgres.
 *
 * Cada consumo abre una transacción, fija `app.tenant_id` (la policy RLS y la
 * función lo exigen) y llama a `consume_rate_limit`. El contador es la fuente
 * de verdad: dos instancias del API comparten la misma ventana.
 */
export class PgRateLimiter implements RateLimiter {
  constructor(private readonly pool: Pool) {}

  async consume(tenantId: string, limit: number, nowMs: number): Promise<RateLimitDecision> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
      const result = await client.query<{ allowed: boolean; used_count: number; window_begin: Date }>(
        'select allowed, used_count, window_begin from consume_rate_limit($1, $2, to_timestamp($3 / 1000.0))',
        [tenantId, limit, nowMs],
      );
      await client.query('commit');
      const row = result.rows[0];
      if (!row) throw new Error('rate_limit_no_row');
      return {
        allowed: row.allowed,
        remaining: Math.max(0, limit - row.used_count),
        resetAt: new Date(row.window_begin).getTime() + 60_000,
      };
    } catch (error) {
      await client.query('rollback').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
}
