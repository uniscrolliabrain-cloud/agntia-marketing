/**
 * MKT-C38 · Rate limit por tenant con backend intercambiable.
 *
 * El API usa esta interfaz para no atarse a un contador en memoria: en una
 * sola instancia vale `MemoryRateLimiter`; con varias hace falta un backend
 * compartido (Postgres en este repo). Un backend que falle debe denegar, no
 * permitir: el llamador trata la excepción como `RATE_LIMITED`.
 */

export interface RateLimitDecision {
  allowed: boolean;
  /** Unidades disponibles tras consumir; nunca negativo. */
  remaining: number;
  /** Fin de la ventana actual, en milisegundos epoch. */
  resetAt: number;
}

export interface RateLimiter {
  consume(tenantId: string, limit: number, nowMs: number): Promise<RateLimitDecision>;
}

const WINDOW_MS = 60_000;
const MAX_TRACKED_WINDOWS = 10_000;

export class MemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, { start: number; used: number }>();

  async consume(tenantId: string, limit: number, nowMs: number): Promise<RateLimitDecision> {
    if (!Number.isInteger(limit) || limit < 1) throw new Error('rate_limit_invalid_limit');
    const windowStart = Math.floor(nowMs / WINDOW_MS) * WINDOW_MS;
    const key = `${tenantId}:${windowStart}`;
    if (this.windows.size > MAX_TRACKED_WINDOWS) this.prune(nowMs);
    const current = this.windows.get(key) ?? { start: windowStart, used: 0 };
    current.used += 1;
    this.windows.set(key, current);
    return {
      allowed: current.used <= limit,
      remaining: Math.max(0, limit - current.used),
      resetAt: windowStart + WINDOW_MS,
    };
  }

  /** Descarta ventanas cerradas para que el mapa no crezca sin límite. */
  private prune(nowMs: number): void {
    const windowStart = Math.floor(nowMs / WINDOW_MS) * WINDOW_MS;
    for (const [key, value] of this.windows) {
      if (value.start < windowStart) this.windows.delete(key);
    }
  }
}
