import { createRegistry } from '@agntia/adapters';
import { createStore, upsertContacts, resolvePrincipal } from '@agntia/core';
import { runWorkerLoop, WorkerFatalError, type WorkerConfig } from './client';
import { runWorkerOnce } from './worker';

/**
 * Worker de outbox (MKT-C22).
 *
 * Con `WORKER_API_URL` + `WORKER_JWT` actúa como proceso de producto: reclama y
 * entrega por la ruta interna del API, que persiste en `tenant_state`, y nunca
 * toca la base directamente. Sin esas variables se ejecuta el ciclo en memoria
 * de siempre, avisándolo: es una demostración, no un worker de producto.
 */
const providerEnv = process.env.WORKER_PROVIDER;
if (providerEnv && providerEnv !== 'email_sandbox') {
  // El proveedor sale de una allowlist: un valor de entorno no amplía el efecto.
  throw new Error('worker_provider_not_allowed');
}

const apiBaseUrl = process.env.WORKER_API_URL;
const token = process.env.WORKER_JWT;
const workerId = process.env.WORKER_ID ?? `worker_${process.pid}`;
const provider = providerEnv === 'email_sandbox' ? ('email_sandbox' as const) : undefined;

if (!apiBaseUrl || !token) {
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
} else {
  const config: WorkerConfig = {
    apiBaseUrl,
    token,
    workerId,
    ...(provider ? { provider } : {}),
    ...(process.env.WORKER_LIMIT ? { limit: Number(process.env.WORKER_LIMIT) } : {}),
  };

  try {
    const report = await runWorkerLoop(config, {
      ...(process.env.WORKER_INTERVAL_MS ? { intervalMs: Number(process.env.WORKER_INTERVAL_MS) } : {}),
      ...(process.env.WORKER_IDLE_ROUNDS ? { idleRoundsToStop: Number(process.env.WORKER_IDLE_ROUNDS) } : {}),
    });
    console.log(JSON.stringify({ mode: 'durable', ...report }, null, 2));
  } catch (error) {
    if (error instanceof WorkerFatalError) {
      // Fallo que reintentar no arregla: se informa y se sale con código propio.
      console.error(JSON.stringify({ mode: 'durable', workerId, status: error.status, detail: error.detail }));
      process.exitCode = 2;
    } else {
      throw error;
    }
  }
}
