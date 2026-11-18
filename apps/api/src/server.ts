import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { createRegistry } from '@agntia/adapters';
import { createStore } from '@agntia/core';
import { createApp } from './app';
import { createSupabaseJwtVerifier } from './auth';
import { PgRateLimiter } from './ratelimit-pg';

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

// Con `DATABASE_URL` el rate limit es compartido; sin ella cae a memoria y el
// proceso lo declara, porque el límite efectivo se multiplica por instancia.
let rateLimiter;
if (process.env.DATABASE_URL) {
  const { default: pg } = await import('pg');
  rateLimiter = new PgRateLimiter(new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 }));
} else {
  console.warn('rate_limiter=memory: el límite no se comparte entre instancias');
}

const ackSecret = process.env.HANDOFF_ACK_SECRET;
if (!ackSecret) console.warn('handoff_ack=unsigned: define HANDOFF_ACK_SECRET para firmar ACKs');
else if (ackSecret.length < 16) throw new Error('HANDOFF_ACK_SECRET_too_short');

const app = createApp({ ctx: createStore(), registry: createRegistry(), verifier, ...(rateLimiter ? { rateLimiter } : {}), ...(ackSecret ? { ackSecret } : {}) });
app.use('/portal/*', serveStatic({ root: './apps/portal/public', rewriteRequestPath: (p) => p.replace(/^\/portal/, '') || '/' }));

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, (info) => {
  console.log(`agntia-marketing api escuchando en :${info.port}`);
});
