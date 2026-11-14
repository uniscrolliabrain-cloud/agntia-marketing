import type { AdapterRegistry } from '@agntia/adapters';
import { deliverIntent, leaseIntents, settleCampaign, type Ctx } from '@agntia/core';

export interface WorkerOptions {
  tenantId: string;
  workerId: string;
  limit?: number;
  provider?: 'email_sandbox';
}

export interface WorkerRun {
  workerId: string;
  leased: number;
  delivered: number;
  failed: number;
  unknown: number;
  campaignsSettled: string[];
}

/**
 * Worker de outbox (MKT-C22). Reclama con fence, entrega con adaptador
 * allowlist, registra receipts y cierra campañas cuando no queda trabajo.
 * Un resultado `unknown` NO se reintenta: queda para reconciliación humana.
 */
export async function runWorkerOnce(ctx: Ctx, registry: AdapterRegistry, options: WorkerOptions): Promise<WorkerRun> {
  const provider = options.provider ?? 'email_sandbox';
  const leased = leaseIntents(ctx, options.tenantId, options.workerId, options.limit ?? 25);
  const run: WorkerRun = { workerId: options.workerId, leased: leased.length, delivered: 0, failed: 0, unknown: 0, campaignsSettled: [] };

  for (const intent of leased) {
    const outcome = await deliverIntent(ctx, registry, intent.id, intent.fence, provider);
    if (outcome.state === 'confirmed') run.delivered += 1;
    else if (outcome.state === 'unknown') run.unknown += 1;
    else if (outcome.state === 'failed') run.failed += 1;
    else run.failed += 1; // requeued: no cuenta como entregado
  }

  const campaignIds = [...new Set(leased.map((i) => i.campaignId))];
  for (const campaignId of campaignIds) {
    const settled = settleCampaign(ctx, options.tenantId, campaignId);
    if (settled.remaining === 0) run.campaignsSettled.push(`${campaignId}:${settled.state}`);
  }
  return run;
}
