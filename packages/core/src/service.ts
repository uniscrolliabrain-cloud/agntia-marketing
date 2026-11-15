import {
  MarketingError,
  PrivacyRequestSchema,
  HandoffSchema,
  type Capability,
  type Handoff,
  type OperationResult,
  type PrivacyRequest,
} from '@agntia/contracts';
import type { AdapterRegistry } from '@agntia/adapters';
import type { Ctx } from './store';
import type { Principal } from './authority';
import { EFFECT_CLASS, recordOperation, replayOrReject } from './authority';
import { newId, sha256 } from './util';
import { suppressContact } from './consent';

/**
 * Fachada del servicio (MKT-C02/C35/C37/C38/C39). Agrupa las operaciones
 * nominadas, aplica idempotencia y devuelve siempre el mismo sobre de resultado.
 */
export function createService(ctx: Ctx, registry: AdapterRegistry) {
  async function run<T>(
    principal: Principal,
    capability: Capability,
    input: { idempotencyKey: string; correlationId: string; payload: unknown },
    fn: () => T | Promise<T>,
  ): Promise<OperationResult<T>> {
    const replay = replayOrReject(ctx, principal.tenantId, capability, input.idempotencyKey, input.payload);
    if (replay.replayed) return replay.result as OperationResult<T>;

    const payload = await fn();
    const result: OperationResult<T> = {
      status: 'ok',
      operationId: newId('op'),
      correlationId: input.correlationId,
      localRefs: [],
      remoteRefs: [],
      evidenceRefs: [],
      payloadHash: sha256(input.payload),
      policyVersion: ctx.policyVersion,
      warnings: [],
      retryable: false,
      reconciliationRequired: false,
      actualScope: { tenantId: principal.tenantId, capability, dryRun: EFFECT_CLASS[capability] !== 'effect' },
      payload,
    };
    recordOperation(ctx, principal.tenantId, capability, input.idempotencyKey, input.payload, result);
    return result;
  }

  // ── Privacidad (MKT-C39) ─────────────────────────────────────────────────
  function submitPrivacyRequest(principal: Principal, input: PrivacyRequest) {
    const parsed = PrivacyRequestSchema.parse(input);
    if (!parsed.verificationRef.startsWith('verify_')) throw new MarketingError('INVALID', 'verification_required');
    const record = {
      id: newId('prv'),
      tenantId: principal.tenantId,
      ...parsed,
      state: 'received' as const,
      outcome: null,
      createdAt: ctx.now().toISOString(),
    };
    ctx.store.privacyRequests.push(record);
    ctx.store.auditLog(
      { tenantId: principal.tenantId, actorId: principal.actorId, action: 'privacy.requested', detail: `${record.id}:${parsed.kind}` },
      ctx.now().toISOString(),
    );
    return record;
  }

  /**
   * Ejecuta una petición ya verificada. La supresión sobrevive al borrado: no se
   * puede "reaparecer" un contacto borrando y reimportando la lista.
   */
  function fulfilPrivacyRequest(principal: Principal, requestId: string) {
    const request = ctx.store.privacyRequests.find((p) => p.tenantId === principal.tenantId && p.id === requestId);
    if (!request) throw new MarketingError('NOT_FOUND', 'privacy_request_not_found');
    if (request.state !== 'received') throw new MarketingError('CONFLICT', `privacy_request_${request.state}`);
    const contact = ctx.store.contacts.find((c) => c.tenantId === principal.tenantId && c.id === request.subjectRef);

    request.state = 'fulfilled';
    if (request.kind === 'access' || request.kind === 'portability') {
      request.outcome = contact
        ? JSON.stringify({
            id: contact.id,
            country: contact.country,
            locale: contact.locale,
            consent: contact.consent,
            suppressed: contact.suppressed,
            purposes: Object.keys(contact.consent),
          })
        : 'no_data';
    } else if (request.kind === 'erasure') {
      if (contact) {
        suppressContact(ctx, principal.tenantId, contact.id, 'erasure');
        contact.emailRef = 'erased';
        contact.interestTopic = 'erased';
        contact.consent = {};
        contact.isBusiness = false;
      }
      request.outcome = 'erased_with_suppression_tombstone';
    } else if (request.kind === 'objection') {
      if (contact) suppressContact(ctx, principal.tenantId, contact.id, 'opt_out');
      request.outcome = 'marketing_objection_registered';
    } else {
      request.outcome = 'manual_review_required';
    }
    ctx.store.events.push({
      id: newId('evt'),
      tenantId: principal.tenantId,
      actorRef: principal.actorId,
      occurredAt: ctx.now().toISOString(),
      correlationId: request.id,
      causationId: null,
      type: 'marketing.suppression.changed',
      payloadRefs: [{ kind: 'privacy_request', id: request.id }],
    });
    return request;
  }

  // ── Cooperación entre servicios (MKT-C37) ────────────────────────────────
  function proposeHandoff(principal: Principal, input: Handoff) {
    const parsed = HandoffSchema.parse(input);
    const conflict = ctx.store.handoffs.find(
      (h) =>
        h.tenantId === principal.tenantId &&
        h.effect === parsed.effect &&
        h.resourceRef === parsed.resourceRef &&
        h.ownerService !== parsed.ownerService &&
        h.state !== 'rejected',
    );
    if (conflict) {
      const record = {
        id: newId('hnd'),
        tenantId: principal.tenantId,
        ...parsed,
        state: 'conflict' as const,
        createdAt: ctx.now().toISOString(),
      };
      ctx.store.handoffs.push(record);
      return { accepted: false as const, conflictWith: conflict.ownerService, handoff: record };
    }
    const record = {
      id: newId('hnd'),
      tenantId: principal.tenantId,
      ...parsed,
      state: 'proposed' as const,
      createdAt: ctx.now().toISOString(),
    };
    ctx.store.handoffs.push(record);
    return { accepted: true as const, handoff: record };
  }

  function respondHandoff(principal: Principal, handoffId: string, decision: 'accept' | 'reject', note?: string) {
    const handoff = ctx.store.handoffs.find((h) => h.tenantId === principal.tenantId && h.id === handoffId);
    if (!handoff) throw new MarketingError('NOT_FOUND', 'handoff_not_found');
    if (handoff.state !== 'proposed') throw new MarketingError('CONFLICT', `handoff_${handoff.state}`);
    handoff.state = decision === 'accept' ? 'accepted' : 'rejected';
    if (note) handoff.acceptance = `${handoff.acceptance} · ${note}`.slice(0, 300);
    ctx.store.auditLog(
      { tenantId: principal.tenantId, actorId: principal.actorId, action: `handoff.${handoff.state}`, detail: handoff.id },
      ctx.now().toISOString(),
    );
    return handoff;
  }

  /** Un handoff sin ACK caduca: no se interpreta como éxito. */
  function expireHandoffs(principal: Principal, olderThanMinutes = 1440) {
    const cutoff = ctx.now().getTime() - olderThanMinutes * 60_000;
    let expired = 0;
    for (const handoff of ctx.store.handoffs) {
      if (handoff.tenantId !== principal.tenantId) continue;
      if (handoff.state !== 'proposed') continue;
      if (Date.parse(handoff.createdAt) > cutoff) continue;
      handoff.state = 'rejected';
      handoff.acceptance = `${handoff.acceptance} · expirado sin ACK`.slice(0, 300);
      expired += 1;
    }
    return { expired };
  }

  function listConflicts(principal: Principal) {
    return ctx.store.handoffs.filter((h) => h.tenantId === principal.tenantId && h.state === 'conflict');
  }

  // ── Coste y observabilidad (MKT-C38) ─────────────────────────────────────
  function estimateServiceCost(input: { contacts: number; emails: number; aiCalls: number; reports: number }) {
    const unit = { contact: 0.0004, email: 0.0009, aiCall: 0.012, report: 0.05 };
    const monthly =
      input.contacts * unit.contact +
      input.emails * unit.email +
      input.aiCalls * unit.aiCall +
      input.reports * unit.report;
    return {
      currency: 'EUR',
      estimate: monthly.toFixed(4),
      unit,
      assumptions: ['precios internos simulados, no factura de proveedor', 'sin coste de medios publicitarios'],
      caveat: 'Estimación de servicio. No incluye gasto publicitario ni descuentos.',
    };
  }

  function serviceHealth(tenantId: string) {
    const connections = ctx.store.connections.filter((c) => c.tenantId === tenantId);
    const intents = ctx.store.intents.filter((i) => i.tenantId === tenantId);
    const queued = intents.filter((i) => i.state === 'queued').length;
    const unknown = intents.filter((i) => i.state === 'unknown').length;
    const stale = intents.filter(
      (i) => i.state === 'leased' && ctx.now().getTime() - Date.parse(i.updatedAt) > 5 * 60_000,
    ).length;
    const providers = connections.map((c) => ({
      provider: c.provider,
      state: c.state,
      verified: false,
      capability: c.capabilityReport,
    }));
    const degraded = providers.some((p) => p.state !== 'ready');
    return {
      state: unknown > 0 || stale > 0 ? 'degraded' : degraded ? 'degraded' : 'ready',
      providers,
      outbox: { queued, unknown, staleLeases: stale },
      adapters: Object.values(registry).map((a) => a.health().state),
      note: 'Salud semántica del propio servicio; no acredita disponibilidad de proveedores no conectados.',
    };
  }

  // ── Asesor Anam (MKT-C36) ────────────────────────────────────────────────
  const sessions: Array<{ id: string; tenantId: string; actorId: string; scope: string; expiresAt: string; recording: 'off' }> = [];
  function openAdvisorSession(principal: Principal, scope: string) {
    if (!principal.isHuman) throw new MarketingError('FORBIDDEN', 'advisor_session_requires_human');
    const session = {
      id: newId('adv'),
      tenantId: principal.tenantId,
      actorId: principal.actorId,
      scope,
      expiresAt: new Date(ctx.now().getTime() + 30 * 60_000).toISOString(),
      recording: 'off' as const,
    };
    sessions.push(session);
    return {
      ...session,
      note: 'Anam es presencia: no autentica, no aprueba y no amplía capacidades.',
    };
  }

  function closeAdvisorSession(principal: Principal, sessionId: string) {
    const session = sessions.find((s) => s.tenantId === principal.tenantId && s.id === sessionId);
    if (!session) throw new MarketingError('NOT_FOUND', 'advisor_session_not_found');
    session.expiresAt = ctx.now().toISOString();
    return { id: session.id, closedAt: session.expiresAt, transcriptStored: false };
  }

  return {
    run,
    submitPrivacyRequest,
    fulfilPrivacyRequest,
    proposeHandoff,
    respondHandoff,
    expireHandoffs,
    listConflicts,
    estimateServiceCost,
    serviceHealth,
    openAdvisorSession,
    closeAdvisorSession,
  };
}

export type MarketingService = ReturnType<typeof createService>;
