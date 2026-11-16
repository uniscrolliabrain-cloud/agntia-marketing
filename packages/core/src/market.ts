import {
  CompetitorSchema,
  IcpHypothesisSchema,
  MarketObservationSchema,
  MarketQuerySchema,
  MarketSourceSchema,
  MarketingError,
  OpportunitySchema,
  SOURCE_MAX_AGE_DAYS,
  type Competitor,
  type EvidenceAssessment,
  type EvidenceGrade,
  type IcpHypothesis,
  type MarketObservation,
  type MarketQuery,
  type MarketSource,
  type Money,
  type Opportunity,
  type OpportunityRanking,
  type SourceKind,
} from '@agntia/contracts';
import type {
  CompetitorRecord,
  Ctx,
  IcpRecord,
  MarketObservationRecord,
  MarketSourceRecord,
  OpportunityRecord,
} from './store';
import type { Principal } from './authority';
import { canonicalJson, newId, sha256 } from './util';

/**
 * M01–M10 · Market Reality Graph.
 *
 * Invariantes:
 * 1. Ninguna oportunidad existe sin fuente declarada, con licencia verificada y
 *    dentro de la caducidad de su tipo. Sin eso se devuelve un error, no un
 *    ranking con evidencia inventada.
 * 2. El grado de evidencia E0–E5 lo calcula el servidor a partir de las fuentes.
 *    El cliente sólo aporta una confianza subjetiva 0..1.
 * 3. El ranking es determinista: mismo estado y mismo reloj producen el mismo
 *    score y el mismo `inputHash`. La frescura decae, no se congela.
 * 4. Todo es tenant-scoped: buscar una fuente de otro tenant es "no existe".
 */

const DAY_MS = 86_400_000;
export const RANKING_POLICY = 'market-ranking-2026-11-16.1';

/** Peso de autoridad por tipo de fuente dentro del factor de frescura. */
const KIND_WEIGHT: Record<SourceKind, number> = {
  official: 1,
  study: 1,
  internal: 0.9,
  user_research: 0.8,
  vendor: 0.6,
  press: 0.4,
};

const EFFORT_WEIGHT: Record<Opportunity['effort'], number> = { low: 1, medium: 0.7, high: 0.45 };

const round4 = (value: number) => Math.round(value * 10_000) / 10_000;

function findSource(ctx: Ctx, tenantId: string, sourceRef: string): MarketSourceRecord | undefined {
  return ctx.store.marketSources.find((s) => s.tenantId === tenantId && s.sourceRef === sourceRef);
}

export function sourceAgeDays(source: { retrievedAt: string }, now: Date): number {
  return (now.getTime() - Date.parse(source.retrievedAt)) / DAY_MS;
}

export function isSourceFresh(source: MarketSourceRecord, now: Date): boolean {
  const age = sourceAgeDays(source, now);
  return age >= 0 && age <= SOURCE_MAX_AGE_DAYS[source.kind];
}

/** Grado de evidencia calculado, nunca declarado por el cliente. */
export function assessEvidence(ctx: Ctx, tenantId: string, refs: string[]): EvidenceAssessment {
  const fresh: string[] = [];
  const stale: string[] = [];
  const unlicensed: string[] = [];
  const missing: string[] = [];
  const now = ctx.now();
  let hasInternal = false;
  let hasOfficialOrStudy = false;

  for (const ref of [...new Set(refs)]) {
    const source = findSource(ctx, tenantId, ref);
    if (!source) {
      missing.push(ref);
      continue;
    }
    if (source.licence === 'unknown') unlicensed.push(ref);
    if (isSourceFresh(source, now)) {
      fresh.push(ref);
      if (source.kind === 'internal') hasInternal = true;
      if (source.kind === 'official' || source.kind === 'study') hasOfficialOrStudy = true;
    } else {
      stale.push(ref);
    }
  }

  const grade: EvidenceGrade =
    fresh.length === 0
      ? 'E0'
      : hasInternal && fresh.length >= 2
        ? 'E4'
        : fresh.length >= 2 && hasOfficialOrStudy
          ? 'E3'
          : fresh.length >= 2
            ? 'E2'
            : 'E1';

  return { grade, fresh, stale, unlicensed, missing };
}

function freshnessFactor(ctx: Ctx, tenantId: string, refs: string[]): number {
  const now = ctx.now();
  const weights: number[] = [];
  for (const ref of [...new Set(refs)]) {
    const source = findSource(ctx, tenantId, ref);
    if (source && isSourceFresh(source, now)) weights.push(KIND_WEIGHT[source.kind]);
  }
  if (weights.length === 0) return 0;
  return round4(weights.reduce((a, b) => a + b, 0) / weights.length);
}

const impactMid = (impact: { low: Money; high: Money }): number =>
  round4((Number(impact.low.amount) + Number(impact.high.amount)) / 2);

export function computeRanking(ctx: Ctx, tenantId: string, opportunity: Opportunity): OpportunityRanking {
  const assessment = assessEvidence(ctx, tenantId, opportunity.evidenceRefs);
  const freshness = freshnessFactor(ctx, tenantId, opportunity.evidenceRefs);
  const impact = impactMid(opportunity.estimatedImpact);
  const effortWeight = EFFORT_WEIGHT[opportunity.effort];
  const score = round4(impact * opportunity.confidence * freshness * effortWeight);
  const reasons: string[] = [
    `evidence_grade:${assessment.grade}`,
    `impact_mid:${impact} ${opportunity.estimatedImpact.low.currency}`,
    `confidence:${opportunity.confidence}`,
    `freshness_factor:${freshness}`,
    `effort_weight:${effortWeight}`,
  ];
  if (assessment.stale.length > 0) reasons.push(`stale_evidence:${assessment.stale.length}`);
  if (assessment.fresh.length === 0) reasons.push('no_fresh_evidence');

  return {
    score,
    grade: assessment.grade,
    freshnessFactor: freshness,
    impactMid: impact,
    confidence: opportunity.confidence,
    effortWeight,
    reasons,
    computedAt: ctx.now().toISOString(),
    inputHash: sha256({
      policy: RANKING_POLICY,
      title: opportunity.title,
      thesis: opportunity.thesis,
      segment: opportunity.segment,
      channelFocus: opportunity.channelFocus,
      estimatedImpact: opportunity.estimatedImpact,
      effort: opportunity.effort,
      confidence: opportunity.confidence,
      evidenceRefs: [...opportunity.evidenceRefs].sort(),
      grade: assessment.grade,
      freshnessFactor: freshness,
    }),
  };
}

// ── Registro de fuentes y señales ──────────────────────────────────────────

export function registerMarketSource(ctx: Ctx, principal: Principal, input: MarketSource): MarketSourceRecord {
  const parsed = MarketSourceSchema.parse(input);
  const now = ctx.now();
  if (Date.parse(parsed.retrievedAt) > now.getTime()) throw new MarketingError('INVALID', 'retrieved_at_in_future');
  if (Date.parse(parsed.publishedAt) > Date.parse(parsed.retrievedAt)) {
    throw new MarketingError('INVALID', 'published_after_retrieved');
  }

  const existing = findSource(ctx, principal.tenantId, parsed.sourceRef);
  if (existing) {
    const same =
      existing.kind === parsed.kind &&
      existing.title === parsed.title &&
      existing.url === parsed.url &&
      existing.publisher === parsed.publisher &&
      existing.publishedAt === parsed.publishedAt &&
      existing.retrievedAt === parsed.retrievedAt &&
      existing.licence === parsed.licence &&
      existing.geography === parsed.geography &&
      existing.note === parsed.note;
    if (same) return existing;
    throw new MarketingError('CONFLICT', 'source_ref_conflict');
  }

  const record: MarketSourceRecord = {
    id: newId('msrc'),
    tenantId: principal.tenantId,
    sourceRef: parsed.sourceRef,
    kind: parsed.kind,
    title: parsed.title,
    url: parsed.url,
    publisher: parsed.publisher,
    publishedAt: parsed.publishedAt,
    retrievedAt: parsed.retrievedAt,
    licence: parsed.licence,
    geography: parsed.geography,
    note: parsed.note,
    createdAt: now.toISOString(),
  };
  ctx.store.marketSources.push(record);
  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'market.source.registered', detail: `${record.sourceRef}:${record.kind}:${record.licence}` },
    now.toISOString(),
  );
  return record;
}

export function registerObservation(ctx: Ctx, principal: Principal, input: MarketObservation): MarketObservationRecord {
  const parsed = MarketObservationSchema.parse(input);
  const now = ctx.now();
  if (!findSource(ctx, principal.tenantId, parsed.sourceRef)) {
    throw new MarketingError('INVALID', 'observation_source_unknown');
  }
  if (Date.parse(parsed.observedAt) > now.getTime()) throw new MarketingError('INVALID', 'observed_at_in_future');

  const fingerprint = sha256({
    sourceRef: parsed.sourceRef,
    kind: parsed.kind,
    topic: parsed.topic,
    statement: parsed.statement,
    observedAt: parsed.observedAt,
  });
  const duplicate = ctx.store.marketObservations.find(
    (o) => o.tenantId === principal.tenantId && sha256({ sourceRef: o.sourceRef, kind: o.kind, topic: o.topic, statement: o.statement, observedAt: o.observedAt }) === fingerprint,
  );
  if (duplicate) return duplicate;

  const record: MarketObservationRecord = {
    id: newId('mobs'),
    tenantId: principal.tenantId,
    ...parsed,
    createdAt: now.toISOString(),
  };
  ctx.store.marketObservations.push(record);
  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'market.observation.recorded', detail: `${record.topic}:${record.kind}` },
    now.toISOString(),
  );
  return record;
}

export function registerCompetitor(ctx: Ctx, principal: Principal, input: Competitor): CompetitorRecord {
  const parsed = CompetitorSchema.parse(input);
  assertEvidenceRefs(ctx, principal.tenantId, parsed.evidenceRefs);
  const duplicate = ctx.store.competitors.find(
    (c) => c.tenantId === principal.tenantId && c.domain === parsed.domain,
  );
  if (duplicate) {
    const same = canonicalJson({ ...duplicate, id: undefined, tenantId: undefined, createdAt: undefined }) === canonicalJson(parsed);
    if (same) return duplicate;
    throw new MarketingError('CONFLICT', 'competitor_domain_conflict');
  }
  const record: CompetitorRecord = {
    id: newId('cmp'),
    tenantId: principal.tenantId,
    ...parsed,
    createdAt: ctx.now().toISOString(),
  };
  ctx.store.competitors.push(record);
  return record;
}

export function registerIcp(ctx: Ctx, principal: Principal, input: IcpHypothesis): IcpRecord {
  const parsed = IcpHypothesisSchema.parse(input);
  assertEvidenceRefs(ctx, principal.tenantId, parsed.evidenceRefs);
  const record: IcpRecord = {
    id: newId('icp'),
    tenantId: principal.tenantId,
    ...parsed,
    createdAt: ctx.now().toISOString(),
  };
  ctx.store.icps.push(record);
  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'market.icp.registered', detail: record.name },
    ctx.now().toISOString(),
  );
  return record;
}

function assertEvidenceRefs(ctx: Ctx, tenantId: string, refs: string[]): void {
  const assessment = assessEvidence(ctx, tenantId, refs);
  if (assessment.missing.length > 0) {
    throw new MarketingError('INVALID', `evidence_ref_unknown:${assessment.missing.join(',')}`);
  }
  if (assessment.unlicensed.length > 0) {
    throw new MarketingError('FORBIDDEN', `evidence_licence_unverified:${assessment.unlicensed.join(',')}`);
  }
}

// ── Oportunidades ──────────────────────────────────────────────────────────

export function proposeOpportunity(ctx: Ctx, principal: Principal, input: Opportunity): OpportunityRecord {
  const parsed = OpportunitySchema.parse(input);
  const now = ctx.now();

  if (parsed.estimatedImpact.low.currency !== parsed.estimatedImpact.high.currency) {
    throw new MarketingError('INVALID', 'impact_currency_mismatch');
  }
  if (Number(parsed.estimatedImpact.high.amount) < Number(parsed.estimatedImpact.low.amount)) {
    throw new MarketingError('INVALID', 'impact_range_inverted');
  }
  if (Date.parse(parsed.expiresAt) <= now.getTime()) throw new MarketingError('INVALID', 'opportunity_already_expired');

  const assessment = assessEvidence(ctx, principal.tenantId, parsed.evidenceRefs);
  if (assessment.missing.length > 0) {
    throw new MarketingError('INVALID', `evidence_ref_unknown:${assessment.missing.join(',')}`);
  }
  if (assessment.unlicensed.length > 0) {
    throw new MarketingError('FORBIDDEN', `evidence_licence_unverified:${assessment.unlicensed.join(',')}`);
  }
  if (assessment.stale.length > 0) {
    throw new MarketingError('CONFLICT', `evidence_stale:${assessment.stale.join(',')}`);
  }
  if (assessment.fresh.length === 0) {
    throw new MarketingError('CONFLICT', 'evidence_missing_fresh');
  }

  const duplicate = ctx.store.opportunities.find(
    (o) =>
      o.tenantId === principal.tenantId &&
      o.status !== 'rejected' &&
      o.input.title === parsed.title &&
      o.input.segment === parsed.segment,
  );
  if (duplicate) throw new MarketingError('CONFLICT', `opportunity_duplicate:${duplicate.id}`);

  const record: OpportunityRecord = {
    id: newId('opp'),
    tenantId: principal.tenantId,
    input: parsed,
    status: 'proposed',
    ranking: computeRanking(ctx, principal.tenantId, parsed),
    createdAt: now.toISOString(),
  };
  ctx.store.opportunities.push(record);
  ctx.store.events.push({
    id: newId('evt'),
    tenantId: principal.tenantId,
    actorRef: principal.actorId,
    occurredAt: now.toISOString(),
    correlationId: record.id,
    causationId: null,
    type: 'marketing.review.required',
    payloadRefs: [{ kind: 'opportunity', id: record.id }],
  });
  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'market.opportunity.proposed', detail: `${record.id}:${record.ranking.grade}` },
    now.toISOString(),
  );
  return record;
}

export interface RankedOpportunity {
  opportunityId: string;
  title: string;
  segment: string;
  status: OpportunityRecord['status'];
  expired: boolean;
  score: number;
  grade: EvidenceGrade;
  freshnessFactor: number;
  reasons: string[];
  inputHash: string;
}

/** Ranking recalculado en cada lectura: la frescura decae con el reloj real. */
export function rankOpportunities(ctx: Ctx, tenantId: string): RankedOpportunity[] {
  const now = ctx.now();
  return ctx.store.opportunities
    .filter((o) => o.tenantId === tenantId && o.status !== 'rejected')
    .map((o) => {
      const ranking = computeRanking(ctx, tenantId, o.input);
      return {
        opportunityId: o.id,
        title: o.input.title,
        segment: o.input.segment,
        status: o.status,
        expired: Date.parse(o.input.expiresAt) <= now.getTime(),
        score: ranking.score,
        grade: ranking.grade,
        freshnessFactor: ranking.freshnessFactor,
        reasons: ranking.reasons,
        inputHash: ranking.inputHash,
      };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.opportunityId.localeCompare(b.opportunityId));
}

export interface RadarTopic {
  topic: string;
  observations: number;
  kinds: string[];
  lastObservedAt: string;
  freshObservations: number;
  staleObservations: number;
  sources: string[];
}

export function marketRadar(ctx: Ctx, tenantId: string): { topics: RadarTopic[]; staleShare: number } {
  const now = ctx.now();
  const rows = ctx.store.marketObservations.filter((o) => o.tenantId === tenantId);
  const byTopic = new Map<string, RadarTopic>();
  let stale = 0;

  for (const row of rows) {
    const source = findSource(ctx, tenantId, row.sourceRef);
    const fresh = source ? isSourceFresh(source, now) : false;
    if (!fresh) stale += 1;
    const current = byTopic.get(row.topic) ?? {
      topic: row.topic,
      observations: 0,
      kinds: [],
      lastObservedAt: row.observedAt,
      freshObservations: 0,
      staleObservations: 0,
      sources: [],
    };
    current.observations += 1;
    if (!current.kinds.includes(row.kind)) current.kinds.push(row.kind);
    if (Date.parse(row.observedAt) > Date.parse(current.lastObservedAt)) current.lastObservedAt = row.observedAt;
    if (!current.sources.includes(row.sourceRef)) current.sources.push(row.sourceRef);
    if (fresh) current.freshObservations += 1;
    else current.staleObservations += 1;
    byTopic.set(row.topic, current);
  }

  return {
    topics: [...byTopic.values()].sort((a, b) => b.observations - a.observations || a.topic.localeCompare(b.topic)),
    staleShare: rows.length === 0 ? 0 : round4(stale / rows.length),
  };
}

export function listMarketObservations(ctx: Ctx, tenantId: string, query: MarketQuery) {
  const parsed = MarketQuerySchema.parse(query);
  return ctx.store.marketObservations.filter((o) => {
    if (o.tenantId !== tenantId) return false;
    if (parsed.topic && o.topic !== parsed.topic) return false;
    if (parsed.kind && o.kind !== parsed.kind) return false;
    if (!parsed.includeStale) {
      const source = findSource(ctx, tenantId, o.sourceRef);
      if (!source || !isSourceFresh(source, ctx.now())) return false;
    }
    return true;
  });
}

export function listMarketSources(ctx: Ctx, tenantId: string) {
  const now = ctx.now();
  return ctx.store.marketSources
    .filter((s) => s.tenantId === tenantId)
    .map((s) => ({
      sourceRef: s.sourceRef,
      kind: s.kind,
      title: s.title,
      licence: s.licence,
      geography: s.geography,
      retrievedAt: s.retrievedAt,
      ageDays: Math.round(sourceAgeDays(s, now) * 10) / 10,
      fresh: isSourceFresh(s, now),
      maxAgeDays: SOURCE_MAX_AGE_DAYS[s.kind],
    }));
}
