import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import type { Pool } from 'pg';
import { createRegistry } from '@agntia/adapters';
import { createStore } from '@agntia/core';
import { PgAdminService } from './admin';
import { createApp } from './app';
import { createSupabaseJwtVerifier } from './auth';
import { createPgPrincipalResolver } from './principals';
import { PgRateLimiter } from './ratelimit-pg';
import { PgTenantStateStore } from './state';

/**
 * Configuración por entorno. En producción se exige JWKS https y nunca se usa
 * el secreto HS256 de desarrollo; sin variables válidas el proceso no arranca.
 */
const port = Number(process.env.PORT ?? 8787);
const supabaseUrl = process.env.SUPABASE_URL;
const audience = process.env.SUPABASE_JWT_AUDIENCE ?? 'authenticated';

if (supabaseUrl) {
  if (!supabaseUrl.startsWith('https://')) throw new Error('SUPABASE_URL_must_be_https');
} else if (process.env.NODE_ENV === 'production') {
  throw new Error('SUPABASE_URL_required_in_production');
}

const verifier = createSupabaseJwtVerifier({
  issuer: supabaseUrl ? `${supabaseUrl}/auth/v1` : 'https://local.invalid/auth/v1',
  audience,
  jwksUrl: supabaseUrl ? `${supabaseUrl}/auth/v1/.well-known/jwks.json` : undefined,
  hmacSecret: supabaseUrl ? undefined : process.env.DEV_JWT_SECRET ?? 'dev-only-secret-change-me',
  requiredRole: 'authenticated',
});

// Con `DATABASE_URL` el rate limit es compartido y la ruta administrativa tiene
// su vía real (`marketing_admin` + `admin_actions`); sin ella caen a memoria y
// a 424 respectivamente, y el proceso lo declara: el límite efectivo se
// multiplica por instancia y no hay administración que fingir.
let pool: Pool | undefined;
if (process.env.DATABASE_URL) {
  const { default: pg } = await import('pg');
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
}
const rateLimiter = pool ? new PgRateLimiter(pool) : undefined;
if (!rateLimiter) console.warn('rate_limiter=memory: el límite no se comparte entre instancias');
const admin = pool ? new PgAdminService(pool) : undefined;
if (!admin) console.warn('admin_api=unconfigured: POST /v1/marketing/admin/actions responde 424');
// Con `DATABASE_URL` el tenant y la membership se leen de `tenants`/`memberships`
// (rol `authenticated` + RLS). Sin ella el store arranca vacío y ningún token
// pasaría de `tenant_unknown`: el aviso lo dice en vez de fingir autenticación.
const principals = pool ? createPgPrincipalResolver(pool) : undefined;
if (!principals) console.warn('principals=memory: el store está vacío y no hay ruta autenticada');

const ackSecret = process.env.HANDOFF_ACK_SECRET;
if (!ackSecret) console.warn('handoff_ack=unsigned: define HANDOFF_ACK_SECRET para firmar ACKs');
else if (ackSecret.length < 16) throw new Error('HANDOFF_ACK_SECRET_too_short');

// Reloj real: el proceso no puede arrancar con el reloj congelado de las pruebas.
const ctx = createStore(() => new Date());
// El documento de estado del tenant es la verdad entre peticiones; sin Postgres
// el store se queda en el proceso y el reinicio lo pierde, y el proceso lo dice.
const state = pool ? new PgTenantStateStore(pool, ctx) : undefined;
if (!state) console.warn('tenant_state=memory: campañas, intents y receipts se pierden al reiniciar');

const app = createApp({
  ctx,
  registry: createRegistry(),
  verifier,
  ...(rateLimiter ? { rateLimiter } : {}),
  ...(admin ? { admin } : {}),
  ...(principals ? { principals } : {}),
  ...(state ? { state } : {}),
  ...(ackSecret ? { ackSecret } : {}),
});
app.use('/portal/*', serveStatic({ root: './apps/portal/public', rewriteRequestPath: (p) => p.replace(/^\/portal/, '') || '/' }));

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, (info) => {
  console.log(`agntia-marketing api escuchando en :${info.port}`);
});
