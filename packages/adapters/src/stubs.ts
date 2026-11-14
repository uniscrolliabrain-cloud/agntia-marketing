import { MarketingError } from '@agntia/contracts';
import type { CapabilityReport, HealthReport, ProviderAdapter, ProviderName, SendRequest, SendOutcome } from './types';

/**
 * Adaptadores en stub (MKT-C08/C11/C13/C14/C23/C24/C25/C29/C30). Ninguno hace
 * red: declaran su capacidad y devuelven DEPENDENCY_MISSING hasta que exista
 * cuenta, edición verificada y lista de licencias. Un stub no verifica la API
 * real y por eso su gate queda NOT_VERIFIED, nunca PASS.
 */
export class StubAdapter implements ProviderAdapter {
  constructor(
    readonly provider: ProviderName,
    private readonly report: CapabilityReport,
    private readonly note = 'Adaptador sin conexión real: no se ha contactado el proveedor.',
  ) {}

  capabilities(): CapabilityReport {
    return this.report;
  }

  health(): HealthReport {
    return {
      provider: this.provider,
      state: 'disabled',
      detail: this.note,
      checkedAt: new Date().toISOString(),
    };
  }

  async send(): Promise<SendOutcome> {
    throw new MarketingError('DEPENDENCY_MISSING', `provider_disabled:${this.provider}`);
  }
}

const report = (
  provider: ProviderName,
  edition: string,
  read: string[],
  write: string[],
  note: string,
): CapabilityReport => ({ provider, edition, read, write, status: 'disabled', note });

export function createStubRegistry(): Record<ProviderName, ProviderAdapter> {
  return {
    mautic: new StubAdapter(
      'mautic',
      report('mautic', 'CE/Cloud por confirmar', ['contacts', 'segments', 'emails', 'campaigns'], [], 'Borradores requieren confirmar edición y versión de API.'),
    ),
    listmonk: new StubAdapter(
      'listmonk',
      report('listmonk', 'v3+ por confirmar', ['lists', 'subscribers', 'campaigns'], [], 'Newsletters alternativas; licencia AGPL, revisar antes de distribuir.'),
    ),
    matomo: new StubAdapter('matomo', report('matomo', 'On-prem/Cloud por confirmar', ['visits', 'goals', 'reports'], [], 'Binding de sitio por propiedad, no global.')),
    plausible: new StubAdapter('plausible', report('plausible', 'Cloud/CE', ['aggregate', 'timeseries'], [], 'Sin export de grano fino en plan básico.')),
    posthog: new StubAdapter('posthog', report('posthog', 'Cloud', ['events', 'persons_aggregate'], [], 'No usar persons raw como audiencia sin base legal.')),
    ga4: new StubAdapter('ga4', report('ga4', 'GA4', ['reports', 'realtime'], [], 'Requiere propiedad y credenciales de servicio; cuotas por API.')),
    search_console: new StubAdapter('search_console', report('search_console', 'API v3', ['search_analytics', 'sitemaps'], [], 'Datos con retraso y muestreo; no garantiza rankings.')),
    growthbook: new StubAdapter('growthbook', report('growthbook', 'Cloud/self-hosted', ['experiments', 'features'], [], 'Asignación real deshabilitada.')),
    ads: new StubAdapter('ads', report('ads', 'test accounts', ['campaign_read', 'insights'], [], 'Sólo lectura y test accounts; validate_only no acredita producción.')),
    email_sandbox: new StubAdapter('email_sandbox', report('email_sandbox', 'sandbox local', [], [], 'Sustituido por SandboxEmailAdapter en desarrollo.')),
    anam: new StubAdapter('anam', report('anam', 'por confirmar', [], [], 'Anam es presencia, no identidad ni aprobación.')),
  };
}

export type SandboxMode = 'accept' | 'fail' | 'unknown';

/**
 * Entrega de sandbox: sólo acepta destinatarios con prefijo `sandbox_`. Permite
 * probar el vertical completo (aprobación → intent → receipt) sin enviar correo
 * a nadie. Los modos `fail` y `unknown` existen para probar reconciliación.
 */
export class SandboxEmailAdapter implements ProviderAdapter {
  readonly provider = 'email_sandbox' as const;
  readonly sent: SendRequest[] = [];

  constructor(private readonly mode: SandboxMode = 'accept') {}

  capabilities(): CapabilityReport {
    return {
      provider: 'email_sandbox',
      edition: 'sandbox local (sin red)',
      read: ['receipts'],
      write: ['sandbox_send'],
      status: 'available',
      note: 'Sólo destinatarios sandbox_*; no entrega correo real.',
    };
  }

  health(): HealthReport {
    return { provider: 'email_sandbox', state: 'ready', detail: 'sandbox local', checkedAt: new Date().toISOString() };
  }

  async send(req: SendRequest): Promise<SendOutcome> {
    if (!req.subjectRef.startsWith('sandbox_')) {
      return { kind: 'failed', code: 'recipient_not_in_sandbox', retryable: false };
    }
    if (this.mode === 'fail') return { kind: 'failed', code: 'sandbox_rejected', retryable: true };
    if (this.mode === 'unknown') return { kind: 'unknown', code: 'sandbox_timeout' };
    this.sent.push(req);
    return { kind: 'accepted', remoteId: `sbx_${req.intentId.slice(-10)}` };
  }
}
