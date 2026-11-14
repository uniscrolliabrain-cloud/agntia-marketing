import { describe, expect, it } from 'vitest';
import { deliverIntent, leaseIntents } from '@agntia/core';
import { MarketingError } from '@agntia/contracts';
import {
  commitCampaign,
  get,
  makeHarness,
  post,
  setupApprovedCampaign,
  TENANT_A,
} from '../support/harness';

describe('MKT-C21 · frecuencia, presupuestos y límites de contacto', () => {
  it('el límite de frecuencia bloquea el segundo envío en la ventana', async () => {
    const h = await makeHarness({ contactPolicy: { maxPerSubjectPerWindow: 1, windowHours: 24 } });
    const first = await setupApprovedCampaign(h);
    await commitCampaign(h, first.campaignId, first.approvalRef);
    await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, { workerId: 'w1', limit: 10, provider: 'email_sandbox' });

    const second = await setupApprovedCampaign(h);
    const commit = await commitCampaign(h, second.campaignId, second.approvalRef);
    expect(commit.status).toBe(200);
    expect(commit.json.payload.queued).toBe(0);
    expect(commit.json.payload.skipped[0].reasonCodes).toContain('frequency_cap');
  });

  it('las horas de silencio bloquean el envío aunque haya aprobación', async () => {
    const h = await makeHarness({ contactPolicy: { maxPerSubjectPerWindow: 5, windowHours: 24, quietHours: { startUtcHour: 9, endUtcHour: 17 } } });
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    const commit = await commitCampaign(h, campaignId, approvalRef);
    expect(commit.status).toBe(200);
    expect(commit.json.payload.queued).toBe(0);
    expect(commit.json.payload.skipped[0].reasonCodes).toContain('quiet_hours');
  });

  it('sin política de contacto no se envía nada (fail-closed)', async () => {
    const h = await makeHarness();
    h.ctx.store.contactPolicies = [];
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    const commit = await commitCampaign(h, campaignId, approvalRef);
    expect(commit.status).toBe(200);
    expect(commit.json.payload.queued).toBe(0);
    expect(commit.json.payload.skipped[0].reasonCodes).toContain('no_contact_policy');
  });

  it('el techo de coste se respeta en el commit', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h, { costCeiling: '10.00' });
    const commit = await commitCampaign(h, campaignId, approvalRef);
    expect(commit.status).toBe(200);
    const budget = h.ctx.store.budgets.find((b) => b.campaignId === campaignId)!;
    expect(Number(budget.committed.amount)).toBeLessThanOrEqual(Number(budget.ceiling.amount));
  });
});

describe('MKT-C22 · outbox, jobs y reconciliación', () => {
  it('un resultado incierto no se reintenta a ciegas y queda para reconciliar', async () => {
    const h = await makeHarness({ sandboxMode: 'unknown' });
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    await commitCampaign(h, campaignId, approvalRef);
    const run = await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, { workerId: 'w1', limit: 10, provider: 'email_sandbox' });
    expect(run.json.payload.every((r: { state: string }) => r.state === 'unknown')).toBe(true);
    const intents = [...h.ctx.store.intents];
    expect(intents.every((i) => i.reconciliationRequired)).toBe(true);
    expect(h.ctx.store.events.some((e) => e.type === 'marketing.effect.outcome_unknown')).toBe(true);

    const first = await post(h, `/v1/marketing/campaigns/${campaignId}/reconcile`, h.tokens.alice, {
      intentId: intents[0]!.id,
      resolution: 'delivered',
      evidenceRef: 'provider_log_1',
    });
    expect(first.status).toBe(200);
    expect(first.json.payload.resend).toBe(false);
    expect(intents[0]!.state).toBe('confirmed');
    expect(first.json.payload.campaign.remaining).toBe(1);

    const second = await post(h, `/v1/marketing/campaigns/${campaignId}/reconcile`, h.tokens.alice, {
      intentId: intents[1]!.id,
      resolution: 'delivered',
      evidenceRef: 'provider_log_2',
    });
    expect(second.status).toBe(200);
    expect(h.ctx.store.campaigns.find((c) => c.id === campaignId)!.state).toBe('reconciled');
  });

  it('un fence antiguo no puede confirmar un efecto', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    await commitCampaign(h, campaignId, approvalRef);
    const leased = leaseIntents(h.ctx, TENANT_A, 'worker_1', 1);
    expect(leased).toHaveLength(1);
    await expect(deliverIntent(h.ctx, h.registry, leased[0]!.id, leased[0]!.fence + 1)).rejects.toBeInstanceOf(MarketingError);
  });

  it('pausar cancela lo encolado pero no deshace lo ya entregado', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    await commitCampaign(h, campaignId, approvalRef);
    h.ctx.store.intents[0]!.state = 'confirmed';
    const paused = await post(h, `/v1/marketing/campaigns/${campaignId}/pause`, h.tokens.alice, {});
    expect(paused.json.payload.state).toBe('paused');
    expect(h.ctx.store.intents[0]!.state).toBe('confirmed');
    expect(h.ctx.store.intents[1]!.state).toBe('cancelled');
  });
});

describe('MKT-C23 · Matomo lectura y binding de propiedades', () => {
  it('guarda observaciones por fuente y las sirve filtradas por métrica', async () => {
    const h = await makeHarness();
    await post(h, '/v1/marketing/observations', h.tokens.alice, {
      sourceId: 'matomo_web',
      metric: 'sessions',
      metricVersion: '1',
      aggregation: 'sum',
      unit: 'session',
      window: { from: '2026-11-10T00:00:00Z', to: '2026-11-11T00:00:00Z' },
      occurredAt: '2026-11-11T02:00:00Z',
      value: 320,
      coverage: 1,
      consentSnapshot: 'analytics:granted',
      sourceHash: 'h1h1h1h1',
    });
    const list = await get(h, '/v1/marketing/observations?metric=sessions', h.tokens.alice);
    expect(list.json).toHaveLength(1);
    expect(list.json[0].sourceId).toBe('matomo_web');
  });
});

describe('MKT-C24 · Plausible y PostHog como alternativas', () => {
  it('ambos se declaran deshabilitados y sin escritura', async () => {
    const h = await makeHarness();
    for (const provider of ['plausible', 'posthog'] as const) {
      const caps = h.registry[provider].capabilities();
      expect(caps.status).toBe('disabled');
      expect(caps.write).toEqual([]);
    }
  });
});

describe('MKT-C25 · GA4 y Search Console', () => {
  it('expone lectura de Search Console con su aviso de muestreo', async () => {
    const h = await makeHarness();
    await post(h, '/v1/marketing/observations', h.tokens.alice, {
      sourceId: 'search_console',
      metric: 'clicks',
      metricVersion: '1',
      aggregation: 'sum',
      unit: 'click',
      window: { from: '2026-11-10T00:00:00Z', to: '2026-11-11T00:00:00Z' },
      occurredAt: '2026-11-11T02:00:00Z',
      value: 45,
      coverage: 0.82,
      consentSnapshot: 'analytics:granted',
      sourceHash: 'scscsc12',
    });
    const perf = await get(h, '/v1/marketing/search-performance', h.tokens.alice);
    expect(perf.json.observations).toHaveLength(1);
    expect(perf.json.note).toMatch(/muestreo/);
  });
});

describe('MKT-C26 · SEO técnico y cambios propuestos', () => {
  it('detecta problemas técnicos y sólo propone cambios', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/seo-audits', h.tokens.alice, {
      url: 'http://agntia.example/landing',
      title: 'Corto',
      metaDescription: 'x',
      h1Count: 0,
      canonical: null,
      robots: 'noindex',
      hasStructuredData: false,
      https: false,
      sitemapListed: false,
      hreflang: [],
      lang: 'es',
    });
    expect(res.status).toBe(200);
    expect(res.json.payload.proposalsOnly).toBe(true);
    const codes = res.json.payload.findings.map((f: { code: string }) => f.code);
    expect(codes).toEqual(expect.arrayContaining(['no_https', 'title_length', 'h1_count', 'missing_canonical', 'noindex']));
  });
});

describe('MKT-C27 · AEO y GEO observacional', () => {
  it('registra una observación sin prometer posición ni tráfico', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/aeo-observations', h.tokens.alice, {
      engine: 'chatgpt',
      prompt: 'mejores agencias de marketing España',
      brandMentioned: true,
      citedUrl: 'https://agntia.example',
    });
    expect(res.status).toBe(200);
    expect(res.json.payload.note).toMatch(/Observacional/);
    expect(res.json.payload.note).toContain('no garantiza');
  });
});

describe('MKT-C28 · experimentación con GrowthBook', () => {
  it('calcula tamaño de muestra y bloquea si la población no llega', async () => {
    const h = await makeHarness();
    const spec = {
      hypothesis: 'La prueba social aumenta la conversión',
      unit: 'subject' as const,
      populationRef: 'aud_growth',
      metric: 'conversion_rate',
      guardrails: ['unsubscribe_rate'],
      minimumDetectableEffect: 0.05,
      alpha: 0.05,
      power: 0.8,
      horizonDays: 28,
      analysisPlan: 'Diferencia de proporciones con intervalo del 95%',
      preregistered: true as const,
    };
    const small = await post(h, '/v1/marketing/experiment-proposals', h.tokens.alice, { spec, populationSize: 500 });
    expect(small.status).toBe(200);
    expect(small.json.payload.status).toBe('blocked');
    expect(small.json.payload.blockers).toContain('population_insufficient');

    const large = await post(h, '/v1/marketing/experiment-proposals', h.tokens.alice, { spec, populationSize: 20000 });
    expect(large.json.payload.status).toBe('ready');
    expect(large.json.payload.sampleSizePerArm).toBeGreaterThan(1000);
  });

  it('un claim causal sin experimento registrado se rechaza', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/measurement-claims', h.tokens.alice, {
      kind: 'experimental',
      estimand: 'incremento de conversión',
      value: 0.03,
      uncertainty: { low: 0.01, high: 0.05 },
      assumptions: ['asignación aleatoria'],
      datasetRefs: ['exp'],
      limits: [],
    });
    expect(res.status).toBe(422);
  });
});

describe('MKT-C29 · paid media lectura y descubrimiento', () => {
  it('sin conexión de ads o con la conexión deshabilitada no hay propuesta', async () => {
    const h = await makeHarness();
    const missing = await post(h, '/v1/marketing/ads/proposals', h.tokens.alice, {
      connectionId: 'con_missing',
      accountKind: 'test',
      objective: 'traffic',
      dailyBudget: { amount: '20.00', currency: 'EUR' },
      audienceRef: 'aud_1',
      creativeRef: 'crv_1',
      landingUrl: 'https://agntia.example/landing',
      validateOnly: true,
    });
    expect(missing.status).toBe(424);

    const conn = await post(h, '/v1/marketing/integrations', h.tokens.alice, {
      provider: 'ads',
      endpointRef: 'https://ads.example',
      secretRef: 'secret://ads/token',
      scopes: ['campaign_read'],
    });
    const disabled = await post(h, '/v1/marketing/ads/proposals', h.tokens.alice, {
      connectionId: conn.json.payload.id,
      accountKind: 'test',
      objective: 'traffic',
      dailyBudget: { amount: '20.00', currency: 'EUR' },
      audienceRef: 'aud_1',
      creativeRef: 'crv_1',
      landingUrl: 'https://agntia.example/landing',
      validateOnly: true,
    });
    expect(disabled.status).toBe(424);
    expect(disabled.json.error.detail).toBe('ads_connection_disabled');
  });
});

describe('MKT-C30 · ads en test accounts', () => {
  it('con capacidad declarada, la propuesta queda bloqueada para producción', async () => {
    const h = await makeHarness();
    const conn = await post(h, '/v1/marketing/integrations', h.tokens.alice, {
      provider: 'ads',
      endpointRef: 'https://ads.example',
      secretRef: 'secret://ads/token',
      scopes: ['campaign_read'],
    });
    const connection = h.ctx.store.connections.find((c) => c.id === conn.json.payload.id)!;
    connection.state = 'ready';
    const res = await post(h, '/v1/marketing/ads/proposals', h.tokens.alice, {
      connectionId: connection.id,
      accountKind: 'test',
      objective: 'conversions',
      dailyBudget: { amount: '20.00', currency: 'EUR' },
      audienceRef: 'aud_1',
      creativeRef: 'crv_1',
      landingUrl: 'https://agntia.example/landing',
      validateOnly: true,
    });
    expect(res.status).toBe(200);
    expect(res.json.payload.productionBlocked).toBe(true);
    expect(res.json.payload.blockers).toContain('provider_capability_not_verified');
  });

  it('rechaza presupuestos de prueba por encima del techo y validateOnly=false', async () => {
    const h = await makeHarness();
    const conn = await post(h, '/v1/marketing/integrations', h.tokens.alice, {
      provider: 'ads',
      endpointRef: 'https://ads.example',
      secretRef: 'secret://ads/token',
      scopes: ['campaign_read'],
    });
    h.ctx.store.connections.find((c) => c.id === conn.json.payload.id)!.state = 'ready';
    const over = await post(h, '/v1/marketing/ads/proposals', h.tokens.alice, {
      connectionId: conn.json.payload.id,
      accountKind: 'test',
      objective: 'traffic',
      dailyBudget: { amount: '500.00', currency: 'EUR' },
      audienceRef: 'aud_1',
      creativeRef: 'crv_1',
      landingUrl: 'https://agntia.example/landing',
      validateOnly: true,
    });
    expect(over.status).toBe(403);
    const invalid = await post(h, '/v1/marketing/ads/proposals', h.tokens.alice, {
      connectionId: conn.json.payload.id,
      accountKind: 'test',
      objective: 'traffic',
      dailyBudget: { amount: '20.00', currency: 'EUR' },
      audienceRef: 'aud_1',
      creativeRef: 'crv_1',
      landingUrl: 'https://agntia.example/landing',
      validateOnly: false,
    });
    expect(invalid.status).toBe(422);
  });
});
