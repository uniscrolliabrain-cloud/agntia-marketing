# Preparación Doppler · `agntia-marketing`

Este documento describe **qué** variables necesita el servicio, en qué ámbito y
con qué rotación. No contiene valores y no se ha creado ningún proyecto Doppler:
crear la config y volcar secretos requiere autorización del founder.

## 1. Configuración que lee el código hoy

| Variable | Ámbito | Obligatoria | Consumidor | Uso | Rotación |
|---|---|---|---|---|---|
| `SUPABASE_URL` | servicio | Sí en staging/prod | `apps/api/src/auth.ts` | Emisor JWKS de Supabase | 180 días |
| `SUPABASE_JWT_AUDIENCE` | servicio | Sí en staging/prod | `apps/api/src/auth.ts` | Audiencia esperada (`authenticated`) | 180 días |
| `DEV_JWT_SECRET` | servicio | Sólo `dev` | `apps/api/src/auth.ts` | HS256 de desarrollo y tests | 90 días |
| `PORT` | servicio | No (8787) | `apps/api/src/server.ts` | Puerto HTTP | — |
| `NODE_ENV` | servicio | No | `apps/api/src/app.ts` | Modo de ejecución | — |
| `RATE_LIMIT_PER_MINUTE` | servicio | No (120) | `apps/api/src/app.ts` | Tope de mutaciones por tenant | — |
| `DATABASE_URL` | servicio | Recomendada | `apps/api/src/server.ts` | Postgres: rate limit compartido y futura persistencia | 180 días |
| `HANDOFF_ACK_SECRET` | servicio | Sí en staging/prod | `apps/api/src/server.ts` | HMAC de ACKs de handoff (mín. 16 chars) | 90 días |

Reglas duras: `DEV_JWT_SECRET` **nunca** se define en `stg`/`prd`, y sin
`HANDOFF_ACK_SECRET` los ACK de handoff salen sin firma (el servicio lo avisa al
arrancar y la verificación devuelve `503 ack_signing_unconfigured`). Sin
`DATABASE_URL` el rate limit es por proceso y también se avisa por consola.

## 2. Variables previstas para cuando exista proveedor real

Se declaran ahora para que Doppler tenga el mapa completo; hoy no las lee nadie
porque los adaptadores están en `disabled`.

| Variable | Ámbito | Entorno | Estado |
|---|---|---|---|
| `MAUTIC_BASE_URL`, `MAUTIC_CLIENT_ID`, `MAUTIC_CLIENT_SECRET` | conexión | stg/prd | Stub |
| `LISTMONK_BASE_URL`, `LISTMONK_API_USER`, `LISTMONK_API_TOKEN` | conexión | stg/prd | Stub |
| `MATOMO_BASE_URL`, `MATOMO_TOKEN` | conexión | stg/prd | Stub |
| `PLAUSIBLE_API_KEY`, `POSTHOG_API_KEY` | conexión | stg/prd | Stub |
| `GA4_SERVICE_ACCOUNT_JSON`, `GSC_SERVICE_ACCOUNT_JSON` | conexión | stg/prd | Stub (JSON secreto) |
| `GROWTHBOOK_API_HOST`, `GROWTHBOOK_CLIENT_KEY` | servicio | stg/prd | Stub |
| `META_ADS_TOKEN`, `GOOGLE_ADS_*` | conexión | `prd-test-account` | Stub, techo 50 EUR/día |
| `ANAM_API_KEY` | servicio | stg/prd | Stub |

Cada credencial de proveedor es **por conexión y por tenant**, no global: el
modelo guarda referencias (`connectionRef`) y el valor vive en el gestor, nunca
en la base de datos del producto ni en el repositorio.

## 3. Estructura propuesta en Doppler

```yaml
# doppler.yaml (propuesta, no creada)
setup:
  - project: agntia-marketing
    config: dev
  - project: agntia-marketing
    config: stg
  - project: agntia-marketing
    config: prd
```

- **Proyecto:** `agntia-marketing` (uno; separación por config, no por proyecto).
- **Configs:** `dev`, `stg`, `prd`, más `prd-test-account` si se autoriza el
  sandbox de ads.
- **Precedencia:** `prd` > rama (`prd_pr_*`) > local. El founder es el único
  owner de `prd`; los agentes sólo tienen lectura en `dev`.

## 4. Arranque seguro

```bash
doppler run --config dev -- npm run api:dev
doppler run --config stg -- npm run api:dev
```

Nunca `doppler secrets download --no-file` hacia el repo. `.env*` está ignorado
por Git; `.env.example` sólo enumera nombres.

## 5. Rotación y respuesta a incidente

1. Rotación programada: `DEV_JWT_SECRET` cada 90 días; proveedores cada 180 días;
   ante sospecha, inmediata.
2. Rotar en Doppler y reiniciar el servicio: el proceso lee al arrancar, no
   recarga en caliente.
3. Invalidar sesiones: revocar el JWT del proyecto Supabase o retirar la
   membership del actor.
4. Revocar la conexión afectada (`marketing.connection.admin`) y dejar el
   adaptador en `disabled` hasta revalidar capacidades.
5. Registrar el incidente en audit; no se borran receipts ni intents.

## 6. Permisos y CI

- Personas: owner (founder) con escritura en `prd`; operadores con lectura en
  `prd` y escritura en `stg`; agentes sólo `dev`.
- CI: service token de **sólo lectura** para `dev`; los tests no necesitan
  secretos reales porque usan HS256 de test.
- Logs: nunca se imprime el valor; el error es `AUTH_REQUIRED` sin detalle.

## 7. Lo que falta para activar Doppler

1. Decisión del founder sobre nombres de proyecto y configs.
2. Crear proyecto y configs (acción humana, no del agente).
3. Cargar `SUPABASE_URL` y audiencia de staging.
4. Sustituir el store en memoria por Postgres cuando exista instancia real.
