import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * MKT-C37 · ACK firmado de handoff.
 *
 * Un handoff entre servicios no se considera aceptado porque el otro servicio
 * lo diga en un JSON: el ACK viaja con un HMAC sobre sus campos canónicos. Sin
 * secreto configurado no se firma nada y la verificación falla cerrada; nunca
 * se acepta un ACK sin firma como si fuera válido.
 */

export interface HandoffAck {
  handoffId: string;
  tenantId: string;
  decision: 'accept' | 'reject';
  actorId: string;
  decidedAt: string;
}

export interface SignedHandoffAck {
  payload: HandoffAck;
  signature: string | null;
  keyId: string;
  algorithm: 'hmac-sha256';
}

const canonical = (ack: HandoffAck): string =>
  JSON.stringify([ack.handoffId, ack.tenantId, ack.decision, ack.actorId, ack.decidedAt]);

export function signHandoffAck(secret: string, ack: HandoffAck): string {
  if (secret.length < 16) throw new Error('ack_secret_too_short');
  return createHmac('sha256', secret).update(canonical(ack)).digest('hex');
}

export function verifyHandoffAck(secret: string, ack: HandoffAck, signature: string): boolean {
  if (!/^[0-9a-f]{64}$/.test(signature)) return false;
  const expected = signHandoffAck(secret, ack);
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}

/**
 * Firma si hay secreto; si no, devuelve `signature: null` para que el llamador
 * pueda exponer `ack_unsigned` en vez de fingir un ACK verificado.
 */
export function buildHandoffAck(ack: HandoffAck, secret?: string, keyId = 'k1'): SignedHandoffAck {
  if (!secret) return { payload: ack, signature: null, keyId, algorithm: 'hmac-sha256' };
  return { payload: ack, signature: signHandoffAck(secret, ack), keyId, algorithm: 'hmac-sha256' };
}
