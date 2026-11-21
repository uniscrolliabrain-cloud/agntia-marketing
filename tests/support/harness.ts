import { createApp } from '../../apps/api/src/app';
import { createSupabaseJwtVerifier, signTestJwt } from '../../apps/api/src/auth';
import { SandboxEmailAdapter, createRegistry, type AdapterRegistry } from '@agntia/adapters';
import {
  createStore,
  type RateLimiter,
  registerTwin,
  resolvePrincipal,
  setContactPolicy,
  upsertContacts,
  type Ctx,
} from '@agntia/core';

export const PARENT_SHA = '54b8d5407a8576459448c4d059a877297d18ca7a';
export const TENANT_A = 'tenant_a';
export const TENANT_B = 'tenant_b';
export const ISS = 'https://test.supabase.co/auth/v1';
export const AUD = 'authenticated';
export const SECRET = 'test-secret-0123456789abcdef0123456789';

const ALL = ['marketing.*'];

export interface Harness {
  ctx: Ctx;
  registry: AdapterRegistry;
  app: ReturnType<typeof createApp>;
  sandbox: SandboxEmailAdapter;
  tokens: { alice: string; viewer: string; bot: string; bob: string; expired: string; wrongIssuer: string; ghost: string };
  advance: (ms: number) => void;
  now: () => Date;
}

let uniqueKey = 0;
export const key = (label = 'k') => `${label}-${Date.now()}-${(uniqueKey += 1)}`;

export async function makeHarness(options: {
  sandboxMode?: 'accept' | 'fail' | 'unknown';
  contactPolicy?: { maxPerSubjectPerWindow: number; windowHours: number; quietHours?: { startUtcHour: number; endUtcHour: number }; timezone?: string };
  ackSecret?: string;
  rateLimiter?: RateLimiter;
  /**
   * Reloj inicial. Los tests usan el fijo; un humo con proceso real necesita
   * una aprobación vigente frente al reloj del servidor, no una caducada.
   */
  startAt?: string;
} = {}): Promise<Harness> {
  let clock = new Date(options.startAt ?? '2026-11-14T10:00:00Z');
  const ctx = createStore(() => clock);
  const advance = (ms: number) => {
    clock = new Date(clock.getTime() + ms);
  };

  for (const [id, name] of [[TENANT_A, 'Tenant A'], [TENANT_B, 'Tenant B']] as const) {
    ctx.store.tenants.set(id, { id, name, plan: 'sandbox', createdAt: clock.toISOString() });
  }

  ctx.store.memberships.push(
    { tenantId: TENANT_A, actorId: 'alice', roles: ['owner'], scopes: ALL, isHuman: true },
    { tenantId: TENANT_A, actorId: 'vic', roles: ['viewer'], scopes: ALL, isHuman: true },
    { tenantId: TENANT_A, actorId: 'bot', roles: ['owner'], scopes: ALL, isHuman: false },
    { tenantId: TENANT_B, actorId: 'bob', roles: ['owner'], scopes: ALL, isHuman: true },
  );

  const alice = resolvePrincipal(ctx, { sub: 'alice', tenantId: TENANT_A, expiresAt: Math.floor(clock.getTime() / 1000) + 3600 }, 'marketing.context.read');

  upsertContacts(ctx, alice, [
    { id: 'sandbox_1', emailRef: 'ref_1', country: 'ES', locale: 'es', lifecycleStage: 'lead', interestTopic: 'growth', consent: { marketing: true }, engagedDays: 40, isBusiness: true },
    { id: 'sandbox_2', emailRef: 'ref_2', country: 'ES', locale: 'es', lifecycleStage: 'mql', interestTopic: 'growth', consent: { marketing: true }, engagedDays: 120, isBusiness: true },
    { id: 'sandbox_3', emailRef: 'ref_3', country: 'FR', locale: 'fr', lifecycleStage: 'customer', interestTopic: 'retention', consent: { marketing: true }, engagedDays: 300, isBusiness: true },
    { id: 'sandbox_optout', emailRef: 'ref_4', country: 'ES', locale: 'es', lifecycleStage: 'lead', interestTopic: 'growth', consent: { marketing: true }, engagedDays: 20, isBusiness: true },
    { id: 'lead_noconsent', emailRef: 'ref_5', country: 'ES', locale: 'es', lifecycleStage: 'lead', interestTopic: 'growth', consent: {}, engagedDays: 10, isBusiness: false },
  ]);
  ctx.store.contacts.find((c) => c.id === 'sandbox_optout')!.suppressed = true;

  setContactPolicy(ctx, TENANT_A, {
    maxPerSubjectPerWindow: options.contactPolicy?.maxPerSubjectPerWindow ?? 5,
    windowHours: options.contactPolicy?.windowHours ?? 24,
    timezone: options.contactPolicy?.timezone ?? 'UTC',
    ...(options.contactPolicy?.quietHours ? { quietHours: options.contactPolicy.quietHours } : {}),
  });

  registerTwin(ctx, TENANT_A, { canonicalAgentSha: PARENT_SHA, displayName: 'marketing-twin' });
  registerTwin(ctx, TENANT_B, { canonicalAgentSha: PARENT_SHA, displayName: 'marketing-twin-b' });

  const sandbox = new SandboxEmailAdapter(options.sandboxMode ?? 'accept');
  const registry = createRegistry({ email_sandbox: sandbox });
  const verifier = createSupabaseJwtVerifier({ issuer: ISS, audience: AUD, hmacSecret: SECRET });
  const app = createApp({
    ctx,
    registry,
    verifier,
    ...(options.ackSecret ? { ackSecret: options.ackSecret } : {}),
    ...(options.rateLimiter ? { rateLimiter: options.rateLimiter } : {}),
  });

  const token = (sub: string, tenantId: string, issuer = ISS, expires = 3600) =>
    signTestJwt({ secret: SECRET, issuer, audience: AUD, sub, tenantId, expiresInSeconds: expires });

  const tokens = {
    alice: await token('alice', TENANT_A),
    viewer: await token('vic', TENANT_A),
    bot: await token('bot', TENANT_A),
    bob: await token('bob', TENANT_B),
    expired: await token('alice', TENANT_A, ISS, -60),
    wrongIssuer: await token('alice', TENANT_A, 'https://evil.example/auth/v1'),
    ghost: await token('nobody', TENANT_A),
  };

  return { ctx, registry, app, sandbox, tokens, advance, now: () => clock };
}

export async function post(
  h: Harness,
  path: string,
  token: string,
  body: unknown = {},
  idempotencyKey = key('idem'),
): Promise<{ status: number; json: any }> {
  const res = await h.app.request(path, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': idempotencyKey,
      'x-correlation-id': 'corr_test',
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

export async function get(h: Harness, path: string, token: string): Promise<{ status: number; json: any }> {
  const res = await h.app.request(path, { headers: { authorization: `Bearer ${token}` } });
  return { status: res.status, json: await res.json() };
}

export const MARKETING_RULE = {
  purpose: 'marketing' as const,
  channel: 'email' as const,
  include: [{ field: 'interestTopic' as const, op: 'eq' as const, value: 'growth' }],
  exclude: [],
};

/**
 * Vertical completa hasta la aprobación humana. No envía: deja la campaña en
 * `approved` con intents listos para commit. Cada paso usa el API real.
 */
export async function setupApprovedCampaign(h: Harness, overrides: { costCeiling?: string; rule?: typeof MARKETING_RULE } = {}) {
  const brief = await post(h, '/v1/marketing/briefs', h.tokens.alice, {
    title: 'Captación growth ES',
    objective: 'Conseguir leads cualificados de growth en España',
    hypothesis: 'Un email con prueba social mejora la respuesta',
    offer: 'Diagnóstico gratuito',
    declaredAudience: 'Contactos B2B de growth con consentimiento',
    channels: ['email'],
    successDefinition: 'Leads cualificados por semana',
    window: { from: '2026-11-15T00:00:00Z', to: '2026-11-30T00:00:00Z' },
    budget: { amount: '500.00', currency: 'EUR' },
    constraints: ['sin descuentos'],
    sources: [{ label: 'informe interno', ref: 'docs/09-medicion-y-evaluacion.md' }],
  });
  const briefId = brief.json.payload.id as string;
  await post(h, `/v1/marketing/briefs/${briefId}/accept`, h.tokens.alice, { expectedVersion: 1 });

  const snapshot = await post(h, '/v1/marketing/audience-snapshots', h.tokens.alice, { rule: overrides.rule ?? MARKETING_RULE });
  const snapshotId = snapshot.json.payload.snapshotId as string;

  await post(h, '/v1/marketing/claims', h.tokens.alice, {
    claim: 'El 92% de los clientes renueva',
    subject: 'AgntiaPro',
    scope: 'clientes 2025 España',
    sourceKind: 'internal_measurement',
    sourceRef: 'informe-retention-2025',
    sourceDate: '2025-12-01',
    support: 'supported',
  });

  const creative = await post(h, '/v1/marketing/creatives', h.tokens.alice, {
    revision: {
      locale: 'es',
      headline: 'Renueva con datos',
      body: 'El 92% de los clientes renueva. Te enseñamos cómo.',
      claims: ['El 92% de los clientes renueva'],
      links: [{ url: 'https://agntia.example/renueva' }],
      assets: [],
      recipientType: 'b2b',
      disclosure: null,
    },
  });
  const creativeId = creative.json.payload.creativeId as string;

  const campaign = await post(h, '/v1/marketing/campaigns', h.tokens.alice, {
    name: 'Growth ES noviembre',
    briefId,
    channel: 'email',
    purpose: 'marketing',
    audienceSnapshotId: snapshotId,
    creativeId,
    costPerRecipient: { amount: '0.01', currency: 'EUR' },
    costCeiling: { amount: overrides.costCeiling ?? '10.00', currency: 'EUR' },
  });
  const campaignId = campaign.json.payload.campaignId as string;

  await post(h, '/v1/marketing/campaign-previews', h.tokens.alice, { campaignId });
  const approval = await post(h, `/v1/marketing/campaigns/${campaignId}/approve`, h.tokens.alice, {
    expiresAt: new Date(h.now().getTime() + 3600_000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
  });

  return { briefId, snapshotId, creativeId, campaignId, approvalRef: approval.json.payload.approvalRef as string };
}

export async function commitCampaign(h: Harness, campaignId: string, approvalRef: string) {
  return post(h, `/v1/marketing/campaigns/${campaignId}/commit`, h.tokens.alice, { approvalRef });
}
