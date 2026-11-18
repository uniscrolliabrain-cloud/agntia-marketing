# Handoff · Persistencia real y scheduler de journeys

**Para:** el agente que toma la campaña de persistencia en `agntia-marketing`.
**Estado de partida:** `main` con las 42 campañas implementadas, 120 pruebas en
verde y Postgres 16.15 **ya verificado en SQL**. Lo que falta es que el dominio
use la base en vez del store en memoria.

## 1. Objetivo

Sustituir el `MemoryStore` por un repositorio Postgres detrás de la **misma
interfaz de dominio**, sin cambiar contratos HTTP ni el comportamiento que ya
cubren las pruebas. Después, mover el scheduler de journeys a la base y la
aprobación de journey de "revisión completa" a "por paso".

No es un MVP ni un rediseño: es conectar lo que ya existe y está probado.

## 2. Qué ya está hecho (no lo rehagas)

- `db/migrations/0001_schema.sql` … `0004_rate_limit.sql` aplican en un Postgres
  limpio y están cubiertas por `tests/db/postgres.test.ts` (13 pruebas).
- RLS **forzada** en las 21 tablas con `tenant_id`, policy `tenant_isolation`
  contra `app_current_tenant()`, y contrato de sesión `set local app.tenant_id`.
- Outbox con `journey_step_id`, `scheduled_for`, índice parcial de vencimientos,
  dedupe `(tenant_id, operation_key)` y unicidad por paso.
- `for update skip locked` probado con dos workers concurrentes.
- Rate limit compartido (`rate_limit_counters` + `consume_rate_limit`) y
  `RateLimiter` enchufable ya en `apps/api`.
- Cliente `pg` ya instalado como devDependency y `npm run db:migrate` operativo.

## 3. Qué tienes que construir

### 3.1 Repositorio

- Implementa un repositorio Postgres que cumpla la interfaz que hoy expone
  `Ctx.store` (`packages/core/src/store.ts`). No cambies las firmas del dominio;
  si necesitas algo nuevo, añádelo como método y documenta el motivo.
- Cada operación de escritura abre transacción, fija el tenant verificado con
  `set local app.tenant_id = $1` y **nunca** confía en un `tenantId` del body.
- El worker reclama con:
  ```sql
  select id from outbound_intents
  where tenant_id = $1 and state = 'queued' and scheduled_for <= now()
  order by created_at, id
  for update skip locked limit $2
  ```
- Idempotencia: `idempotency_keys` con `(tenant_id, capability, idempotency_key)`
  como clave; un replay devuelve el mismo `operationId` y el mismo envelope.
- Las lecturas del portal y del SDK también pasan por RLS; no hay consultas
  "de servicio" que salten la policy.

### 3.2 Scheduler

- Un job (proceso aparte o el worker existente) que:
  1. selecciona journeys activos cuyo siguiente paso venció,
  2. revalida aprobación vigente, elegibilidad y frecuencia **antes** de entregar
     (ya existe esa lógica en `leaseIntents`; reutilízala, no la dupliques),
  3. deja rastro en `audit_log` por tenant.
- Reentrada: `reentry: never` y `after_days` deben resolverse con datos, no con
  memoria del proceso. Hoy `journeyEnrollments` vive en el store.

### 3.3 Aprobación por paso (C19)

- Hoy una aprobación cubre la revisión completa del journey. La especificación
  pide aprobación por paso.
- Propuesta: `approvals` ya tiene `revision_hash` y `audience_max_hash`; añade
  `journey_step_id` (nullable) en una migración nueva y exige, al entregar un
  paso de journey, una aprobación con ese `journey_step_id` y la revisión del
  paso. Mantén la aprobación de journey como paraguas si el founder prefiere no
  duplicar decisiones.

## 4. Reglas del repo que no debes romper

- **Numeración de migraciones:** empieza en `0006_`. `0001`–`0004` están tomadas y
  `0005_db_hardening.sql` corrige los hallazgos PG-01…PG-08 de la revisión nativa
  (RLS de `tenants`, FK compuestas de `outbound_intents`, auditoría append-only y
  permisos mínimos). No la reescribas: es aditiva e idempotente.
- **No toques** `packages/core/src/store.ts` en su interfaz pública, ni los
  contratos de `packages/contracts`, ni `apps/api/src/app.ts` salvo lo mínimo para
  inyectar el repositorio.
- **No cambies** los tests existentes para que pasen: si una prueba falla, es un
  fallo real (o el contrato cambió y hay que justificarlo).
- **Deny-by-default:** sin tenant en sesión no se lee nada; un recurso de otro
  tenant responde `NOT_FOUND`, nunca `FORBIDDEN` con detalles.
- **Nada de secretos** en código, logs ni migraciones. `DATABASE_URL` viene del
  entorno.
- **No despliegues ni publiques**: commit en rama y PR, merge a `main` lo decide
  el founder.

## 5. Criterios de aceptación

1. `npx tsc -p tsconfig.json --noEmit` limpio.
2. `DATABASE_URL=… npx vitest run` en verde, incluidas las 13 pruebas de
   `tests/db/postgres.test.ts` y sin regresiones en las 107 restantes.
3. Un test nuevo que arranque el API con el repositorio Postgres, haga un ciclo
   campaña → commit → lease → delivery sandbox y compruebe que un reinicio del
   proceso conserva intents y auditoría.
4. Un test nuevo de aislamiento **a través del API**: token de A no ve ni escribe
   nada de B con datos reales en la base.
5. Un test nuevo de jornada programada: paso 1 entregado, paso 2 en el futuro no
   se reclama, y una baja entre ambos cancela el paso 2 (`approval_expired` o
   `ineligible`) también con datos persistidos.
6. `db/README.md` y el reporte de la campaña actualizados con lo que **realmente**
   se ejecutó, distinguiendo `PASS` de `NOT_VERIFIED`.

## 6. Cómo levantar Postgres en este entorno

Está documentado paso a paso en `docs/evidence/POSTGRES-REAL.md`: binarios de
Ubuntu extraídos con `dpkg-deb -x` (no hay Docker ni `sudo`), `initdb` en
`/tmp/pgdata`, puerto `55432`, `npm run db:migrate`. Recuerda
`LD_LIBRARY_PATH=/tmp/pg/usr/lib/x86_64-linux-gnu` para `initdb`/`psql`.

En CI ya existe el job `database` con `postgres:16` como servicio y
`DATABASE_URL` definida; las pruebas se saltan solas si la variable falta, así que
un verde local sin `DATABASE_URL` **no** prueba persistencia.

## 7. Riesgos y trampas conocidas

- `create unique index … coalesce(journey_step_id, '')` es deliberado: sin el
  `coalesce`, dos intents de campaña (paso `NULL`) no colisionarían y se
  duplicarían.
- `set local` fuera de transacción no persiste: cada operación necesita su
  `begin`/`commit`, también las lecturas.
- Después de `0005`, el rol `authenticated` **sólo lee** `tenants` y `memberships`:
  provisionar tenants o cambiar roles/scopes es un flujo administrativo separado y
  auditado, no una escritura del repositorio. `audit_log` es append-only (sin
  `update`/`delete`), pero el INSERT normal funciona porque la secuencia tiene
  `usage`; no hace falta suministrar `seq`.
- RLS está **forzada**: el owner de la tabla tampoco se libra. Los tests usan
  `set local role authenticated`; el superusuario sí la salta, no lo uses para
  "verificar" aislamiento.
- `policies` se aplican a `select/insert/update/delete`; una función
  `security definer` mal puesta abriría un agujero. Evítalas.
- El clúster de `/tmp` no sobrevive al archivado: no guardes datos que necesites
  entre sesiones.

## 8. Entregable

Un PR con: repositorio Postgres, scheduler persistente, migraciones `0005+`,
pruebas nuevas, `db/README.md` actualizado y el reporte de fase (C19/C22) con SHA
inicial y final, archivos tocados, tests ejecutados y límites que queden abiertos.
