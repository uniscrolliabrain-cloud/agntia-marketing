import { z } from 'zod';
import { Channel, ID, ISO, Money } from './domain';

/**
 * M01–M10 · Market Intelligence Plane.
 *
 * Toda señal de mercado debe poder rastrearse hasta una fuente declarada, con
 * licencia explícita y caducidad por tipo. El sistema no acepta "verdad" sin
 * procedencia: una oportunidad sin evidencia fresca y lícita no se rankea.
 */

export const SOURCE_KINDS = ['official', 'vendor', 'study', 'press', 'internal', 'user_research'] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

/**
 * Caducidad operativa por tipo de fuente (días). No es una verdad universal:
 * es una política versionada del servicio que el reporte debe citar.
 */
export const SOURCE_MAX_AGE_DAYS: Record<SourceKind, number> = {
  official: 365,
  vendor: 180,
  study: 730,
  press: 30,
  internal: 90,
  user_research: 180,
};

export const EVIDENCE_GRADES = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5'] as const;
export type EvidenceGrade = (typeof EVIDENCE_GRADES)[number];

/**
 * Confianza máxima alcanzable por evidencia de mercado. Sin experimento
 * aleatorizado no se puede superar E4; el servicio nunca autoeleva el grado.
 */
export const MARKET_MAX_GRADE: EvidenceGrade = 'E4';

const HttpsUrl = z
  .string()
  .url()
  .max(500)
  .refine((value) => value.startsWith('https://'), { message: 'source_url_must_be_https' });

export const MarketSourceSchema = z
  .object({
    sourceRef: ID,
    kind: z.enum(SOURCE_KINDS),
    title: z.string().min(3).max(300),
    url: HttpsUrl.nullable().default(null),
    publisher: z.string().min(2).max(160),
    publishedAt: ISO,
    retrievedAt: ISO,
    licence: z.enum(['public', 'licensed', 'internal', 'unknown']),
    geography: z.string().min(2).max(80).default('ES'),
    note: z.string().max(500).nullable().default(null),
  })
  .strict();
export type MarketSource = z.infer<typeof MarketSourceSchema>;

export const OBSERVATION_KINDS = [
  'demand_signal',
  'competitor_move',
  'price',
  'trend',
  'audience_insight',
  'regulatory',
] as const;
export type ObservationKind = (typeof OBSERVATION_KINDS)[number];

export const MarketObservationSchema = z
  .object({
    sourceRef: ID,
    kind: z.enum(OBSERVATION_KINDS),
    topic: z.string().min(2).max(80),
    statement: z.string().min(10).max(600),
    geography: z.string().min(2).max(80).default('ES'),
    observedAt: ISO,
    value: z.number().finite().nullable().default(null),
    unit: z.string().min(1).max(20).nullable().default(null),
    confidence: z.number().min(0).max(1),
  })
  .strict();
export type MarketObservation = z.infer<typeof MarketObservationSchema>;

export const CompetitorSchema = z
  .object({
    name: z.string().min(2).max(160),
    domain: z
      .string()
      .min(3)
      .max(253)
      .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, 'domain_invalid'),
    positioning: z.string().min(5).max(400),
    offer: z.string().min(3).max(400),
    priceBand: z.enum(['low', 'mid', 'high', 'unknown']),
    channels: z.array(Channel).min(1).max(6),
    lastSeenAt: ISO,
    evidenceRefs: z.array(ID).min(1).max(20),
  })
  .strict();
export type Competitor = z.infer<typeof CompetitorSchema>;

export const IcpHypothesisSchema = z
  .object({
    name: z.string().min(3).max(120),
    segment: z.string().min(3).max(160),
    need: z.string().min(10).max(600),
    triggers: z.array(z.string().min(3).max(160)).max(10).default([]),
    disqualifiers: z.array(z.string().min(3).max(160)).max(10).default([]),
    evidenceRefs: z.array(ID).min(1).max(20),
  })
  .strict();
export type IcpHypothesis = z.infer<typeof IcpHypothesisSchema>;

export const OpportunitySchema = z
  .object({
    title: z.string().min(5).max(160),
    thesis: z.string().min(20).max(1200),
    segment: z.string().min(3).max(160),
    channelFocus: z.array(Channel).min(1).max(6),
    estimatedImpact: z.object({ low: Money, high: Money }),
    effort: z.enum(['low', 'medium', 'high']),
    evidenceRefs: z.array(ID).min(1).max(20),
    /** Confianza declarada 0..1. El grado E se calcula, nunca se declara. */
    confidence: z.number().min(0).max(1),
    expiresAt: ISO,
    hypothesis: z.string().min(10).max(1000),
  })
  .strict();
export type Opportunity = z.infer<typeof OpportunitySchema>;

export interface EvidenceAssessment {
  grade: EvidenceGrade;
  fresh: string[];
  stale: string[];
  unlicensed: string[];
  missing: string[];
}

export interface OpportunityRanking {
  score: number;
  grade: EvidenceGrade;
  /** Factor 0..1 por frescura de la evidencia en el instante del cálculo. */
  freshnessFactor: number;
  impactMid: number;
  confidence: number;
  effortWeight: number;
  reasons: string[];
  inputHash: string;
  computedAt: string;
}

export const MarketQuerySchema = z
  .object({
    topic: z.string().min(2).max(80).optional(),
    kind: z.enum(OBSERVATION_KINDS).optional(),
    includeStale: z.boolean().default(false),
  })
  .strict();
export type MarketQuery = z.infer<typeof MarketQuerySchema>;
