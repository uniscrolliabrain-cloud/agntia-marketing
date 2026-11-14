import { z } from 'zod';
import { PARENT_EVENT_MAP, type ServiceEvent } from '@agntia/contracts';
import type { MarketingClient } from './client';

/**
 * Tools expuestas al modelo (MKT-C35). Tenant, actor y scopes NO forman parte
 * del input: los pone el servidor desde el principal verificado. No existen
 * tools de envío, aprobación, export total, cambio de presupuesto, subida de
 * audiencia ni administración.
 */
const NoTenant = z.object({}).strict();

export interface ToolDefinition {
  name: string;
  description: string;
  input: z.ZodTypeAny;
  invoke: (client: MarketingClient, input: unknown) => Promise<unknown>;
}

export const TOOLS: ToolDefinition[] = [
  {
    name: 'marketing_brief_read',
    description: 'Lee un brief por id.',
    input: z.object({ briefId: z.string().min(1) }).strict(),
    invoke: async (client, input) => {
      const { briefId } = input as { briefId: string };
      const res = await client.call({ capability: 'marketing.brief.read', method: 'GET', path: '/v1/marketing/briefs' });
      const briefs = res.body as Array<{ id: string }>;
      return briefs.find((b) => b.id === briefId) ?? null;
    },
  },
  {
    name: 'marketing_campaign_status',
    description: 'Estado y version de una campaña.',
    input: z.object({ campaignId: z.string().min(1) }).strict(),
    invoke: async (client, input) => {
      const { campaignId } = input as { campaignId: string };
      return (await client.call({ capability: 'marketing.campaign.preview', method: 'GET', path: `/v1/marketing/campaigns/${campaignId}` })).body;
    },
  },
  {
    name: 'marketing_audience_preview',
    description: 'Cuenta elegibles para una regla, sin exportar la lista.',
    input: z.object({ rule: z.record(z.unknown()) }).strict(),
    invoke: async (client, input) => {
      const { rule } = input as { rule: unknown };
      return (
        await client.call({
          capability: 'marketing.audience.preview',
          method: 'POST',
          path: '/v1/marketing/audiences/previews',
          body: rule,
          idempotencyKey: `tool_preview_${crypto.randomUUID().slice(0, 12)}`,
        })
      ).body;
    },
  },
  {
    name: 'marketing_creative_propose',
    description: 'Propone una revisión de creatividad; no envía.',
    input: z.object({ revision: z.record(z.unknown()) }).strict(),
    invoke: async (client, input) =>
      (
        await client.call({
          capability: 'marketing.creative.write',
          method: 'POST',
          path: '/v1/marketing/creatives',
          body: input,
          idempotencyKey: `tool_creative_${crypto.randomUUID().slice(0, 12)}`,
        })
      ).body,
  },
  {
    name: 'marketing_metrics_read',
    description: 'Lee observaciones por métrica.',
    input: z.object({ metric: z.string().min(1) }).strict(),
    invoke: async (client, input) => {
      const { metric } = input as { metric: string };
      return (await client.call({ capability: 'marketing.observation.read', method: 'GET', path: `/v1/marketing/observations?metric=${encodeURIComponent(metric)}` })).body;
    },
  },
  {
    name: 'marketing_measurement_explain',
    description: 'Explica el tipo de claim y sus límites.',
    input: NoTenant,
    invoke: async () =>
      'descriptive ≠ attributed ≠ experimental ≠ model_estimate. Solo experimental con asignación permite lenguaje causal; attributed no es incrementalidad.',
  },
  {
    name: 'marketing_report_read',
    description: 'Lee un snapshot de reporte.',
    input: z.object({ reportId: z.string().min(1) }).strict(),
    invoke: async (client, input) => {
      const { reportId } = input as { reportId: string };
      return (await client.call({ capability: 'marketing.report.read', method: 'GET', path: `/v1/marketing/reports/${reportId}` })).body;
    },
  },
  {
    name: 'marketing_integration_health',
    description: 'Salud semántica de integraciones.',
    input: NoTenant,
    invoke: async (client) => (await client.call({ capability: 'marketing.context.read', method: 'GET', path: '/v1/marketing/health' })).body,
  },
];

export function findTool(name: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.name === name);
}

export interface ParentEventEnvelope {
  type: string;
  schemaVersion: '1.0';
  owner: string;
  emittedAt: string;
  source: 'agntia-marketing';
  payload: { localId: string; localKind: string };
}

/**
 * Bridge al padre (MKT-C35): sólo tipos nativos mapeados, envelope v1.0 y sin
 * PII. Un evento sin equivalente devuelve null en vez de inventar un tipo.
 */
export function toParentEvent(event: ServiceEvent, meta: { owner: string; emittedAt: string }): ParentEventEnvelope | null {
  const mapped = PARENT_EVENT_MAP[event.type];
  if (!mapped) return null;
  const first = event.payloadRefs[0];
  if (!first) return null;
  return {
    type: mapped.type,
    schemaVersion: '1.0',
    owner: meta.owner,
    emittedAt: meta.emittedAt,
    source: 'agntia-marketing',
    payload: { localId: first.id, localKind: first.kind },
  };
}
