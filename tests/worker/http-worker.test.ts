import { describe, expect, it } from 'vitest';
import { drainOnce, runWorkerLoop, WorkerFatalError, WorkerTransientError, type WorkerConfig } from '../../apps/worker/src/client';

/**
 * MKT-C22 · Proceso de outbox: contrato HTTP, reintentos y parada.
 *
 * Sin base de datos: aquí se prueba la parte que decide cuándo insistir y cuándo
 * rendirse. Que la entrega sea durable se prueba en `tests/db/worker-drain.test.ts`.
 */
const config: WorkerConfig = { apiBaseUrl: 'http://api.test/', token: 'tok_worker', workerId: 'w1' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('worker de outbox · contrato', () => {
  it('reclama por la ruta interna con token, idempotencia y límite', async () => {
    let seen: { url: string; init: RequestInit } | undefined;
    const result = await drainOnce(
      { ...config, limit: 7, provider: 'email_sandbox' },
      {
        fetch: async (url, init) => {
          seen = { url, init };
          return json({ payload: [{ state: 'confirmed' }, { state: 'unknown' }, { state: 'failed' }, { state: 'queued' }] });
        },
      },
    );

    expect(result).toEqual({ leased: 4, confirmed: 1, unknown: 1, failed: 1, requeued: 1 });
    expect(seen!.url).toBe('http://api.test/v1/marketing/internal/deliver');
    const headers = seen!.init.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer tok_worker');
    expect(headers['idempotency-key']!.length).toBeGreaterThanOrEqual(8);
    expect(JSON.parse(String(seen!.init.body))).toEqual({ workerId: 'w1', limit: 7, provider: 'email_sandbox' });
  });

  it('cuenta una vuelta sin trabajo como vacía, no como error', async () => {
    const result = await drainOnce(config, { fetch: async () => json({ payload: [] }) });
    expect(result).toEqual({ leased: 0, confirmed: 0, failed: 0, unknown: 0, requeued: 0 });
  });

  it('no reintenta un token rechazado', async () => {
    let calls = 0;
    await expect(
      drainOnce(config, {
        fetch: async () => {
          calls += 1;
          return json({ error: { detail: 'token_invalid' } }, 401);
        },
      }),
    ).rejects.toBeInstanceOf(WorkerFatalError);
    expect(calls).toBe(1);

    let fatal: WorkerFatalError | undefined;
    try {
      await drainOnce(config, { fetch: async () => json({ error: { detail: 'principal_lookup_failed' } }, 424) });
    } catch (error) {
      fatal = error as WorkerFatalError;
    }
    expect(fatal?.status).toBe(424);
    expect(fatal?.detail).toBe('principal_lookup_failed');
  });

  it('trata 5xx y red caída como transitorios', async () => {
    await expect(drainOnce(config, { fetch: async () => json({ error: { detail: 'state_write_failed' } }, 503) })).rejects.toBeInstanceOf(
      WorkerTransientError,
    );
    await expect(
      drainOnce(config, {
        fetch: async () => {
          throw new TypeError('fetch failed');
        },
      }),
    ).rejects.toBeInstanceOf(WorkerTransientError);
  });

  it('falla cerrado si la respuesta no respeta el contrato', async () => {
    await expect(drainOnce(config, { fetch: async () => json({ payload: 'nope' }) })).rejects.toBeInstanceOf(WorkerFatalError);
    await expect(drainOnce(config, { fetch: async () => json({ payload: [{ state: 'delivered_magic' }] }) })).rejects.toBeInstanceOf(
      WorkerFatalError,
    );
    await expect(drainOnce(config, { fetch: async () => new Response('<html>', { status: 200 }) })).rejects.toBeInstanceOf(WorkerFatalError);
  });
});

describe('worker de outbox · bucle', () => {
  const empty = async () => json({ payload: [] });

  it('para tras varias vueltas sin trabajo', async () => {
    const sleeps: number[] = [];
    const report = await runWorkerLoop(config, {
      idleRoundsToStop: 2,
      intervalMs: 10,
      fetch: empty,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    });

    expect(report).toMatchObject({ rounds: 2, drained: 0, idleRounds: 2, stopReason: 'idle', transientErrors: 0 });
    // Sólo se espera entre vueltas: la que decide parar ya no duerme.
    expect(sleeps).toEqual([10]);
  });

  it('absorbe un fallo transitorio con backoff, entrega y luego para', async () => {
    const queue: Array<{ status: number; body: unknown }> = [
      { status: 503, body: { error: { detail: 'state_write_failed' } } },
      { status: 200, body: { payload: [{ state: 'confirmed' }] } },
      { status: 200, body: { payload: [] } },
      { status: 200, body: { payload: [] } },
    ];
    let calls = 0;
    const sleeps: number[] = [];
    const report = await runWorkerLoop(config, {
      idleRoundsToStop: 2,
      backoffMs: 100,
      intervalMs: 10,
      fetch: async () => {
        const next = queue[calls] ?? { status: 200, body: { payload: [] } };
        calls += 1;
        return json(next.body, next.status);
      },
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    });

    expect(report).toMatchObject({ rounds: 3, drained: 1, confirmed: 1, transientErrors: 1, stopReason: 'idle' });
    expect(sleeps).toEqual([100, 10, 10]);
  });

  it('propaga el error permanente en vez de insistir', async () => {
    let calls = 0;
    await expect(
      runWorkerLoop(config, {
        fetch: async () => {
          calls += 1;
          return json({ error: { detail: 'ack_signing_unconfigured' } }, 424);
        },
        sleep: async () => undefined,
      }),
    ).rejects.toBeInstanceOf(WorkerFatalError);
    expect(calls).toBe(1);
  });

  it('respeta el techo de vueltas cuando siempre hay trabajo', async () => {
    let calls = 0;
    const report = await runWorkerLoop(config, {
      maxRounds: 3,
      fetch: async () => {
        calls += 1;
        return json({ payload: [{ state: 'confirmed' }, { state: 'confirmed' }] });
      },
      sleep: async () => undefined,
    });
    expect(report).toMatchObject({ rounds: 3, drained: 6, confirmed: 6, stopReason: 'max_rounds' });
    expect(calls).toBe(3);
  });
});
