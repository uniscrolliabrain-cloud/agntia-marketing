import { describe, expect, it } from 'vitest';
import { localHour } from '@agntia/core';
import { commitCampaign, get, key, makeHarness, MARKETING_RULE, post, setupApprovedCampaign } from '../support/harness';

const futureExpiry = '2026-11-30T00:00:00Z';

async function journeyFactory(h: Awaited<ReturnType<typeof makeHarness>>) {
  const created = await post(h, '/v1/marketing/journeys', h.tokens.alice, {
    name: 'Bienvenida growth',
    steps: [
      { stepId: 'welcome', channel: 'email', delayHours: 0, templateRef: 'tpl_welcome' },
      { stepId: 'followup', channel: 'email', delayHours: 72, templateRef: 'tpl_followup' },
    ],
    audienceRule: MARKETING_RULE,
    reentry: 'never',
  });
  const journeyId = created.json.payload.id as string;
  const approval = await post(h, `/v1/marketing/journeys/${journeyId}/approve`, h.tokens.alice, {
    expiresAt: futureExpiry,
  });
  return { journeyId, approvalRef: approval.json.payload.approvalRef as string };
}

describe('MKT-C19 · journeys programados y revalidados', () => {
  it('rechaza ciclos sin máximo de pasos y reentradas sin plazo', async () => {
    const h = await makeHarness();
    const many = await post(h, '/v1/marketing/journeys', h.tokens.alice, {
      name: 'Ciclo infinito',
      steps: Array.from({ length: 21 }, (_, i) => ({ stepId: `s${i}`, channel: 'email', delayHours: i, templateRef: 'tpl' })),
      audienceRule: MARKETING_RULE,
      reentry: 'never',
    });
    expect(many.status).toBe(422);
    const noReentryDays = await post(h, '/v1/marketing/journeys', h.tokens.alice, {
      name: 'Reentrada sin plazo',
      steps: [{ stepId: 's1', channel: 'email', delayHours: 0, templateRef: 'tpl' }],
      audienceRule: MARKETING_RULE,
      reentry: 'after_days',
    });
    expect(noReentryDays.status).toBe(422);
    expect(noReentryDays.json.error.detail).toBe('reentry_days_required');
  });

  it('aprueba, inscribe y sólo entrega el paso cuyo plazo venció', async () => {
    const h = await makeHarness();
    const { journeyId, approvalRef } = await journeyFactory(h);
    const enrollment = await post(h, `/v1/marketing/journeys/${journeyId}/enrollments`, h.tokens.alice, { approvalRef });
    expect(enrollment.status).toBe(200);
    expect(enrollment.json.payload.enrolled).toBe(2);
    expect(enrollment.json.payload.intents).toBe(4);

    const firstRun = await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, {
      workerId: 'w_j1',
      limit: 10,
      provider: 'email_sandbox',
    });
    expect(firstRun.json.payload).toHaveLength(2);
    expect(h.ctx.store.intents.filter((i) => i.state === 'queued')).toHaveLength(2);

    for (const intent of h.ctx.store.intents) intent.scheduledFor = '2026-11-14T09:00:00Z';
    const secondRun = await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, {
      workerId: 'w_j2',
      limit: 10,
      provider: 'email_sandbox',
    });
    expect(secondRun.json.payload).toHaveLength(2);
    expect(h.ctx.store.intents.every((i) => i.state === 'confirmed')).toBe(true);
  });

  it('una baja posterior a la inscripción cancela el paso antes de entregarlo', async () => {
    const h = await makeHarness();
    const { journeyId, approvalRef } = await journeyFactory(h);
    await post(h, `/v1/marketing/journeys/${journeyId}/enrollments`, h.tokens.alice, { approvalRef });
    h.ctx.store.contacts.find((c) => c.id === 'sandbox_1')!.suppressed = true;

    const run = await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, {
      workerId: 'w_j3',
      limit: 10,
      provider: 'email_sandbox',
    });
    expect(run.json.payload).toHaveLength(1);
    const cancelled = h.ctx.store.intents.filter((i) => i.state === 'cancelled');
    expect(cancelled.length).toBeGreaterThan(0);
    expect(cancelled[0]!.lastError).toContain('ineligible:suppressed');
  });

  it('cambiar los pasos invalida la aprobación del journey', async () => {
    const h = await makeHarness();
    const { journeyId, approvalRef } = await journeyFactory(h);
    const journey = h.ctx.store.journeys[0]!;
    journey.steps = [...journey.steps, { stepId: 'extra', channel: 'email', delayHours: 120, templateRef: 'tpl_extra' }];
    const res = await post(h, `/v1/marketing/journeys/${journeyId}/enrollments`, h.tokens.alice, { approvalRef });
    expect(res.status).toBe(409);
    expect(res.json.error.detail).toBe('approval_revision_mismatch');
  });

  it('revocar la aprobación cancela los pasos pendientes', async () => {
    const h = await makeHarness();
    const { journeyId, approvalRef } = await journeyFactory(h);
    await post(h, `/v1/marketing/journeys/${journeyId}/enrollments`, h.tokens.alice, { approvalRef });
    h.ctx.store.approvals.find((a) => a.approvalRef === approvalRef)!.revokedAt = '2026-11-14T10:30:00Z';
    const run = await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, {
      workerId: 'w_revoked',
      limit: 10,
      provider: 'email_sandbox',
    });
    expect(run.json.payload).toHaveLength(0);
    const cancelled = h.ctx.store.intents.filter((i) => i.state === 'cancelled');
    expect(cancelled.length).toBe(2);
    expect(cancelled[0]!.lastError).toBe('approval_expired');
    expect(h.ctx.store.intents.filter((i) => i.state === 'queued')).toHaveLength(2);
  });

  it('no reingresa dos veces con reentry never', async () => {
    const h = await makeHarness();
    const { journeyId, approvalRef } = await journeyFactory(h);
    await post(h, `/v1/marketing/journeys/${journeyId}/enrollments`, h.tokens.alice, { approvalRef });
    const second = await post(h, `/v1/marketing/journeys/${journeyId}/enrollments`, h.tokens.alice, { approvalRef });
    expect(second.json.payload.enrolled).toBe(0);
    expect(second.json.payload.skipped[0].reasonCodes).toContain('already_enrolled');
  });
});

describe('MKT-C21 · horas de silencio por zona IANA', () => {
  it('calcula la hora local real y no la UTC', () => {
    const at = new Date('2026-11-14T10:00:00Z');
    expect(localHour('UTC', at)).toBe(10);
    expect(localHour('Europe/Madrid', at)).toBe(11);
    expect(localHour('America/New_York', at)).toBe(5);
    expect(localHour('zona/invalida', at)).toBe(10);
  });

  it('bloquea el envío si la hora local cae en silencio y lo permite en otra zona', async () => {
    const madrid = await makeHarness({
      contactPolicy: { maxPerSubjectPerWindow: 5, windowHours: 24, quietHours: { startUtcHour: 11, endUtcHour: 19 }, timezone: 'Europe/Madrid' },
    });
    const a = await setupApprovedCampaign(madrid);
    const blocked = await commitCampaign(madrid, a.campaignId, a.approvalRef);
    expect(blocked.json.payload.queued).toBe(0);
    expect(blocked.json.payload.skipped[0].reasonCodes).toContain('quiet_hours');

    const utc = await makeHarness({
      contactPolicy: { maxPerSubjectPerWindow: 5, windowHours: 24, quietHours: { startUtcHour: 11, endUtcHour: 19 }, timezone: 'UTC' },
    });
    const b = await setupApprovedCampaign(utc);
    const allowed = await commitCampaign(utc, b.campaignId, b.approvalRef);
    expect(allowed.json.payload.queued).toBe(2);
  });
});

describe('MKT-C37 · estados de handoff', () => {
  it('acepta, rechaza y no permite responder dos veces', async () => {
    const h = await makeHarness();
    const proposed = await post(h, '/v1/marketing/handoffs', h.tokens.alice, {
      toService: 'redes',
      effect: 'publish_post',
      resourceRef: 'post_9',
      ownerService: 'redes',
      acceptance: 'redes publica y confirma',
    });
    const id = proposed.json.payload.handoff.id as string;
    const accepted = await post(h, `/v1/marketing/handoffs/${id}/respond`, h.tokens.alice, { decision: 'accept' });
    expect(accepted.status).toBe(200);
    expect(accepted.json.payload.state).toBe('accepted');
    const twice = await post(h, `/v1/marketing/handoffs/${id}/respond`, h.tokens.alice, { decision: 'reject' });
    expect(twice.status).toBe(409);
  });

  it('un handoff sin ACK caduca y no se cuenta como éxito', async () => {
    const h = await makeHarness();
    const proposed = await post(h, '/v1/marketing/handoffs', h.tokens.alice, {
      toService: 'ventas',
      effect: 'create_quote',
      resourceRef: 'quote_1',
      ownerService: 'ventas',
      acceptance: 'ventas acepta la oportunidad',
    });
    h.ctx.store.handoffs[0]!.createdAt = '2026-11-10T10:00:00Z';
    const expired = await post(h, '/v1/marketing/handoffs/expire', h.tokens.alice, { olderThanMinutes: 1440 });
    expect(expired.json.payload.expired).toBeGreaterThan(0);
    expect(h.ctx.store.handoffs.find((x) => x.id === proposed.json.payload.handoff.id)!.state).toBe('rejected');
  });

  it('expone los conflictos de responsable por endpoint', async () => {
    const h = await makeHarness();
    await post(h, '/v1/marketing/handoffs', h.tokens.alice, {
      toService: 'redes', effect: 'publish_post', resourceRef: 'post_c', ownerService: 'redes', acceptance: 'redes publica y confirma',
    });
    await post(h, '/v1/marketing/handoffs', h.tokens.alice, {
      toService: 'branding', effect: 'publish_post', resourceRef: 'post_c', ownerService: 'clientes', acceptance: 'marketing declara cliente distinto',
    });
    const conflicts = await get(h, '/v1/marketing/conflicts', h.tokens.alice);
    expect(conflicts.json).toHaveLength(1);
  });
});

describe('MKT-C38 · rate limit por tenant', () => {
  it('devuelve 429 al superar el límite en la ventana', async () => {
    const h = await makeHarness();
    let limited = 0;
    for (let i = 0; i < 125; i += 1) {
      const res = await post(h, '/v1/marketing/ads/proposals', h.tokens.alice, {}, key('rl'));
      if (res.status === 429) limited += 1;
    }
    expect(limited).toBeGreaterThan(0);
  });
});

describe('MKT-C35 · lectura de eventos del servicio', () => {
  it('sirve eventos del tenant y no de otro', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    await commitCampaign(h, campaignId, approvalRef);
    const events = await get(h, '/v1/marketing/events', h.tokens.alice);
    expect(events.json.length).toBeGreaterThan(0);
    expect(events.json.every((e: { tenantId: string }) => e.tenantId === 'tenant_a')).toBe(true);
    const other = await get(h, '/v1/marketing/events', h.tokens.bob);
    expect(other.json).toEqual([]);
  });
});
