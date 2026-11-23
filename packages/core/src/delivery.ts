import {
  AdsProposalSchema,
  ConnectionSchema,
  MarketingError,
  type AdsProposal,
  type ConnectionInput,
} from '@agntia/contracts';
import type { AdapterRegistry, SendOutcome, SendRequest } from '@agntia/adapters';
import type { ConnectionRecord, Ctx, OutboundIntentRecord } from './store';
import type { Principal } from './authority';
import { transition } from './campaigns';
import { checkFrequency, evaluateEligibility, recordContact } from './consent';
import { newId, sha256 } from './util';

// ── Conexiones (MKT-C08) ───────────────────────────────────────────────────

export function registerConnection(ctx: Ctx, principal: Principal, input: ConnectionInput): ConnectionRecord {
  const parsed = ConnectionSchema.parse(input);
  if (!parsed.secretRef.startsWith('secret://')) throw new MarketingError('INVALID', 'secret_must_be_reference');
  if (/^(sk|pk|api[_-]?key|bearer)/i.test(parsed.secretRef)) throw new MarketingError('INVALID', 'secret_material_in_reference');
  const existing = ctx.store.connections.find((c) => c.tenantId === principal.tenantId && c.provider === parsed.provider);
  const record: ConnectionRecord = {
    id: existing?.id ?? newId('con'),
    tenantId: principal.tenantId,
    provider: parsed.provider,
    endpointRef: parsed.endpointRef,
    secretRef: parsed.secretRef,
    remoteAccountId: parsed.remoteAccountId,
    scopes: parsed.scopes,
    state: parsed.provider === 'email_sandbox' ? 'ready' : 'disabled',
    capabilityReport: {
      provider: parsed.provider,
      read: parsed.scopes,
      write: [],
      note: 'Capacidad declarada por el operador; no verificada contra la API real.',
    },
    revision: (existing?.revision ?? 0) + 1,
  };
  if (existing) Object.assign(existing, record);
  else ctx.store.connections.push(record);
  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'connection.registered', detail: record.id },
    ctx.now().toISOString(),
  );
  return record;
}

export function listConnections(ctx: Ctx, tenantId: string) {
  return ctx.store.connections
    .filter((c) => c.tenantId === tenantId)
    .map(({ secretRef: _secret, ...rest }) => rest);
}

export function integrationCapabilities(ctx: Ctx, tenantId: string, connectionId: string) {
  const connection = ctx.store.connections.find((c) => c.tenantId === tenantId && c.id === connectionId);
  if (!connection) throw new MarketingError('NOT_FOUND', 'connection_not_found');
  return {
    connectionId,
    provider: connection.provider,
    state: connection.state,
    capabilityReport: connection.capabilityReport,
    verifiedAgainstProvider: false,
    note: 'health semántico: disponible no significa verificado',
  };
}

// ── Outbox y entrega (MKT-C22/C14) ─────────────────────────────────────────

export interface DeliveryOutcome {
  intentId: string;
  state: OutboundIntentRecord['state'];
  remoteId: string | null;
  code: string | null;
}

/**
 * Reclama intents con un fence monotónico. Un worker con fence antiguo no puede
 * confirmar: evita que un reintento tardío duplique un efecto ya aceptado.
 */
export function leaseIntents(ctx: Ctx, tenantId: string, workerId: string, limit = 25): Array<OutboundIntentRecord & { fence: number }> {
  if (limit < 1 || limit > 100) throw new MarketingError('INVALID', 'limit_out_of_range');
  const now = ctx.now().toISOString();
  const leased: Array<OutboundIntentRecord & { fence: number }> = [];
  for (const intent of ctx.store.intents) {
    if (intent.tenantId !== tenantId) continue;
    if (intent.state !== 'queued') continue;
    if (Date.parse(intent.scheduledFor) > ctx.now().getTime()) continue;
    if (leased.length >= limit) break;

    // La aprobación se revisa en el momento del efecto: revocarla o dejarla
    // caducar cancela lo que aún no se ha entregado.
    const approval = ctx.store.approvals.find((a) => a.tenantId === tenantId && a.approvalRef === intent.approvalRef);
    if (!approval || approval.revokedAt || Date.parse(approval.expiresAt) <= ctx.now().getTime()) {
      intent.state = 'cancelled';
      intent.lastError = approval ? 'approval_expired' : 'approval_missing';
      intent.updatedAt = now;
      ctx.store.auditLog(
        { tenantId, actorId: workerId, action: 'intent.cancelled_at_lease', detail: `${intent.id}:${intent.lastError}` },
        now,
      );
      continue;
    }

    // Revalidación en el momento del efecto: una baja o un cambio de consentimiento
    // posterior al commit invalida la entrega, aunque exista aprobación.
    const snapshot = ctx.store.snapshots.find((s) => s.tenantId === tenantId && s.id === intent.audienceSnapshotId);
    const purpose = snapshot?.rule.purpose ?? 'marketing';
    const decision = evaluateEligibility(ctx, tenantId, intent.subjectRef, purpose, intent.channel);
    if (decision.state !== 'eligible') {
      intent.state = 'cancelled';
      intent.lastError = `ineligible:${decision.reasonCodes.join(',')}`;
      intent.updatedAt = now;
      ctx.store.auditLog(
        { tenantId, actorId: workerId, action: 'intent.cancelled_at_lease', detail: `${intent.id}:${decision.reasonCodes.join(',')}` },
        now,
      );
      continue;
    }
    const frequency = checkFrequency(ctx, tenantId, [intent.subjectRef], intent.channel)[0];
    if (frequency && !frequency.allowed) {
      intent.state = 'cancelled';
      intent.lastError = `frequency:${frequency.reasonCodes.join(',')}`;
      intent.updatedAt = now;
      ctx.store.auditLog(
        { tenantId, actorId: workerId, action: 'intent.cancelled_at_lease', detail: `${intent.id}:${frequency.reasonCodes.join(',')}` },
        now,
      );
      continue;
    }

    intent.leaseFence += 1;
    intent.state = 'leased';
    intent.attempts += 1;
    intent.updatedAt = now;
    ctx.store.auditLog(
      { tenantId, actorId: workerId, action: 'intent.leased', detail: `${intent.id}:${intent.leaseFence}` },
      now,
    );
    leased.push({ ...intent, fence: intent.leaseFence });
  }
  return leased;
}

/**
 * Entrega en dos fases (rebanada vertical campaña → commit → lease → delivery →
 * receipt). El cerrojo del tenant serializa el estado, pero **no** debe cubrir la
 * red: un proveedor lento retendría el tenant entero durante todo su timeout.
 *
 * Fase 1 `leaseIntents` (bajo cerrojo, milisegundos) → fase 2 `sendIntent` (sin
 * transacción) → fase 3 `settleIntent` (bajo cerrojo, con el fence del lease).
 * Si el proceso muere entre 2 y 3 el intent queda `leased` y `expireLeases` lo
 * deja en `unknown` para reconciliación: nunca se reenvía a ciegas.
 */
export function prepareSend(intent: OutboundIntentRecord): SendRequest {
  return {
    tenantId: intent.tenantId,
    intentId: intent.id,
    subjectRef: intent.subjectRef,
    channel: intent.channel,
    payloadHash: intent.payloadHash,
    idempotencyKey: intent.operationKey,
  };
}

/** Sólo habla con el adaptador: no lee ni escribe estado, así que no necesita el cerrojo. */
export async function sendIntent(
  registry: AdapterRegistry,
  provider: keyof AdapterRegistry,
  request: SendRequest,
): Promise<SendOutcome> {
  const adapter = registry[provider];
  if (!adapter.send) return { kind: 'failed', code: 'provider_has_no_send', retryable: false };
  try {
    return await adapter.send(request);
  } catch (err) {
    const e = err as Error;
    return { kind: 'failed', code: e.name === 'MarketingError' ? 'provider_unavailable' : 'provider_error', retryable: true };
  }
}

export interface SettlementResult extends DeliveryOutcome {
  /** `false` si el lease ya no era nuestro: no se tocó el store. */
  applied: boolean;
}

/**
 * Fase 3: aplica el resultado del envío sólo si el intent sigue `leased` con el
 * mismo fence. Sin eso, una vuelta tardía reescribiría un receipt ajeno o
 * marcaría confirmado un intent que otra vuelta ya declaró incierto.
 */
export function settleIntent(
  ctx: Ctx,
  tenantId: string,
  intentId: string,
  fence: number,
  outcome: SendOutcome,
  provider: keyof AdapterRegistry = 'email_sandbox',
): SettlementResult {
  const intent = ctx.store.intents.find((i) => i.tenantId === tenantId && i.id === intentId);
  if (!intent) throw new MarketingError('NOT_FOUND', 'intent_not_found');
  if (intent.state !== 'leased' || intent.leaseFence !== fence) {
    return {
      intentId,
      state: intent.state,
      remoteId: null,
      code: intent.state === 'leased' ? 'lease_conflict' : `lease_not_held:${intent.state}`,
      applied: false,
    };
  }

  const at = ctx.now().toISOString();
  intent.updatedAt = at;
  if (outcome.kind === 'accepted') {
    intent.state = 'confirmed';
    intent.remoteRefs.push({ kind: provider, id: outcome.remoteId });
    ctx.store.receipts.push({
      id: newId('rcp'),
      tenantId: intent.tenantId,
      intentId: intent.id,
      provider,
      remoteId: outcome.remoteId,
      state: 'accepted',
      receivedAt: at,
    });
    recordContact(ctx, intent.tenantId, intent.subjectRef, intent.channel);
    ctx.store.events.push({
      id: newId('evt'),
      tenantId: intent.tenantId,
      actorRef: `worker:${provider}`,
      occurredAt: at,
      correlationId: intent.campaignId,
      causationId: intent.id,
      type: 'marketing.effect.confirmed',
      payloadRefs: [{ kind: 'intent', id: intent.id }],
    });
    return { intentId, state: 'confirmed', remoteId: outcome.remoteId, code: null, applied: true };
  }

  if (outcome.kind === 'unknown') {
    intent.state = 'unknown';
    intent.reconciliationRequired = true;
    intent.lastError = outcome.code;
    ctx.store.events.push({
      id: newId('evt'),
      tenantId: intent.tenantId,
      actorRef: `worker:${provider}`,
      occurredAt: at,
      correlationId: intent.campaignId,
      causationId: intent.id,
      type: 'marketing.effect.outcome_unknown',
      payloadRefs: [{ kind: 'intent', id: intent.id }],
    });
    return { intentId, state: 'unknown', remoteId: null, code: outcome.code, applied: true };
  }

  intent.lastError = outcome.code;
  intent.state = outcome.retryable && intent.attempts < 3 ? 'queued' : 'failed';
  return { intentId, state: intent.state, remoteId: null, code: outcome.code, applied: true };
}

/** Una sola pasada: reclamar, enviar y liquidar (worker en memoria y pruebas). */
export async function deliverIntent(
  ctx: Ctx,
  registry: AdapterRegistry,
  intentId: string,
  fence: number,
  provider: keyof AdapterRegistry = 'email_sandbox',
): Promise<DeliveryOutcome> {
  const intent = ctx.store.intents.find((i) => i.id === intentId);
  if (!intent) throw new MarketingError('NOT_FOUND', 'intent_not_found');
  if (intent.state !== 'leased') throw new MarketingError('CONFLICT', `intent_not_leased:${intent.state}`);
  if (intent.leaseFence !== fence) throw new MarketingError('CONFLICT', 'stale_lease_fence');

  const tenantId = intent.tenantId;
  const outcome = await sendIntent(registry, provider, prepareSend(intent));
  const settled = settleIntent(ctx, tenantId, intentId, fence, outcome, provider);
  return { intentId, state: settled.state, remoteId: settled.remoteId, code: settled.code };
}

export interface LeaseExpiry {
  expired: number;
  intentIds: string[];
}

/**
 * Recuperación de leases huérfanos: un proceso que murió entre el reclamo y la
 * liquidación dejó el intent `leased`. Devolverlo a `queued` reenviaría a ciegas
 * —el remoto pudo aceptarlo—, así que pasa a `unknown` con reconciliación
 * obligatoria. `resend` no existe aquí por diseño.
 */
export function expireLeases(ctx: Ctx, tenantId: string, ttlMs: number, actorId = 'system'): LeaseExpiry {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new MarketingError('INVALID', 'lease_ttl_out_of_range');
  const now = ctx.now();
  const intentIds: string[] = [];
  for (const intent of ctx.store.intents) {
    if (intent.tenantId !== tenantId) continue;
    if (intent.state !== 'leased') continue;
    if (now.getTime() - Date.parse(intent.updatedAt) <= ttlMs) continue;

    intent.state = 'unknown';
    intent.reconciliationRequired = true;
    intent.lastError = 'lease_expired';
    intent.updatedAt = now.toISOString();
    intentIds.push(intent.id);
    ctx.store.events.push({
      id: newId('evt'),
      tenantId,
      actorRef: `worker:${actorId}`,
      occurredAt: intent.updatedAt,
      correlationId: intent.campaignId,
      causationId: intent.id,
      type: 'marketing.effect.outcome_unknown',
      payloadRefs: [{ kind: 'intent', id: intent.id }],
    });
    ctx.store.auditLog({ tenantId, actorId, action: 'intent.lease_expired', detail: intent.id }, intent.updatedAt);
  }
  return { expired: intentIds.length, intentIds };
}

export interface ReconciliationResult {
  intentId: string;
  resolved: 'delivered' | 'not_delivered' | 'duplicate';
  resend: false;
}

/**
 * Reconciliación manual/automática de un resultado incierto. Nunca reenvía a
 * ciegas: si ya estaba entregado se registra; si no, se marca fallido para que
 * una persona decida. `resend` es siempre false.
 */
export function reconcileIntent(
  ctx: Ctx,
  tenantId: string,
  intentId: string,
  resolution: 'delivered' | 'not_delivered' | 'duplicate',
  evidenceRef: string,
): ReconciliationResult {
  const intent = ctx.store.intents.find((i) => i.tenantId === tenantId && i.id === intentId);
  if (!intent) throw new MarketingError('NOT_FOUND', 'intent_not_found');
  if (intent.state !== 'unknown') throw new MarketingError('CONFLICT', `intent_not_unknown:${intent.state}`);
  if (!evidenceRef) throw new MarketingError('INVALID', 'evidence_required');

  if (resolution === 'delivered' || resolution === 'duplicate') {
    intent.state = 'confirmed';
  } else {
    intent.state = 'failed';
  }
  intent.reconciliationRequired = false;
  intent.updatedAt = ctx.now().toISOString();
  ctx.store.auditLog(
    { tenantId, actorId: 'system', action: 'intent.reconciled', detail: `${intentId}:${resolution}` },
    ctx.now().toISOString(),
  );
  return { intentId, resolved: resolution, resend: false };
}

export function campaignDeliveryState(ctx: Ctx, tenantId: string, campaignId: string) {
  const intents = ctx.store.intents.filter((i) => i.tenantId === tenantId && i.campaignId === campaignId);
  const counts = intents.reduce<Record<string, number>>((acc, i) => {
    acc[i.state] = (acc[i.state] ?? 0) + 1;
    return acc;
  }, {});
  const pending = intents.filter((i) => !['confirmed', 'failed'].includes(i.state)).length;
  return { campaignId, total: intents.length, counts, pending };
}

/** Cierra la campaña sólo cuando todos los intents son terminales. */
export function settleCampaign(ctx: Ctx, tenantId: string, campaignId: string): { state: string; remaining: number } {
  const campaign = ctx.store.campaigns.find((c) => c.tenantId === tenantId && c.id === campaignId);
  if (!campaign) throw new MarketingError('NOT_FOUND', 'campaign_not_found');
  const state = campaignDeliveryState(ctx, tenantId, campaignId);
  if (state.pending > 0) return { state: campaign.state, remaining: state.pending };
  if (campaign.state === 'queued' || campaign.state === 'sending') {
    transition(ctx, campaignId, tenantId, 'sending', 'worker_pickup');
  }
  if (campaign.state === 'sending') {
    const failed = state.counts.failed ?? 0;
    transition(ctx, campaignId, tenantId, failed === state.total ? 'failed' : 'sent', `settled:${JSON.stringify(state.counts)}`);
  }
  if (campaign.state === 'sent' || campaign.state === 'failed') {
    transition(ctx, campaignId, tenantId, 'reconciled', 'delivery_settled');
  }
  return { state: campaign.state, remaining: 0 };
}

// ── Paid media (MKT-C29/C30) ───────────────────────────────────────────────

export interface AdsProposalResult {
  proposalId: string;
  accountKind: string;
  validateOnly: true;
  productionBlocked: true;
  blockers: string[];
  note: string;
}

/**
 * MKT-C29/C30: sólo lectura y test accounts. No existe ruta que lance una
 * campaña real ni que supere el techo de gasto; `validate_only` no acredita
 * capacidad de producción.
 */
export function proposeAds(ctx: Ctx, principal: Principal, input: AdsProposal): AdsProposalResult {
  const proposal = AdsProposalSchema.parse(input);
  const connection = ctx.store.connections.find((c) => c.tenantId === principal.tenantId && c.id === proposal.connectionId);
  if (!connection || connection.provider !== 'ads') throw new MarketingError('DEPENDENCY_MISSING', 'ads_connection_missing');
  if (connection.state === 'disabled') throw new MarketingError('DEPENDENCY_MISSING', 'ads_connection_disabled');
  if (proposal.dailyBudget.currency !== 'EUR') throw new MarketingError('INVALID', 'unsupported_currency');
  if (Number(proposal.dailyBudget.amount) > 50) throw new MarketingError('FORBIDDEN', 'test_budget_ceiling_exceeded');

  const blockers: string[] = [];
  if (proposal.accountKind !== 'test') blockers.push('only_test_accounts');
  blockers.push('provider_capability_not_verified');

  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'ads.proposal', detail: proposal.connectionId },
    ctx.now().toISOString(),
  );
  return {
    proposalId: sha256({ proposal, at: ctx.now().toISOString() }).slice(0, 20),
    accountKind: proposal.accountKind,
    validateOnly: true,
    productionBlocked: true,
    blockers,
    note: 'Borrador de propuesta. No se envía ni se gasta: falta capacidad verificada de test account.',
  };
}
