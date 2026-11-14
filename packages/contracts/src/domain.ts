import { z } from 'zod';

export const ISO = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/);
export const ID = z.string().min(1).max(128);
export const Locale = z.enum(['es', 'en', 'fr']);

/** Dinero siempre decimal string + currency validada: nunca float del LLM. */
export const Money = z
  .object({
    amount: z.string().regex(/^-?\d{1,12}(\.\d{1,4})?$/),
    currency: z.string().regex(/^[A-Z]{3}$/),
  })
  .strict();

export type Money = z.infer<typeof Money>;

export const Channel = z.enum(['email', 'newsletter', 'landing', 'ads', 'social', 'in_person']);
export type Channel = z.infer<typeof Channel>;

export const Purpose = z.enum(['service', 'marketing', 'analytics', 'support', 'legal']);
export type Purpose = z.infer<typeof Purpose>;

// ── MKT-C02/C04: dominio, autoridad y procedencia ────────────────────────────
export const TwinBindingSchema = z
  .object({
    twinId: ID,
    canonicalAgentRef: z.object({ repo: z.literal('agente'), sha: z.string().regex(/^[0-9a-f]{40}$/) }),
    parentTenantId: ID,
    targetTenantId: ID,
    capabilities: z.array(z.string().min(1)).min(1).max(64),
    purpose: Purpose,
    validUntil: ISO,
    revocable: z.literal(true),
  })
  .strict();
export type TwinBinding = z.infer<typeof TwinBindingSchema>;

export const DelegationMandateSchema = z
  .object({
    mandateId: ID,
    originatingActorId: ID,
    originatingTenantId: ID,
    targetTenantId: ID,
    twinId: ID,
    workOrderId: ID,
    capabilities: z.array(z.string().min(1)).min(1).max(64),
    resources: z.array(z.string().min(1)).max(64).default([]),
    purpose: Purpose,
    validFrom: ISO,
    validUntil: ISO,
    budget: Money.optional(),
    proofRef: ID,
  })
  .strict();
export type DelegationMandate = z.infer<typeof DelegationMandateSchema>;

// ── MKT-C17: brief y estrategia ─────────────────────────────────────────────
export const BriefSchema = z
  .object({
    title: z.string().min(3).max(160),
    objective: z.string().min(10).max(2000),
    hypothesis: z.string().min(10).max(2000),
    offer: z.string().min(3).max(500),
    declaredAudience: z.string().min(3).max(1000),
    channels: z.array(Channel).min(1),
    successDefinition: z.string().min(3).max(500),
    window: z.object({ from: ISO, to: ISO }),
    budget: Money.optional(),
    constraints: z.array(z.string().max(300)).max(30).default([]),
    sources: z.array(z.object({ label: z.string().max(200), ref: z.string().max(500) })).min(1).max(30),
  })
  .strict();
export type Brief = z.infer<typeof BriefSchema>;

// ── MKT-C18: audiencias ────────────────────────────────────────────────────
export const AUDIENCE_FIELDS = [
  'country',
  'locale',
  'lifecycleStage',
  'interestTopic',
  'consentPurpose',
  'engagedDays',
  'isBusiness',
] as const;
export type AudienceField = (typeof AUDIENCE_FIELDS)[number];

const Cond = z
  .object({
    field: z.enum(AUDIENCE_FIELDS),
    op: z.enum(['eq', 'neq', 'in', 'gte', 'lte', 'exists']),
    value: z.union([z.string().max(64), z.number(), z.boolean(), z.array(z.string().max(64)).max(50)]),
  })
  .strict();

export const AudienceRuleSchema = z
  .object({
    purpose: Purpose,
    channel: Channel,
    locale: Locale.optional(),
    include: z.array(Cond).max(20).default([]),
    exclude: z.array(Cond).max(20).default([]),
  })
  .strict();
export type AudienceRule = z.infer<typeof AudienceRuleSchema>;

// ── MKT-C16: marca, activos y claims ───────────────────────────────────────
export const ClaimEvidenceSchema = z
  .object({
    claim: z.string().min(3).max(300),
    subject: z.string().min(1).max(200),
    scope: z.string().min(1).max(300),
    sourceKind: z.enum(['official', 'vendor', 'study', 'internal_measurement', 'customer_testimonial']),
    sourceRef: z.string().min(1).max(500),
    sourceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    support: z.enum(['supported', 'contradicted', 'unverified']),
    reviewer: ID.optional(),
    validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .strict();
export type ClaimEvidence = z.infer<typeof ClaimEvidenceSchema>;

export const CreativeRevisionSchema = z
  .object({
    locale: Locale,
    headline: z.string().min(1).max(160),
    body: z.string().min(1).max(4000),
    disclosure: z.string().max(300).nullable().default(null),
    claims: z.array(z.string().max(300)).max(20).default([]),
    links: z.array(z.object({ url: z.string().url().max(500), utm: z.record(z.string().max(64)).optional() })).max(10).default([]),
    assets: z
      .array(z.object({ assetId: ID, rights: z.enum(['owned', 'licensed', 'generated']), licenceRef: z.string().max(300).nullable() }))
      .max(20)
      .default([]),
    recipientType: z.enum(['b2b', 'b2c', 'internal']),
  })
  .strict();
export type CreativeRevision = z.infer<typeof CreativeRevisionSchema>;

// ── MKT-C20: aprobación vinculada ──────────────────────────────────────────
export const ApprovalBindingSchema = z
  .object({
    approvalRef: ID,
    approverActorId: ID,
    approverIsHuman: z.literal(true),
    revisionHash: z.string().min(16),
    audienceMaxHash: z.string().min(16),
    purpose: Purpose,
    channel: Channel,
    costCeiling: Money,
    policyVersion: z.string().min(1),
    expiresAt: ISO,
    revokedAt: ISO.nullable().default(null),
  })
  .strict();
export type ApprovalBinding = z.infer<typeof ApprovalBindingSchema>;

// ── MKT-C21: frecuencia y presupuesto ─────────────────────────────────────
export const ContactPolicySchema = z
  .object({
    maxPerSubjectPerWindow: z.number().int().min(1).max(20),
    windowHours: z.number().int().min(1).max(24 * 90),
    quietHours: z.object({ startUtcHour: z.number().int().min(0).max(23), endUtcHour: z.number().int().min(0).max(23) }).optional(),
    timezone: z.string().min(1).max(64).default('UTC'),
  })
  .strict();
export type ContactPolicy = z.infer<typeof ContactPolicySchema>;

// ── MKT-C25/C31: observación y medición ────────────────────────────────────
export const ObservationSchema = z
  .object({
    sourceId: ID,
    metric: z.string().min(1).max(80),
    metricVersion: z.string().min(1).max(20),
    aggregation: z.enum(['sum', 'count', 'average', 'ratio']),
    unit: z.string().min(1).max(20),
    window: z.object({ from: ISO, to: ISO }),
    occurredAt: ISO,
    value: z.number().nullable(),
    coverage: z.number().min(0).max(1),
    consentSnapshot: z.string().max(200),
    sourceHash: z.string().min(8).max(128),
  })
  .strict();
export type Observation = z.infer<typeof ObservationSchema>;

export const ConversionFactSchema = z
  .object({
    sourceObjectId: ID,
    businessEvent: z.enum(['order', 'booking', 'subscription', 'lead', 'refund', 'cancellation']),
    amount: Money.nullable(),
    status: z.enum(['confirmed', 'refunded', 'cancelled', 'pending']),
    dedupBasis: z.string().min(3).max(200),
    eventTime: ISO,
    evidenceRef: ID.nullable(),
  })
  .strict();
export type ConversionFact = z.infer<typeof ConversionFactSchema>;

export const MEASUREMENT_KINDS = ['descriptive', 'attributed', 'experimental', 'quasi_experimental', 'model_estimate'] as const;
export type MeasurementKind = (typeof MEASUREMENT_KINDS)[number];

// ── MKT-C28: experimentación ───────────────────────────────────────────────
export const ExperimentSpecSchema = z
  .object({
    hypothesis: z.string().min(10).max(1000),
    unit: z.enum(['subject', 'session', 'account', 'geo']),
    populationRef: ID,
    metric: z.string().min(1).max(120),
    guardrails: z.array(z.string().max(120)).min(1).max(10),
    minimumDetectableEffect: z.number().positive().max(1),
    alpha: z.number().min(0.001).max(0.2),
    power: z.number().min(0.5).max(0.99),
    horizonDays: z.number().int().min(1).max(365),
    analysisPlan: z.string().min(10).max(2000),
    preregistered: z.literal(true),
  })
  .strict();
export type ExperimentSpec = z.infer<typeof ExperimentSpecSchema>;

// ── MKT-C33: escenarios de mix ─────────────────────────────────────────────
export const BudgetScenarioSchema = z
  .object({
    totalBudget: Money,
    channelCaps: z.record(z.string().max(40), z.number().min(0).max(1)),
    expectedOutcomeRange: z.object({ low: z.number().nonnegative(), high: z.number().nonnegative() }),
    assumptions: z.array(z.string().max(300)).min(1).max(20),
  })
  .strict();
export type BudgetScenario = z.infer<typeof BudgetScenarioSchema>;

// ── MKT-C29/C30: paid media ────────────────────────────────────────────────
export const AdsProposalSchema = z
  .object({
    connectionId: ID,
    accountKind: z.enum(['test', 'read_only']),
    objective: z.enum(['awareness', 'traffic', 'conversions']),
    dailyBudget: Money,
    audienceRef: ID,
    creativeRef: ID,
    landingUrl: z.string().url().max(500),
    validateOnly: z.literal(true),
  })
  .strict();
export type AdsProposal = z.infer<typeof AdsProposalSchema>;

// ── MKT-C08/C11: conexiones y proveedores ─────────────────────────────────
export const ConnectionSchema = z
  .object({
    provider: z.enum(['mautic', 'listmonk', 'matomo', 'plausible', 'posthog', 'ga4', 'search_console', 'growthbook', 'ads', 'email_sandbox', 'anam']),
    endpointRef: z.string().min(1).max(300),
    secretRef: z.string().min(1).max(300),
    remoteAccountId: z.string().max(200).nullable().default(null),
    scopes: z.array(z.string().max(80)).min(1).max(40),
  })
  .strict();
export type ConnectionInput = z.infer<typeof ConnectionSchema>;

// ── MKT-C39: privacidad ────────────────────────────────────────────────────
export const PrivacyRequestSchema = z
  .object({
    kind: z.enum(['access', 'erasure', 'rectification', 'objection', 'portability']),
    subjectRef: ID,
    verificationRef: ID,
  })
  .strict();
export type PrivacyRequest = z.infer<typeof PrivacyRequestSchema>;

// ── MKT-C37: cooperación entre servicios ──────────────────────────────────
export const HandoffSchema = z
  .object({
    toService: z.enum(['redes', 'clientes', 'ventas', 'branding', 'agente']),
    effect: z.enum(['publish_post', 'send_message', 'create_quote', 'update_brand_asset', 'emit_event']),
    resourceRef: ID,
    ownerService: z.enum(['redes', 'clientes', 'ventas', 'branding', 'marketing']),
    acceptance: z.string().min(3).max(300),
  })
  .strict();
export type Handoff = z.infer<typeof HandoffSchema>;
