import {
  BriefSchema,
  ClaimEvidenceSchema,
  CreativeRevisionSchema,
  MarketingError,
  type Brief,
  type Channel,
  type ClaimEvidence,
  type CreativeRevision,
  type Money,
  type Purpose,
} from '@agntia/contracts';
import type { CampaignRecord, CampaignState, ClaimRecord, CreativeRecord, Ctx } from './store';
import type { Principal } from './authority';
import { createApproval, verifyApproval } from './authority';
import { assertSnapshotUsable, checkFrequency, evaluateEligibility, previewAudience } from './consent';
import { addMoney, compareMoney, newId, sha256 } from './util';

// ── Brief y estrategia (MKT-C17) ───────────────────────────────────────────

export function createBrief(ctx: Ctx, principal: Principal, input: Brief, idempotencyKey: string) {
  const brief = BriefSchema.parse(input);
  if (Date.parse(brief.window.to) <= Date.parse(brief.window.from)) throw new MarketingError('INVALID', 'window_invalid');
  const record = {
    ...brief,
    id: newId('brf'),
    tenantId: principal.tenantId,
    version: 1,
    status: 'draft' as const,
    createdAt: ctx.now().toISOString(),
    idempotencyKey,
  };
  ctx.store.briefs.push(record);
  return record;
}

export function acceptBrief(ctx: Ctx, principal: Principal, briefId: string, expectedVersion: number): void {
  const brief = ctx.store.briefs.find((b) => b.tenantId === principal.tenantId && b.id === briefId);
  if (!brief) throw new MarketingError('NOT_FOUND', 'brief_not_found');
  if (brief.version !== expectedVersion) throw new MarketingError('CONFLICT', 'version_mismatch');
  if (brief.status === 'accepted') throw new MarketingError('CONFLICT', 'already_accepted');
  brief.status = 'accepted';
  brief.version += 1;
  ctx.store.events.push({
    id: newId('evt'),
    tenantId: principal.tenantId,
    actorRef: principal.actorId,
    occurredAt: ctx.now().toISOString(),
    correlationId: brief.id,
    causationId: null,
    type: 'marketing.brief.accepted',
    payloadRefs: [{ kind: 'brief', id: brief.id }],
  });
}

export interface StrategyProposal {
  briefId: string;
  scenarios: Array<{ channel: Channel; share: number; rationale: string; assumptions: string[] }>;
  blockers: string[];
  modelConfigRef: string;
  evidenceRefs: string[];
  note: string;
}

/**
 * Propuesta determinista: reparte el presupuesto declarado entre los canales del
 * brief según encaje y coste relativo. No compra medios ni afirma retorno causal.
 */
export function proposeStrategy(ctx: Ctx, principal: Principal, briefId: string): StrategyProposal {
  const brief = ctx.store.briefs.find((b) => b.tenantId === principal.tenantId && b.id === briefId);
  if (!brief) throw new MarketingError('NOT_FOUND', 'brief_not_found');
  if (brief.status !== 'accepted') throw new MarketingError('INVALID', 'brief_not_accepted');

  const weights: Record<Channel, number> = { email: 3, newsletter: 2, landing: 2, social: 1, ads: 3, in_person: 0.5 };
  const total = brief.channels.reduce((acc, c) => acc + weights[c], 0);
  const blockers: string[] = [];
  if (!brief.budget) blockers.push('no_budget_declared');
  if (brief.channels.includes('ads')) blockers.push('paid_media_requires_test_account_capacity');

  const scenarios = [...brief.channels]
    .sort((a, b) => a.localeCompare(b))
    .map((channel) => ({
      channel,
      share: Math.round((weights[channel] / total) * 1000) / 1000,
      rationale: `Peso base ${weights[channel]} sobre ${total} para ${channel}`,
      assumptions: ['coste por contacto no verificado', 'sin datos de rendimiento histórico'],
    }));

  return {
    briefId,
    scenarios,
    blockers,
    modelConfigRef: 'deterministic-share-v1',
    evidenceRefs: brief.sources.map((s) => s.ref),
    note: 'Preparación, no efecto externo. No implica compra, gasto ni retorno esperado causal.',
  };
}

// ── Claims y creatividades (MKT-C16) ───────────────────────────────────────

export function addClaim(ctx: Ctx, principal: Principal, input: ClaimEvidence): ClaimRecord {
  const evidence = ClaimEvidenceSchema.parse(input);
  const record: ClaimRecord = {
    ...evidence,
    id: newId('clm'),
    tenantId: principal.tenantId,
    createdAt: ctx.now().toISOString(),
  };
  ctx.store.claims.push(record);
  return record;
}

export interface ClaimCheck {
  claim: string;
  state: 'supported' | 'contradicted' | 'unverified' | 'missing';
}

export function checkClaims(ctx: Ctx, tenantId: string, claims: string[]): { ok: boolean; checks: ClaimCheck[] } {
  const checks = claims.map<ClaimCheck>((claim) => {
    const evidence = ctx.store.claims
      .filter((c) => c.tenantId === tenantId && c.claim === claim)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    if (!evidence) return { claim, state: 'missing' };
    if (evidence.validUntil && evidence.validUntil < ctx.now().toISOString().slice(0, 10)) {
      return { claim, state: 'unverified' };
    }
    return { claim, state: evidence.support };
  });
  return { ok: checks.every((c) => c.state === 'supported'), checks };
}

export function createCreative(
  ctx: Ctx,
  principal: Principal,
  input: { creativeId?: string; revision: CreativeRevision },
): CreativeRecord {
  const revision = CreativeRevisionSchema.parse(input.revision);
  for (const link of revision.links) {
    if (!link.url.startsWith('https://')) throw new MarketingError('INVALID', 'link_must_be_https');
  }
  for (const asset of revision.assets) {
    if (asset.rights !== 'owned' && !asset.licenceRef) throw new MarketingError('INVALID', 'asset_licence_required');
  }
  const claims = checkClaims(ctx, principal.tenantId, revision.claims);
  if (!claims.ok) {
    throw new MarketingError('INVALID', `unsupported_claims:${claims.checks.filter((c) => c.state !== 'supported').map((c) => c.claim).join('|')}`);
  }
  const existing = input.creativeId
    ? ctx.store.creatives.find((c) => c.tenantId === principal.tenantId && c.id === input.creativeId)
    : undefined;
  const revisionNumber = existing ? existing.revision + 1 : 1;
  const hash = sha256({ tenantId: principal.tenantId, revision, revisionNumber });
  const record: CreativeRecord = existing
    ? { ...existing, revision: revisionNumber, data: revision, hash }
    : { id: newId('crv'), tenantId: principal.tenantId, revision: revisionNumber, data: revision, hash, status: 'draft' };
  if (existing) Object.assign(existing, record);
  else ctx.store.creatives.push(record);
  return record;
}

// ── FSM de campaña (MKT-C19/C20/C22) ───────────────────────────────────────

const TRANSITIONS: Record<CampaignState, CampaignState[]> = {
  draft: ['previewed', 'cancelled'],
  previewed: ['approved', 'draft', 'cancelled'],
  approved: ['queued', 'cancelled', 'paused'],
  queued: ['sending', 'paused', 'cancelled'],
  sending: ['sent', 'failed', 'unknown'],
  sent: ['reconciled'],
  failed: ['reconciled'],
  unknown: ['reconciled'],
  paused: ['queued', 'cancelled'],
  cancelled: [],
  reconciled: [],
};

export function transition(ctx: Ctx, campaignId: string, tenantId: string, to: CampaignState, reason: string): CampaignRecord {
  const campaign = ctx.store.campaigns.find((c) => c.tenantId === tenantId && c.id === campaignId);
  if (!campaign) throw new MarketingError('NOT_FOUND', 'campaign_not_found');
  if (!TRANSITIONS[campaign.state].includes(to)) throw new MarketingError('CONFLICT', `transition_${campaign.state}_to_${to}_forbidden`);
  campaign.history.push({ at: ctx.now().toISOString(), from: campaign.state, to, reason });
  campaign.state = to;
  campaign.version += 1;
  ctx.store.events.push({
    id: newId('evt'),
    tenantId,
    actorRef: 'system',
    occurredAt: ctx.now().toISOString(),
    correlationId: campaign.id,
    causationId: null,
    type: 'marketing.campaign.state_changed',
    payloadRefs: [{ kind: 'campaign', id: campaign.id }],
  });
  return campaign;
}

export interface CampaignInput {
  name: string;
  briefId: string;
  channel: Channel;
  purpose: Purpose;
  audienceSnapshotId: string;
  creativeId: string;
  costPerRecipient: Money;
  costCeiling: Money;
}

export function createCampaign(ctx: Ctx, principal: Principal, input: CampaignInput): CampaignRecord {
  const brief = ctx.store.briefs.find((b) => b.tenantId === principal.tenantId && b.id === input.briefId);
  if (!brief) throw new MarketingError('NOT_FOUND', 'brief_not_found');
  if (brief.status !== 'accepted') throw new MarketingError('INVALID', 'brief_not_accepted');
  const snapshot = ctx.store.snapshots.find((s) => s.tenantId === principal.tenantId && s.id === input.audienceSnapshotId);
  if (!snapshot) throw new MarketingError('NOT_FOUND', 'snapshot_not_found');
  const creative = ctx.store.creatives.find((c) => c.tenantId === principal.tenantId && c.id === input.creativeId);
  if (!creative) throw new MarketingError('NOT_FOUND', 'creative_not_found');
  if (input.costPerRecipient.currency !== input.costCeiling.currency) throw new MarketingError('INVALID', 'currency_mismatch');

  const campaign: CampaignRecord = {
    id: newId('cmp'),
    tenantId: principal.tenantId,
    name: input.name,
    briefId: input.briefId,
    channel: input.channel,
    revision: 1,
    audienceSnapshotId: snapshot.id,
    creativeId: creative.id,
    approvalRef: null,
    costCeiling: input.costCeiling,
    state: 'draft',
    version: 1,
    history: [{ at: ctx.now().toISOString(), from: 'draft', to: 'draft', reason: 'created' }],
  };
  ctx.store.campaigns.push(campaign);
  ctx.store.budgets.push({
    id: newId('bud'),
    tenantId: principal.tenantId,
    campaignId: campaign.id,
    ceiling: input.costCeiling,
    committed: { amount: '0.00', currency: input.costCeiling.currency },
    currency: input.costCeiling.currency,
  });
  return campaign;
}

export interface CampaignPreview {
  campaignId: string;
  revisionHash: string;
  audienceMaxHash: string;
  purpose: Purpose;
  channel: Channel;
  recipients: number;
  estimatedCost: Money;
  excluded: number;
  blockers: string[];
  requiredApproval: { revisionHash: string; audienceMaxHash: string; costCeiling: Money };
}

export function previewCampaign(ctx: Ctx, tenantId: string, campaignId: string): CampaignPreview {
  const campaign = ctx.store.campaigns.find((c) => c.tenantId === tenantId && c.id === campaignId);
  if (!campaign) throw new MarketingError('NOT_FOUND', 'campaign_not_found');
  const snapshot = assertSnapshotUsable(ctx, tenantId, campaign.audienceSnapshotId);
  const creative = ctx.store.creatives.find((c) => c.tenantId === tenantId && c.id === campaign.creativeId);
  if (!creative) throw new MarketingError('NOT_FOUND', 'creative_not_found');

  const blockers: string[] = [];
  const claims = checkClaims(ctx, tenantId, creative.data.claims);
  if (!claims.ok) blockers.push('creative_claims_unsupported');
  if (snapshot.expiresAt <= ctx.now().toISOString()) blockers.push('snapshot_expired');

  const rule = snapshot.rule;
  const fresh = previewAudience(ctx, tenantId, rule);
  const removed = snapshot.memberRefs.filter((ref) => !fresh.eligibleRefs.includes(ref));
  const added = fresh.eligibleRefs.filter((ref) => !snapshot.memberRefs.includes(ref));
  if (added.length > 0) blockers.push('audience_grew_needs_new_snapshot');

  const recipients = snapshot.memberRefs.length - removed.length;
  const estimatedCost: Money = {
    amount: (Number(campaign.costCeiling.amount) / Math.max(snapshot.memberRefs.length, 1)) * recipients >= 0
      ? (Number(campaign.costCeiling.amount) / Math.max(snapshot.memberRefs.length, 1) * recipients).toFixed(2)
      : '0.00',
    currency: campaign.costCeiling.currency,
  };
  const revisionHash = sha256({ campaignId, revision: campaign.revision, creativeHash: creative.hash, channel: campaign.channel });
  return {
    campaignId,
    revisionHash,
    audienceMaxHash: snapshot.membersHash,
    purpose: snapshot.rule.purpose,
    channel: campaign.channel,
    recipients,
    estimatedCost,
    excluded: removed.length,
    blockers,
    requiredApproval: { revisionHash, audienceMaxHash: snapshot.membersHash, costCeiling: campaign.costCeiling },
  };
}

export function approveCampaign(
  ctx: Ctx,
  principal: Principal,
  campaignId: string,
  expiresAt: string,
): { approvalRef: string } {
  const preview = previewCampaign(ctx, principal.tenantId, campaignId);
  if (preview.blockers.length > 0) throw new MarketingError('INVALID', `preview_blocked:${preview.blockers.join(',')}`);
  const campaign = ctx.store.campaigns.find((c) => c.tenantId === principal.tenantId && c.id === campaignId)!;
  const approval = createApproval(ctx, principal, {
    revisionHash: preview.revisionHash,
    audienceMaxHash: preview.audienceMaxHash,
    purpose: preview.purpose,
    channel: preview.channel,
    costCeiling: preview.requiredApproval.costCeiling,
    expiresAt,
  });
  campaign.approvalRef = approval.approvalRef;
  transition(ctx, campaignId, principal.tenantId, 'previewed', 'preview');
  transition(ctx, campaignId, principal.tenantId, 'approved', 'human_approval');
  return { approvalRef: approval.approvalRef };
}

export interface CommitResult {
  campaignId: string;
  queued: number;
  skipped: Array<{ subjectRef: string; reasonCodes: string[] }>;
  intentIds: string[];
  budgetCommitted: Money;
}

/**
 * Commit = efecto. Revalida aprobación, snapshot, supresión, frecuencia y techo
 * de coste justo antes de encolar. Cualquier miembro que ya no sea elegible se
 * excluye (reduce alcance); si aparecen miembros nuevos, exige nueva aprobación.
 */
export function commitCampaign(
  ctx: Ctx,
  principal: Principal,
  campaignId: string,
  approvalRef: string,
): CommitResult {
  const preview = previewCampaign(ctx, principal.tenantId, campaignId);
  if (preview.blockers.length > 0) throw new MarketingError('INVALID', `preview_blocked:${preview.blockers.join(',')}`);
  const campaign = ctx.store.campaigns.find((c) => c.tenantId === principal.tenantId && c.id === campaignId)!;
  if (campaign.state !== 'approved') throw new MarketingError('CONFLICT', `campaign_not_approved:${campaign.state}`);
  if (campaign.approvalRef !== approvalRef) throw new MarketingError('FORBIDDEN', 'approval_not_bound_to_campaign');

  const snapshot = assertSnapshotUsable(ctx, principal.tenantId, campaign.audienceSnapshotId);
  verifyApproval(ctx, principal.tenantId, approvalRef, {
    revisionHash: preview.revisionHash,
    audienceMaxHash: snapshot.membersHash,
    purpose: snapshot.rule.purpose,
    channel: campaign.channel,
    requiredBudget: campaign.costCeiling,
  });

  const creative = ctx.store.creatives.find((c) => c.id === campaign.creativeId && c.tenantId === principal.tenantId)!;
  const payloadHash = sha256({ creative: creative.hash, campaignId, revision: campaign.revision });
  const skipped: CommitResult['skipped'] = [];
  const intentIds: string[] = [];
  const frequency = checkFrequency(ctx, principal.tenantId, snapshot.memberRefs, campaign.channel);

  for (const subjectRef of snapshot.memberRefs) {
    const eligibility = evaluateEligibility(ctx, principal.tenantId, subjectRef, snapshot.rule.purpose, campaign.channel);
    if (eligibility.state !== 'eligible') {
      skipped.push({ subjectRef, reasonCodes: eligibility.reasonCodes });
      continue;
    }
    const freq = frequency.find((f) => f.subjectRef === subjectRef);
    if (!freq?.allowed) {
      skipped.push({ subjectRef, reasonCodes: freq?.reasonCodes ?? ['frequency_unknown'] });
      continue;
    }
    const exists = ctx.store.intents.find(
      (i) => i.tenantId === principal.tenantId && i.campaignId === campaignId && i.subjectRef === subjectRef && i.state !== 'cancelled',
    );
    if (exists) continue;
    const intent = {
      id: newId('int'),
      tenantId: principal.tenantId,
      operationKey: `${campaignId}:${campaign.revision}:${subjectRef}`,
      campaignId,
      subjectRef,
      channel: campaign.channel,
      payloadHash,
      approvalRef,
      audienceSnapshotId: snapshot.id,
      eligibilityRef: `elig_${subjectRef}_${eligibility.suppressionVersion}`,
      state: 'queued' as const,
      leaseFence: 0,
      attempts: 0,
      remoteRefs: [],
      lastError: null,
      reconciliationRequired: false,
      createdAt: ctx.now().toISOString(),
      updatedAt: ctx.now().toISOString(),
    };
    ctx.store.intents.push(intent);
    intentIds.push(intent.id);
  }

  const budget = ctx.store.budgets.find((b) => b.tenantId === principal.tenantId && b.campaignId === campaignId)!;
  const committed = addMoney(budget.committed, preview.estimatedCost);
  if (compareMoney(committed, budget.ceiling) > 0) throw new MarketingError('CONFLICT', 'budget_ceiling_exceeded');
  budget.committed = committed;

  transition(ctx, campaignId, principal.tenantId, 'queued', `commit:${intentIds.length}`);
  return { campaignId, queued: intentIds.length, skipped, intentIds, budgetCommitted: committed };
}

export function pauseCampaign(ctx: Ctx, principal: Principal, campaignId: string): CampaignRecord {
  const campaign = ctx.store.campaigns.find((c) => c.tenantId === principal.tenantId && c.id === campaignId);
  if (!campaign) throw new MarketingError('NOT_FOUND', 'campaign_not_found');
  const paused = transition(ctx, campaignId, principal.tenantId, 'paused', 'human_pause');
  for (const intent of ctx.store.intents) {
    if (intent.tenantId === principal.tenantId && intent.campaignId === campaignId && intent.state === 'queued') {
      intent.state = 'cancelled';
      intent.updatedAt = ctx.now().toISOString();
    }
  }
  return paused;
}

// ── Journeys (MKT-C19) ─────────────────────────────────────────────────────

export interface JourneySpecInput {
  name: string;
  steps: Array<{ stepId: string; channel: Channel; delayHours: number; templateRef: string }>;
  audienceRule: import('@agntia/contracts').AudienceRule;
  reentry: 'never' | 'after_days';
  reentryDays?: number;
}

export function createJourney(ctx: Ctx, principal: Principal, input: JourneySpecInput) {
  if (input.steps.length === 0 || input.steps.length > 20) throw new MarketingError('INVALID', 'steps_out_of_range');
  const ids = new Set(input.steps.map((s) => s.stepId));
  if (ids.size !== input.steps.length) throw new MarketingError('INVALID', 'duplicate_step');
  if (input.reentry === 'after_days' && !input.reentryDays) throw new MarketingError('INVALID', 'reentry_days_required');
  const journey = {
    id: newId('jrn'),
    tenantId: principal.tenantId,
    name: input.name,
    steps: [...input.steps].sort((a, b) => a.delayHours - b.delayHours),
    audienceRule: input.audienceRule,
    reentry: input.reentry,
    ...(input.reentryDays !== undefined ? { reentryDays: input.reentryDays } : {}),
    version: 1,
    createdAt: ctx.now().toISOString(),
  };
  ctx.store.journeys.push(journey);
  return journey;
}

export function previewJourney(ctx: Ctx, tenantId: string, journeyId: string, sample = 50) {
  const journey = ctx.store.journeys.find((j) => j.tenantId === tenantId && j.id === journeyId);
  if (!journey) throw new MarketingError('NOT_FOUND', 'journey_not_found');
  const preview = previewAudience(ctx, tenantId, journey.audienceRule);
  return {
    journeyId,
    steps: journey.steps.length,
    eligible: preview.eligibleCount,
    sampleSubjects: Math.min(sample, preview.eligibleCount),
    scheduleNote: 'Simulación. No inscribe ni envía; cada envío vuelve a pasar por approval y frecuencia.',
  };
}

// ── Landings (MKT-C15) ─────────────────────────────────────────────────────

export function proposeLanding(ctx: Ctx, principal: Principal, input: { pageRef: string; currentHtml: string; proposedHtml: string }) {
  if (input.proposedHtml.length > 200_000) throw new MarketingError('INVALID', 'landing_too_large');
  if (/<script[^>]*src=["']http:/i.test(input.proposedHtml)) throw new MarketingError('INVALID', 'insecure_script');
  const currentHash = sha256(input.currentHtml);
  const proposedHash = sha256(input.proposedHtml);
  if (currentHash === proposedHash) throw new MarketingError('INVALID', 'no_change');
  const added = input.proposedHtml.split('\n').length - input.currentHtml.split('\n').length;
  const proposal = {
    id: newId('lnd'),
    tenantId: principal.tenantId,
    pageRef: input.pageRef,
    currentHash,
    proposedHtml: input.proposedHtml,
    proposedHash,
    diffSummary: `${added >= 0 ? '+' : ''}${added} líneas; hash ${currentHash.slice(0, 8)}→${proposedHash.slice(0, 8)}`,
    state: 'proposed' as const,
    approvalRef: null,
  };
  ctx.store.landings.push(proposal);
  return { id: proposal.id, diffSummary: proposal.diffSummary, proposedHash };
}

export function publishLanding(ctx: Ctx, principal: Principal, proposalId: string, approvalRef: string) {
  const proposal = ctx.store.landings.find((l) => l.tenantId === principal.tenantId && l.id === proposalId);
  if (!proposal) throw new MarketingError('NOT_FOUND', 'landing_not_found');
  verifyApproval(ctx, principal.tenantId, approvalRef, {
    revisionHash: proposal.proposedHash,
    audienceMaxHash: sha256('public_page'),
    purpose: 'marketing',
    channel: 'landing',
    requiredBudget: { amount: '0.00', currency: 'EUR' },
  });
  proposal.state = 'published';
  proposal.approvalRef = approvalRef;
  return { pageRef: proposal.pageRef, publishedHash: proposal.proposedHash };
}

export function listLandings(ctx: Ctx, tenantId: string) {
  return ctx.store.landings
    .filter((l) => l.tenantId === tenantId)
    .map(({ proposedHtml: _html, ...rest }) => rest);
}
