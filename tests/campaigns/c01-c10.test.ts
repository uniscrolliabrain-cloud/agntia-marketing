import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import {
  EnvelopeSchema,
  MarketingError,
  TwinBindingSchema,
  type DelegationMandate,
} from '@agntia/contracts';
import {
  evaluateEligibility,
  previewAudience,
  validateMandate,
  summariseObservations,
  registerTwin,
} from '@agntia/core';
import { TOOLS, toParentEvent } from '@agntia/sdk';
import { commitCampaign, get, key, makeHarness, PARENT_SHA, post, setupApprovedCampaign, TENANT_A } from '../support/harness';

describe('MKT-C01 · baseline y perímetro autorizado', () => {
  it('congela SHA del padre, fecha y límites en un registro reproducible', () => {
    const baseline = readFileSync('docs/BASELINE.md', 'utf8');
    expect(baseline).toContain(PARENT_SHA);
    expect(baseline).toContain('2026-11-14');
    expect(baseline).toContain('NOT_VERIFIED');
    expect(baseline).toMatch(/no modificar `?agente`?/i);
  });

  it('separa fallos preexistentes de cambios de la implementación', () => {
    const baseline = readFileSync('docs/BASELINE.md', 'utf8');
    expect(baseline).toMatch(/Hallazgos heredados/);
    expect(baseline).toMatch(/Postgres/);
  });
});

describe('MKT-C02 · dominio, autoridad y modelo SaaS', () => {
  it('un viewer no puede preparar escrituras', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/briefs', h.tokens.viewer, {});
    expect(res.status).toBe(403);
    expect(res.json.error.code).toBe('FORBIDDEN');
  });

  it('un actor no humano no puede ejecutar una capacidad de efecto', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/campaigns/x/commit', h.tokens.bot, { approvalRef: 'x' });
    expect(res.status).toBe(403);
    expect(res.json.error.detail).toBe('effect_requires_human');
  });

  it('no existe fallback a tenant por defecto: el tenant viene del token', async () => {
    const h = await makeHarness();
    const me = await get(h, '/v1/marketing/me', h.tokens.alice);
    expect(me.json.tenantId).toBe(TENANT_A);
    expect(me.json.actorId).toBe('alice');
  });
});

describe('MKT-C03 · Supabase JWT y principal verificado', () => {
  it('acepta un token válido y devuelve el contexto mínimo', async () => {
    const h = await makeHarness();
    const res = await get(h, '/v1/marketing/me', h.tokens.alice);
    expect(res.status).toBe(200);
    expect(res.json.roles).toContain('owner');
  });

  it('rechaza token caducado, issuer ajeno, usuario sin membership y petición sin bearer', async () => {
    const h = await makeHarness();
    expect((await get(h, '/v1/marketing/me', h.tokens.expired)).status).toBe(401);
    expect((await get(h, '/v1/marketing/me', h.tokens.wrongIssuer)).status).toBe(401);
    const ghost = await get(h, '/v1/marketing/me', h.tokens.ghost);
    expect(ghost.status).toBe(403);
    expect(ghost.json.error.detail).toBe('no_membership');
    const noAuth = await h.app.request('/v1/marketing/me');
    expect(noAuth.status).toBe(401);
  });

  it('el error de autenticación no filtra el motivo del verificador', async () => {
    const h = await makeHarness();
    const res = await get(h, '/v1/marketing/me', 'not.a.token');
    expect(res.status).toBe(401);
    expect(JSON.stringify(res.json)).not.toMatch(/JWKS|signature|jose/i);
  });
});

describe('MKT-C04 · twins y nomenclatura de procedencia', () => {
  it('registra un twin con procedencia que incluye el SHA canónico', async () => {
    const h = await makeHarness();
    const twin = h.ctx.store.twins.find((t) => t.tenantId === TENANT_A)!;
    expect(twin.canonicalAgentSha).toBe(PARENT_SHA);
    expect(twin.provenance).toContain('agente:');
    expect(twin.status).toBe('active');
  });

  it('rechaza un mandato que amplía capacidades del twin', async () => {
    const h = await makeHarness();
    const twin = registerTwin(h.ctx, 'tenant_c', { canonicalAgentSha: PARENT_SHA, displayName: 'twin-c' });
    const base = {
      mandateId: 'man_1',
      originatingActorId: 'alice',
      originatingTenantId: 'tenant_c',
      targetTenantId: 'tenant_c',
      twinId: twin.twinId,
      workOrderId: 'wo_1',
      capabilities: ['marketing.brief.read'],
      resources: [],
      purpose: 'marketing' as const,
      validFrom: '2026-11-01T00:00:00Z',
      validUntil: '2026-12-01T00:00:00Z',
      proofRef: 'proof_1',
    };
    const ok = validateMandate(h.ctx, twin, base as DelegationMandate);
    expect(ok.ok).toBe(true);
    const expanded = validateMandate(h.ctx, twin, { ...base, capabilities: ['marketing.campaign.commit'] } as DelegationMandate);
    expect(expanded).toEqual({ ok: false, reason: 'capability_not_delegable' });
    const expired = validateMandate(h.ctx, twin, { ...base, validUntil: '2026-01-01T00:00:00Z' } as DelegationMandate);
    expect(expired).toEqual({ ok: false, reason: 'mandate_expired' });
    expect(TwinBindingSchema.safeParse(twin).success).toBe(true);
  });
});

describe('MKT-C05 · contratos tipados y validación de frontera', () => {
  it('el envelope rechaza campos desconocidos y versiones distintas', () => {
    const valid = {
      schemaVersion: 1,
      operationId: 'op_12345678',
      tenantId: 'tenant_a',
      actorId: 'alice',
      capability: 'marketing.brief.read',
      correlationId: 'corr_1',
      idempotencyKey: 'idem_1',
      dryRun: true,
      payload: {},
    };
    expect(EnvelopeSchema.safeParse(valid).success).toBe(true);
    expect(EnvelopeSchema.safeParse({ ...valid, extra: true }).success).toBe(false);
    expect(EnvelopeSchema.safeParse({ ...valid, schemaVersion: 2 }).success).toBe(false);
  });

  it('la API rechaza payload con campos extra y no devuelve trazas internas', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/creatives', h.tokens.alice, { revision: { locale: 'es', headline: 'x', body: 'y', recipientType: 'b2b', extra: 1 } });
    expect(res.status).toBe(422);
    expect(JSON.stringify(res.json)).not.toMatch(/at .*\.ts:\d+/);
    expect(z.string().safeParse(res.json.error.code).success).toBe(true);
  });

  it('las tools del modelo no aceptan tenant ni actor en el input', () => {
    for (const tool of TOOLS) {
      const parsed = tool.input.safeParse({ tenantId: 'tenant_b', actorId: 'bob' });
      expect(parsed.success).toBe(false);
    }
  });
});

describe('MKT-C06 · Postgres, RLS y persistencia', () => {
  it('todas las tablas con datos de tenant tienen RLS forzada', () => {
    const rls = readFileSync('db/migrations/0002_rls.sql', 'utf8');
    for (const table of ['contacts', 'campaigns', 'outbound_intents', 'observations', 'approvals', 'audit_log']) {
      expect(rls).toContain(`'${table}'`);
    }
    expect(rls).toContain('force row level security');
    expect(rls).toContain('app_current_tenant()');
  });

  it('el esquema usa claves compuestas por tenant y dedup durable', () => {
    const schema = readFileSync('db/migrations/0001_schema.sql', 'utf8');
    expect(schema).toContain('foreign key (tenant_id, campaign_id) references campaigns(tenant_id, id)');
    expect(schema).toContain('unique (tenant_id, campaign_id, subject_ref)');
    expect(schema).toContain('unique (tenant_id, source_id, dedup_key)');
    expect(schema).toContain("secret_ref like 'secret://%'");
  });

  it('dos tenants no comparten filas ni operaciones', async () => {
    const h = await makeHarness();
    const { campaignId } = await setupApprovedCampaign(h);
    expect((await get(h, `/v1/marketing/campaigns/${campaignId}`, h.tokens.bob)).status).toBe(404);
    expect((await get(h, '/v1/marketing/integrations', h.tokens.bob)).json).toEqual([]);
    expect(h.ctx.store.intents.filter((i) => i.tenantId === 'tenant_b')).toHaveLength(0);
  });
});

describe('MKT-C07 · bases de tratamiento, supresión y preferencias', () => {
  it('la supresión bloquea y el contacto desconocido es unknown, no elegible', async () => {
    const h = await makeHarness();
    expect(evaluateEligibility(h.ctx, TENANT_A, 'sandbox_optout', 'marketing', 'email').state).toBe('blocked');
    expect(evaluateEligibility(h.ctx, TENANT_A, 'lead_noconsent', 'marketing', 'email').reasonCodes).toContain('no_consent_for_purpose');
    const unknown = evaluateEligibility(h.ctx, TENANT_A, 'no_existe', 'marketing', 'email');
    expect(unknown.state).toBe('unknown');
  });

  it('la audiencia excluye sin consentimiento y sin supresión', async () => {
    const h = await makeHarness();
    const preview = previewAudience(h.ctx, TENANT_A, {
      purpose: 'marketing',
      channel: 'email',
      include: [{ field: 'interestTopic', op: 'eq', value: 'growth' }],
      exclude: [],
    });
    expect(preview.eligibleRefs.sort()).toEqual(['sandbox_1', 'sandbox_2']);
    expect(preview.excludedCount).toBe(3);
  });

  it('una baja posterior invalida el snapshot congelado', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    h.ctx.store.contacts.find((c) => c.id === 'sandbox_1')!.suppressed = true;
    const res = await commitCampaign(h, campaignId, approvalRef);
    expect(res.status).toBe(409);
    expect(res.json.error.detail).toBe('snapshot_superseded_by_suppression');
    expect(h.ctx.store.intents).toHaveLength(0);
  });
});

describe('MKT-C08 · registro, secretos y discovery', () => {
  it('rechaza material secreto y exige referencia secret://', async () => {
    const h = await makeHarness();
    const raw = await post(h, '/v1/marketing/integrations', h.tokens.alice, {
      provider: 'mautic',
      endpointRef: 'https://mautic.example',
      secretRef: 'sk_live_123',
      scopes: ['contacts'],
    });
    expect(raw.status).toBe(422);
    const ok = await post(h, '/v1/marketing/integrations', h.tokens.alice, {
      provider: 'mautic',
      endpointRef: 'https://mautic.example',
      secretRef: 'secret://mautic/token',
      scopes: ['contacts'],
    });
    expect(ok.status).toBe(200);
    expect(ok.json.payload.state).toBe('disabled');
    const caps = await get(h, `/v1/marketing/integrations/${ok.json.payload.id}/capabilities`, h.tokens.alice);
    expect(caps.json.verified).toBe(false);
  });
});

describe('MKT-C09 · datos propios y puente de relación', () => {
  it('el bridge sólo mapea tipos nativos y descarta los no mapeados', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    await commitCampaign(h, campaignId, approvalRef);
    const stateEvent = h.ctx.store.events.find((e) => e.type === 'marketing.campaign.state_changed')!;
    const mapped = toParentEvent(stateEvent, { owner: 'agntia-marketing', emittedAt: h.now().toISOString() });
    expect(mapped?.schemaVersion).toBe('1.0');
    expect(mapped?.type).toBe('specialist.work_item.updated');
    const suppressionEvent = { ...stateEvent, type: 'marketing.suppression.changed' as const };
    expect(toParentEvent(suppressionEvent, { owner: 'x', emittedAt: '2026-11-14T00:00:00Z' })).toBeNull();
  });

  it('los eventos no llevan email ni cuerpos de mensaje', async () => {
    const h = await makeHarness();
    const { campaignId, approvalRef } = await setupApprovedCampaign(h);
    await commitCampaign(h, campaignId, approvalRef);
    const serialised = JSON.stringify(h.ctx.store.events);
    expect(serialised).not.toMatch(/@/);
    expect(serialised).not.toContain('Renueva con datos');
  });
});

describe('MKT-C10 · taxonomía y medición de eventos', () => {
  it('distingue missing, cero y observado', async () => {
    const h = await makeHarness();
    const base = {
      sourceId: 'matomo',
      metricVersion: '1',
      aggregation: 'sum' as const,
      unit: 'visit',
      window: { from: '2026-11-01T00:00:00Z', to: '2026-11-02T00:00:00Z' },
      occurredAt: '2026-11-02T01:00:00Z',
      coverage: 1,
      consentSnapshot: 'analytics:granted',
      sourceHash: 'hash1234',
    };
    expect(summariseObservations(h.ctx, TENANT_A, 'visits').state).toBe('missing');
    expect(
      (await post(h, '/v1/marketing/observations', h.tokens.alice, { ...base, metric: 'visits', value: null })).status,
    ).toBe(200);
    expect(summariseObservations(h.ctx, TENANT_A, 'visits').state).toBe('missing');
    await post(h, '/v1/marketing/observations', h.tokens.alice, { ...base, metric: 'visits', value: 0 });
    expect(summariseObservations(h.ctx, TENANT_A, 'visits').state).toBe('zero');
    await post(h, '/v1/marketing/observations', h.tokens.alice, { ...base, metric: 'visits', value: 12 });
    const summary = summariseObservations(h.ctx, TENANT_A, 'visits');
    expect(summary.state).toBe('observed');
    expect(summary.value).toBe(12);
  });

  it('una observación sin ventana válida se rechaza', async () => {
    const h = await makeHarness();
    const res = await post(h, '/v1/marketing/observations', h.tokens.alice, {
      sourceId: 'matomo',
      metric: 'visits',
      metricVersion: '1',
      aggregation: 'sum',
      unit: 'visit',
      window: { from: '2026-11-02T00:00:00Z', to: '2026-11-01T00:00:00Z' },
      occurredAt: '2026-11-02T01:00:00Z',
      value: 1,
      coverage: 1,
      consentSnapshot: 'x',
      sourceHash: 'hash1234',
    });
    expect(res.status).toBe(422);
  });
});

describe('MKT-C02 · idempotencia real', () => {
  it('repetir la misma clave devuelve el mismo resultado y un payload distinto colisiona', async () => {
    const h = await makeHarness();
    const idem = key('same');
    const body = {
      title: 'Brief idempotente',
      objective: 'Comprobar idempotencia de escritura',
      hypothesis: 'Repetir no debe duplicar',
      offer: 'Diagnóstico',
      declaredAudience: 'Equipos de growth',
      channels: ['email'],
      successDefinition: 'Un brief, no dos',
      window: { from: '2026-11-15T00:00:00Z', to: '2026-11-20T00:00:00Z' },
      sources: [{ label: 'interno', ref: 'doc' }],
    };
    const first = await post(h, '/v1/marketing/briefs', h.tokens.alice, body, idem);
    const second = await post(h, '/v1/marketing/briefs', h.tokens.alice, body, idem);
    expect(first.json.operationId).toBe(second.json.operationId);
    expect(h.ctx.store.briefs).toHaveLength(1);
    const collision = await post(h, '/v1/marketing/briefs', h.tokens.alice, { ...body, title: 'Otro' }, idem);
    expect(collision.status).toBe(409);
  });
});

describe('MKT-C05 · errores seguros', () => {
  it('un error de dominio expone código y correlationId, nunca el stack', () => {
    const err = new MarketingError('CONFLICT', 'version_mismatch');
    const body = err.toBody('corr_1');
    expect(body.error.code).toBe('CONFLICT');
    expect(JSON.stringify(body)).not.toContain('stack');
  });
});
