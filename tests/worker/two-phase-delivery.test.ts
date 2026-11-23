import { describe, expect, it } from 'vitest';
import { createApp } from '../../apps/api/src/app';
import { createSupabaseJwtVerifier, signTestJwt } from '../../apps/api/src/auth';
import type { TenantStatePort } from '../../apps/api/src/state';
import { expireLeases, leaseIntents, settleIntent } from '@agntia/core';
import type { SendRequest } from '@agntia/adapters';
import { AUD, ISS, SECRET, TENANT_A, commitCampaign, makeHarness, setupApprovedCampaign } from '../support/harness';

/**
 * MKT-C22 · Entrega en dos fases (rebanada vertical campaña → commit → lease →
 * delivery → receipt).
 *
 * Lo que se comprueba aquí es la forma de la transacción, que ninguna prueba de
 * resultado final detecta: el reclamo y la liquidación van bajo el cerrojo del
 * tenant, pero **la llamada al proveedor no**. Si esto se rompe, un proveedor
 * lento vuelve a retener el tenant entero y el cerrojo deja de ser corto.
 */
const headers = (token: string): Record<string, string> => ({
  authorization: `Bearer ${token}`,
  'content-type': 'application/json',
  'idempotency-key': `idem-${Math.random().toString(36).slice(2, 12)}`,
  'x-correlation-id': 'corr_two_phase',
});

describe('MKT-C22 · entrega en dos fases', () => {
  it('envía fuera del cerrojo y liquida en una transacción aparte', async () => {
    const h = await makeHarness();
    h.ctx.store.memberships.push({
      tenantId: TENANT_A,
      actorId: 'worker_tp',
      roles: ['worker'],
      scopes: ['marketing.*'],
      isHuman: false,
    });
    const setup = await setupApprovedCampaign(h);
    const commit = await commitCampaign(h, setup.campaignId, setup.approvalRef);
    expect(commit.status).toBe(200);
    const queued = commit.json.payload.queued as number;
    expect(queued).toBeGreaterThan(0);

    let open = 0;
    let maxOpenDuringSend = -1;
    let mutations = 0;
    const state: TenantStatePort = {
      async mutate<T>(_tenantId: string, run: () => Promise<T>): Promise<T> {
        mutations += 1;
        open += 1;
        try {
          return await run();
        } finally {
          open -= 1;
        }
      },
      async read<T>(_tenantId: string, run: () => Promise<T>): Promise<T> {
        return run();
      },
    };

    const registry = {
      ...h.registry,
      email_sandbox: {
        provider: 'email_sandbox' as const,
        capabilities: () => h.sandbox.capabilities(),
        health: () => h.sandbox.health(),
        send: async (req: SendRequest) => {
          maxOpenDuringSend = Math.max(maxOpenDuringSend, open);
          return h.sandbox.send(req);
        },
      },
    };

    const app = createApp({
      ctx: h.ctx,
      registry,
      verifier: createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET }),
      state,
    });
    const token = await signTestJwt({ secret: SECRET, issuer: ISS, audience: AUD, sub: 'worker_tp', tenantId: TENANT_A });

    const res = await app.request('/v1/marketing/internal/deliver', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ workerId: 'worker_tp', limit: 25, provider: 'email_sandbox' }),
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { payload: Array<{ intentId: string; state: string }> };
    expect(body.payload).toHaveLength(queued);
    expect(body.payload.every((o) => o.state === 'confirmed')).toBe(true);
    expect(h.sandbox.sent).toHaveLength(queued);

    // La red ocurrió con cero transacciones abiertas.
    expect(maxOpenDuringSend).toBe(0);
    // Reclamo + liquidación + persistencia de la idempotencia.
    expect(mutations).toBe(3);

    const receipts = h.ctx.store.receipts.filter((r) => r.tenantId === TENANT_A);
    expect(receipts).toHaveLength(queued);
    expect(new Set(receipts.map((r) => r.intentId)).size).toBe(queued);
  });

  it('un lease huérfano queda incierto y no se reenvía', async () => {
    const h = await makeHarness();
    const setup = await setupApprovedCampaign(h);
    const commit = await commitCampaign(h, setup.campaignId, setup.approvalRef);
    const queued = commit.json.payload.queued as number;

    // El proceso reclama y muere antes de enviar: quedan `leased`.
    const leased = leaseIntents(h.ctx, TENANT_A, 'worker_crash', 25);
    expect(leased).toHaveLength(queued);

    h.advance(120_000);
    const expiry = expireLeases(h.ctx, TENANT_A, 60_000, 'worker_crash');
    expect(expiry.expired).toBe(queued);

    const intents = h.ctx.store.intents.filter((i) => i.tenantId === TENANT_A && i.campaignId === setup.campaignId);
    expect(intents).toHaveLength(queued);
    expect(intents.every((i) => i.state === 'unknown' && i.reconciliationRequired && i.lastError === 'lease_expired')).toBe(true);

    // `leaseIntents` sólo toma `queued`: el huérfano nunca vuelve a la cola.
    expect(leaseIntents(h.ctx, TENANT_A, 'worker_next', 25)).toHaveLength(0);
    expect(h.sandbox.sent).toHaveLength(0);
    expect(h.ctx.store.receipts).toHaveLength(0);
  });

  it('una liquidación con fence viejo no reescribe el resultado', async () => {
    const h = await makeHarness();
    const setup = await setupApprovedCampaign(h);
    await commitCampaign(h, setup.campaignId, setup.approvalRef);

    const first = leaseIntents(h.ctx, TENANT_A, 'worker_a', 1)[0]!;
    const settled = settleIntent(h.ctx, TENANT_A, first.id, first.fence + 1, { kind: 'accepted', remoteId: 'sbx_late' }, 'email_sandbox');

    expect(settled.applied).toBe(false);
    expect(settled.code).toBe('lease_conflict');
    const intent = h.ctx.store.intents.find((i) => i.id === first.id)!;
    expect(intent.state).toBe('leased');
    expect(h.ctx.store.receipts).toHaveLength(0);
  });

  it('la liquidación no aplica dos veces el mismo envío', async () => {
    const h = await makeHarness();
    const setup = await setupApprovedCampaign(h);
    await commitCampaign(h, setup.campaignId, setup.approvalRef);

    const first = leaseIntents(h.ctx, TENANT_A, 'worker_a', 1)[0]!;
    const applied = settleIntent(h.ctx, TENANT_A, first.id, first.fence, { kind: 'accepted', remoteId: 'sbx_once' }, 'email_sandbox');
    const again = settleIntent(h.ctx, TENANT_A, first.id, first.fence, { kind: 'accepted', remoteId: 'sbx_once' }, 'email_sandbox');

    expect(applied.applied).toBe(true);
    expect(applied.state).toBe('confirmed');
    expect(again.applied).toBe(false);
    expect(again.code).toBe('lease_not_held:confirmed');
    expect(h.ctx.store.receipts).toHaveLength(1);
  });
});
