import {
  BudgetScenarioSchema,
  ConversionFactSchema,
  ExperimentSpecSchema,
  MarketingError,
  ObservationSchema,
  type BudgetScenario,
  type ConversionFact,
  type ExperimentSpec,
  type MeasurementKind,
  type Observation,
} from '@agntia/contracts';
import type { Ctx } from './store';
import type { Principal } from './authority';
import { newId, sha256 } from './util';

// ── Observaciones (MKT-C10/C23/C24/C25) ────────────────────────────────────

/**
 * missing (null), cero (0) y stale son estados distintos. `coverage` viaja con
 * el dato: un 0 con cobertura 0.2 no es un cero real.
 */
export function ingestObservation(ctx: Ctx, principal: Principal, input: Observation) {
  const obs = ObservationSchema.parse(input);
  if (Date.parse(obs.window.to) <= Date.parse(obs.window.from)) throw new MarketingError('INVALID', 'window_invalid');
  const record = { ...obs, id: newId('obs'), tenantId: principal.tenantId };
  ctx.store.observations.push(record);
  return record;
}

export function listObservations(
  ctx: Ctx,
  tenantId: string,
  filter: { sourceId?: string; metric?: string; from?: string; to?: string } = {},
) {
  return ctx.store.observations.filter((o) => {
    if (o.tenantId !== tenantId) return false;
    if (filter.sourceId && o.sourceId !== filter.sourceId) return false;
    if (filter.metric && o.metric !== filter.metric) return false;
    if (filter.from && Date.parse(o.window.to) < Date.parse(filter.from)) return false;
    if (filter.to && Date.parse(o.window.from) > Date.parse(filter.to)) return false;
    return true;
  });
}

export function summariseObservations(ctx: Ctx, tenantId: string, metric: string) {
  const rows = listObservations(ctx, tenantId, { metric });
  if (rows.length === 0) return { metric, state: 'missing' as const, value: null, coverage: 0, freshnessMinutes: null };
  const present = rows.filter((r) => r.value !== null);
  if (present.length === 0) return { metric, state: 'missing' as const, value: null, coverage: 0, freshnessMinutes: null };
  const value = present.reduce((acc, r) => acc + (r.value as number), 0);
  const coverage = present.reduce((acc, r) => acc + r.coverage, 0) / present.length;
  const latest = present.map((r) => Date.parse(r.occurredAt)).sort((a, b) => b - a)[0] ?? null;
  const freshnessMinutes = latest === null ? null : Math.round((ctx.now().getTime() - latest) / 60_000);
  return {
    metric,
    state: value === 0 ? ('zero' as const) : ('observed' as const),
    value,
    coverage,
    freshnessMinutes,
  };
}

// ── Conversiones y dedup (MKT-C31) ─────────────────────────────────────────

export function ingestConversion(ctx: Ctx, tenantId: string, sourceId: string, input: ConversionFact) {
  const fact = ConversionFactSchema.parse(input);
  const dedupKey = `${sourceId}|${fact.sourceObjectId}|${fact.dedupBasis}`;
  const existing = ctx.store.conversions.find((c) => c.tenantId === tenantId && c.dedupKey === dedupKey);
  if (existing) {
    existing.status = fact.status;
    existing.amount = fact.amount;
    return { duplicate: true as const, id: existing.id };
  }
  const record = { ...fact, id: newId('cvf'), tenantId, sourceId, dedupKey, createdAt: ctx.now().toISOString() };
  ctx.store.conversions.push(record);
  return { duplicate: false as const, id: record.id };
}

export interface MeasurementClaimRecord {
  id: string;
  kind: MeasurementKind;
  estimand: string;
  value: number;
  uncertainty: { low: number; high: number };
  assumptions: string[];
  datasetRefs: string[];
  limits: string[];
  requiresReview: boolean;
  approvedBy: string | null;
}

/**
 * MKT-C31: una cifra sólo es `experimental` si hay asignación aleatoria
 * registrada; `attributed` no es causal; `model_estimate` exige supuestos.
 * Sumar conversiones atribuidas de varias plataformas está prohibido.
 */
export function createMeasurementClaim(
  ctx: Ctx,
  principal: Principal,
  input: {
    kind: MeasurementKind;
    estimand: string;
    value: number;
    uncertainty: { low: number; high: number };
    assumptions: string[];
    datasetRefs: string[];
    limits: string[];
    experimentId?: string;
    platformBreakdown?: Array<{ platform: string; conversions: number }>;
  },
): MeasurementClaimRecord {
  if (input.kind === 'experimental' && !input.experimentId) throw new MarketingError('INVALID', 'experiment_required_for_causal_claim');
  if (input.kind === 'attributed' && input.limits.length === 0) throw new MarketingError('INVALID', 'attribution_limits_required');
  if (input.kind === 'attributed' && (input.platformBreakdown?.length ?? 0) > 1) {
    throw new MarketingError('INVALID', 'do_not_sum_platform_attribution');
  }
  if (input.uncertainty.high < input.uncertainty.low) throw new MarketingError('INVALID', 'uncertainty_range_invalid');
  const claim: MeasurementClaimRecord = {
    id: newId('mcl'),
    kind: input.kind,
    estimand: input.estimand,
    value: input.value,
    uncertainty: input.uncertainty,
    assumptions: input.assumptions,
    datasetRefs: input.datasetRefs,
    limits: input.limits,
    requiresReview: input.kind !== 'descriptive' || !principal.isHuman,
    approvedBy: input.kind === 'descriptive' ? principal.actorId : null,
  };
  ctx.store.auditLog(
    { tenantId: principal.tenantId, actorId: principal.actorId, action: 'measurement.claim', detail: `${claim.id}:${claim.kind}` },
    ctx.now().toISOString(),
  );
  return claim;
}

// ── Experimentos (MKT-C28) ─────────────────────────────────────────────────

export function proposeExperiment(
  ctx: Ctx,
  principal: Principal,
  input: ExperimentSpec,
  populationSize: number,
) {
  const spec = ExperimentSpecSchema.parse(input);
  if (populationSize < 0) throw new MarketingError('INVALID', 'population_invalid');
  const perArm = sampleSizePerArm(spec);
  const blockers: string[] = [];
  if (perArm === null) blockers.push('effect_too_small_for_power');
  else if (perArm * 2 > populationSize) blockers.push('population_insufficient');
  if (spec.horizonDays > 90) blockers.push('horizon_exceeds_quarter');

  const record = {
    ...spec,
    id: newId('exp'),
    tenantId: principal.tenantId,
    status: blockers.length === 0 ? ('ready' as const) : ('blocked' as const),
    sampleSizePerArm: perArm,
    blockers,
    createdAt: ctx.now().toISOString(),
  };
  ctx.store.experiments.push(record);
  return record;
}

/** Aproximación normal para dos proporciones, p=0.5 (conservadora). */
export function sampleSizePerArm(spec: Pick<ExperimentSpec, 'minimumDetectableEffect' | 'alpha' | 'power'>): number | null {
  if (spec.minimumDetectableEffect <= 0 || spec.minimumDetectableEffect >= 1) return null;
  const zAlpha = inverseNormal(1 - spec.alpha / 2);
  const zBeta = inverseNormal(spec.power);
  const p = 0.5;
  const n = (2 * p * (1 - p) * (zAlpha + zBeta) ** 2) / spec.minimumDetectableEffect ** 2;
  return Math.ceil(n);
}

function inverseNormal(p: number): number {
  // Aproximación de Acklam: suficiente para planificación, no para p-valores.
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) / ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  }
  if (p > 1 - plow) return -inverseNormal(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return (((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q /
    (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1);
}

// ── MMM y escenarios (MKT-C32/C33) ─────────────────────────────────────────

export interface MmmResult {
  method: string;
  status: 'sufficient' | 'blocked';
  blockers: string[];
  contributionShares: Array<{ channel: string; share: number }>;
  diagnostics: Record<string, string | number>;
  note: string;
}

/**
 * MKT-C32: no se ajusta un MMM con datos insuficientes. Con suficiencia se
 * devuelve un reparto descriptivo basado en gasto observado, etiquetado como
 * modelo, nunca como ROI causal.
 */
export function runMmm(
  ctx: Ctx,
  tenantId: string,
  input: { weeks: number; channels: string[]; spendByChannel: Record<string, number>; confounders: string[] },
): MmmResult {
  const blockers: string[] = [];
  if (input.weeks < 52) blockers.push('less_than_52_weeks');
  if (input.channels.length < 2) blockers.push('need_two_channels');
  if (input.channels.length > input.weeks / 8) blockers.push('too_many_channels_for_weeks');
  if (input.confounders.length === 0) blockers.push('no_confounders_declared');
  if (input.channels.some((c) => !(c in input.spendByChannel))) blockers.push('missing_spend_for_channel');

  if (blockers.length > 0) {
    return {
      method: 'descriptive-spend-share-v1',
      status: 'blocked',
      blockers,
      contributionShares: [],
      diagnostics: { weeks: input.weeks, channels: input.channels.length },
      note: 'Datos insuficientes: no se estima contribución ni ROI.',
    };
  }
  const total = input.channels.reduce((acc, c) => acc + input.spendByChannel[c]!, 0);
  const contributionShares = input.channels.map((channel) => ({
    channel,
    share: total === 0 ? 0 : Math.round((input.spendByChannel[channel]! / total) * 1000) / 1000,
  }));
  return {
    method: 'descriptive-spend-share-v1',
    status: 'sufficient',
    blockers: [],
    contributionShares,
    diagnostics: { weeks: input.weeks, channels: input.channels.length, totalSpend: total },
    note: 'Reparto descriptivo del gasto observado. No es ROI causal ni incrementalidad.',
  };
}

export function buildBudgetScenario(ctx: Ctx, tenantId: string, input: BudgetScenario) {
  const scenario = BudgetScenarioSchema.parse(input);
  if (scenario.expectedOutcomeRange.high < scenario.expectedOutcomeRange.low) {
    throw new MarketingError('INVALID', 'outcome_range_invalid');
  }
  const capSum = Object.values(scenario.channelCaps).reduce((a, b) => a + b, 0);
  if (capSum > 1.0001) throw new MarketingError('INVALID', 'channel_caps_exceed_total');
  const total = Number(scenario.totalBudget.amount);
  const spendProposal = Object.entries(scenario.channelCaps)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([channel, share]) => ({
      channel,
      amount: (total * share).toFixed(2),
      currency: scenario.totalBudget.currency,
      share,
    }));
  return {
    tenantId,
    totalBudget: scenario.totalBudget,
    spendProposal,
    expectedOutcomeRange: scenario.expectedOutcomeRange,
    assumptions: scenario.assumptions,
    mutatesSpend: false,
    note: 'Escenario. No modifica presupuestos ni lanza campañas.',
    hash: sha256({ scenario, tenantId }),
  };
}

// ── Reportes (MKT-C34) ─────────────────────────────────────────────────────

export function generateReport(
  ctx: Ctx,
  principal: Principal,
  input: { metrics: string[]; datasetRefs: string[]; definitions: Record<string, string>; ttlMinutes?: number },
) {
  if (input.metrics.length === 0) throw new MarketingError('INVALID', 'metrics_required');
  const metrics = input.metrics.map((metric) => {
    const summary = summariseObservations(ctx, principal.tenantId, metric);
    return {
      name: metric,
      kind: summary.state,
      value: summary.value,
      coverage: summary.coverage,
      freshnessMinutes: summary.freshnessMinutes,
    };
  });
  const generatedAt = ctx.now().toISOString();
  const ttl = input.ttlMinutes ?? 60;
  const record = {
    id: newId('rpt'),
    tenantId: principal.tenantId,
    datasetRefs: input.datasetRefs,
    definitions: input.definitions,
    metrics,
    hash: sha256({ metrics, generatedAt, tenantId: principal.tenantId }),
    generatedAt,
    expiresAt: new Date(ctx.now().getTime() + ttl * 60_000).toISOString(),
  };
  ctx.store.reports.push(record);
  return record;
}

// ── SEO, AEO y GEO (MKT-C26/C27) ───────────────────────────────────────────

export interface PageFacts {
  url: string;
  title: string;
  metaDescription: string;
  h1Count: number;
  canonical: string | null;
  robots: string | null;
  hasStructuredData: boolean;
  https: boolean;
  sitemapListed: boolean;
  hreflang: string[];
  lang: string;
}

export interface SeoFinding {
  code: string;
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

export function auditSeo(input: PageFacts): { findings: SeoFinding[]; proposalsOnly: true } {
  const findings: SeoFinding[] = [];
  if (!input.https) findings.push({ code: 'no_https', severity: 'high', detail: 'La página no es HTTPS.' });
  if (input.title.length < 15 || input.title.length > 65) findings.push({ code: 'title_length', severity: 'medium', detail: `${input.title.length} caracteres.` });
  if (input.metaDescription.length < 50 || input.metaDescription.length > 160) findings.push({ code: 'meta_description_length', severity: 'low', detail: `${input.metaDescription.length} caracteres.` });
  if (input.h1Count !== 1) findings.push({ code: 'h1_count', severity: 'medium', detail: `${input.h1Count} h1.` });
  if (!input.canonical) findings.push({ code: 'missing_canonical', severity: 'medium', detail: 'Sin canonical.' });
  if (input.robots?.includes('noindex')) findings.push({ code: 'noindex', severity: 'high', detail: 'Página marcada noindex.' });
  if (!input.hasStructuredData) findings.push({ code: 'no_structured_data', severity: 'low', detail: 'Sin datos estructurados.' });
  if (!input.sitemapListed) findings.push({ code: 'not_in_sitemap', severity: 'medium', detail: 'No aparece en sitemap.' });
  if (input.hreflang.length > 0 && !input.hreflang.includes(input.lang)) {
    findings.push({ code: 'hreflang_missing_self', severity: 'low', detail: 'hreflang sin autorreferencia.' });
  }
  return { findings, proposalsOnly: true };
}

export interface AeoObservation {
  id: string;
  tenantId: string;
  engine: 'google_ai_overview' | 'chatgpt' | 'perplexity' | 'other';
  prompt: string;
  brandMentioned: boolean;
  citedUrl: string | null;
  observedAt: string;
  note: string;
}

export function recordAeoObservation(
  ctx: Ctx,
  tenantId: string,
  input: Omit<AeoObservation, 'id' | 'tenantId' | 'observedAt' | 'note'>,
): AeoObservation {
  const record: AeoObservation = {
    id: newId('aeo'),
    tenantId,
    ...input,
    observedAt: ctx.now().toISOString(),
    note: 'Observacional: una mención no garantiza posición, tráfico ni cita futura.',
  };
  ctx.store.auditLog({ tenantId, actorId: 'system', action: 'aeo.observed', detail: record.id }, ctx.now().toISOString());
  return record;
}
