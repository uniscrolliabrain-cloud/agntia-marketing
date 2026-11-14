import { createRemoteJWKSet, jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { MarketingError } from '@agntia/contracts';
import type { VerifiedJwt } from '@agntia/core';

/**
 * MKT-C03: JWT de Supabase verificado en servidor. Se comprueba firma, issuer,
 * audience y tiempos; la membership se consulta aparte. `user_metadata` no es
 * autorización y no se usa para roles ni tenant.
 */
export interface JwtVerifier {
  verify(token: string): Promise<VerifiedJwt>;
}

export interface SupabaseAuthConfig {
  issuer: string;
  audience: string;
  /** URL de JWKS del proyecto Supabase. */
  jwksUrl?: string;
  /** Sólo para tests locales; en producción se usa JWKS asimétrico. */
  hmacSecret?: string;
  requiredRole?: string;
}

export function createSupabaseJwtVerifier(config: SupabaseAuthConfig): JwtVerifier {
  if (!config.issuer.startsWith('https://')) throw new Error('issuer_must_be_https');
  if (!config.jwksUrl && !config.hmacSecret) throw new Error('jwks_or_secret_required');
  if (config.jwksUrl && !config.jwksUrl.startsWith('https://')) throw new Error('jwks_must_be_https');

  const jwks = config.jwksUrl ? createRemoteJWKSet(new URL(config.jwksUrl)) : null;
  const secret = config.hmacSecret ? new TextEncoder().encode(config.hmacSecret) : null;

  return {
    async verify(token: string): Promise<VerifiedJwt> {
      if (!token || token.split('.').length !== 3) throw new MarketingError('AUTH_REQUIRED', 'malformed_token');
      let payload: JWTPayload;
      const options = {
        issuer: config.issuer,
        audience: config.audience,
        clockTolerance: 5,
      } as const;
      try {
        const result = jwks
          ? await jwtVerify(token, jwks, { ...options, algorithms: ['RS256', 'ES256', 'EdDSA'] })
          : await jwtVerify(token, secret as Uint8Array, { ...options, algorithms: ['HS256'] });
        payload = result.payload;
      } catch {
        // No se filtra el motivo exacto del verificador (puede revelar configuración).
        throw new MarketingError('AUTH_REQUIRED', 'token_invalid');
      }

      if (typeof payload.sub !== 'string' || payload.sub.length === 0) throw new MarketingError('AUTH_REQUIRED', 'missing_subject');
      if (config.requiredRole && payload.role !== config.requiredRole) throw new MarketingError('FORBIDDEN', 'role_not_authenticated');
      const tenantId = payload.tenant_id;
      if (typeof tenantId !== 'string' || tenantId.length === 0) throw new MarketingError('AUTH_REQUIRED', 'missing_tenant_claim');
      const exp = payload.exp;
      if (typeof exp !== 'number') throw new MarketingError('AUTH_REQUIRED', 'missing_exp');
      return { sub: payload.sub, tenantId, expiresAt: exp };
    },
  };
}

/** Utilidad sólo para tests: firma un JWT HS256 con claims de Supabase. */
export async function signTestJwt(input: {
  secret: string;
  issuer: string;
  audience: string;
  sub: string;
  tenantId: string;
  role?: string;
  expiresInSeconds?: number;
}): Promise<string> {
  return new SignJWT({ tenant_id: input.tenantId, role: input.role ?? 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(input.sub)
    .setIssuer(input.issuer)
    .setAudience(input.audience)
    .setIssuedAt()
    .setExpirationTime(`${input.expiresInSeconds ?? 3600}s`)
    .sign(new TextEncoder().encode(input.secret));
}
