import { Hono, type Context } from 'hono';
import { z, ZodError } from 'zod';
import {
  AdsProposalSchema,
  AudienceRuleSchema,
  BriefSchema,
  ClaimEvidenceSchema,
  CompetitorSchema,
  ConnectionSchema,
  ConversionFactSchema,
  CreativeRevisionSchema,
  ExperimentSpecSchema,
  HandoffSchema,
  MarketingError,
  ObservationSchema,
  PrivacyRequestSchema,
  BudgetScenarioSchema,
  IcpHypothesisSchema,
  MarketObservationSchema,
  MarketSourceSchema,
  OpportunitySchema,
  type Capability,
  type MarketQuery,
} from '@agntia/contracts';
import type { AdapterRegistry } from '@agntia/adapters';
import {
  acceptBrief,
  addClaim,
  approveCampaign,
  approveJourney,
  assertSnapshotUsable,
  auditSeo,
  authorityMapView,
  buildBudgetScenario,
  checkClaims,
  commitCampaign,
  createBrief,
  createCampaign,
  createCreative,
  createJourney,
  enrollJourney,
  createMeasurementClaim,
  createService,
  createStore,
  deliverIntent,
  freezeAudience,
  generateReport,
  ingestConversion,
  ingestObservation,
  leaseIntents,
  listConnections,
  listMarketObservations,
  listMarketSources,
  listObservations,
  pauseCampaign,
  marketRadar,
  previewAudience,
  previewCampaign,
  previewJourney,
  proposeAds,
  proposeExperiment,
  proposeLanding,
  proposeOpportunity,
  proposeStrategy,
  rankOpportunities,
  registerCompetitor,
  registerIcp,
  registerMarketSource,
  registerObservation,
  publishLanding,
  reconcileIntent,
  registerConnection,
  resolvePrincipal,
  runMmm,
  settleCampaign,
  summariseObservations,
  recordAeoObservation,
  type Ctx,
  type Principal,
} from '@agntia/core';
import type { JwtVerifier } from './auth';

export interface AppDeps {
  ctx: Ctx;
  registry: AdapterRegistry;
  verifier: JwtVerifier;
}

interface Vars {
  jwt: Awaited<ReturnType<JwtVerifier['verify']>>;
}

const CampaignInputSchema = z
  .object({
    name: z.string().min(3).max(160),
    briefId: z.string().min(1),
    channel: z.enum(['email', 'newsletter', 'landing', 'ads', 'social', 'in_person']),
    purpose: z.enum(['service', 'marketing', 'analytics', 'support', 'legal']),
    audienceSnapshotId: z.string().min(1),
    creativeId: z.string().min(1),
    costPerRecipient: z.object({ amount: z.string(), currency: z.string().length(3) }),
    costCeiling: z.object({ amount: z.string(), currency: z.string().length(3) }),
  })
  .strict();

export function createApp(deps: AppDeps) {
  const { ctx, registry } = deps;
  const service = createService(ctx, registry);
  const app = new Hono<{ Variables: Vars }>();

  const idempotency = (c: Context) => {
    const key = c.req.header('idempotency-key');
    if (!key || key.length < 8) throw new MarketingError('INVALID', 'idempotency_key_required');
    return key;
  };

  const correlation = (c: Context) => c.req.header('x-correlation-id') ?? `corr_${crypto.randomUUID().slice(0, 12)}`;

  const param = (c: Context, name = 'id'): string => {
    const value = c.req.param(name);
    if (!value) throw new MarketingError('INVALID', `missing_param:${name}`);
    return value;
  };

  // Rate limit por tenant y minuto sobre operaciones de escritura (MKT-C38).
  const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120);
  const rateWindow = new Map<string, number>();

  app.get('/healthz', (c) => c.json({ ok: true, service: 'agntia-marketing', policy: ctx.policyVersion }));

  app.use('/v1/marketing/*', async (c, next) => {
    const header = c.req.header('authorization') ?? '';
    if (!header.startsWith('Bearer ')) throw new MarketingError('AUTH_REQUIRED', 'missing_bearer');
    const jwt = await deps.verifier.verify(header.slice('Bearer '.length));
    c.set('jwt', jwt);
    await next();
  });

  /** Escritura: principal verificado + capability + idempotencia + envelope. */
  function mutate<TBody, TResult>(
    capability: Capability,
    schema: z.ZodType<TBody, z.ZodTypeDef, unknown>,
    handler: (principal: Principal, body: TBody, c: Context) => TResult,
  ) {
    return async (c: Context) => {
      const principal = resolvePrincipal(ctx, c.get('jwt') as Vars['jwt'], capability);
      const windowKey = `${principal.tenantId}:${Math.floor(ctx.now().getTime() / 60_000)}`;
      const used = rateWindow.get(windowKey) ?? 0;
      if (used >= RATE_LIMIT_PER_MINUTE) throw new MarketingError('RATE_LIMITED', 'tenant_rate_limit');
      rateWindow.set(windowKey, used + 1);
      const key = idempotency(c);
      const raw = await c.req.json().catch(() => ({}));
      const body = schema.parse(raw);
      const result = await service.run(principal, capability, { idempotencyKey: key, correlationId: correlation(c), payload: body }, () =>
        handler(principal, body, c),
      );
      return c.json(result, 200);
    };
  }

  /** Lectura: mismo PEP, sin idempotencia ni envelope de escritura. */
  function read<TResult>(capability: Capability, handler: (principal: Principal, c: Context) => TResult) {
    return (c: Context) => {
      const principal = resolvePrincipal(ctx, c.get('jwt') as Vars['jwt'], capability);
      return c.json(handler(principal, c), 200);
    };
  }

  // ── Contexto y conexiones (C02, C08) ────────────────────────────────────
  app.get(
    '/v1/marketing/me',
    read('marketing.context.read', (principal) => ({
      actorId: principal.actorId,
      tenantId: principal.tenantId,
      roles: principal.roles,
      isHuman: principal.isHuman,
      capabilities: principal.scopes,
      policyVersion: ctx.policyVersion,
      twin: ctx.store.twins.find((t) => t.tenantId === principal.tenantId) ?? null,
    })),
  );

  app.get('/v1/marketing/integrations', read('marketing.integration.read', (p) => listConnections(ctx, p.tenantId)));

  app.post(
    '/v1/marketing/integrations',
    mutate('marketing.connection.admin', ConnectionSchema, (p, body) => registerConnection(ctx, p, body)),
  );

  app.get(
    '/v1/marketing/integrations/:id/capabilities',
    read('marketing.integration.read', (p, c) => {
      const connection = ctx.store.connections.find((x) => x.tenantId === p.tenantId && x.id === param(c));
      if (!connection) throw new MarketingError('NOT_FOUND', 'connection_not_found');
      return { connectionId: connection.id, provider: connection.provider, state: connection.state, verified: false, capabilityReport: connection.capabilityReport };
    }),
  );

  // ── Briefs y estrategia (C17) ───────────────────────────────────────────
  app.post(
    '/v1/marketing/briefs',
    mutate('marketing.brief.write', BriefSchema, (p, body, c) => createBrief(ctx, p, body, c.req.header('idempotency-key') ?? '')),
  );

  app.get('/v1/marketing/briefs', read('marketing.brief.read', (p) => ctx.store.briefs.filter((b) => b.tenantId === p.tenantId)));

  const AcceptBriefSchema = z.object({ expectedVersion: z.number().int().nonnegative() }).strict();
  app.post(
    '/v1/marketing/briefs/:id/accept',
    mutate('marketing.brief.write', AcceptBriefSchema, (p, body, c) => {
      acceptBrief(ctx, p, param(c), body.expectedVersion);
      return { briefId: param(c), status: 'accepted' };
    }),
  );

  app.post(
    '/v1/marketing/briefs/:id/strategy-proposals',
    mutate('marketing.strategy.propose', z.object({}).strict(), (p, _body, c) => proposeStrategy(ctx, p, param(c))),
  );

  // ── Audiencias (C18) ────────────────────────────────────────────────────
  app.post(
    '/v1/marketing/audiences/previews',
    mutate('marketing.audience.preview', AudienceRuleSchema, (p, body) => {
      const preview = previewAudience(ctx, p.tenantId, body);
      return {
        eligibleCount: preview.eligibleCount,
        excludedCount: preview.excludedCount,
        eligibleRefs: preview.eligibleRefs.slice(0, 100),
        excludedSample: preview.excluded.slice(0, 20),
        ruleHash: preview.ruleHash,
      };
    }),
  );

  const SnapshotInput = z.object({ rule: AudienceRuleSchema, ttlMinutes: z.number().int().min(5).max(1440).optional() }).strict();
  app.post(
    '/v1/marketing/audience-snapshots',
    mutate('marketing.audience.snapshot', SnapshotInput, (p, body) => {
      const snapshot = freezeAudience(ctx, p.tenantId, body.rule, body.ttlMinutes);
      return { snapshotId: snapshot.id, membersHash: snapshot.membersHash, eligibleCount: snapshot.eligibleCount, expiresAt: snapshot.expiresAt };
    }),
  );

  // ── Claims y creatividades (C16) ────────────────────────────────────────
  app.post(
    '/v1/marketing/claims',
    mutate('marketing.creative.write', ClaimEvidenceSchema, (p, body) => addClaim(ctx, p, body)),
  );

  const CreativeInput = z.object({ creativeId: z.string().min(1).optional(), revision: CreativeRevisionSchema }).strict();
  app.post(
    '/v1/marketing/creatives',
    mutate('marketing.creative.write', CreativeInput, (p, body) => {
      const creative = createCreative(ctx, p, body);
      const claims = checkClaims(ctx, p.tenantId, creative.data.claims);
      return { creativeId: creative.id, revision: creative.revision, hash: creative.hash, claims };
    }),
  );

  // ── Campañas (C19/C20/C22) ──────────────────────────────────────────────
  app.post(
    '/v1/marketing/campaigns',
    mutate('marketing.campaign.preview', CampaignInputSchema, (p, body) => {
      const campaign = createCampaign(ctx, p, body);
      return { campaignId: campaign.id, state: campaign.state, version: campaign.version };
    }),
  );

  app.get(
    '/v1/marketing/campaigns/:id',
    read('marketing.campaign.preview', (p, c) => {
      const campaign = ctx.store.campaigns.find((x) => x.tenantId === p.tenantId && x.id === param(c));
      if (!campaign) throw new MarketingError('NOT_FOUND', 'campaign_not_found');
      return campaign;
    }),
  );

  app.post(
    '/v1/marketing/campaign-previews',
    mutate(
      'marketing.campaign.preview',
      z.object({ campaignId: z.string().min(1) }).strict(),
      (p, body) => previewCampaign(ctx, p.tenantId, body.campaignId),
    ),
  );

  app.post(
    '/v1/marketing/campaigns/:id/approve',
    mutate(
      'marketing.campaign.commit',
      z.object({ expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/) }).strict(),
      (p, body, c) => approveCampaign(ctx, p, param(c), body.expiresAt),
    ),
  );

  app.post(
    '/v1/marketing/campaigns/:id/commit',
    mutate(
      'marketing.campaign.commit',
      z.object({ approvalRef: z.string().min(1) }).strict(),
      (p, body, c) => commitCampaign(ctx, p, param(c), body.approvalRef),
    ),
  );

  app.post(
    '/v1/marketing/campaigns/:id/pause',
    mutate('marketing.campaign.pause', z.object({}).strict(), (p, _b, c) => {
      const campaign = pauseCampaign(ctx, p, param(c));
      return { campaignId: campaign.id, state: campaign.state };
    }),
  );

  app.post(
    '/v1/marketing/campaigns/:id/reconcile',
    mutate(
      'marketing.campaign.reconcile',
      z.object({ intentId: z.string().min(1), resolution: z.enum(['delivered', 'not_delivered', 'duplicate']), evidenceRef: z.string().min(1) }).strict(),
      (p, body, c) => {
        const result = reconcileIntent(ctx, p.tenantId, body.intentId, body.resolution, body.evidenceRef);
        return { ...result, campaign: settleCampaign(ctx, p.tenantId, param(c)) };
      },
    ),
  );

  app.get(
    '/v1/marketing/campaigns/:id/delivery',
    read('marketing.campaign.preview', (p, c) => {
      const intents = ctx.store.intents.filter((i) => i.tenantId === p.tenantId && i.campaignId === param(c));
      return {
        total: intents.length,
        counts: intents.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.state]: (acc[i.state] ?? 0) + 1 }), {}),
        reconciliationRequired: intents.filter((i) => i.reconciliationRequired).map((i) => i.id),
      };
    }),
  );

  // ── Journeys y landings (C19/C15) ───────────────────────────────────────
  const JourneyInput = z
    .object({
      name: z.string().min(3).max(160),
      steps: z
        .array(z.object({ stepId: z.string().min(1), channel: z.enum(['email', 'newsletter', 'landing', 'ads', 'social', 'in_person']), delayHours: z.number().int().min(0).max(8760), templateRef: z.string().min(1) }))
        .min(1)
        .max(20),
      audienceRule: AudienceRuleSchema,
      reentry: z.enum(['never', 'after_days']),
      reentryDays: z.number().int().min(1).max(365).optional(),
    })
    .strict();
  app.post('/v1/marketing/journeys', mutate('marketing.journey.preview', JourneyInput, (p, body) => createJourney(ctx, p, body)));
  app.post(
    '/v1/marketing/journeys/:id/preview',
    mutate('marketing.journey.preview', z.object({ sample: z.number().int().min(1).max(1000).optional() }).strict(), (p, body, c) =>
      previewJourney(ctx, p.tenantId, param(c), body.sample ?? 50),
    ),
  );


  app.post(
    '/v1/marketing/journeys/:id/approve',
    mutate(
      'marketing.journey.enroll',
      z.object({ expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/) }).strict(),
      (p, body, c) => approveJourney(ctx, p, param(c), body.expiresAt),
    ),
  );

  app.post(
    '/v1/marketing/journeys/:id/enrollments',
    mutate('marketing.journey.enroll', z.object({ approvalRef: z.string().min(1) }).strict(), (p, body, c) =>
      enrollJourney(ctx, p, param(c), body.approvalRef),
    ),
  );

  app.get(
    '/v1/marketing/journeys/:id/enrollments',
    read('marketing.journey.preview', (p, c) =>
      ctx.store.journeyEnrollments.filter((e) => e.tenantId === p.tenantId && e.journeyId === param(c)),
    ),
  );

  const LandingInput = z.object({ pageRef: z.string().min(1).max(300), currentHtml: z.string().max(200_000), proposedHtml: z.string().max(200_000) }).strict();
  app.post('/v1/marketing/landing-previews', mutate('marketing.landing.propose', LandingInput, (p, body) => proposeLanding(ctx, p, body)));
  app.post(
    '/v1/marketing/landing-change-proposals/:id/publish',
    mutate('marketing.landing.publish', z.object({ approvalRef: z.string().min(1) }).strict(), (p, body, c) =>
      publishLanding(ctx, p, param(c), body.approvalRef),
    ),
  );

  // ── Medición (C23/C24/C25/C26/C27/C31) ──────────────────────────────────
  app.post('/v1/marketing/observations', mutate('marketing.observation.read', ObservationSchema, (p, body) => ingestObservation(ctx, p, body)));
  app.get(
    '/v1/marketing/observations',
    read('marketing.observation.read', (p, c) => listObservations(ctx, p.tenantId, { metric: c.req.query('metric') ?? undefined })),
  );
  app.get(
    '/v1/marketing/search-performance',
    read('marketing.observation.read', (p) => ({
      source: 'search_console',
      observations: listObservations(ctx, p.tenantId, { sourceId: 'search_console' }),
      note: 'Datos con retraso y muestreo; no implican ranking garantizado.',
    })),
  );

  app.post(
    '/v1/marketing/conversions',
    mutate('marketing.measurement.run', ConversionFactSchema.extend({ sourceId: z.string().min(1) }).strict(), (p, body) => {
      const { sourceId, ...fact } = body;
      return ingestConversion(ctx, p.tenantId, sourceId, fact);
    }),
  );

  app.post(
    '/v1/marketing/measurement-claims',
    mutate(
      'marketing.measurement.run',
      z
        .object({
          kind: z.enum(['descriptive', 'attributed', 'experimental', 'quasi_experimental', 'model_estimate']),
          estimand: z.string().min(3),
          value: z.number(),
          uncertainty: z.object({ low: z.number(), high: z.number() }),
          assumptions: z.array(z.string()).default([]),
          datasetRefs: z.array(z.string()).default([]),
          limits: z.array(z.string()).default([]),
          experimentId: z.string().optional(),
          platformBreakdown: z.array(z.object({ platform: z.string(), conversions: z.number() })).optional(),
        })
        .strict(),
      (p, body) => createMeasurementClaim(ctx, p, body),
    ),
  );

  app.post(
    '/v1/marketing/experiment-proposals',
    mutate(
      'marketing.experiment.propose',
      z.object({ spec: ExperimentSpecSchema, populationSize: z.number().int().nonnegative() }).strict(),
      (p, body) => proposeExperiment(ctx, p, body.spec, body.populationSize),
    ),
  );

  app.post(
    '/v1/marketing/measurement-runs',
    mutate(
      'marketing.measurement.run',
      z.object({ weeks: z.number().int().min(1).max(520), channels: z.array(z.string()).min(1), spendByChannel: z.record(z.number().nonnegative()), confounders: z.array(z.string()) }).strict(),
      (p, body) => runMmm(ctx, p.tenantId, body),
    ),
  );

  app.post(
    '/v1/marketing/budget-scenarios',
    mutate('marketing.budget.scenario', BudgetScenarioSchema, (p, body) => buildBudgetScenario(ctx, p.tenantId, body)),
  );

  app.post('/v1/marketing/reports', mutate('marketing.report.write', z.object({ metrics: z.array(z.string()).min(1), datasetRefs: z.array(z.string()).default([]), definitions: z.record(z.string()).default({}) }).strict(), (p, body) => generateReport(ctx, p, body)));
  app.get(
    '/v1/marketing/reports/:id',
    read('marketing.report.read', (p, c) => {
      const report = ctx.store.reports.find((r) => r.tenantId === p.tenantId && r.id === param(c));
      if (!report) throw new MarketingError('NOT_FOUND', 'report_not_found');
      return { ...report, stale: Date.parse(report.expiresAt) <= ctx.now().getTime() };
    }),
  );

  app.get(
    '/v1/marketing/reports',
    read('marketing.report.read', (p) => ctx.store.reports.filter((r) => r.tenantId === p.tenantId)),
  );

  const SeoInput = z
    .object({
      url: z.string().url(),
      title: z.string(),
      metaDescription: z.string(),
      h1Count: z.number().int().min(0),
      canonical: z.string().nullable(),
      robots: z.string().nullable(),
      hasStructuredData: z.boolean(),
      https: z.boolean(),
      sitemapListed: z.boolean(),
      hreflang: z.array(z.string()).default([]),
      lang: z.string(),
    })
    .strict();
  app.post('/v1/marketing/seo-audits', mutate('marketing.observation.read', SeoInput, (_p, body) => auditSeo(body)));

  const AeoInput = z.object({ engine: z.enum(['google_ai_overview', 'chatgpt', 'perplexity', 'other']), prompt: z.string().min(3).max(500), brandMentioned: z.boolean(), citedUrl: z.string().url().nullable() }).strict();
  app.post('/v1/marketing/aeo-observations', mutate('marketing.observation.read', AeoInput, (p, body) => recordAeoObservation(ctx, p.tenantId, body)));

  // ── Ads (C29/C30) ───────────────────────────────────────────────────────
  app.post('/v1/marketing/ads/proposals', mutate('marketing.ads.propose', AdsProposalSchema, (p, body) => proposeAds(ctx, p, body)));

  // ── Privacidad, cooperación, asesor (C36/C37/C39) ───────────────────────
  app.post('/v1/marketing/privacy-requests', mutate('marketing.privacy.request', PrivacyRequestSchema, (p, body) => service.submitPrivacyRequest(p, body)));
  app.post(
    '/v1/marketing/privacy-requests/:id/fulfil',
    mutate('marketing.privacy.request', z.object({}).strict(), (p, _b, c) => service.fulfilPrivacyRequest(p, param(c))),
  );
  app.post('/v1/marketing/handoffs', mutate('marketing.campaign.preview', HandoffSchema, (p, body) => service.proposeHandoff(p, body)));
  app.post(
    '/v1/marketing/handoffs/:id/respond',
    mutate(
      'marketing.campaign.preview',
      z.object({ decision: z.enum(['accept', 'reject']), note: z.string().max(300).optional() }).strict(),
      (p, body, c) => service.respondHandoff(p, param(c), body.decision, body.note),
    ),
  );
  app.post(
    '/v1/marketing/handoffs/expire',
    mutate('marketing.campaign.preview', z.object({ olderThanMinutes: z.number().int().min(5).max(43_200).optional() }).strict(), (p, body) =>
      service.expireHandoffs(p, body.olderThanMinutes ?? 1440),
    ),
  );
  app.get('/v1/marketing/conflicts', read('marketing.campaign.preview', (p) => service.listConflicts(p)));
  app.get(
    '/v1/marketing/events',
    read('marketing.context.read', (p, c) => {
      const limit = Math.min(Number(c.req.query('limit') ?? 50), 200);
      return ctx.store.events.filter((e) => e.tenantId === p.tenantId).slice(-limit);
    }),
  );
  app.post(
    '/v1/marketing/advisor-sessions',
    mutate('marketing.advisor.session', z.object({ scope: z.string().min(1).max(300) }).strict(), (p, body) => service.openAdvisorSession(p, body.scope)),
  );
  app.post(
    '/v1/marketing/advisor-sessions/:id/close',
    mutate('marketing.advisor.session', z.object({}).strict(), (p, _b, c) => service.closeAdvisorSession(p, param(c))),
  );

  // ── Operación (C38) ─────────────────────────────────────────────────────
  app.get('/v1/marketing/health', read('marketing.context.read', (p) => service.serviceHealth(p.tenantId)));
  app.get(
    '/v1/marketing/jobs/:id',
    read('marketing.job.read', (_p, c) => {
      throw new MarketingError('NOT_FOUND', `job_not_found:${param(c)}`);
    }),
  );

  // ── Worker interno de sandbox (C14/C22) ─────────────────────────────────
  const WorkerRun = z.object({ workerId: z.string().min(1), limit: z.number().int().min(1).max(100).default(25), provider: z.enum(['email_sandbox']) }).strict();
  app.post(
    '/v1/marketing/internal/deliver',
    mutate('marketing.campaign.commit', WorkerRun, async (p, body) => {
      const leased = leaseIntents(ctx, p.tenantId, body.workerId, body.limit);
      const results = [];
      for (const intent of leased) {
        results.push(await deliverIntent(ctx, registry, intent.id, intent.fence, body.provider));
      }
      for (const campaignId of new Set(leased.map((i) => i.campaignId))) {
        // Los intents de journey no son campañas: sólo se liquida lo que lo es.
        const isCampaign = ctx.store.campaigns.some((camp) => camp.tenantId === p.tenantId && camp.id === campaignId);
        if (isCampaign) settleCampaign(ctx, p.tenantId, campaignId);
      }
      return results;
    }),
  );

  // ── M01–M10 · Inteligencia de mercado (C03) ─────────────────────────────
  const marketQuery = (c: Context): MarketQuery => ({
    ...(c.req.query('topic') ? { topic: c.req.query('topic') } : {}),
    ...(c.req.query('kind') ? { kind: c.req.query('kind') as MarketQuery['kind'] } : {}),
    includeStale: c.req.query('includeStale') === 'true',
  });

  app.post(
    '/v1/marketing/market/sources',
    mutate('marketing.market.write', MarketSourceSchema, (p, body) => registerMarketSource(ctx, p, body)),
  );
  app.get('/v1/marketing/market/sources', read('marketing.market.read', (p) => listMarketSources(ctx, p.tenantId)));

  app.post(
    '/v1/marketing/market/observations',
    mutate('marketing.market.write', MarketObservationSchema, (p, body) => registerObservation(ctx, p, body)),
  );
  app.get(
    '/v1/marketing/market/observations',
    read('marketing.market.read', (p, c) => listMarketObservations(ctx, p.tenantId, marketQuery(c))),
  );

  app.post(
    '/v1/marketing/market/competitors',
    mutate('marketing.market.write', CompetitorSchema, (p, body) => registerCompetitor(ctx, p, body)),
  );
  app.get(
    '/v1/marketing/market/competitors',
    read('marketing.market.read', (p) => ctx.store.competitors.filter((c) => c.tenantId === p.tenantId)),
  );

  app.post(
    '/v1/marketing/market/icps',
    mutate('marketing.market.write', IcpHypothesisSchema, (p, body) => registerIcp(ctx, p, body)),
  );

  app.post(
    '/v1/marketing/market/opportunities',
    mutate('marketing.market.write', OpportunitySchema, (p, body) => proposeOpportunity(ctx, p, body)),
  );
  app.get(
    '/v1/marketing/market/opportunities',
    read('marketing.market.read', (p) => rankOpportunities(ctx, p.tenantId)),
  );

  app.get('/v1/marketing/market/radar', read('marketing.market.read', (p) => marketRadar(ctx, p.tenantId)));

  // ── M65 · AuthorityMap entre dominios (C01) ─────────────────────────────
  app.get('/v1/marketing/authority', read('marketing.context.read', () => authorityMapView()));

  app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', detail: 'route_not_found', correlationId: `corr_${crypto.randomUUID().slice(0, 12)}` } }, 404));

  app.onError((err, c) => {
    const correlationId = c.req.header('x-correlation-id') ?? `corr_${crypto.randomUUID().slice(0, 12)}`;
    if (err instanceof MarketingError) return c.json(err.toBody(correlationId), err.httpStatus as 400);
    if (err instanceof ZodError) {
      return c.json(
        {
          error: {
            code: 'INVALID',
            detail: err.issues.map((i) => `${i.path.join('.') || 'body'}:${i.code}`).join(','),
            correlationId,
            retryable: false,
            reconciliationRequired: false,
          },
        },
        422,
      );
    }
    // Nunca se devuelve el mensaje interno: puede contener rutas o datos.
    return c.json(
      { error: { code: 'UNAVAILABLE', detail: 'internal_error', correlationId, retryable: true, reconciliationRequired: false } },
      503,
    );
  });

  return app;
}

/** Arranque de conveniencia para `tsx apps/api/src/server.ts`. */
export function createDefaultContext(): Ctx {
  return createStore();
}
