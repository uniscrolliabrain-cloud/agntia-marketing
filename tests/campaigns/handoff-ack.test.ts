import { describe, expect, it } from 'vitest';
import { buildHandoffAck, MemoryRateLimiter, signHandoffAck, verifyHandoffAck } from '@agntia/core';
import { makeHarness, post } from '../support/harness';

const SECRET = 'test-ack-secret-0123456789abcdef';

async function propose(h: Awaited<ReturnType<typeof makeHarness>>) {
  const res = await post(h, '/v1/marketing/handoffs', h.tokens.alice, {
    toService: 'redes',
    effect: 'publish_post',
    resourceRef: 'post_ack',
    ownerService: 'redes',
    acceptance: 'redes publica y confirma',
  });
  return res.json.payload.handoff.id as string;
}

describe('MKT-C37 · ACK firmado de handoff', () => {
  it('firma el ACK y acepta la firma correcta', async () => {
    const h = await makeHarness({ ackSecret: SECRET });
    const id = await propose(h);
    const decided = await post(h, `/v1/marketing/handoffs/${id}/respond`, h.tokens.alice, { decision: 'accept' });
    const ack = decided.json.payload.ack;
    expect(ack.signature).toMatch(/^[0-9a-f]{64}$/);

    const verified = await post(h, `/v1/marketing/handoffs/${id}/verify-ack`, h.tokens.alice, {
      decision: ack.payload.decision,
      actorId: ack.payload.actorId,
      decidedAt: ack.payload.decidedAt,
      signature: ack.signature,
    });
    expect(verified.status).toBe(200);
    expect(verified.json.payload).toEqual({ valid: true, reason: null });
  });

  it('rechaza un ACK manipulado o con otra decisión', async () => {
    const h = await makeHarness({ ackSecret: SECRET });
    const id = await propose(h);
    const decided = await post(h, `/v1/marketing/handoffs/${id}/respond`, h.tokens.alice, { decision: 'accept' });
    const ack = decided.json.payload.ack;

    const tampered = await post(h, `/v1/marketing/handoffs/${id}/verify-ack`, h.tokens.alice, {
      decision: 'accept',
      actorId: 'intruso',
      decidedAt: ack.payload.decidedAt,
      signature: ack.signature,
    });
    expect(tampered.json.payload.valid).toBe(false);
    expect(tampered.json.payload.reason).toBe('signature_invalid');

    const otherDecision = await post(h, `/v1/marketing/handoffs/${id}/verify-ack`, h.tokens.alice, {
      decision: 'reject',
      actorId: ack.payload.actorId,
      decidedAt: ack.payload.decidedAt,
      signature: ack.signature,
    });
    expect(otherDecision.json.payload.reason).toBe('decision_mismatch');
  });

  it('no verifica nada sin secreto configurado: falla cerrado', async () => {
    const h = await makeHarness();
    const id = await propose(h);
    const decided = await post(h, `/v1/marketing/handoffs/${id}/respond`, h.tokens.alice, { decision: 'accept' });
    expect(decided.json.payload.ack.signature).toBeNull();

    const verified = await post(h, `/v1/marketing/handoffs/${id}/verify-ack`, h.tokens.alice, {
      decision: 'accept',
      actorId: 'alice',
      decidedAt: decided.json.payload.ack.payload.decidedAt,
      signature: 'a'.repeat(64),
    });
    expect(verified.status).toBe(503);
    expect(verified.json.error.detail).toBe('ack_signing_unconfigured');
  });

  it('no valida una firma emitida para otro handoff', () => {
    const base = { tenantId: 'tenant_a', decision: 'accept' as const, actorId: 'alice', decidedAt: '2026-11-15T10:00:00.000Z' };
    const signature = signHandoffAck(SECRET, { ...base, handoffId: 'hnd_1' });
    expect(verifyHandoffAck(SECRET, { ...base, handoffId: 'hnd_1' }, signature)).toBe(true);
    expect(verifyHandoffAck(SECRET, { ...base, handoffId: 'hnd_2' }, signature)).toBe(false);
    expect(verifyHandoffAck(`${SECRET}x`, { ...base, handoffId: 'hnd_1' }, signature)).toBe(false);
    expect(buildHandoffAck({ ...base, handoffId: 'hnd_1' }).signature).toBeNull();
    expect(() => signHandoffAck('corto', { ...base, handoffId: 'hnd_1' })).toThrow('ack_secret_too_short');
  });
});

describe('MKT-C38 · rate limiter con backend intercambiable', () => {
  it('cuenta ventanas de un minuto y reinicia al cambiar de minuto', async () => {
    const limiter = new MemoryRateLimiter();
    const t0 = Date.parse('2026-11-15T10:00:10Z');
    expect(await limiter.consume('tenant_a', 2, t0)).toEqual({ allowed: true, remaining: 1, resetAt: Date.parse('2026-11-15T10:01:00Z') });
    expect((await limiter.consume('tenant_a', 2, t0 + 1000)).allowed).toBe(true);
    expect((await limiter.consume('tenant_a', 2, t0 + 2000)).allowed).toBe(false);
    expect((await limiter.consume('tenant_b', 2, t0 + 2000)).allowed).toBe(true);
    expect((await limiter.consume('tenant_a', 2, t0 + 60_000)).allowed).toBe(true);
  });

  it('deniega la petición si el backend de rate limit falla', async () => {
    const failing = {
      async consume(): Promise<never> {
        throw new Error('backend caído');
      },
    };
    const h = await makeHarness({ rateLimiter: failing });
    const res = await post(h, '/v1/marketing/ads/proposals', h.tokens.alice, {});
    expect(res.status).toBe(503);
    expect(res.json.error.detail).toBe('rate_limiter_unavailable');
  });
});
