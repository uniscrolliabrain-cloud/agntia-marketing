import { describe, expect, it } from 'vitest';
import { runWorkerDaemon, WorkerFatalError, type WorkerConfig } from '../../apps/worker/src/client';

/**
 * MKT-C22 · El worker como servicio.
 *
 * Sin base de datos: aquí se prueba lo que distingue a un servicio de un trabajo
 * por lotes — sigue vivo sin trabajo, late más despacio cuando está ocioso, no
 * corta una entrega en curso al recibir la señal y termina en vez de fingir
 * salud cuando el API no responde. La entrega durable está en
 * `tests/db/worker-drain.test.ts` y en el humo de `docs/evidence/`.
 */
const config: WorkerConfig = { apiBaseUrl: 'http://api.test', token: 'tok_worker', workerId: 'w_daemon' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const empty = () => json({ payload: [] });
const confirmed = () => json({ payload: [{ state: 'confirmed' }] });

describe('worker como servicio · bucle vivo', () => {
  it('sigue reclamando después de varias vueltas vacías y para con la señal', async () => {
    const controller = new AbortController();
    const queue: Array<() => Response> = [empty, empty, empty, confirmed];
    let calls = 0;

    const report = await runWorkerDaemon(config, {
      signal: controller.signal,
      intervalMs: 1,
      idleIntervalMs: 1,
      fetch: async () => {
        const next = queue[calls] ?? empty;
        calls += 1;
        // La señal llega con la entrega ya en curso: debe contarse igual.
        if (calls === 4) controller.abort();
        return next();
      },
      sleep: async () => undefined,
    });

    expect(report).toMatchObject({ rounds: 4, drained: 1, confirmed: 1, idleRounds: 3, stopReason: 'signal' });
    expect(calls).toBe(4);
  });

  it('no reclama nada si la señal ya está abortada', async () => {
    const controller = new AbortController();
    controller.abort();
    let calls = 0;

    const report = await runWorkerDaemon(config, {
      signal: controller.signal,
      fetch: async () => {
        calls += 1;
        return empty();
      },
      sleep: async () => undefined,
    });

    expect(report).toMatchObject({ rounds: 0, drained: 0, stopReason: 'signal' });
    expect(calls).toBe(0);
  });

  it('espera más entre vueltas vacías que entre vueltas con trabajo', async () => {
    const sleeps: number[] = [];
    const controller = new AbortController();
    let calls = 0;

    const report = await runWorkerDaemon(config, {
      signal: controller.signal,
      intervalMs: 10,
      idleIntervalMs: 1000,
      fetch: async () => {
        calls += 1;
        return calls === 1 ? confirmed() : empty();
      },
      sleep: async (ms) => {
        sleeps.push(ms);
        if (sleeps.length === 2) controller.abort();
      },
    });

    expect(sleeps).toEqual([10, 1000]);
    expect(report).toMatchObject({ rounds: 2, drained: 1, confirmed: 1, stopReason: 'signal' });
  });

  it('reporta el latido de cada vuelta vacía', async () => {
    const idles: number[] = [];
    const controller = new AbortController();
    let calls = 0;

    await runWorkerDaemon(config, {
      signal: controller.signal,
      idleIntervalMs: 4242,
      fetch: async () => {
        calls += 1;
        return empty();
      },
      onIdle: ({ idleMs }) => {
        idles.push(idleMs);
        if (idles.length === 2) controller.abort();
      },
      sleep: async () => undefined,
    });

    expect(idles).toEqual([4242, 4242]);
    expect(calls).toBe(2);
  });

  it('no aborta la entrega en curso cuando llega la señal', async () => {
    const controller = new AbortController();
    let resolveFetch: ((response: Response) => void) | undefined;
    let seenSignal: AbortSignal | null | undefined;
    let calls = 0;

    const pending = runWorkerDaemon(config, {
      signal: controller.signal,
      intervalMs: 1,
      fetch: (_url, init) => {
        calls += 1;
        seenSignal = init.signal;
        return new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        });
      },
      sleep: async () => undefined,
    });

    // Dejamos que la vuelta llegue a la petición y entonces pedimos parar.
    await new Promise((resolve) => setTimeout(resolve, 0));
    controller.abort();
    expect(seenSignal?.aborted).toBe(false);

    resolveFetch?.(confirmed());
    const report = await pending;

    // La señal de parada no se propaga a la petición: se termina y se cuenta.
    expect(seenSignal?.aborted).toBe(false);
    expect(report).toMatchObject({ rounds: 1, drained: 1, confirmed: 1, stopReason: 'signal' });
    expect(calls).toBe(1);
  });

  it('avisa de cada vuelta con su duración y su recuento', async () => {
    const rounds: Array<{ round: number; durationMs: number; confirmed: number }> = [];
    const controller = new AbortController();

    await runWorkerDaemon(config, {
      signal: controller.signal,
      fetch: async () => confirmed(),
      onRound: ({ round, result, durationMs }) => {
        rounds.push({ round, durationMs, confirmed: result.confirmed });
        if (round === 2) controller.abort();
      },
      sleep: async () => undefined,
    });

    expect(rounds.map((r) => r.round)).toEqual([1, 2]);
    expect(rounds.map((r) => r.confirmed)).toEqual([1, 1]);
    expect(rounds.every((r) => r.durationMs >= 0)).toBe(true);
  });
});

describe('worker como servicio · fallos', () => {
  it('absorbe fallos transitorios y reinicia el contador tras una vuelta buena', async () => {
    const controller = new AbortController();
    const statuses = [503, 503, 200, 503, 200];
    const waits: number[] = [];
    let calls = 0;

    const report = await runWorkerDaemon(config, {
      signal: controller.signal,
      maxConsecutiveErrors: 3,
      backoffMs: 7,
      maxBackoffMs: 100,
      idleIntervalMs: 5,
      fetch: async () => {
        const status = statuses[calls] ?? 200;
        calls += 1;
        return status === 200 ? empty() : json({ error: { detail: 'state_write_failed' } }, status);
      },
      sleep: async (ms) => {
        waits.push(ms);
        if (calls >= statuses.length) controller.abort();
      },
    });

    // Dos fallos seguidos, una vuelta buena (reinicia), otro fallo, otra buena.
    expect(report.transientErrors).toBe(3);
    expect(report.stopReason).toBe('signal');
    expect(waits).toEqual([7, 14, 5, 7, 5]);
  });

  it('termina degradado tras fallos transitorios consecutivos', async () => {
    let calls = 0;
    let slept = 0;

    const report = await runWorkerDaemon(config, {
      maxConsecutiveErrors: 3,
      backoffMs: 1,
      fetch: async () => {
        calls += 1;
        return json({ error: { detail: 'api_down' } }, 503);
      },
      sleep: async () => {
        slept += 1;
      },
    });

    expect(report).toMatchObject({ rounds: 0, drained: 0, transientErrors: 3, stopReason: 'degraded', lastError: 'api_down' });
    expect(calls).toBe(3);
    // El fallo que alcanza el umbral no vuelve a esperar: se sale.
    expect(slept).toBe(2);
  });

  it('con `maxConsecutiveErrors: 0` no se rinde por fallos transitorios', async () => {
    const controller = new AbortController();
    let calls = 0;

    const report = await runWorkerDaemon(config, {
      signal: controller.signal,
      maxConsecutiveErrors: 0,
      backoffMs: 1,
      fetch: async () => {
        calls += 1;
        return json({ error: { detail: 'api_down' } }, 503);
      },
      sleep: async () => {
        if (calls >= 4) controller.abort();
      },
    });

    expect(report).toMatchObject({ transientErrors: 4, rounds: 0, stopReason: 'signal' });
  });

  it('propaga el fallo permanente en vez de reintentarlo', async () => {
    let calls = 0;
    await expect(
      runWorkerDaemon(config, {
        fetch: async () => {
          calls += 1;
          return json({ error: { detail: 'token_invalid' } }, 401);
        },
        sleep: async () => undefined,
      }),
    ).rejects.toBeInstanceOf(WorkerFatalError);
    expect(calls).toBe(1);
  });
});
