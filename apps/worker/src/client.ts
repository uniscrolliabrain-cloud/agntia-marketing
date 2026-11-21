/**
 * MKT-C22 · Worker de outbox como proceso propio.
 *
 * El worker no reimplementa elegibilidad, supresión, frecuencia ni entrega:
 * llama a `POST /v1/marketing/internal/deliver`, que corre el dominio dentro del
 * cerrojo del tenant y escribe el resultado en `tenant_state`. Así hay un solo
 * conjunto de reglas y una sola fuente de verdad.
 *
 * Lo que aporta este módulo es el proceso: reclama, cuenta resultados, reintenta
 * fallos transitorios con backoff y para cuando no queda trabajo. Un error
 * permanente (token inválido, dependencia ausente) no se reintenta: se propaga.
 */

export interface WorkerConfig {
  /** Base del API, sin barra final: `http://127.0.0.1:8792`. */
  apiBaseUrl: string;
  /** JWT del actor de servicio; el tenant y la membership salen de él y de Postgres. */
  token: string;
  workerId: string;
  limit?: number;
  provider?: 'email_sandbox';
  requestTimeoutMs?: number;
}

export interface DrainResult {
  /** Intents reclamados en esta vuelta. */
  leased: number;
  confirmed: number;
  failed: number;
  unknown: number;
  /** Reencolados por el dominio (reintento permitido). */
  requeued: number;
}

export interface LoopOptions {
  intervalMs?: number;
  /** Vueltas seguidas sin trabajo que paran el bucle. */
  idleRoundsToStop?: number;
  maxRounds?: number;
  /** Base del backoff exponencial ante fallos transitorios. */
  backoffMs?: number;
  maxBackoffMs?: number;
  sleep?: (ms: number) => Promise<void>;
  onRound?: (round: { round: number; result: DrainResult }) => void;
  /** Inyectable para pruebas; por defecto `fetch`. */
  fetch?: FetchLike;
}

export interface LoopReport {
  workerId: string;
  rounds: number;
  drained: number;
  confirmed: number;
  failed: number;
  unknown: number;
  requeued: number;
  /** Fallos transitorios absorbidos con backoff. */
  transientErrors: number;
  idleRounds: number;
  stopReason: 'idle' | 'max_rounds';
}

/** Error que no se reintenta: token rechazado, dependencia ausente, contrato roto. */
export class WorkerFatalError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail: string,
  ) {
    super(message);
    this.name = 'WorkerFatalError';
  }
}

/** Error que sí se reintenta: red caída, 5xx, 429. */
export class WorkerTransientError extends Error {
  constructor(
    message: string,
    readonly detail: string,
  ) {
    super(message);
    this.name = 'WorkerTransientError';
  }
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

function outcomeField(value: unknown, field: string): unknown {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>)[field] : undefined;
}

/** Una vuelta: reclama hasta `limit`, entrega lo reclamado y devuelve el recuento. */
export async function drainOnce(
  config: WorkerConfig,
  deps: { fetch?: FetchLike; signal?: AbortSignal } = {},
): Promise<DrainResult> {
  const doFetch: FetchLike = deps.fetch ?? ((input, init) => fetch(input, init));
  const timeoutMs = config.requestTimeoutMs ?? 15_000;
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = deps.signal ? AbortSignal.any([deps.signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await doFetch(`${config.apiBaseUrl.replace(/\/+$/, '')}/v1/marketing/internal/deliver`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
        // Una vuelta = una petición distinta: el reintento del bucle debe volver
        // a reclamar trabajo, no reproducir la respuesta anterior de idempotencia.
        'idempotency-key': `wrk-${crypto.randomUUID()}`,
        'x-correlation-id': `corr_${config.workerId}_${Date.now().toString(36)}`,
      },
      body: JSON.stringify({
        workerId: config.workerId,
        limit: config.limit ?? 25,
        // El contrato exige proveedor: el sandbox es el único adaptador real del
        // repo y pedirlo explícitamente evita un `undefined` silencioso.
        provider: config.provider ?? 'email_sandbox',
      }),
      signal,
    });
  } catch (error) {
    const cause = error instanceof Error ? error.name : 'unknown';
    throw new WorkerTransientError(`deliver_unreachable:${cause}`, 'deliver_unreachable');
  }

  const text = await response.text().catch(() => '');
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const detail = String(outcomeField(outcomeField(body, 'error') ?? {}, 'detail') ?? `http_${response.status}`);
    // 401/403: el token no sirve. 424: falta una dependencia declarada (p. ej.
    // el resolutor de principals). 400/422: el contrato cambió. Reintentar esos
    // casos sólo gasta tiempo: se propagan.
    const transient = response.status === 429 || response.status >= 500;
    const message = `deliver_http_${response.status}:${detail}`;
    if (transient) throw new WorkerTransientError(message, detail);
    throw new WorkerFatalError(message, response.status, detail);
  }

  const payload = outcomeField(body, 'payload');
  if (!Array.isArray(payload)) throw new WorkerFatalError('deliver_contract_invalid', response.status, 'payload_not_array');

  const result: DrainResult = { leased: payload.length, confirmed: 0, failed: 0, unknown: 0, requeued: 0 };
  for (const outcome of payload) {
    const state = outcomeField(outcome, 'state');
    switch (state) {
      case 'confirmed':
        result.confirmed += 1;
        break;
      case 'unknown':
        result.unknown += 1;
        break;
      case 'failed':
        result.failed += 1;
        break;
      case 'queued':
        result.requeued += 1;
        break;
      default:
        throw new WorkerFatalError('deliver_contract_invalid', response.status, `unexpected_outcome_state:${String(state)}`);
    }
  }
  return result;
}

/**
 * Bucle de proceso: una vuelta tras otra hasta quedarse sin trabajo. El backoff
 * crece con los fallos transitorios consecutivos y se recorta con `maxBackoffMs`.
 */
export async function runWorkerLoop(config: WorkerConfig, options: LoopOptions = {}): Promise<LoopReport> {
  const intervalMs = options.intervalMs ?? 250;
  const idleRoundsToStop = options.idleRoundsToStop ?? 3;
  const maxRounds = options.maxRounds ?? 1_000;
  const backoffMs = options.backoffMs ?? 200;
  const maxBackoffMs = options.maxBackoffMs ?? 5_000;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  const report: LoopReport = {
    workerId: config.workerId,
    rounds: 0,
    drained: 0,
    confirmed: 0,
    failed: 0,
    unknown: 0,
    requeued: 0,
    transientErrors: 0,
    idleRounds: 0,
    stopReason: 'max_rounds',
  };

  let consecutiveErrors = 0;
  while (report.rounds < maxRounds) {
    let result: DrainResult;
    try {
      result = await drainOnce(config, options.fetch ? { fetch: options.fetch } : {});
      consecutiveErrors = 0;
    } catch (error) {
      if (!(error instanceof WorkerTransientError)) throw error;
      report.transientErrors += 1;
      consecutiveErrors += 1;
      const wait = Math.min(backoffMs * 2 ** Math.min(consecutiveErrors - 1, 5), maxBackoffMs);
      await sleep(wait);
      continue;
    }

    report.rounds += 1;
    report.drained += result.leased;
    report.confirmed += result.confirmed;
    report.failed += result.failed;
    report.unknown += result.unknown;
    report.requeued += result.requeued;
    options.onRound?.({ round: report.rounds, result });

    if (result.leased === 0) {
      report.idleRounds += 1;
      if (report.idleRounds >= idleRoundsToStop) {
        report.stopReason = 'idle';
        return report;
      }
    } else {
      report.idleRounds = 0;
    }
    await sleep(intervalMs);
  }
  return report;
}
