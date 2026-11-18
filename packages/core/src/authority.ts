import { randomUUID } from 'node:crypto';
import {
  MarketingError,
  POLICY_VERSION,
  CapabilitySchema,
  ApprovalBindingSchema,
  TwinBindingSchema,
  DelegationMandateSchema,
  type ApprovalBinding,
  type Capability,
  type EffectClass,
  type Money,
  type TwinBinding,
  type DelegationMandate,
  type Channel,
  type Purpose,
} from '@agntia/contracts';
import type { Ctx, Membership } from './store';
import { canonicalJson, compareMoney, sha256 } from './util';

/**
 * MKT-C02/C03: el principal se deriva del JWT verificado y de la membership de
 * servidor. Ni `tenantId`, ni `actorId`, ni `capability` escritos por el modelo
 * son autorización. No hay fallback a owner/default.
 */
export interface VerifiedJwt {
  sub: string;
  tenantId: string;
  expiresAt: number; // epoch segundos, ya validado por el verificador
  email?: string;
}

export interface Principal {
  actorId: string;
  tenantId: string;
  roles: Membership['roles'];
  scopes: string[];
  isHuman: boolean;
}

export const EFFECT_CLASS: Record<Capability, EffectClass> = {
  'marketing.context.read': 'read',
  'marketing.integration.read': 'read',
  'marketing.connection.admin': 'prepare',
  'marketing.brief.read': 'read',
  'marketing.brief.write': 'prepare',
  'marketing.strategy.propose': 'prepare',
  'marketing.audience.preview': 'read',
  'marketing.audience.snapshot': 'prepare',
  'marketing.creative.write': 'prepare',
  'marketing.campaign.preview': 'read',
  'marketing.campaign.commit': 'effect',
  'marketing.campaign.pause': 'effect',
  'marketing.campaign.reconcile': 'effect',
  'marketing.journey.preview': 'read',
  'marketing.journey.enroll': 'effect',
  'marketing.landing.preview': 'read',
  'marketing.landing.propose': 'prepare',
  'marketing.landing.publish': 'effect',
  'marketing.observation.read': 'read',
  'marketing.experiment.propose': 'prepare',
  'marketing.measurement.run': 'prepare',
  'marketing.budget.scenario': 'prepare',
  'marketing.ads.propose': 'prepare',
  'marketing.ads.validate': 'effect',
  'marketing.report.read': 'read',
  'marketing.report.write': 'prepare',
  'marketing.advisor.session': 'prepare',
  'marketing.job.read': 'read',
  'marketing.privacy.request': 'effect',
  'marketing.tenant.admin': 'effect',
};

const READ_ROLES = new Set(['owner', 'operator', 'reviewer', 'viewer', 'worker']);
const PREPARE_ROLES = new Set(['owner', 'operator', 'reviewer']);
const EFFECT_ROLES = new Set(['owner', 'operator']);
// Administrar el tenant (plan, membresías, purga) no es una operación de
// campaña: un operator no cambia roles ni el plan de su propio tenant.
const ADMIN_ROLES = new Set(['owner']);

/**
 * Hechos de autorización ya resueltos: si el tenant del JWT existe y cuál es su
 * membership para el actor. Separarlos de la fuente permite que el API los lea
 * de Postgres sin duplicar ni una regla: `resolvePrincipal` (memoria) y el
 * borde asíncrono del API (`apps/api/src/principals.ts`) llegan a la misma
 * función de decisión.
 */
export interface PrincipalFacts {
  tenantExists: boolean;
  membership: Membership | undefined;
}

export function resolvePrincipal(ctx: Ctx, jwt: VerifiedJwt, capability: Capability): Principal {
  return principalFromFacts(
    ctx,
    jwt,
    {
      tenantExists: ctx.store.tenants.has(jwt.tenantId),
      membership: ctx.store.memberships.find((m) => m.tenantId === jwt.tenantId && m.actorId === jwt.sub),
    },
    capability,
  );
}

/**
 * Decisión única de autorización: expiración, tenant, membership, scopes y rol.
 * No hay fallback a owner/default ni permiso escrito por el cliente.
 */
export function principalFromFacts(
  ctx: Pick<Ctx, 'now'>,
  jwt: VerifiedJwt,
  facts: PrincipalFacts,
  capability: Capability,
): Principal {
  const parsed = CapabilitySchema.safeParse(capability);
  if (!parsed.success) throw new MarketingError('FORBIDDEN', 'unknown_capability');
  if (jwt.expiresAt * 1000 <= ctx.now().getTime()) throw new MarketingError('AUTH_REQUIRED', 'token_expired');
  if (!facts.tenantExists) throw new MarketingError('AUTH_REQUIRED', 'tenant_unknown');

  const membership = facts.membership;
  if (!membership) throw new MarketingError('FORBIDDEN', 'no_membership');

  const principal: Principal = {
    actorId: membership.actorId,
    tenantId: membership.tenantId,
    roles: membership.roles,
    scopes: membership.scopes,
    isHuman: membership.isHuman,
  };
  authorize(principal, capability);
  return principal;
}

export function authorize(principal: Principal, capability: Capability): void {
  if (!principal.scopes.includes(capability) && !principal.scopes.includes('marketing.*')) {
    throw new MarketingError('FORBIDDEN', 'capability_not_granted');
  }
  if (capability === 'marketing.tenant.admin') {
    if (!principal.isHuman) throw new MarketingError('FORBIDDEN', 'effect_requires_human');
    if (!principal.roles.some((r) => ADMIN_ROLES.has(r))) throw new MarketingError('FORBIDDEN', 'role_not_allowed');
    return;
  }
  const effect = EFFECT_CLASS[capability];
  const allowed =
    effect === 'read' ? READ_ROLES : effect === 'prepare' ? PREPARE_ROLES : EFFECT_ROLES;
  if (!principal.roles.some((r) => allowed.has(r))) {
    throw new MarketingError('FORBIDDEN', 'role_not_allowed');
  }
  if (effect === 'effect' && !principal.isHuman) {
    throw new MarketingError('FORBIDDEN', 'effect_requires_human');
  }
}

// ── Aprobación vinculada (MKT-C20) ─────────────────────────────────────────

export interface ApprovalRequest {
  revisionHash: string;
  audienceMaxHash: string;
  purpose: Purpose;
  channel: Channel;
  costCeiling: Money;
  expiresAt: string;
}

export function createApproval(ctx: Ctx, principal: Principal, req: ApprovalRequest): ApprovalBinding {
  if (!principal.isHuman) throw new MarketingError('FORBIDDEN', 'approver_must_be_human');
  const approval = ApprovalBindingSchema.parse({
    approvalRef: `apv_${randomUUID().replaceAll('-', '').slice(0, 20)}`,
    approverActorId: principal.actorId,
    approverIsHuman: true,
    revisionHash: req.revisionHash,
    audienceMaxHash: req.audienceMaxHash,
    purpose: req.purpose,
    channel: req.channel,
    costCeiling: req.costCeiling,
    policyVersion: ctx.policyVersion,
    expiresAt: req.expiresAt,
    revokedAt: null,
  });
  ctx.store.approvals.push({ ...approval, tenantId: principal.tenantId });
  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'approval.created', detail: approval.approvalRef },
    ctx.now().toISOString(),
  );
  return approval;
}

export function verifyApproval(
  ctx: Ctx,
  tenantId: string,
  approvalRef: string,
  expected: {
    revisionHash: string;
    audienceMaxHash: string;
    purpose: Purpose;
    channel: Channel;
    requiredBudget: Money;
    slug?: string;
  },
): ApprovalBinding {
  const approval = ctx.store.approvals.find((a) => a.tenantId === tenantId && a.approvalRef === approvalRef);
  if (!approval) throw new MarketingError('FORBIDDEN', 'approval_not_found');
  if (approval.revokedAt) throw new MarketingError('FORBIDDEN', 'approval_revoked');
  if (Date.parse(approval.expiresAt) <= ctx.now().getTime()) throw new MarketingError('FORBIDDEN', 'approval_expired');
  if (approval.revisionHash !== expected.revisionHash) throw new MarketingError('CONFLICT', 'approval_revision_mismatch');
  if (approval.audienceMaxHash !== expected.audienceMaxHash) throw new MarketingError('CONFLICT', 'approval_audience_mismatch');
  if (approval.purpose !== expected.purpose) throw new MarketingError('CONFLICT', 'approval_purpose_mismatch');
  if (approval.channel !== expected.channel) throw new MarketingError('CONFLICT', 'approval_channel_mismatch');
  if (compareMoney(approval.costCeiling, expected.requiredBudget) < 0) {
    throw new MarketingError('CONFLICT', 'approval_cost_ceiling_exceeded');
  }
  if (expected.slug !== undefined && expected.slug !== approval.channel) {
    throw new MarketingError('CONFLICT', 'approval_target_mismatch');
  }
  return approval;
}

// ── Twins y mandatos (MKT-C04) ─────────────────────────────────────────────

export function registerTwin(ctx: Ctx, tenantId: string, input: { canonicalAgentSha: string; displayName: string }): TwinBinding {
  if (!/^[0-9a-f]{40}$/.test(input.canonicalAgentSha)) throw new MarketingError('INVALID', 'agent_sha_invalid');
  const binding = TwinBindingSchema.parse({
    twinId: `twin_${tenantId}_${randomUUID().slice(0, 8)}`,
    canonicalAgentRef: { repo: 'agente', sha: input.canonicalAgentSha },
    parentTenantId: tenantId,
    targetTenantId: tenantId,
    capabilities: ['marketing.brief.read', 'marketing.audience.preview'],
    purpose: 'marketing',
    validUntil: new Date(ctx.now().getTime() + 1000 * 60 * 60 * 24 * 30).toISOString().replace(/\.\d{3}Z$/, 'Z'),
    revocable: true,
  });
  ctx.store.twins.push({
    id: binding.twinId,
    tenantId,
    canonicalAgentSha: input.canonicalAgentSha,
    displayName: input.displayName,
    provenance: `${tenantId}/${input.displayName}@agente:${input.canonicalAgentSha.slice(0, 12)}`,
    status: 'active',
  });
  return binding;
}

export function validateMandate(
  ctx: Ctx,
  twin: TwinBinding,
  mandate: DelegationMandate,
): { ok: true } | { ok: false; reason: string } {
  const parsedTwin = TwinBindingSchema.safeParse(twin);
  const parsedMandate = DelegationMandateSchema.safeParse(mandate);
  if (!parsedTwin.success || !parsedMandate.success) return { ok: false, reason: 'schema_invalid' };
  if (twin.twinId !== mandate.twinId) return { ok: false, reason: 'twin_mismatch' };
  if (mandate.originatingTenantId !== twin.parentTenantId) return { ok: false, reason: 'origin_not_bound' };
  if (mandate.targetTenantId !== twin.targetTenantId) return { ok: false, reason: 'target_not_bound' };
  if (!mandate.capabilities.every((c) => twin.capabilities.includes(c))) return { ok: false, reason: 'capability_not_delegable' };
  if (Date.parse(mandate.validUntil) <= ctx.now().getTime()) return { ok: false, reason: 'mandate_expired' };
  if (Date.parse(mandate.validFrom) > ctx.now().getTime()) return { ok: false, reason: 'mandate_not_yet_valid' };
  return { ok: true };
}

export function twinProvenance(twin: { provenance: string; status: string }): string {
  if (twin.status !== 'active') throw new MarketingError('FORBIDDEN', 'twin_revoked');
  return twin.provenance;
}

// ── Idempotencia de operaciones (MKT-C22) ──────────────────────────────────

export function operationKey(tenantId: string, capability: Capability, idempotencyKey: string): string {
  return `${tenantId}|${capability}|${idempotencyKey}`;
}

export function replayOrReject(
  ctx: Ctx,
  tenantId: string,
  capability: Capability,
  idempotencyKey: string,
  payload: unknown,
): { replayed: true; result: unknown } | { replayed: false } {
  const key = operationKey(tenantId, capability, idempotencyKey);
  const prior = ctx.store.operations.get(key);
  if (!prior) return { replayed: false };
  const hash = sha256(payload);
  if (prior.payloadHash !== hash) throw new MarketingError('CONFLICT', 'idempotency_key_reused_with_different_payload');
  return { replayed: true, result: prior.result };
}

export function recordOperation(
  ctx: Ctx,
  tenantId: string,
  capability: Capability,
  idempotencyKey: string,
  payload: unknown,
  result: unknown,
): void {
  ctx.store.operations.set(operationKey(tenantId, capability, idempotencyKey), {
    payloadHash: sha256(payload),
    result,
  });
}

export function policyFingerprint(): string {
  return sha256({ policyVersion: POLICY_VERSION, effectClasses: canonicalJson(EFFECT_CLASS) }).slice(0, 32);
}
