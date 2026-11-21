import { createRegistry } from '@agntia/adapters';
import { createStore, upsertContacts, resolvePrincipal } from '@agntia/core';
import { runWorkerDaemon, runWorkerLoop, WorkerFatalError, type WorkerConfig } from './client';
import { runWorkerOnce } from './worker';

/**
 * Worker de outbox (MKT-C22).
 *
 * Tres modos, y el proceso dice siempre en qué modo está:
 *
 * - `daemon`: servicio de verdad. Con `WORKER_API_URL` + `WORKER_JWT`, reclama y
 *   entrega en bucle sin parar por inactividad, late en cada vuelta vacía y sale
 *   ordenadamente con `SIGTERM`/`SIGINT` (código 0) o degradado (código 3).
 * - `drain`: una pasada acotada que termina al quedarse sin trabajo. Es el modo
 *   de humo y de tareas programadas.
 * - `demo`: sin variables de API corre el ciclo en memoria y **avisa**: el estado
 *   se pierde al salir y eso no es un worker de producto.
 *
 * En ningún caso se toca la base directamente: todo pasa por la ruta interna del
 * API, que corre el dominio dentro del cerrojo del tenant.
 */
const providerEnv = process.env.WORKER_PROVIDER;
if (providerEnv && providerEnv !== 'email_sandbox') {
  // El proveedor sale de una allowlist: un valor de entorno no amplía el efecto.
  throw new Error('worker_provider_not_allowed');
}

/** Entero de entorno con mínimo; un valor inválido detiene el proceso. */
function envInt(name: string, fallback: number, min: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min) throw new Error(`worker_env_invalid:${name}`);
  return value;
}

const daemonMode = /^(1|true|yes)$/i.test(process.env.WORKER_DAEMON ?? '') || process.env.WORKER_MODE === 'daemon';
const apiBaseUrl = process.env.WORKER_API_URL;
const token = process.env.WORKER_JWT;
const workerId = process.env.WORKER_ID ?? `worker_${process.pid}`;
const provider = providerEnv === 'email_sandbox' ? ('email_sandbox' as const) : undefined;

const log = (event: Record<string, unknown>): void => {
  console.log(JSON.stringify(event));
};

const fatalExit = (error: unknown, extra: Record<string, unknown> = {}): void => {
  if (error instanceof WorkerFatalError) {
    // Fallo que reintentar no arregla: se informa y se sale con código propio.
    log({ event: 'worker_fatal', workerId, status: error.status, detail: error.detail, ...extra });
    process.exitCode = 2;
    return;
  }
  throw error;
};

if (!apiBaseUrl || !token) {
  if (daemonMode) {
    // Un servicio no puede degradarse a demo por una variable ausente.
    log({ event: 'worker_config_invalid', detail: 'WORKER_API_URL_and_WORKER_JWT_required_in_daemon_mode' });
    process.exit(2);
  }

  console.warn('worker_mode=demo: sin WORKER_API_URL y WORKER_JWT se ejecuta el ciclo en memoria y el estado se pierde al salir');

  const ctx = createStore(() => new Date());
  const registry = createRegistry();

  ctx.store.tenants.set('tenant_sandbox', { id: 'tenant_sandbox', name: 'Sandbox', plan: 'sandbox', createdAt: ctx.now().toISOString() });
  ctx.store.memberships.push({
    tenantId: 'tenant_sandbox',
    actorId: 'worker_system',
    roles: ['worker'],
    scopes: ['marketing.*'],
    isHuman: false,
  });

  const worker = resolvePrincipal(
    ctx,
    { sub: 'worker_system', tenantId: 'tenant_sandbox', expiresAt: Math.floor(ctx.now().getTime() / 1000) + 600 },
    'marketing.context.read',
  );

  upsertContacts(
    ctx,
    worker,
    Array.from({ length: 3 }, (_, i) => ({
      id: `sandbox_${i + 1}`,
      emailRef: `ref_${i + 1}`,
      country: 'ES',
      locale: 'es' as const,
      lifecycleStage: 'lead' as const,
      interestTopic: 'growth',
      consent: { marketing: true },
      engagedDays: 30,
      isBusiness: true,
    })),
  );

  const run = await runWorkerOnce(ctx, registry, { tenantId: 'tenant_sandbox', workerId });
  console.log(JSON.stringify({ mode: 'demo', run, outbox: ctx.store.intents.length }, null, 2));
} else if (daemonMode) {
  await runDaemon({ apiBaseUrl, token, workerId, ...(provider ? { provider } : {}), limit: envInt('WORKER_LIMIT', 25, 1) });
} else {
  const config: WorkerConfig = {
    apiBaseUrl,
    token,
    workerId,
    ...(provider ? { provider } : {}),
    limit: envInt('WORKER_LIMIT', 25, 1),
  };

  try {
    const report = await runWorkerLoop(config, {
      intervalMs: envInt('WORKER_INTERVAL_MS', 250, 0),
      idleRoundsToStop: envInt('WORKER_IDLE_ROUNDS', 3, 1),
    });
    console.log(JSON.stringify({ mode: 'durable', ...report }, null, 2));
  } catch (error) {
    fatalExit(error);
  }
}

/** Demonio: bucle vivo, latido por vuelta vacía y parada ordenada por señal. */
async function runDaemon(config: WorkerConfig): Promise<void> {
  const intervalMs = envInt('WORKER_INTERVAL_MS', 250, 0);
  const idleIntervalMs = envInt('WORKER_IDLE_INTERVAL_MS', 5_000, 0);
  const maxConsecutiveErrors = envInt('WORKER_MAX_CONSECUTIVE_ERRORS', 30, 0);
  const controller = new AbortController();

  const stop = (signal: NodeJS.Signals) => {
    if (controller.signal.aborted) return;
    // No se aborta la vuelta en curso: el envío puede haber salido ya y
    // abortarlo dejaría el intent `queued` con el mensaje entregado.
    log({ event: 'worker_stopping', workerId: config.workerId, signal });
    controller.abort();
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);

  log({
    event: 'worker_started',
    mode: 'daemon',
    workerId: config.workerId,
    apiBaseUrl: config.apiBaseUrl,
    limit: config.limit ?? 25,
    provider: config.provider ?? 'email_sandbox',
    intervalMs,
    idleIntervalMs,
    maxConsecutiveErrors,
  });

  try {
    const report = await runWorkerDaemon(config, {
      signal: controller.signal,
      intervalMs,
      idleIntervalMs,
      maxConsecutiveErrors,
      onRound: ({ round, result, durationMs }) =>
        log({ event: 'worker_round', workerId: config.workerId, round, durationMs, ...result }),
      onIdle: ({ idleMs }) => log({ event: 'worker_idle', workerId: config.workerId, idleMs }),
    });
    log({ event: 'worker_stopped', mode: 'daemon', ...report });
    if (report.stopReason === 'degraded') process.exitCode = 3;
  } catch (error) {
    fatalExit(error);
  }
}
