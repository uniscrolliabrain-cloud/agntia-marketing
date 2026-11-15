import {
  MarketingError,
  AudienceRuleSchema,
  ContactPolicySchema,
  type AudienceRule,
  type Channel,
  type ContactPolicy,
  type Purpose,
} from '@agntia/contracts';
import type { AudienceSnapshotRecord, Contact, Ctx } from './store';
import { sha256 } from './util';
import type { Principal } from './authority';

export interface ContactInput {
  id: string;
  emailRef: string;
  country: string;
  locale: 'es' | 'en' | 'fr';
  lifecycleStage: Contact['lifecycleStage'];
  interestTopic: string;
  consent: Partial<Record<Purpose, boolean>>;
  engagedDays: number;
  isBusiness: boolean;
}

export function upsertContacts(ctx: Ctx, principal: Principal, inputs: ContactInput[]): { created: number; updated: number } {
  if (inputs.length > 500) throw new MarketingError('INVALID', 'batch_too_large');
  let created = 0;
  let updated = 0;
  for (const input of inputs) {
    const existing = ctx.store.contacts.find((c) => c.tenantId === principal.tenantId && c.id === input.id);
    if (existing) {
      Object.assign(existing, {
        emailRef: input.emailRef,
        country: input.country,
        locale: input.locale,
        lifecycleStage: input.lifecycleStage,
        interestTopic: input.interestTopic,
        consent: input.consent,
        engagedDays: input.engagedDays,
        isBusiness: input.isBusiness,
      });
      updated += 1;
    } else {
      ctx.store.contacts.push({
        tenantId: principal.tenantId,
        ...input,
        suppressed: false,
        suppressionVersion: 1,
        lastContactedAt: {},
      });
      created += 1;
    }
  }
  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'contacts.upserted', detail: `${created}/${updated}` },
    ctx.now().toISOString(),
  );
  return { created, updated };
}

/**
 * MKT-C07: la supresión es irreversible por esta vía y no se borra al reimportar
 * contactos. Una baja incrementa suppressionVersion para invalidar aprobaciones
 * cuyo hash de audiencia ya no representa la población real.
 */
export function suppressContact(ctx: Ctx, tenantId: string, subjectRef: string, reason: 'opt_out' | 'complaint' | 'bounce' | 'erasure'): Contact {
  const contact = ctx.store.contacts.find((c) => c.tenantId === tenantId && c.id === subjectRef);
  if (!contact) throw new MarketingError('NOT_FOUND', 'contact_not_found');
  contact.suppressed = true;
  contact.suppressionVersion += 1;
  ctx.store.auditLog({ tenantId, actorId: 'system', action: 'suppression.added', detail: `${subjectRef}:${reason}` }, ctx.now().toISOString());
  return contact;
}

export function isSuppressed(ctx: Ctx, tenantId: string, subjectRef: string): boolean {
  const contact = ctx.store.contacts.find((c) => c.tenantId === tenantId && c.id === subjectRef);
  if (!contact) return true; // fail-closed: no encontrado no es elegible
  return contact.suppressed;
}

export interface EligibilityDecision {
  subjectRef: string;
  purpose: Purpose;
  channel: Channel;
  state: 'eligible' | 'blocked' | 'unknown';
  reasonCodes: string[];
  suppressionVersion: number;
  processingBasisRef: string;
  evaluatedAt: string;
}

/**
 * Fail-closed: sin consentimiento explícito para la finalidad, o sin contacto
 * conocido, el estado es `unknown` y el envío se bloquea. `service` no exime de
 * supresión.
 */
export function evaluateEligibility(
  ctx: Ctx,
  tenantId: string,
  subjectRef: string,
  purpose: Purpose,
  channel: Channel,
): EligibilityDecision {
  const contact = ctx.store.contacts.find((c) => c.tenantId === tenantId && c.id === subjectRef);
  const base = {
    subjectRef,
    purpose,
    channel,
    evaluatedAt: ctx.now().toISOString(),
  };
  if (!contact) {
    return {
      ...base,
      state: 'unknown',
      reasonCodes: ['contact_not_found'],
      suppressionVersion: 0,
      processingBasisRef: 'none',
    };
  }
  const reasonCodes: string[] = [];
  if (contact.suppressed) reasonCodes.push('suppressed');
  if (contact.consent[purpose] !== true) reasonCodes.push('no_consent_for_purpose');
  const basis = contact.consent[purpose] === true ? `consent:${purpose}:v${contact.suppressionVersion}` : 'none';
  return {
    ...base,
    state: reasonCodes.length === 0 ? 'eligible' : 'blocked',
    reasonCodes,
    suppressionVersion: contact.suppressionVersion,
    processingBasisRef: basis,
  };
}

// ── Audiencias (MKT-C18) ───────────────────────────────────────────────────

function fieldValue(contact: Contact, rule: AudienceRule, field: string): unknown {
  switch (field) {
    case 'consentPurpose':
      return contact.consent[rule.purpose] === true;
    default:
      return (contact as unknown as Record<string, unknown>)[field];
  }
}

function matches(contact: Contact, rule: AudienceRule, cond: AudienceRule['include'][number]): boolean {
  const value = fieldValue(contact, rule, cond.field);
  switch (cond.op) {
    case 'eq':
      return value === cond.value;
    case 'neq':
      return value !== cond.value;
    case 'in':
      return Array.isArray(cond.value) && cond.value.includes(String(value));
    case 'gte':
      return typeof value === 'number' && typeof cond.value === 'number' && value >= cond.value;
    case 'lte':
      return typeof value === 'number' && typeof cond.value === 'number' && value <= cond.value;
    case 'exists':
      return value !== undefined && value !== null;
    default:
      return false;
  }
}

export interface AudiencePreview {
  ruleHash: string;
  eligibleRefs: string[];
  excluded: Array<{ subjectRef: string; reasonCodes: string[] }>;
  eligibleCount: number;
  excludedCount: number;
  sourceWatermark: number;
}

export function previewAudience(ctx: Ctx, tenantId: string, input: AudienceRule): AudiencePreview {
  const rule = AudienceRuleSchema.parse(input);
  const contacts = ctx.store.contacts.filter((c) => c.tenantId === tenantId);
  const eligibleRefs: string[] = [];
  const excluded: AudiencePreview['excluded'] = [];

  for (const contact of contacts) {
    const included = rule.include.every((c) => matches(contact, rule, c));
    const excludedByRule = rule.exclude.some((c) => matches(contact, rule, c));
    if (!included || excludedByRule) {
      excluded.push({ subjectRef: contact.id, reasonCodes: [included ? 'excluded_by_rule' : 'not_matching_include'] });
      continue;
    }
    const decision = evaluateEligibility(ctx, tenantId, contact.id, rule.purpose, rule.channel);
    if (decision.state === 'eligible') eligibleRefs.push(contact.id);
    else excluded.push({ subjectRef: contact.id, reasonCodes: decision.reasonCodes });
  }

  return {
    ruleHash: sha256(rule),
    eligibleRefs: eligibleRefs.sort(),
    excluded,
    eligibleCount: eligibleRefs.length,
    excludedCount: excluded.length,
    sourceWatermark: ctx.store.nextSequence(),
  };
}

const DEFAULT_TTL_MINUTES = 60;

/**
 * El snapshot congela miembros reales, no solo la regla: el hash incluye la
 * lista ordenada de refs elegibles. Un hash del SQL no congela población.
 */
export function freezeAudience(
  ctx: Ctx,
  tenantId: string,
  input: AudienceRule,
  ttlMinutes = DEFAULT_TTL_MINUTES,
): AudienceSnapshotRecord {
  if (ttlMinutes < 5 || ttlMinutes > 24 * 60) throw new MarketingError('INVALID', 'ttl_out_of_range');
  const preview = previewAudience(ctx, tenantId, input);
  if (preview.eligibleCount === 0) throw new MarketingError('INVALID', 'audience_empty');
  const membersHash = sha256({ rule: preview.ruleHash, members: preview.eligibleRefs, watermark: preview.sourceWatermark });
  const snapshot: AudienceSnapshotRecord = {
    id: `aud_${sha256(membersHash).slice(0, 16)}`,
    tenantId,
    ruleHash: preview.ruleHash,
    rule: AudienceRuleSchema.parse(input),
    memberRefs: preview.eligibleRefs,
    eligibleCount: preview.eligibleCount,
    excludedCount: preview.excludedCount,
    membersHash,
    createdAt: ctx.now().toISOString(),
    expiresAt: new Date(ctx.now().getTime() + ttlMinutes * 60_000).toISOString(),
    policyVersion: ctx.policyVersion,
    sourceWatermark: preview.sourceWatermark,
  };
  ctx.store.snapshots.push(snapshot);
  return snapshot;
}

/** Un snapshot caducado o con supresión posterior no se puede usar para enviar. */
export function assertSnapshotUsable(ctx: Ctx, tenantId: string, snapshotId: string): AudienceSnapshotRecord {
  const snapshot = ctx.store.snapshots.find((s) => s.tenantId === tenantId && s.id === snapshotId);
  if (!snapshot) throw new MarketingError('NOT_FOUND', 'snapshot_not_found');
  if (Date.parse(snapshot.expiresAt) <= ctx.now().getTime()) throw new MarketingError('CONFLICT', 'snapshot_expired');
  const staleMember = snapshot.memberRefs.some((ref) => isSuppressed(ctx, tenantId, ref));
  if (staleMember) throw new MarketingError('CONFLICT', 'snapshot_superseded_by_suppression');
  return snapshot;
}

// ── Frecuencia y silencio (MKT-C21) ────────────────────────────────────────

export function setContactPolicy(ctx: Ctx, tenantId: string, input: ContactPolicy): ContactPolicy {
  const policy = ContactPolicySchema.parse(input);
  const existing = ctx.store.contactPolicies.find((p) => p.tenantId === tenantId);
  if (existing) Object.assign(existing, policy);
  else ctx.store.contactPolicies.push({ tenantId, ...policy });
  return policy;
}

export interface FrequencyDecision {
  subjectRef: string;
  allowed: boolean;
  reasonCodes: string[];
}

export function checkFrequency(
  ctx: Ctx,
  tenantId: string,
  subjectRefs: string[],
  channel: Channel,
  at: Date = ctx.now(),
): FrequencyDecision[] {
  const policy = ctx.store.contactPolicies.find((p) => p.tenantId === tenantId);
  if (!policy) return subjectRefs.map((subjectRef) => ({ subjectRef, allowed: false, reasonCodes: ['no_contact_policy'] }));

  const quiet = policy.quietHours;
  const hour = localHour(policy.timezone, at);
  const inQuietHours =
    quiet !== undefined && (quiet.startUtcHour <= quiet.endUtcHour
      ? hour >= quiet.startUtcHour && hour < quiet.endUtcHour
      : hour >= quiet.startUtcHour || hour < quiet.endUtcHour);

  return subjectRefs.map((subjectRef) => {
    const contact = ctx.store.contacts.find((c) => c.tenantId === tenantId && c.id === subjectRef);
    const reasons: string[] = [];
    if (!contact) reasons.push('contact_not_found');
    if (inQuietHours) reasons.push('quiet_hours');
    const last = contact?.lastContactedAt[channel];
    if (last) {
      const elapsedHours = (at.getTime() - Date.parse(last)) / 3_600_000;
      if (elapsedHours < policy.windowHours) {
        const recent = recentContacts(ctx, tenantId, subjectRef, channel, policy.windowHours, at);
        if (recent >= policy.maxPerSubjectPerWindow) reasons.push('frequency_cap');
      }
    }
    return { subjectRef, allowed: reasons.length === 0, reasonCodes: reasons };
  });
}

/**
 * Hora local real de la zona IANA de la política. Si la zona no es válida se
 * cae a UTC en vez de asumir silencio o permiso: el fallback se registra en el
 * motivo para que el resultado siga siendo auditable.
 */
export function localHour(timezone: string, at: Date): number {
  try {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    }).format(at);
    const parsed = Number.parseInt(formatted, 10);
    return Number.isNaN(parsed) ? at.getUTCHours() : parsed % 24;
  } catch {
    return at.getUTCHours();
  }
}

function recentContacts(ctx: Ctx, tenantId: string, subjectRef: string, channel: Channel, windowHours: number, at: Date): number {
  const since = at.getTime() - windowHours * 3_600_000;
  return ctx.store.intents.filter(
    (i) =>
      i.tenantId === tenantId &&
      i.subjectRef === subjectRef &&
      i.channel === channel &&
      (i.state === 'confirmed' || i.state === 'unknown' || i.state === 'leased') &&
      Date.parse(i.createdAt) >= since,
  ).length;
}

export function recordContact(ctx: Ctx, tenantId: string, subjectRef: string, channel: Channel, at = ctx.now()): void {
  const contact = ctx.store.contacts.find((c) => c.tenantId === tenantId && c.id === subjectRef);
  if (contact) contact.lastContactedAt[channel] = at.toISOString();
}
