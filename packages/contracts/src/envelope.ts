import { z } from 'zod';

/**
 * Capacidades nominadas (MKT-C02/C05). No existe passthrough por prefijo:
 * cada ruta del API y cada tool del SDK declara una de estas.
 */
export const CAPABILITIES = [
  'marketing.context.read',
  'marketing.integration.read',
  'marketing.connection.admin',
  'marketing.brief.read',
  'marketing.brief.write',
  'marketing.market.read',
  'marketing.market.write',
  'marketing.strategy.propose',
  'marketing.audience.preview',
  'marketing.audience.snapshot',
  'marketing.creative.write',
  'marketing.campaign.preview',
  'marketing.campaign.commit',
  'marketing.campaign.pause',
  'marketing.campaign.reconcile',
  'marketing.journey.preview',
  'marketing.journey.enroll',
  'marketing.landing.preview',
  'marketing.landing.propose',
  'marketing.landing.publish',
  'marketing.observation.read',
  'marketing.experiment.propose',
  'marketing.measurement.run',
  'marketing.budget.scenario',
  'marketing.ads.propose',
  'marketing.ads.validate',
  'marketing.report.read',
  'marketing.report.write',
  'marketing.advisor.session',
  'marketing.job.read',
  'marketing.privacy.request',
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const CapabilitySchema = z.enum(CAPABILITIES);

/** Clase de efecto. Todo lo que no es lectura pasa por policy + approval. */
export type EffectClass = 'read' | 'prepare' | 'effect';

export const OPERATION_ID = /^[A-Za-z0-9_-]{8,64}$/;
export const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

/**
 * Envelope v1. `tenantId`, `actorId` y `capability` son valores resueltos por el
 * servidor: el cliente no los puede imponer. En la práctica la ruta fija
 * capability y el principal fija tenantId/actorId; aquí se validan por contrato.
 */
export const EnvelopeSchema = z
  .object({
    schemaVersion: z.literal(1),
    operationId: z.string().regex(OPERATION_ID),
    tenantId: z.string().min(1).max(128),
    actorId: z.string().min(1).max(128),
    capability: CapabilitySchema,
    requestId: z.string().max(128).optional(),
    correlationId: z.string().min(1).max(128),
    causationId: z.string().max(128).nullable().default(null),
    idempotencyKey: z.string().min(1).max(200),
    expectedVersion: z.number().int().nonnegative().optional(),
    approvalRef: z.string().min(1).max(128).nullable().default(null),
    dryRun: z.boolean().default(true),
    payload: z.unknown(),
  })
  .strict();

export type Envelope = z.infer<typeof EnvelopeSchema>;

/** Payload del cliente: nunca incluye identidad ni capacidad. */
export const ClientRequestSchema = z
  .object({
    correlationId: z.string().min(1).max(128).optional(),
    idempotencyKey: z.string().min(1).max(200).optional(),
    expectedVersion: z.number().int().nonnegative().optional(),
    approvalRef: z.string().min(1).max(128).nullable().optional(),
    dryRun: z.boolean().optional(),
    payload: z.unknown(),
  })
  .strict();

export type ClientRequest = z.infer<typeof ClientRequestSchema>;

export type OperationStatus = 'ok' | 'accepted' | 'conflict' | 'rejected';

export interface OperationResult<T = unknown> {
  status: OperationStatus;
  operationId: string;
  correlationId: string;
  localRefs: string[];
  remoteRefs: Array<{ kind: string; id: string }>;
  evidenceRefs: string[];
  payloadHash: string;
  policyVersion: string;
  warnings: string[];
  retryable: boolean;
  reconciliationRequired: boolean;
  actualScope: { tenantId: string; capability: Capability; dryRun: boolean };
  payload?: T;
}

export const ERROR_STATUS = {
  AUTH_REQUIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID: 422,
  DEPENDENCY_MISSING: 424,
  RATE_LIMITED: 429,
  UPSTREAM_INVALID: 502,
  UNAVAILABLE: 503,
  TIMEOUT: 504,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

/**
 * Error de dominio seguro: nunca transporta tokens, PII, DSN ni tracebacks.
 * `detail` es un código corto y estable, no texto libre del proveedor.
 */
export class MarketingError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly detail?: string;
  readonly retryable: boolean;
  readonly reconciliationRequired: boolean;

  constructor(
    code: ErrorCode,
    detail?: string,
    opts: { retryable?: boolean; reconciliationRequired?: boolean } = {},
  ) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'MarketingError';
    this.code = code;
    this.httpStatus = ERROR_STATUS[code];
    this.detail = detail;
    this.retryable = opts.retryable ?? (code === 'TIMEOUT' || code === 'UNAVAILABLE' || code === 'RATE_LIMITED');
    this.reconciliationRequired = opts.reconciliationRequired ?? false;
  }

  toBody(correlationId: string) {
    return {
      error: {
        code: this.code,
        detail: this.detail ?? null,
        correlationId,
        retryable: this.retryable,
        reconciliationRequired: this.reconciliationRequired,
      },
    };
  }
}
