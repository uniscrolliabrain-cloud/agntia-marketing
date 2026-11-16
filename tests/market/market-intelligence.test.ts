import { describe, expect, it } from 'vitest';
import { signTestJwt } from '../../apps/api/src/auth';
import { AUD, get, ISS, key, makeHarness, post, SECRET, type Harness } from '../support/harness';

/**
 * C03 · M01–M10. Pruebas de contrato y de invariantes:
 * procedencia, licencia, caducidad, ranking determinista y aislamiento.
 */

const source = (over: Record<string, unknown> = {}) => ({
  sourceRef: 'src_ine_2026',
  kind: 'official',
  title: 'Informe de demanda digital 2026',
  url: 'https://ine.example/informes/demanda-2026',
  publisher: 'INE',
  publishedAt: '2026-10-01T00:00:00Z',
  retrievedAt: '2026-11-10T00:00:00Z',
  licence: 'public',
  geography: 'ES',
  note: null,
  ...over,
});

const observation = (over: Record<string, unknown> = {}) => ({
  sourceRef: 'src_ine_2026',
  kind: 'demand_signal',
  topic: 'reactivacion-b2b',
  statement: 'Las pymes B2B buscan reactivar contactos inactivos tras el verano',
  geography: 'ES',
  observedAt: '2026-11-01T00:00:00Z',
  value: 18.5,
  unit: '%',
  confidence: 0.6,
  ...over,
});

const opportunity = (over: Record<string, unknown> = {}) => ({
  title: 'Email de reactivación B2B',
  thesis: 'Los contactos B2B inactivos responden a una secuencia corta con prueba social verificada.',
  segment: 'B2B growth',
  channelFocus: ['email'],
  estimatedImpact: {
    low: { amount: '1000.00', currency: 'EUR' },
    high: { amount: '3000.00', currency: 'EUR' },
  },
  effort: 'medium',
  evidenceRefs: ['src_ine_2026'],
  confidence: 0.7,
  expiresAt: '2026-12-31T00:00:00Z',
  hypothesis: 'Una secuencia de tres emails recupera el 10% de los contactos inactivos',
  ...over,
});

async function withSource(h: Harness, over: Record<string, unknown> = {}) {
  const res = await post(h, '/v1/marketing/market/sources', h.tokens.alice, source(over), key('src'));
  expect(res.status).toBe(200);
  return res;
}

describe('C03 · M01–M04 fuentes y observaciones', () => {
  it('registra una fuente y una observación y alimenta el radar', async () => {
    const h = await makeHarness();
    await withSource(h);
    const obs = await post(h, '/v1/marketing/market/observations', h.tokens.alice, observation());
    expect(obs.status).toBe(200);
    expect(obs.json.payload.topic).toBe('reactivacion-b2b');

    const radar = await get(h, '/v1/marketing/market/radar', h.tokens.alice);
    expect(radar.status).toBe(200);
    expect(radar.json.topics).toHaveLength(1);
    expect(radar.json.topics[0].observations).toBe(1);
    expect(radar.json.topics[0].freshObservations).toBe(1);
    expect(radar.json.staleShare).toBe(0);

    const sources = await get(h, '/v1/marketing/market/sources', h.tokens.alice);
    expect(sources.json[0].fresh).toBe(true);
    expect(sources.json[0].maxAgeDays).toBe(365);
  });

  it('rechaza una fuente con URL no cifrada y una observación huérfana', async () => {
    const h = await makeHarness();
    const insecure = await post(
      h,
      '/v1/marketing/market/sources',
      h.tokens.alice,
      source({ url: 'http://ine.example/informes' }),
      key('src'),
    );
    expect(insecure.status).toBe(422);

    const orphan = await post(
      h,
      '/v1/marketing/market/observations',
      h.tokens.alice,
      observation({ sourceRef: 'src_inexistente' }),
      key('obs'),
    );
    expect(orphan.status).toBe(422);
    expect(orphan.json.error.detail).toContain('observation_source_unknown');
  });

  it('marca como caducada una fuente de prensa y la excluye de las lecturas por defecto', async () => {
    const h = await makeHarness();
    await withSource(h, {
      sourceRef: 'src_press',
      kind: 'press',
      publishedAt: '2025-12-20T00:00:00Z',
      retrievedAt: '2026-01-01T00:00:00Z',
    });
    await post(
      h,
      '/v1/marketing/market/observations',
      h.tokens.alice,
      observation({ sourceRef: 'src_press' }),
      key('obs'),
    );

    const fresh = await get(h, '/v1/marketing/market/observations', h.tokens.alice);
    expect(fresh.json).toHaveLength(0);
    const all = await get(h, '/v1/marketing/market/observations?includeStale=true', h.tokens.alice);
    expect(all.json).toHaveLength(1);
  });
});

describe('C03 · M05–M08 evidencia y oportunidades', () => {
  it('deniega una oportunidad cuya fuente no tiene licencia verificada', async () => {
    const h = await makeHarness();
    await withSource(h, { licence: 'unknown' });
    const res = await post(h, '/v1/marketing/market/opportunities', h.tokens.alice, opportunity());
    expect(res.status).toBe(403);
    expect(res.json.error.detail).toContain('evidence_licence_unverified');
  });

  it('deniega una oportunidad con evidencia caducada y exige refresco', async () => {
    const h = await makeHarness();
    await withSource(h, {
      sourceRef: 'src_press',
      kind: 'press',
      publishedAt: '2026-08-01T00:00:00Z',
      retrievedAt: '2026-09-01T00:00:00Z',
    });
    const res = await post(
      h,
      '/v1/marketing/market/opportunities',
      h.tokens.alice,
      opportunity({ evidenceRefs: ['src_press'] }),
    );
    expect(res.status).toBe(409);
    expect(res.json.error.detail).toContain('evidence_stale');
  });

  it('deniega referencias de evidencia de otro tenant', async () => {
    const h = await makeHarness();
    await withSource(h);
    const res = await post(h, '/v1/marketing/market/opportunities', h.tokens.bob, opportunity());
    expect(res.status).toBe(422);
    expect(res.json.error.detail).toContain('evidence_ref_unknown');
  });

  it('rechaza un rango de impacto invertido y propuestas duplicadas', async () => {
    const h = await makeHarness();
    await withSource(h);
    const inverted = await post(
      h,
      '/v1/marketing/market/opportunities',
      h.tokens.alice,
      opportunity({
        estimatedImpact: {
          low: { amount: '5000.00', currency: 'EUR' },
          high: { amount: '1000.00', currency: 'EUR' },
        },
      }),
      key('opp'),
    );
    expect(inverted.status).toBe(422);
    expect(inverted.json.error.detail).toContain('impact_range_inverted');

    const first = await post(h, '/v1/marketing/market/opportunities', h.tokens.alice, opportunity(), key('opp-a'));
    expect(first.status).toBe(200);
    expect(first.json.payload.ranking.grade).toBe('E1');

    const duplicate = await post(h, '/v1/marketing/market/opportunities', h.tokens.alice, opportunity(), key('opp-b'));
    expect(duplicate.status).toBe(409);
    expect(duplicate.json.error.detail).toContain('opportunity_duplicate');
  });

  it('calcula el grado de evidencia en servidor con dos fuentes corroborantes', async () => {
    const h = await makeHarness();
    await withSource(h);
    await withSource(h, { sourceRef: 'src_estudio', kind: 'study', title: 'Estudio sectorial 2026' });
    const res = await post(
      h,
      '/v1/marketing/market/opportunities',
      h.tokens.alice,
      opportunity({ evidenceRefs: ['src_ine_2026', 'src_estudio'] }),
    );
    expect(res.status).toBe(200);
    expect(res.json.payload.ranking.grade).toBe('E3');
  });
});

describe('C03 · M09–M10 ranking, determinismo y tenancy', () => {
  it('ordena por score y produce el mismo hash en dos lecturas con el mismo reloj', async () => {
    const h = await makeHarness();
    await withSource(h);
    await post(
      h,
      '/v1/marketing/market/opportunities',
      h.tokens.alice,
      opportunity({ title: 'A · quick win', effort: 'low', confidence: 0.9 }),
      key('o1'),
    );
    await post(
      h,
      '/v1/marketing/market/opportunities',
      h.tokens.alice,
      opportunity({ title: 'B · apuesta larga', effort: 'high', confidence: 0.9 }),
      key('o2'),
    );

    const first = await get(h, '/v1/marketing/market/opportunities', h.tokens.alice);
    const second = await get(h, '/v1/marketing/market/opportunities', h.tokens.alice);
    expect(first.json.map((o: any) => o.title)).toEqual(['A · quick win', 'B · apuesta larga']);
    expect(first.json[0].score).toBeGreaterThan(first.json[1].score);
    expect(first.json[0].inputHash).toBe(second.json[0].inputHash);
    expect(first.json[0].score).toBe(second.json[0].score);
    expect(first.json[0].reasons).toContain('evidence_grade:E1');
  });

  it('degrada el score cuando la evidencia envejece', async () => {
    const h = await makeHarness();
    await withSource(h, {
      sourceRef: 'src_press',
      kind: 'press',
      publishedAt: '2026-10-25T00:00:00Z',
      retrievedAt: '2026-11-01T00:00:00Z',
    });
    await post(
      h,
      '/v1/marketing/market/opportunities',
      h.tokens.alice,
      opportunity({ evidenceRefs: ['src_press'] }),
      key('press'),
    );
    const before = await get(h, '/v1/marketing/market/opportunities', h.tokens.alice);
    expect(before.json[0].freshnessFactor).toBe(0.4);

    h.advance(40 * 24 * 60 * 60 * 1000);
    // El token original ha expirado: se reemite uno nuevo para leer el ranking.
    const expired = await get(h, '/v1/marketing/market/opportunities', h.tokens.alice);
    expect(expired.status).toBe(401);
    const fresh = await signTestJwt({
      secret: SECRET,
      issuer: ISS,
      audience: AUD,
      sub: 'alice',
      tenantId: 'tenant_a',
      // Cubre el salto de reloj simulado de 40 días.
      expiresInSeconds: 60 * 24 * 3600,
    });
    const after = await get(h, '/v1/marketing/market/opportunities', fresh);
    expect(after.status).toBe(200);
    expect(after.json[0].freshnessFactor).toBe(0);
    expect(after.json[0].score).toBe(0);
    expect(after.json[0].reasons).toContain('no_fresh_evidence');
  });

  it('aísla oportunidades y competidores entre tenants', async () => {
    const h = await makeHarness();
    await withSource(h);
    await post(h, '/v1/marketing/market/opportunities', h.tokens.alice, opportunity(), key('a'));
    const bob = await get(h, '/v1/marketing/market/opportunities', h.tokens.bob);
    expect(bob.json).toHaveLength(0);
    const alice = await get(h, '/v1/marketing/market/opportunities', h.tokens.alice);
    expect(alice.json).toHaveLength(1);

    const competitor = {
      name: 'Competidor A',
      domain: 'competidor.example',
      positioning: 'Precio bajo para pymes',
      offer: 'Plan mensual básico',
      priceBand: 'low',
      channels: ['email'],
      lastSeenAt: '2026-11-01T00:00:00Z',
      evidenceRefs: ['src_ine_2026'],
    };
    const created = await post(h, '/v1/marketing/market/competitors', h.tokens.alice, competitor, key('c'));
    expect(created.status).toBe(200);
    expect(await get(h, '/v1/marketing/market/competitors', h.tokens.bob)).toMatchObject({ json: [] });
  });

  it('impide escribir a un viewer y permite leer', async () => {
    const h = await makeHarness();
    const denied = await post(h, '/v1/marketing/market/sources', h.tokens.viewer, source(), key('v'));
    expect(denied.status).toBe(403);
    const read = await get(h, '/v1/marketing/market/opportunities', h.tokens.viewer);
    expect(read.status).toBe(200);
  });

  it('reproduce la respuesta con la misma idempotency key y payload', async () => {
    const h = await makeHarness();
    const idem = key('idem-opp');
    const first = await post(h, '/v1/marketing/market/sources', h.tokens.alice, source(), idem);
    const second = await post(h, '/v1/marketing/market/sources', h.tokens.alice, source(), idem);
    expect(first.status).toBe(200);
    expect(second.json.operationId).toBe(first.json.operationId);
  });
});

describe('C01 · M65 AuthorityMap', () => {
  it('publica el mapa de autoridad con los dueños canónicos', async () => {
    const h = await makeHarness();
    const res = await get(h, '/v1/marketing/authority', h.tokens.alice);
    expect(res.status).toBe(200);
    expect(res.json.effectOwners.publish_post).toBe('redes');
    const marketing = res.json.domains.find((d: any) => d.domain === 'marketing');
    expect(marketing.owns).toContain('campaign');
    expect(marketing.effects).not.toContain('publish_post');
    expect(res.json.boundary.marketingMaySelfGrant).toBe(false);
  });

  it('deniega que marketing se declare dueño de un efecto de otro dominio', async () => {
    const h = await makeHarness();
    const selfGrant = await post(
      h,
      '/v1/marketing/handoffs',
      h.tokens.alice,
      {
        toService: 'redes',
        effect: 'publish_post',
        resourceRef: 'post_x',
        ownerService: 'marketing',
        acceptance: 'marketing publica el post',
      },
      key('handoff'),
    );
    expect(selfGrant.status).toBe(409);
    expect(selfGrant.json.error.detail).toContain('effect_not_owned_by_marketing');
  });

  it('anota la declaración de autoridad en handoffs legítimos', async () => {
    const h = await makeHarness();
    const ok = await post(
      h,
      '/v1/marketing/handoffs',
      h.tokens.alice,
      {
        toService: 'redes',
        effect: 'publish_post',
        resourceRef: 'post_ok',
        ownerService: 'redes',
        acceptance: 'redes publica y confirma receipt',
      },
      key('handoff-ok'),
    );
    expect(ok.status).toBe(200);
    expect(ok.json.payload.accepted).toBe(true);
    expect(ok.json.payload.authority).toEqual({
      declaredOwner: 'redes',
      canonicalOwner: 'redes',
      matches: true,
    });
  });
});
