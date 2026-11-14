import { MarketingError, type Capability } from '@agntia/contracts';

/**
 * Cliente HTTP del SDK (MKT-C35). Allowlist de rutas: no acepta una URL
 * arbitraria, ni un método libre, ni tenant/actor en el cuerpo. Esa autoridad
 * vive en el servidor.
 */
export interface ClientOptions {
  baseUrl: string;
  token: string;
  correlationId?: string;
  fetchImpl?: typeof fetch;
}

export interface CallOptions {
  capability: Capability;
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
  idempotencyKey?: string;
}

export interface CallResult<T = unknown> {
  status: number;
  body: T;
}

const ALLOWED_PATH = /^\/v1\/marketing\/[a-z0-9\-/:]+$/i;

export class MarketingClient {
  constructor(private readonly options: ClientOptions) {
    if (!/^https?:\/\//.test(options.baseUrl)) throw new Error('baseUrl_invalid');
    if (!options.token) throw new Error('token_required');
  }

  async call<T = unknown>(opts: CallOptions): Promise<CallResult<T>> {
    if (!ALLOWED_PATH.test(opts.path)) throw new Error('path_not_allowlisted');
    if (opts.method === 'POST' && !opts.idempotencyKey) throw new Error('idempotency_key_required');
    const fetchImpl = this.options.fetchImpl ?? fetch;
    const headers: Record<string, string> = {
      authorization: `Bearer ${this.options.token}`,
      'content-type': 'application/json',
    };
    if (opts.idempotencyKey) headers['idempotency-key'] = opts.idempotencyKey;
    const correlationId = this.options.correlationId ?? `sdk_${crypto.randomUUID().slice(0, 12)}`;
    headers['x-correlation-id'] = correlationId;

    const response = await fetchImpl(`${this.options.baseUrl}${opts.path}`, {
      method: opts.method,
      headers,
      body: opts.method === 'POST' ? JSON.stringify(opts.body ?? {}) : undefined,
    });
    const body = (await response.json()) as T & { error?: { code?: string; detail?: string } };
    if (!response.ok) {
      const error = body.error ?? {};
      throw new MarketingError((error.code as never) ?? 'UNAVAILABLE', error.detail);
    }
    return { status: response.status, body };
  }
}
