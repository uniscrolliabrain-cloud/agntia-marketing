# Flujo administrativo auditado — migración `0006`

Fecha: 2026-11-18. Base: `main` en `9cf035b`. Migración nueva:
`db/migrations/0006_admin_flows.sql`. Resultado del runner nativo sobre un clúster
Postgres 16 recién creado: **39 comprobaciones, 39 PASS, 0 FAIL**, exit 0, y
**18/18** en `tests/db/postgres.test.ts` contra Postgres real.

## Qué problema resuelve

`0005` cerró el camino de datos: `authenticated` ya no puede provisionar tenants,
cambiar roles/scopes ni purgar `audit_log`. Eso era correcto, pero dejaba un
hueco operativo real: **no existía ninguna vía** para hacer esas operaciones, ni
auditada ni sin auditar (ver `docs/evidence/db-hardening-20261118/README.md`,
«Límites que siguen abiertos»). `0006` crea esa vía con tres reglas:

1. `authenticated` no gana ningún permiso nuevo: sólo `select` sobre
   `admin_actions` de su propio tenant.
2. Existe un rol propio, `marketing_admin` (`nologin noinherit`), con los grants
   mínimos: `update` en `tenants`, CRUD en `memberships`, `select, insert, delete`
   en `audit_log` y `usage` en su secuencia.
3. `marketing_admin` **no puede escribir sin dejar el registro**: un trigger
   `require_admin_action()` exige que, en la misma transacción, exista una fila de
   `admin_actions` con el mismo `tenant_id`, el mismo `ticket` y el mismo `actor`
   que declara la sesión (`app.admin_ticket`, `app.admin_actor`). Sin ticket o sin
   registro, `42501`.

`admin_actions` no tiene `update` ni `delete` para ningún rol con grants: el
registro no se reescribe ni se borra.

## Cómo se usa

```sql
begin;
select set_config('app.tenant_id', '<tenant verificado>', true);
select set_config('app.admin_ticket', 'CHG-2026-0042', true);
select set_config('app.admin_actor', '<operador autenticado>', true);

insert into admin_actions (tenant_id, id, actor_id, action, ticket, detail)
values ('<tenant>', 'adm_0001', '<operador autenticado>', 'audit.purge', 'CHG-2026-0042',
        '{"retention_days":365}'::jsonb);

delete from audit_log where tenant_id = '<tenant>' and at < now() - interval '365 days';
commit;
```

| Operación | Acción exigida en `admin_actions` |
|---|---|
| `insert`/`update`/`delete` en `memberships` | `membership.%` |
| `update`/`delete` en `tenants` (plan, nombre) | `tenant.%` |
| `delete` en `audit_log` (purga) | `audit.purge` |

## Verificación ejecutada

| Afirmación | Prueba | Resultado |
|---|---|---|
| El rol de datos no purga ni administra | `tests/db/postgres.test.ts` › «el rol de datos no administra» | PASS (42501 en `delete audit_log`, `insert memberships`, `insert admin_actions`) |
| Sin ticket y sin registro no hay purga | ídem › «el rol administrativo no purga sin ticket ni sin acción registrada» | PASS (42501 tres veces; la fila vieja sigue ahí) |
| La purga auditada borra sólo lo vencido | ídem › «la purga auditada borra sólo lo vencido y deja el registro inmutable» | PASS (`purge_target` desaparece, `synthetic_recent` queda, `admin_actions` conserva `audit.purge`) |
| El registro no se reescribe ni se borra | ídem, mismo caso | PASS (42501 en `update`/`delete` de `admin_actions`) |
| La membresía sólo cambia por el camino registrado | ídem › «la membresía cambia sólo por el camino administrativo registrado» | PASS (42501 sin registro; con registro, el rol de datos lo lee pero no lo modifica) |
| Un cambio de plan exige registro | ídem › «un cambio de plan exige acción administrativa registrada» | PASS (42501 sin registro; `pilot` con registro) |
| La cadena sigue aplicándose en limpio y es idempotente | `apply_0006_admin_flows.sql` (PASS) + reaplicación en la misma base (18/18 dos veces) | PASS |
| Aislamiento por tenant en la tabla nueva | `all_tenant_id_tables_isolate_both_roles` — 22 tablas, 2 roles | PASS (0 filas cruzadas) |

Runner nativo completo: `39 / 39` (los 33 checks de comportamiento anteriores +
un `apply_*` por cada una de las seis migraciones). Los ocho hallazgos PG-01…PG-08
siguen en PASS: `0006` no relaja ninguno de los `revoke` de `0005`.

## Límites que quedan abiertos

- **No hay endpoint administrativo en el API.** El flujo está probado en SQL; hoy
  `apps/api` no expone ninguna ruta que abra una sesión `marketing_admin`. Por eso
  el gate nuevo `MKT-C06-G03` queda en `PARTIAL`, no en PASS.
- **La garantía no cubre superusuario ni `BYPASSRLS`**, que ya pueden saltarse RLS.
  El trigger se aplica a `marketing_admin`, que es el rol que se concede a la
  aplicación.
- **La provisión de un tenant (`insert` en `tenants`) no pasa por el trigger**: el
  registro necesita el `tenant_id` y la FK exige que la fila exista. Es un
  bootstrap de plataforma; el registro de la acción se escribe justo después, ya
  con el rol administrativo sobre ese tenant.
- **La purga sigue sin integrarse con solicitudes de privacidad.** `fulfilPrivacyRequest`
  funciona en memoria; cuando la persistencia real aterrice, la supresión y la
  retención tendrán que hablar con `admin_actions`, no con escrituras directas.
- **Ningún worker ni proveedor se ejecutó** en esta pasada.

## Reproducción

```bash
# 1. Suite de base de datos contra Postgres real (18 pruebas)
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia_final npx vitest run tests/db/postgres.test.ts

# 2. Runner nativo sobre un clúster nuevo (39 checks)
MKT_PG_LAB=/tmp/mktlab3 MKT_PG_PORT=55435 MKT_REVIEW_SOURCE="$PWD" \
MKT_REVIEW_SHA="$(git rev-parse HEAD)" python3 tests/postgres/native_postgres.py

# 3. Typecheck
npx tsc -p tsconfig.json --noEmit
```

El clúster de `/tmp` no sobrevive al archivado: hay que recrearlo con `initdb`
antes de cada pasada del runner (`docs/evidence/POSTGRES-REAL.md`).

## Evidencia incluida

- `results.json`: 39 comprobaciones con nombre, estado, alcance y detalle.
- `sql-log.json`: 101 ejecuciones SQL (rol, base, sentencia, exit code, salida).
- `run.log`: salida de la pasada, un JSON por check más los totales.
- `0001…0006 *.log`: aplicación de cada migración.
- `restore.log`, `migration-failure.log`: dump/restore y rollback de DDL.
- `provenance.json`: SHA base, hashes de las fuentes, versión de Postgres y límites.
- `gate-matrix.json`: estado de los gates tras `0006` (ninguno promovido a PASS).
