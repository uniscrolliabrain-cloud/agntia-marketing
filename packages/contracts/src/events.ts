import { z } from 'zod';
import { ISO, ID } from './domain';

/**
 * Eventos propios v1 (MKT-C04/C10/C35). Nunca llevan personas de listas, PII,
 * tokens ni cuerpos de mensaje: solo referencias locales y hashes.
 */
export const SERVICE_EVENT_TYPES = [
  'marketing.brief.accepted',
  'marketing.campaign.review_required',
  'marketing.campaign.state_changed',
  'marketing.effect.confirmed',
  'marketing.effect.outcome_unknown',
  'marketing.suppression.changed',
  'marketing.measurement.ready',
  'marketing.review.required',
] as const;

export type ServiceEventType = (typeof SERVICE_EVENT_TYPES)[number];

export const ServiceEventSchema = z
  .object({
    id: ID,
    tenantId: ID,
    actorRef: ID,
    occurredAt: ISO,
    correlationId: ID,
    causationId: ID.nullable(),
    type: z.enum(SERVICE_EVENT_TYPES),
    payloadRefs: z.array(z.object({ kind: z.string().max(40), id: ID })).max(20),
  })
  .strict();

export type ServiceEvent = z.infer<typeof ServiceEventSchema>;

/** Tipos nativos del padre que el bridge puede mapear. Allowlist, no passthrough. */
export const PARENT_EVENT_MAP: Record<ServiceEventType, { type: string; schemaVersion: '1.0' } | null> = {
  'marketing.brief.accepted': { type: 'specialist.work_item.updated', schemaVersion: '1.0' },
  'marketing.campaign.review_required': { type: 'specialist.review.requested', schemaVersion: '1.0' },
  'marketing.campaign.state_changed': { type: 'specialist.work_item.updated', schemaVersion: '1.0' },
  'marketing.effect.confirmed': { type: 'specialist.effect.reported', schemaVersion: '1.0' },
  'marketing.effect.outcome_unknown': { type: 'specialist.effect.reported', schemaVersion: '1.0' },
  'marketing.suppression.changed': null,
  'marketing.measurement.ready': { type: 'specialist.work_item.updated', schemaVersion: '1.0' },
  'marketing.review.required': { type: 'specialist.review.requested', schemaVersion: '1.0' },
};
