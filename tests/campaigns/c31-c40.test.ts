import { describe, expect, it } from 'vitest';
import { MarketingClient, TOOLS } from '@agntia/sdk';
import { createService, generateReport, ingestObservation, resolvePrincipal } from '@agntia/core';
import {
  commitCampaign,
  get,
  makeHarness,
  post,
  setupApprovedCampaign,
  TENANT_A,
  TENANT_B,
} from '../support/harness';

describe('MKT-C31 · atribución e incrementalidad admisible', () => {
  it('no permite sumar conversiones atribuidas de varias plataformas', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/measurement-claims', h.tokens.alice, {
      kind: 'attributed',
      estimand: 'conversiones atribuidas',
      value: 42,
      uncertainty: { low: 30, high: 55 },
      assumptions: ['ventana de 7 días'],
      datasetRefs: ['ads', 'ga4'],
      limits: ['atribución last-click'],
      platformBreakdown: [
        { platform: 'ads', conversions: 25 },
        { platform: 'ga4', conversions: 20 },
      ],
    });
    expect(res.status).toBe(422);
    expect(res.json.error.detail).toBe('do_not_sum_platform_attribution');
  });

  it('un claim atribuido exige límites explícitos y uno descriptivo no', async () => {
    const h = await makeHarness();
    const noLimits = await post(h, '/v1/marketing/measurement-claims', h.tokens.alice, {
      kind: 'attributed',
      estimand: 'conversiones atribuidas',
      value: 42,
      uncertainty: { low: 30, high: 55 },
      assumptions: [],
      datasetRefs: ['ads'],
      limits: [],
    });
    expect(noLimits.status).toBe(422);
    const descriptive = await post(h, '/v1/marketing/measurement-claims', h.tokens.alice, {
      kind: 'descriptive',
      estimand: 'sesiones observadas',
      value: 1200,
      uncertainty: { low: 1200, high: 1200 },
      assumptions: [],
      datasetRefs: ['matomo'],
      limits: [],
    });
    expect(descriptive.status).toBe(200);
    expect(descriptive.json.payload.requiresReview).toBe(false);
  });

  it('deduplica conversiones por fuente y clave de negocio', async () => {
    const h = await makeHarness();
    const fact = {
      sourceId: 'tienda',
      sourceObjectId: 'order_1',
      businessEvent: 'order',
      amount: { amount: '120.00', currency: 'EUR' },
      status: 'confirmed',
      dedupBasis: 'order_id',
      eventTime: '2026-11-14T09:00:00Z',
      evidenceRef: 'receipt_1',
    };
    const first = await post(h, '/v1/marketing/conversions', h.tokens.alice, fact);
    const second = await post(h, '/v1/marketing/conversions', h.tokens.alice, fact);
    expect(first.json.payload.duplicate).toBe(false);
    expect(second.json.payload.duplicate).toBe(true);
    expect(h.ctx.store.conversions).toHaveLength(1);
  });
});

describe('MKT-C32 · MMM Meridian y Robyn optativos', () => {
  it('no estima con datos insuficientes y con suficiencia sólo da reparto descriptivo', async () => {
    const h = await makeHarness();
    const blocked = await post(h, '/v1/marketing/measurement-runs', h.tokens.alice, {
      weeks: 20,
      channels: ['email', 'ads'],
      spendByChannel: { email: 100, ads: 400 },
      confounders: ['estacionalidad'],
    });
    expect(blocked.status).toBe(200);
    expect(blocked.json.payload.status).toBe('blocked');
    expect(blocked.json.payload.blockers).toContain('less_than_52_weeks');

    const sufficient = await post(h, '/v1/marketing/measurement-runs', h.tokens.alice, {
      weeks: 60,
      channels: ['email', 'ads', 'social'],
      spendByChannel: { email: 100, ads: 400, social: 500 },
      confounders: ['estacionalidad', 'precio'],
    });
    expect(sufficient.json.payload.status).toBe('sufficient');
    const shares = sufficient.json.payload.contributionShares as Array<{ share: number }>;
    expect(shares.reduce((a, b) => a + b.share, 0)).toBeCloseTo(1, 2);
    expect(sufficient.json.payload.note).toMatch(/No es ROI causal/);
  });
});

describe('MKT-C33 · escenarios de mix y presupuesto', () => {
  it('valida caps y no modifica gasto', async () => {
    const h = await makeHarness();
    const invalid = await post(h, '/v1/marketing/budget-scenarios', h.tokens.alice, {
      totalBudget: { amount: '1000.00', currency: 'EUR' },
      channelCaps: { email: 0.6, ads: 0.6 },
      expectedOutcomeRange: { low: 10, high: 20 },
      assumptions: ['supuesto'],
    });
    expect(invalid.status).toBe(422);

    const valid = await post(h, '/v1/marketing/budget-scenarios', h.tokens.alice, {
      totalBudget: { amount: '1000.00', currency: 'EUR' },
      channelCaps: { email: 0.4, ads: 0.35, social: 0.25 },
      expectedOutcomeRange: { low: 10, high: 20 },
      assumptions: ['coste por contacto estimado'],
    });
    expect(valid.status).toBe(200);
    expect(valid.json.payload.mutatesSpend).toBe(false);
    const total = (valid.json.payload.spendProposal as Array<{ amount: string }>).reduce((a, b) => a + Number(b.amount), 0);
    expect(total).toBeCloseTo(1000, 2);
  });
});

describe('MKT-C34 · dashboard, infografías y briefing', () => {
  it('genera un snapshot con cobertura y lo marca stale al caducar', async () => {
    const h = await makeHarness();
    await post(h, '/v1/marketing/observations', h.tokens.alice, {
      sourceId: 'matomo',
      metric: 'sessions',
      metricVersion: '1',
      aggregation: 'sum',
      unit: 'session',
      window: { from: '2026-11-13T00:00:00Z', to: '2026-11-14T00:00:00Z' },
      occurredAt: '2026-11-14T01:00:00Z',
      value: 500,
      coverage: 0.9,
      consentSnapshot: 'analytics:granted',
      sourceHash: 'report123',
    });
    const report = await post(h, '/v1/marketing/reports', h.tokens.alice, {
      metrics: ['sessions'],
      datasetRefs: ['matomo'],
      definitions: { sessions: 'sesiones Matomo, ventana diaria' },
    });
    expect(report.status).toBe(200);
    expect(report.json.payload.metrics[0].coverage).toBeCloseTo(0.9, 2);
    expect(report.json.payload.hash).toHaveLength(64);

    const fresh = await get(h, `/v1/marketing/reports/${report.json.payload.id}`, h.tokens.alice);
    expect(fresh.json.stale).toBe(false);
    h.advance(2 * 3600_000);
    const stale = await get(h, `/v1/marketing/reports/${report.json.payload.id}`, h.tokens.alice);
    expect(stale.json.stale).toBe(true);
  });

  it('un reporte sin métricas se rechaza', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/reports', h.tokens.alice, { metrics: [], datasetRefs: [], definitions: {} });
    expect(res.status).toBe(422);
  });
});

describe('MKT-C35 · SDK Hono, tools y bridge del padre', () => {
  it('el cliente sólo acepta rutas allowlist y exige idempotencia en POST', async () => {
    const h = await makeHarness();
    const client = new MarketingClient({
      baseUrl: 'http://app.local',
      token: h.tokens.alice,
      fetchImpl: ((input: RequestInfo | URL, init?: RequestInit) => h.app.request(input as string, init)) as typeof fetch,
    });
    const me = await client.call({ capability: 'marketing.context.read', method: 'GET', path: '/v1/marketing/me' });
    expect(me.status).toBe(200);
    await expect(client.call({ capability: 'marketing.brief.write', method: 'POST', path: '/v1/marketing/briefs', body: {} })).rejects.toThrow('idempotency_key_required');
    await expect(client.call({ capability: 'marketing.context.read', method: 'GET', path: '/v1/marketing/../admin' })).rejects.toThrow('path_not_allowlisted');
  });

  it('no existen tools de envío, aprobación, export o administración', () => {
    const names = TOOLS.map((t) => t.name);
    expect(names).toContain('marketing_campaign_status');
    for (const forbidden of ['send', 'approve', 'export_all', 'change_budget', 'upload_audience', 'admin']) {
      expect(names.some((n) => n.includes(forbidden))).toBe(false);
    }
  });
});

describe('MKT-C36 · portal responsive y sesiones Anam', () => {
  it('la sesión de asesor exige humano y no autentica ni aprueba', async () => {
    const h = await makeHarness();
    const human = await post(h, '/v1/marketing/advisor-sessions', h.tokens.alice, { scope: 'revisar campaña' });
    expect(human.status).toBe(200);
    expect(human.json.payload.note).toMatch(/no autentica, no aprueba/);
    expect(human.json.payload.recording).toBe('off');
    const bot = await post(h, '/v1/marketing/advisor-sessions', h.tokens.bot, { scope: 'x' });
    expect(bot.status).toBe(403);
  });
});

describe('MKT-C37 · cooperación SaaS y rotas', () => {
  it('detecta dos responsables para el mismo efecto y recurso', async () => {
    const h = await makeHarness();
    const first = await post(h, '/v1/marketing/handoffs', h.tokens.alice, {
      toService: 'redes',
      effect: 'publish_post',
      resourceRef: 'post_1',
      ownerService: 'redes',
      acceptance: 'redes publica y confirma receipt',
    });
    expect(first.status).toBe(200);
    expect(first.json.payload.accepted).toBe(true);
    const conflict = await post(h, '/v1/marketing/handoffs', h.tokens.alice, {
      toService: 'branding',
      effect: 'publish_post',
      resourceRef: 'post_1',
      ownerService: 'clientes',
      acceptance: 'clientes publicaría el mismo post',
    });
    expect(conflict.status).toBe(200);
    expect(conflict.json.payload.accepted).toBe(false);
    expect(conflict.json.payload.conflictWith).toBe('redes');
  });
});

describe('MKT-C38 · coste de servicio y observabilidad', () => {
  it('estima coste con supuestos y marca degradado si hay incertidumbre', async () => {
    const h = await makeHarness({ sandboxMode: 'unknown' });
    const service = createService(h.ctx, h.registry);
    const cost = service.estimateServiceCost({ contacts: 10_000, emails: 20_000, aiCalls: 500, reports: 20 });
    expect(Number(cost.estimate)).toBeGreaterThan(0);
    expect(cost.assumptions).toHaveLength(2);

    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    await commitCampaign(h, campaignId, approvalRef);
    await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, { workerId: 'w1', limit: 10, provider: 'email_sandbox' });
    const health = await get(h, '/v1/marketing/health', h.tokens.alice);
    expect(health.json.state).toBe('degraded');
    expect(health.json.outbox.unknown).toBeGreaterThan(0);
  });
});

describe('MKT-C39 · privacidad, derechos y pruebas adversariales', () => {
  it('exige verificación y conserva lápida de supresión tras el borrado', async () => {
    const h = await makeHarness();
    const unverified = await post(h, '/v1/marketing/privacy-requests', h.tokens.alice, {
      kind: 'erasure',
      subjectRef: 'sandbox_1',
      verificationRef: 'no-verificado',
    });
    expect(unverified.status).toBe(422);

    const request = await post(h, '/v1/marketing/privacy-requests', h.tokens.alice, {
      kind: 'erasure',
      subjectRef: 'sandbox_1',
      verificationRef: 'verify_email_1',
    });
    expect(request.status).toBe(200);
    const fulfilled = await post(h, `/v1/marketing/privacy-requests/${request.json.payload.id}/fulfil`, h.tokens.alice, {});
    expect(fulfilled.status).toBe(200);
    const contact = h.ctx.store.contacts.find((c) => c.id === 'sandbox_1')!;
    expect(contact.emailRef).toBe('erased');
    expect(contact.suppressed).toBe(true);
    expect(fulfilled.json.payload.outcome).toBe('erased_with_suppression_tombstone');
  });

  it('el acceso devuelve sólo los datos del propio tenant y sujeto', async () => {
    const h = await makeHarness();
    const req = await post(h, '/v1/marketing/privacy-requests', h.tokens.alice, {
      kind: 'access',
      subjectRef: 'sandbox_2',
      verificationRef: 'verify_2',
    });
    const fulfilled = await post(h, `/v1/marketing/privacy-requests/${req.json.payload.id}/fulfil`, h.tokens.alice, {});
    expect(fulfilled.json.payload.outcome).toContain('sandbox_2');
    expect(fulfilled.json.payload.outcome).not.toContain('sandbox_1');
  });
});

describe('MKT-C40 · evaluación y vertical E2E', () => {
  it('dos tenants completan el vertical sin verse entre sí', async () => {
    const h = await makeHarness();
    const a = await setupApprovedCampaign(h);
    const commit = await commitCampaign(h, a.campaignId, a.approvalRef);
    expect(commit.json.payload.queued).toBe(2);
    await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, { workerId: 'w1', limit: 10, provider: 'email_sandbox' });

    expect(h.ctx.store.receipts.every((r) => r.tenantId === TENANT_A)).toBe(true);
    expect(h.ctx.store.intents.every((i) => i.tenantId === TENANT_A)).toBe(true);

    const meBob = await get(h, '/v1/marketing/me', h.tokens.bob);
    expect(meBob.json.tenantId).toBe(TENANT_B);
    expect((await get(h, `/v1/marketing/campaigns/${a.campaignId}`, h.tokens.bob)).status).toBe(404);
    expect((await get(h, '/v1/marketing/reports', h.tokens.bob)).json).toEqual([]);
    expect((await post(h, `/v1/marketing/campaigns/${a.campaignId}/pause`, h.tokens.bob, {})).status).toBe(404);
  });

  it('el worker es determinista con el mismo reloj y los mismos datos', async () => {
    const h1 = await makeHarness();
    const h2 = await makeHarness();
    const run = async (h: Awaited<ReturnType<typeof makeHarness>>) => {
      const ids = await setupApprovedCampaign(h);
      await commitCampaign(h, ids.campaignId, ids.approvalRef);
      const res = await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, { workerId: 'w', limit: 10, provider: 'email_sandbox' });
      return res.json.payload.map((r: { state: string }) => r.state);
    };
    expect(await run(h1)).toEqual(await run(h2));
  });
});

describe('MKT-C34 · medición reproducible', () => {
  it('el mismo snapshot produce el mismo hash', async () => {
    const h = await makeHarness();
    const principal = resolvePrincipal(
      h.ctx,
      { sub: 'alice', tenantId: TENANT_A, expiresAt: Math.floor(h.now().getTime() / 1000) + 600 },
      'marketing.report.write',
    );
    ingestObservation(h.ctx, principal, {
      sourceId: 'matomo',
      metric: 'sessions',
      metricVersion: '1',
      aggregation: 'sum',
      unit: 'session',
      window: { from: '2026-11-13T00:00:00Z', to: '2026-11-14T00:00:00Z' },
      occurredAt: '2026-11-14T01:00:00Z',
      value: 100,
      coverage: 1,
      consentSnapshot: 'x',
      sourceHash: 'abcd1234',
    });
    const a = generateReport(h.ctx, principal, { metrics: ['sessions'], datasetRefs: [], definitions: {} });
    const b = generateReport(h.ctx, principal, { metrics: ['sessions'], datasetRefs: [], definitions: {} });
    expect(a.hash).toBe(b.hash);
  });
});
