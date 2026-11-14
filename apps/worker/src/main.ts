import { createRegistry } from '@agntia/adapters';
import { createStore, upsertContacts, resolvePrincipal } from '@agntia/core';
import { runWorkerOnce } from './worker';

/**
 * Worker de demostración: usa el store en memoria y un tenant sandbox. En
 * producción debe conectarse al repositorio Postgres con RLS y ejecutarse con
 * delegación verificada; hoy el bucle sólo demuestra el ciclo outbox → receipt.
 */
const ctx = createStore();
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

const run = await runWorkerOnce(ctx, registry, { tenantId: 'tenant_sandbox', workerId: 'worker_local_1' });
console.log(JSON.stringify({ run, outbox: ctx.store.intents.length }, null, 2));
