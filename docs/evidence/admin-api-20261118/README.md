# Endpoint administrativo auditado (MKT-C06-G03)

Fecha: 2026-11-18. Base: `main` en `c77ee69`. Cambio: el API expone
`POST /v1/marketing/admin/actions`, la única vía por la que una petición HTTP
llega al rol `marketing_admin` que abrió `0006`. Verificación: **6/6 pruebas del
archivo nuevo PASS**, `131/131` en la suite completa y `tsc --noEmit` exit 0,
todo contra Postgres 16.15 real.

## Qué problema resuelve

`0006` dejó el flujo administrativo probado en SQL y sin puerta en el API: no se
podía purgar auditoría, cambiar una membresía ni cambiar el plan de un tenant
desde el producto. `MKT-C06-G03` estaba en `PARTIAL` exactamente por eso.

La ruta nueva no reimplementa la garantía: abre una transacción, fija
`app.tenant_id`, `app.admin_ticket` y `app.admin_actor`, **asume el rol
`marketing_admin`**, inserta la fila en `admin_actions` y sólo entonces ejecuta
el efecto. Si el registro no existe el trigger responde `42501`; el API no
concede ninguna escritura que el SQL no permita.

| Capa | Regla |
|---|---|
| JWT | `Authorization: Bearer` verificado (firma, issuer, audience, exp) |
| Membership | `resolvePrincipal`: sin membership no hay principal |
| Capability | `marketing.tenant.admin` (`effect`) |
| Rol | **owner humano**; un `operator` no cambia roles ni el plan |
| Ticket | obligatorio (`^[A-Za-z0-9._:-]{3,64}$`), queda en `admin_actions` |
| Idempotencia | `Idempotency-Key`; el id de la acción se deriva de la clave |
| Aislamiento | `set_config('app.tenant_id', ...)` + RLS forzada (sin `BYPASSRLS`) |

`tenantId` y `actorId` nunca salen del cuerpo: los pone el principal verificado.

## Acciones soportadas

```json
{ "kind": "audit.purge", "ticket": "CHG-2026-0042", "retentionDays": 365 }
{ "kind": "membership.upsert", "ticket": "CHG-2026-0042",
  "membership": { "actorId": "ops_2", "roles": ["reviewer"],
                  "scopes": ["marketing.context.read"], "isHuman": true } }
{ "kind": "tenant.set-plan", "ticket": "CHG-2026-0042", "plan": "pilot" }
```

## Verificación ejecutada

| Afirmación | Prueba (`tests/db/admin-api.test.ts`) | Resultado |
|---|---|---|
| La purga borra sólo lo vencido del propio tenant y deja el registro con el actor del JWT | «purga sólo lo vencido del propio tenant…» | PASS (200; `affected ≥ 1`; fila vieja fuera, reciente dentro; fila del tenant vecino intacta; `admin_actions.actor_id = owner_1`) |
| La membresía y el plan cambian por la vía registrada | «cambia membresía y plan por la vía registrada» | PASS (200; `memberships.roles = {reviewer}`, `tenants.plan = pilot`) |
| Un operator, un viewer o un bot no administran, y no se escribe nada | «rechaza a quien no es owner humano…» | PASS (403 `role_not_allowed` / `effect_requires_human`; 0 filas en `admin_actions`; el plan no cambia) |
| Repetir la clave no duplica ni repite el efecto | «la misma clave de idempotencia…» | PASS (2.ª ejecución `replayed: true`, `affected: 0`, una sola fila; a nivel HTTP, mismo `operationId`) |
| Falla cerrado | «falla cerrado…» | PASS (tenant ausente en Postgres → 404 `tenant_not_found`; ticket inválido → 422) |
| Sin Postgres no se simula | «sin puerto administrativo…» | PASS (424 `admin_persistence_unconfigured`) |

Suite completa con `DATABASE_URL`: **131/131** (antes 125; +6 nuevas).
`npx tsc -p tsconfig.json --noEmit`: exit 0.

## Límites que quedan abiertos

- **La membership se lee del store en memoria**, igual que en el resto del API:
  el endpoint persiste en Postgres pero autoriza con `ctx.store.memberships`.
  Cuando aterrice la persistencia (`0007+`) esa lectura pasa a Postgres; hasta
  entonces `MKT-C06-G01/G02` siguen en `PARTIAL`.
- **El rol de login del API debe ser miembro de `marketing_admin`**
  (`grant marketing_admin to <rol>`). Sin esa concesión la ruta responde
  `424 admin_role_not_granted`; no se cae a escrituras directas.
- **La provisión de tenants sigue fuera de la ruta** (bootstrap de plataforma,
  ver `0006`): aquí sólo se cambia el plan o el nombre de un tenant existente.
- **La purga no está conectada a solicitudes de privacidad**: `fulfilPrivacyRequest`
  sigue en memoria.
- **No se ejecutó ningún worker ni proveedor real** en esta pasada. El gate
  `MKT-C06-G03` pasa a `PASS`; `MKT-C22-G01/G02`, `MKT-C41-G01` no cambian.

## Reproducción

```bash
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia_final npx vitest run tests/db/admin-api.test.ts
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia_final npx vitest run
npx tsc -p tsconfig.json --noEmit
```

## Evidencia incluida

- `run.log`: salida verbose de las 6 pruebas.
- `vitest.json`: resultados en JSON (6 tests, 6 pass, 0 fail).
- `full-suite.log`: la suite completa, 131/131.
- `provenance.json`: SHA base, hashes de las fuentes y versión de Postgres.
