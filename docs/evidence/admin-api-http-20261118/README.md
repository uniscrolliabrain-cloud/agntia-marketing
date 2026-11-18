# Humo HTTP del endpoint administrativo (MKT-C06-G03, segunda pasada)

Fecha: 2026-11-18. Base: `main` en `622d9e0`. Este registro no repite lo que ya
probó `docs/evidence/admin-api-20261118`: aquí se ejerce **el servidor HTTP
real por red** (`apps/api/src/server.ts`), con el tenant y la membership leídos
de **Postgres**, no del store en memoria.

## Qué hueco había

El proceso arrancaba con `createStore()` vacío: `resolvePrincipal` consultaba
`ctx.store.tenants` y `ctx.store.memberships`, así que con `npm run api:dev`
**ningún token pasaba de `401 tenant_unknown`**. La membership que `0005`/`0006`
administran en Postgres no se consultaba nunca desde el API. La suite de
`admin-api.test.ts` no lo veía porque sembraba el `Ctx` a mano y usaba
`app.request` (sin socket).

Cambio de esta pasada: `apps/api/src/principals.ts` añade el puerto asíncrono
`PrincipalResolver`, que lee `tenants` y `memberships` como rol `authenticated`
con `app.tenant_id` fijado (RLS decide) y entrega los hechos a
`principalFromFacts` — la **misma** función de decisión que usa el dominio. Sin
caché: revocar una membership surte efecto en la petición siguiente. Si la base
no responde, el API falla cerrado (`503 principal_lookup_failed`) en vez de
autorizar con datos viejos.

## Verificación ejecutada

Proceso real (`tsx apps/api/src/server.ts`, `PORT=8791`) con `DATABASE_URL`,
verificador JWT HS256 local (`DEV_JWT_SECRET`) y rate limit sobre Postgres.
Dos tenants sembrados (`tenant_smoke_http`, `tenant_smoke_other`), cada uno con
una fila de auditoría vieja y otra reciente.

| Afirmación | Comprobación en `run.log` | Resultado |
|---|---|---|
| El proceso arranca y responde | `GET /healthz` | 200 `{ok:true, policy:policy-2026-11-14.1}` |
| El principal sale de Postgres (no de memoria) | `GET /v1/marketing/me` con token HS256 válido | 200 con `roles:["owner"]`, `capabilities:["marketing.*"]`, `tenantId` del claim |
| Dos tenants conviven | `/me` del segundo tenant | 200 con su propio `actorId`/`tenantId` |
| Primera ejecución del efecto | `POST /v1/marketing/admin/actions` (`tenant.set-plan`) | 200 `affected:1`, `replayed:false`; en la base `tenants.plan = pilot` |
| La purga audita y borra sólo lo vencido | `audit.purge` (365 días) | 200 `affected:1`; desaparece la fila de 400 días, sigue la de hoy |
| Repetir la clave no duplica | mismo `Idempotency-Key`, mismo proceso | 200, mismo `operationId`, una sola fila en `admin_actions` |
| Aislamiento por red | `audit.purge` del segundo tenant | 200 `affected:1` sobre sus filas; las del primer tenant intactas |
| `operator` no administra | `tenant.set-plan` con token `operator` | 403 `role_not_allowed` |
| Tenant ausente en la base | `/me` con `tenant_id` inexistente | 401 `tenant_unknown` |
| **El reinicio no pierde la garantía** | proceso 34702 detenido (puerto libre, `curl` exit 7), arranque nuevo 34778 con la misma clave | 200 `replayed:true`, `affected:0`; sigue habiendo **una** fila por ticket |

Estado final en Postgres (`run.log`, sección «efecto durable»):

```
 tenant_smoke_http  | CHG-HTTP-2026-0001 | audit.purge        | smoke_owner       | 1
 tenant_smoke_http  | CHG-HTTP-2026-0002 | tenant.plan_change | smoke_owner       | 1
 tenant_smoke_other | CHG-HTTP-2026-0004 | audit.purge        | smoke_other_owner | 1
```

Suite y tipos en esta misma pasada: `137/137` con `DATABASE_URL` (6 nuevas de
`tests/db/api-principals.test.ts`) y `npx tsc -p tsconfig.json --noEmit` exit 0.

## Límites que siguen abiertos

- **Sólo la autorización va por Postgres.** Campañas, intents, receipts,
  audiencias y el resto del estado de producto siguen en `MemoryStore`: un
  reinicio los pierde. `MKT-C06-G01/G02` siguen en `PARTIAL` y la opción A del
  §9 del handoff (rebanada campaña → commit → lease → delivery → receipt) sigue
  pendiente. Lo que **sí** queda cerrado es el aislamiento *a través del API con
  datos reales* para la vía administrativa y la resolución de principal.
- **La repetición dentro del mismo proceso la contesta la caché de operaciones
  en memoria** (`payload.replayed` sigue siendo el de la primera respuesta); la
  que se resuelve en Postgres es la repetición tras reinicio, que es la que
  importa. Se ve en la diferencia entre la tanda A y la tanda B de `run.log`.
- **El JWT es HS256 de desarrollo**, no un Supabase real: la firma, issuer y
  audience se verifican con el mismo código, pero el JWKS asimétrico de
  producción no se ejerció aquí.
- **El rol de login del sandbox es `postgres` (superusuario).** Se concedió
  `marketing_admin` y se usó `SET LOCAL ROLE`, pero un superusuario también
  podría saltarse RLS: el aislamiento observado se apoya además en las
  condiciones por `tenant_id` de cada consulta. Un login no privilegiado que sea
  miembro de `authenticated` y `marketing_admin` es la configuración a validar
  en el despliegue.
- **No hay worker, proveedor real, UI ni despliegue** en esta pasada.

## Reproducción

```bash
# 1. base y migraciones
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia_final npm run db:migrate

# 2. dos tenants con membership y auditoría (ver «siembra» en run.log)
# 3. servidor real
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia_final PORT=8791 \
  DEV_JWT_SECRET=<secreto-local> npx tsx apps/api/src/server.ts

# 4. llamadas por red con un JWT HS256 (script de /tmp, no forma parte del repo)
```

El script de humo se ejecutó desde `/tmp` a propósito: no añade dependencias ni
código de producción al repositorio. `run.log` es su salida íntegra.

## Evidencia incluida

- `run.log`: arranque, tanda A, reinicio verificado, tanda B y estado durable.
- `provenance.json`: SHA base, hashes de las fuentes y del test, versión de
  Postgres y límites declarados.
