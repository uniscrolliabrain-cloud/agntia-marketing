# Arquitectura objetivo

TypeScript/pnpm/Hono, Zod, Postgres/Supabase RLS, core determinista de audiencias/consentimiento/journeys/presupuestos, outbox/worker/reconciliación, adaptadores opcionales Mautic/Listmonk/Matomo/Plausible/PostHog/GA4/GrowthBook/Ads, SDK y portal Anam. No instalar todos por defecto. Twin vinculado al agente canónico del padre. Operador, tenant cliente y audiencia/contacto no son identidades intercambiables.

`JWT+membership -> Hono -> policy/AuthorityMap -> campaign FSM -> Postgres RLS+audit/outbox -> worker scoped -> provider allowlist -> receipts -> parent bridge`. Publicación y gasto externos deshabilitados por defecto. Atribución no implica causalidad; MMM requiere datos suficientes y supuestos documentados.
