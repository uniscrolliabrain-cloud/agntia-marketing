import type { Channel } from '@agntia/contracts';

/**
 * MKT-C08/C11/C13/C14/C23/C24/C25/C29: contrato único de proveedor. Cada
 * adaptador declara lo que realmente puede hacer; lo no implementado queda
 * deshabilitado y el gate correspondiente no puede pasar a PASS.
 */
export type ProviderName =
  | 'mautic'
  | 'listmonk'
  | 'matomo'
  | 'plausible'
  | 'posthog'
  | 'ga4'
  | 'search_console'
  | 'growthbook'
  | 'ads'
  | 'email_sandbox'
  | 'anam';

export interface CapabilityReport {
  provider: ProviderName;
  edition: string;
  read: string[];
  write: string[];
  status: 'available' | 'disabled' | 'unverified';
  note: string;
}

export interface HealthReport {
  provider: ProviderName;
  state: 'ready' | 'degraded' | 'disabled';
  detail: string;
  checkedAt: string;
}

export interface SendRequest {
  tenantId: string;
  intentId: string;
  subjectRef: string;
  channel: Channel;
  payloadHash: string;
  idempotencyKey: string;
}

export type SendOutcome =
  | { kind: 'accepted'; remoteId: string }
  | { kind: 'failed'; code: string; retryable: boolean }
  | { kind: 'unknown'; code: string };

export interface ProviderAdapter {
  readonly provider: ProviderName;
  capabilities(): CapabilityReport;
  health(): HealthReport;
  /** Sólo los adaptadores de entrega lo implementan. Nunca hace red aquí. */
  send?(req: SendRequest): Promise<SendOutcome>;
  /** Lectura de métricas. Devuelve observaciones crudas, no claims causales. */
  fetchObservations?(input: { tenantId: string; from: string; to: string }): Promise<Array<{
    metric: string;
    value: number | null;
    window: { from: string; to: string };
    coverage: number;
  }>>;
}
