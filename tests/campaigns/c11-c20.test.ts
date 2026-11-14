import { describe, expect, it } from 'vitest';
import { MarketingError, type CreativeRevision } from '@agntia/contracts';
import { createApproval, previewCampaign, resolvePrincipal, sha256, upsertContacts } from '@agntia/core';
import {
  commitCampaign,
  get,
  key,
  makeHarness,
  MARKETING_RULE,
  post,
  setupApprovedCampaign,
  TENANT_A,
} from '../support/harness';

describe('MKT-C11 · Mautic lectura y mapeo', () => {
  it('declara capacidades de lectura y ninguna escritura, en estado disabled', async () => {
    const h = await makeHarness();
    const mautic = h.registry.mautic;
    expect(mautic.capabilities().read).toContain('contacts');
    expect(mautic.capabilities().write).toEqual([]);
    expect(mautic.capabilities().status).toBe('disabled');
    expect(mautic.health().state).toBe('disabled');
  });

  it('un adaptador deshabilitado no puede enviar ni simular éxito', async () => {
    const h = await makeHarness();
    await expect(h.registry.mautic.send?.({ tenantId: TENANT_A, intentId: 'x', subjectRef: 'sandbox_1', channel: 'email', payloadHash: 'h', idempotencyKey: 'k' })).rejects.toBeInstanceOf(MarketingError);
  });
});

describe('MKT-C12 · Mautic borradores y autoridad de ejecución', () => {
  it('no se puede commitear una campaña sin aprobación humana', async () => {
    const h = await makeHarness();
    const { campaignId } = await setupApprovedCampaign(h);
    const campaign = h.ctx.store.campaigns.find((c) => c.id === campaignId)!;
    campaign.state = 'previewed';
    const res = await commitCampaign(h, campaignId, 'apv_inexistente');
    expect(res.status).toBe(409);
    expect(res.json.error.detail).toContain('campaign_not_approved');
  });

  it('el modelo no puede aprobarse a sí mismo', async () => {
    const h = await makeHarness();
    const { campaignId } = await setupApprovedCampaign(h);
    const draft = h.ctx.store.campaigns.find((c) => c.id === campaignId)!;
    draft.state = 'previewed';
    const res = await post(h, `/v1/marketing/campaigns/${campaignId}/approve`, h.tokens.bot, {
      expiresAt: '2027-01-01T00:00:00Z',
    });
    expect(res.status).toBe(403);
  });
});

describe('MKT-C13 · Listmonk como alternativa', () => {
  it('se declara como alternativa de solo lectura y sin capacidades de envío', async () => {
    const h = await makeHarness();
    const listmonk = h.registry.listmonk.capabilities();
    expect(listmonk.read).toEqual(['lists', 'subscribers', 'campaigns']);
    expect(listmonk.write).toEqual([]);
    expect(listmonk.note).toMatch(/AGPL/);
  });
});

describe('MKT-C14 · entrega email de sandbox y reputación', () => {
  it('vertical completa: commit, entrega, receipts y cierre de campaña', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    const commit = await commitCampaign(h, campaignId, approvalRef);
    expect(commit.status).toBe(200);
    expect(commit.json.payload.queued).toBe(2);

    const run = await post(h, '/v1/marketing/internal/deliver', h.tokens.alice, {
      workerId: 'worker_test_1',
      limit: 10,
      provider: 'email_sandbox',
    });
    expect(run.status).toBe(200);
    expect(run.json.payload.every((r: { state: string }) => r.state === 'confirmed')).toBe(true);
    expect(h.sandbox.sent).toHaveLength(2);
    expect(h.ctx.store.receipts).toHaveLength(2);

    const delivery = await get(h, `/v1/marketing/campaigns/${campaignId}/delivery`, h.tokens.alice);
    expect(delivery.json.counts.confirmed).toBe(2);
    expect(h.ctx.store.campaigns.find((c) => c.id === campaignId)!.state).toBe('reconciled');
  });

  it('el sandbox rechaza destinatarios fuera de sandbox', async () => {
    const h = await makeHarness();
    const outcome = await h.sandbox.send({
      tenantId: TENANT_A,
      intentId: 'int_1',
      subjectRef: 'cliente_real@example.com',
      channel: 'email',
      payloadHash: 'h',
      idempotencyKey: 'k',
    });
    expect(outcome).toEqual({ kind: 'failed', code: 'recipient_not_in_sandbox', retryable: false });
  });
});

describe('MKT-C15 · formularios y landings controladas', () => {
  it('propone un diff y exige aprobación para publicar', async () => {
    const h = await makeHarness();
    const proposal = await post(h, '/v1/marketing/landing-previews', h.tokens.alice, {
      pageRef: 'landing/growth',
      currentHtml: '<h1>Growth</h1>',
      proposedHtml: '<h1>Growth 2026</h1>\n<p>Nueva prueba social</p>',
    });
    expect(proposal.status).toBe(200);
    expect(proposal.json.payload.diffSummary).toContain('+1 líneas');

    const blocked = await post(h, `/v1/marketing/landing-change-proposals/${proposal.json.payload.id}/publish`, h.tokens.alice, {
      approvalRef: 'apv_missing',
    });
    expect(blocked.status).toBe(403);

    const principal = resolvePrincipal(
      h.ctx,
      { sub: 'alice', tenantId: TENANT_A, expiresAt: Math.floor(h.now().getTime() / 1000) + 600 },
      'marketing.landing.publish',
    );
    const approval = createApproval(h.ctx, principal, {
      revisionHash: proposal.json.payload.proposedHash,
      audienceMaxHash: sha256('public_page'),
      purpose: 'marketing',
      channel: 'landing',
      costCeiling: { amount: '0.00', currency: 'EUR' },
      expiresAt: '2027-01-01T00:00:00Z',
    });
    const published = await post(h, `/v1/marketing/landing-change-proposals/${proposal.json.payload.id}/publish`, h.tokens.alice, {
      approvalRef: approval.approvalRef,
    });
    expect(published.status).toBe(200);
    expect(h.ctx.store.landings[0]!.state).toBe('published');
  });

  it('rechaza una propuesta sin cambios o con script inseguro', async () => {
    const h = await makeHarness();
    const same = await post(h, '/v1/marketing/landing-previews', h.tokens.alice, {
      pageRef: 'x',
      currentHtml: '<h1>A</h1>',
      proposedHtml: '<h1>A</h1>',
    });
    expect(same.status).toBe(422);
    const insecure = await post(h, '/v1/marketing/landing-previews', h.tokens.alice, {
      pageRef: 'x',
      currentHtml: '<h1>A</h1>',
      proposedHtml: '<h1>A</h1><script src="http://evil.example/x.js"></script>',
    });
    expect(insecure.status).toBe(422);
  });
});

describe('MKT-C16 · marca, assets y evidencia de claims', () => {
  it('bloquea creatividades con claims sin evidencia o con assets sin licencia', async () => {
    const h = await makeHarness();
    const unsupported = await post(h, '/v1/marketing/creatives', h.tokens.alice, {
      revision: {
        locale: 'es',
        headline: 'Líderes del mercado',
        body: 'Somos los número uno',
        claims: ['Somos los número uno'],
        links: [],
        assets: [],
        recipientType: 'b2b',
        disclosure: null,
      },
    });
    expect(unsupported.status).toBe(422);
    expect(unsupported.json.error.detail).toContain('unsupported_claims');

    const unlicensed = await post(h, '/v1/marketing/creatives', h.tokens.alice, {
      revision: {
        locale: 'es',
        headline: 'Con foto',
        body: 'Texto con imagen',
        claims: [],
        links: [],
        assets: [{ assetId: 'img_1', rights: 'licensed', licenceRef: null }],
        recipientType: 'b2b',
        disclosure: null,
      },
    });
    expect(unlicensed.status).toBe(422);
  });

  it('acepta una creatividad con claim soportado y derechos declarados', async () => {
    const h = await makeHarness();
    await post(h, '/v1/marketing/claims', h.tokens.alice, {
      claim: 'Atendemos en 4 idiomas',
      subject: 'AgntiaPro',
      scope: 'servicio 2026',
      sourceKind: 'official',
      sourceRef: 'web-oficial',
      sourceDate: '2026-01-10',
      support: 'supported',
    });
    const revision: CreativeRevision = {
      locale: 'es',
      headline: 'Cuatro idiomas',
      body: 'Te atendemos en cuatro idiomas.',
      claims: ['Atendemos en 4 idiomas'],
      links: [{ url: 'https://agntia.example/idiomas' }],
      assets: [{ assetId: 'logo_1', rights: 'owned', licenceRef: null }],
      recipientType: 'b2b',
      disclosure: null,
    };
    const res = await post(h, '/v1/marketing/creatives', h.tokens.alice, { revision });
    expect(res.status).toBe(200);
    expect(res.json.payload.claims.ok).toBe(true);
  });
});

describe('MKT-C17 · investigación, brief y estrategia', () => {
  it('rechaza ventanas inválidas y briefs con fechas incoherentes', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/briefs', h.tokens.alice, {
      title: 'Brief roto',
      objective: 'Objetivo suficientemente largo',
      hypothesis: 'Hipótesis suficientemente larga',
      offer: 'Oferta',
      declaredAudience: 'Audiencia',
      channels: ['email'],
      successDefinition: 'Éxito',
      window: { from: '2026-12-01T00:00:00Z', to: '2026-11-01T00:00:00Z' },
      sources: [{ label: 'x', ref: 'y' }],
    });
    expect(res.status).toBe(422);
  });

  it('la estrategia sólo se propone sobre briefs aceptados y no compra medios', async () => {
    const h = await makeHarness();
    const brief = await post(h, '/v1/marketing/briefs', h.tokens.alice, {
      title: 'Estrategia Q4',
      objective: 'Priorizar canales para el trimestre',
      hypothesis: 'Email y landing convierten mejor que social',
      offer: 'Diagnóstico',
      declaredAudience: 'B2B growth',
      channels: ['email', 'landing', 'ads'],
      successDefinition: 'Propuesta revisada por el owner',
      window: { from: '2026-11-15T00:00:00Z', to: '2026-12-15T00:00:00Z' },
      budget: { amount: '1000.00', currency: 'EUR' },
      sources: [{ label: 'interno', ref: 'doc' }],
    });
    const briefId = brief.json.payload.id;
    const early = await post(h, `/v1/marketing/briefs/${briefId}/strategy-proposals`, h.tokens.alice, {});
    expect(early.status).toBe(422);
    await post(h, `/v1/marketing/briefs/${briefId}/accept`, h.tokens.alice, { expectedVersion: 1 });
    const strategy = await post(h, `/v1/marketing/briefs/${briefId}/strategy-proposals`, h.tokens.alice, {});
    expect(strategy.status).toBe(200);
    expect(strategy.json.payload.scenarios.length).toBe(3);
    expect(strategy.json.payload.blockers).toContain('paid_media_requires_test_account_capacity');
    expect(JSON.stringify(strategy.json.payload)).not.toMatch(/garantiz|ROI/i);
  });
});

describe('MKT-C18 · segmentación y audiencia máxima', () => {
  it('congela miembros reales, no sólo la regla', async () => {
    const h = await makeHarness();
    const snapshot = await post(h, '/v1/marketing/audience-snapshots', h.tokens.alice, { rule: MARKETING_RULE });
    expect(snapshot.status).toBe(200);
    const stored = h.ctx.store.snapshots[0]!;
    expect(stored.membersHash).not.toBe(stored.ruleHash);
    expect(stored.memberRefs).toHaveLength(2);
    expect(stored.eligibleCount).toBe(2);
  });

  it('rechaza audiencias vacías y detecta crecimiento que exige nueva aprobación', async () => {
    const h = await makeHarness();
    const empty = await post(h, '/v1/marketing/audience-snapshots', h.tokens.alice, {
      rule: { purpose: 'marketing', channel: 'email', include: [{ field: 'country', op: 'eq', value: 'DE' }], exclude: [] },
    });
    expect(empty.status).toBe(422);

    const { campaignId } = await setupApprovedCampaign(h);
    const principal = resolvePrincipal(
      h.ctx,
      { sub: 'alice', tenantId: TENANT_A, expiresAt: Math.floor(h.now().getTime() / 1000) + 600 },
      'marketing.context.read',
    );
    upsertContacts(h.ctx, principal, [
      { id: 'sandbox_new', emailRef: 'ref_new', country: 'ES', locale: 'es', lifecycleStage: 'lead', interestTopic: 'growth', consent: { marketing: true }, engagedDays: 1, isBusiness: true },
    ]);
    const preview = previewCampaign(h.ctx, TENANT_A, campaignId);
    expect(preview.blockers).toContain('audience_grew_needs_new_snapshot');
  });
});

describe('MKT-C19 · journeys y motor de campañas', () => {
  it('valida pasos y reentry y no inscribe al previsualizar', async () => {
    const h = await makeHarness();
    const dup = await post(h, '/v1/marketing/journeys', h.tokens.alice, {
      name: 'Journey duplicado',
      steps: [
        { stepId: 's1', channel: 'email', delayHours: 0, templateRef: 't1' },
        { stepId: 's1', channel: 'email', delayHours: 24, templateRef: 't2' },
      ],
      audienceRule: MARKETING_RULE,
      reentry: 'never',
    });
    expect(dup.status).toBe(422);

    const missingDays = await post(h, '/v1/marketing/journeys', h.tokens.alice, {
      name: 'Journey reentry',
      steps: [{ stepId: 's1', channel: 'email', delayHours: 0, templateRef: 't1' }],
      audienceRule: MARKETING_RULE,
      reentry: 'after_days',
    });
    expect(missingDays.status).toBe(422);

    const created = await post(h, '/v1/marketing/journeys', h.tokens.alice, {
      name: 'Journey bienvenida',
      steps: [
        { stepId: 's1', channel: 'email', delayHours: 0, templateRef: 't1' },
        { stepId: 's2', channel: 'email', delayHours: 72, templateRef: 't2' },
      ],
      audienceRule: MARKETING_RULE,
      reentry: 'never',
    });
    expect(created.status).toBe(200);
    const preview = await post(h, `/v1/marketing/journeys/${created.json.payload.id}/preview`, h.tokens.alice, { sample: 10 });
    expect(preview.json.payload.steps).toBe(2);
    expect(preview.json.payload.eligible).toBe(2);
    expect(h.ctx.store.intents).toHaveLength(0);
  });
});

describe('MKT-C20 · preview y aprobación vinculada', () => {
  it('una aprobación caducada no permite commit', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    const approval = h.ctx.store.approvals.find((a) => a.approvalRef === approvalRef)!;
    approval.expiresAt = '2026-11-14T09:00:00Z';
    const res = await commitCampaign(h, campaignId, approvalRef);
    expect(res.status).toBe(403);
    expect(res.json.error.detail).toBe('approval_expired');
  });

  it('una nueva revisión de creatividad invalida la aprobación anterior', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef, creativeId } = await setupApprovedCampaign(h);
    const revised = await post(h, '/v1/marketing/creatives', h.tokens.alice, {
      creativeId,
      revision: {
        locale: 'es',
        headline: 'Renueva con datos (v2)',
        body: 'El 92% de los clientes renueva. Nueva versión.',
        claims: ['El 92% de los clientes renueva'],
        links: [{ url: 'https://agntia.example/renueva' }],
        assets: [],
        recipientType: 'b2b',
        disclosure: null,
      },
    });
    expect(revised.status).toBe(200);
    expect(revised.json.payload.revision).toBe(2);
    const res = await commitCampaign(h, campaignId, approvalRef);
    expect(res.status).toBe(409);
    expect(res.json.error.detail).toBe('approval_revision_mismatch');
  });

  it('el preview devuelve el hash de revisión y el techo de coste que se aprueban', async () => {
    const h = await makeHarness();
    const { campaignId } = await setupApprovedCampaign(h);
    const preview = await post(h, '/v1/marketing/campaign-previews', h.tokens.alice, { campaignId });
    expect(preview.json.payload.audienceMaxHash).toHaveLength(64);
    expect(preview.json.payload.requiredApproval.costCeiling.currency).toBe('EUR');
    expect(preview.json.payload.recipients).toBe(2);
  });
});

describe('MKT-C20 · errores de aprobación', () => {
  it('una aprobación de otro tenant no sirve', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    const res = await post(h, `/v1/marketing/campaigns/${campaignId}/commit`, h.tokens.bob, { approvalRef }, key('bob'));
    expect([403, 404]).toContain(res.status);
  });
});
