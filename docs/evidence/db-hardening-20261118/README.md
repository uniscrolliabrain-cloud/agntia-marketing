# Hardening de la capa SQL — corrección de PG-01 … PG-08

Fecha: 2026-11-18. Base: `eb421fa` (`main`) más esta rama de trabajo. Migración
nueva: `db/migrations/0005_db_hardening.sql`. Resultado del runner nativo sobre un
clúster Postgres 16 recién creado: **38 comprobaciones, 38 PASS, 0 FAIL**, exit 0.

La revisión original (`docs/evidence/postgres-native-20261118/`) reprodujo ocho
fallos P1 sobre `1a848a4`. Este informe documenta su corrección y la revalidación;
no reescribe los resultados históricos de aquella revisión.

## Qué se ejecutó

- Clúster nuevo (`initdb`), socket Unix privado `0700`, `listen_addresses=''`,
  `fsync=on`, puerto 55434. Sin Docker, sin instalación global, datos sintéticos.
- Cadena **completa** de migraciones `0001` … `0005` aplicada con
  `--single-transaction`; `apply_0005_db_hardening.sql` PASS.
- `tests/postgres/native_postgres.py` con `MKT_REVIEW_SOURCE` apuntando a este
  árbol. 38 checks: los 33 checks de comportamiento de la revisión original más
  un `apply_*` por cada una de las cinco migraciones.
- `tests/db/postgres.test.ts` (13 pruebas) contra Postgres real: PASS, incluida la
  reaplicación de `0005` (idempotente).
- `npx tsc -p tsconfig.json --noEmit`: exit 0.

## Corrección por hallazgo

| Hallazgo | Corrección en `0005` | Check que lo prueba | Estado |
|---|---|---|---|
| PG-01 `tenants` visible entre tenants | RLS forzada con policy `id = app_current_tenant()`; `select` para `authenticated`, sin escrituras | `tenant_directory_does_not_reveal_other_tenant` | PASS |
| PG-02 `approval_ref` sin FK | FK `(tenant_id, approval_ref) → approvals` | `intent_approval_fk_rejects_cross_tenant` | PASS (23503) |
| PG-03 `audience_snapshot_id` sin FK | FK `(tenant_id, audience_snapshot_id) → audience_snapshots` | `intent_snapshot_fk_rejects_cross_tenant` | PASS (23503) |
| PG-04 `subject_ref` sin FK | FK `(tenant_id, subject_ref) → contacts` | `intent_subject_fk_rejects_cross_tenant` | PASS (23503) |
| PG-05 auditoría reescribible | `revoke update` en `audit_log` | `audit_log_cannot_be_updated_by_application_role` | PASS (42501) |
| PG-06 auditoría borrable por el worker | `revoke delete` en `audit_log` | `audit_log_cannot_be_deleted_by_worker_role` | PASS (42501) |
| PG-07 escalada de `memberships` | `revoke insert, update, delete`; sólo lectura | `membership_role_cannot_be_self_escalated_by_data_role` | PASS (42501) |
| PG-08 INSERT de auditoría sin permiso de secuencia | `grant usage on sequence audit_log_seq_seq` | `application_can_append_audit_with_generated_sequence` | PASS |

Las FK nuevas se crean de forma idempotente (guardadas por `pg_constraint`), así
que reaplicar la cadena no falla. Sobre datos existentes fallan con `23503` y
listan las filas incoherentes; el preflight está en `db/README.md`.

## Efecto en los gates

| Gate | Antes | Ahora |
|---|---|---|
| MKT-C06-G01 | FAIL_DB_PART | **PARTIAL**: las cuatro referencias del grafo rechazan cruces de tenant; el camino API→Postgres sigue ausente. |
| MKT-C06-G02 | PARTIAL | PARTIAL sin cambio: rollback SQL y DDL transaccional probados; falta el adaptador de producto. |
| MKT-C22-G01/G02 | NOT_VERIFIED_PRODUCT | Sin cambio: `SKIP LOCKED` pasa como espécimen SQL, no hay worker PG de producto. |
| MKT-C41-G01 | NOT_VERIFIED | Sin cambio: requiere proveedor y ACK reales. |
| MKT-C41-G02 | PARTIAL | PARTIAL sin cambio: dump/restore pasa; falta el protocolo de arranque/reconciliación del worker. |

No se promovió ningún gate a PASS y no se ejecutó ningún worker de producto.

## Límites que siguen abiertos

- `packages/core/src/store.ts` sigue sirviendo `MemoryStore` en `apps/worker/src/main.ts`:
  el SQL está endurecido, la persistencia de producto sigue siendo la campaña
  pendiente (`FreeBuff/HANDOFF-PERSISTENCIA-Y-SCHEDULER.md`, ahora desde `0006`).
- `subject_ref` se modela como contacto del tenant. Si en el futuro se admite un
  sujeto sin contacto, hará falta otra tabla con la misma integridad; no se ha
  inventado esa representación aquí.
- `audit_log` es append-only para el rol de datos, no contra superusuario ni
  `BYPASSRLS`. La prueba usó roles sin esos privilegios.
- La purga administrativa de auditoría (solicitudes de privacidad) no está
  implementada: hoy el rol de datos no puede hacerla y no se ha creado un flujo
  privilegiado, auditado y probado para ello.

## Reproducción

```bash
export MKT_PG_LAB=/tmp/pg-lab MKT_PG_PORT=55432 MKT_REVIEW_SOURCE="$PWD"
python3 tests/postgres/native_postgres.py   # exit 0, 38/38
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia npx vitest run
npx tsc -p tsconfig.json --noEmit
```

`MKT_REVIEW_SHA` debe pasarse explícitamente; el runner ya no atribuye resultados
a un SHA fijo. Los logs SQL individuales están consolidados en `sql-log.json`
(99 ejecuciones), sin datos reales.

## Evidencia incluida

- `results.json`: 38 comprobaciones con nombre, estado y alcance.
- `sql-log.json`: 99 ejecuciones SQL (rol, base, SQL, exit code, stdout/stderr).
- `run.log`: salida completa de la pasada.
- `0001…0005 *.log`: aplicación de cada migración.
- `provenance.json`: SHA base, hashes de fuentes, versión de Postgres y límites.
- `gate-matrix.json`: estado de los seis gates tras la corrección.

## Actualización · 2026-11-18

Este informe describe la pasada de `0005` y se conserva tal cual. Dos cosas han
cambiado después y no invalidan ninguno de sus resultados:

1. **El commit ya está en `main`.** `9cf035b` se empujó y se mergeó en `main` por
   fast-forward; `verify` y `database` pasaron en GitHub Actions sobre ese SHA.
   Ver `docs/evidence/merge-20261118/`.
2. **La purga administrativa ya existe.** El último límite abierto de este
   informe («no se ha creado un flujo privilegiado, auditado y probado») queda
   resuelto por `db/migrations/0006_admin_flows.sql`: rol `marketing_admin`,
   registro append-only `admin_actions` y triggers que exigen ticket y registro
   previos. Ver `docs/evidence/admin-flows-20261118/` (39/39 en el runner
   nativo, 18/18 en `tests/db/postgres.test.ts`). Los `revoke` de `0005` no se
   relajaron: `authenticated` sigue sin poder purgar ni administrar.
