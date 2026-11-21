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

- `db/migrations/0001_schema.sql` … `0006_admin_flows.sql` aplican en un Postgres
  limpio y están cubiertas por `tests/db/postgres.test.ts` (18 pruebas) y por el
  runner nativo (39/39, `docs/evidence/admin-flows-20261118/`).
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

- **Numeración de migraciones:** empieza en `0007_`. `0001`–`0004` están tomadas,
  `0005_db_hardening.sql` corrige los hallazgos PG-01…PG-08 de la revisión nativa
  (RLS de `tenants`, FK compuestas de `outbound_intents`, auditoría append-only y
  permisos mínimos) y `0006_admin_flows.sql` añade el rol `marketing_admin`, el
  registro `admin_actions` y los triggers que exigen ticket y registro previos.
  No las reescribas: son aditivas e idempotentes.
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
2. `DATABASE_URL=… npx vitest run` en verde, incluidas las 18 pruebas de
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
- Ese flujo ya existe desde `0006`: `marketing_admin` + `admin_actions`, con
  `app.admin_ticket` y `app.admin_actor` fijados en la misma transacción. Si tu
  repositorio necesita purgar auditoría o cambiar membresías, **no añadas grants al
  rol de datos**: usa ese camino (ver `db/README.md`).
- Desde el 2026-11-18 el API ya expone ese camino en
  `POST /v1/marketing/admin/actions` (capacidad `marketing.tenant.admin`, owner
  humano + ticket); la suite `tests/db/admin-api.test.ts` lo ejerce contra
  Postgres real. Si escribes el repositorio de producto, **no dupliques** ese
  camino ni añadas `insert`/`update` a `authenticated`.
- RLS está **forzada**: el owner de la tabla tampoco se libra. Los tests usan
  `set local role authenticated`; el superusuario sí la salta, no lo uses para
  "verificar" aislamiento.
- `policies` se aplican a `select/insert/update/delete`; una función
  `security definer` mal puesta abriría un agujero. Evítalas.
- El clúster de `/tmp` no sobrevive al archivado: no guardes datos que necesites
  entre sesiones.

## 8. Entregable

Un PR con: repositorio Postgres, scheduler persistente, migraciones `0007+`,
pruebas nuevas, `db/README.md` actualizado y el reporte de fase (C19/C22) con SHA
inicial y final, archivos tocados, tests ejecutados y límites que queden abiertos.

## 9. Hallazgo bloqueante: el repositorio Postgres no es «drop-in»

La sección 3.1 pide un repositorio que cumpla «la misma interfaz de dominio» sin
cambiar firmas. **Tal como está escrito, eso no se puede hacer.** No es una
cuestión de esfuerzo, es de forma de la interfaz:

- `Ctx.store` es hoy un objeto **síncrono** (`packages/core/src/store.ts`): arrays
  públicos y un `Map`. El dominio lee y **muta** esos arrays en el sitio, sin
  `await`.
- Hay **121 accesos `ctx.store.*`** repartidos en **9 módulos** (`campaigns.ts` 37,
  `delivery.ts` 22, `consent.ts` 17, `service.ts` 15, `campaigns`/`measurement` 8,
  `authority.ts` 8, `app.ts` 10, `main.ts` 3, `store.ts` 1). Casi todos son
  mutaciones (`intent.state = …`, `ctx.store.receipts.push(…)`).
- `pg` es asíncrono: `pool.query` devuelve una promesa. Un repositorio real no
  puede devolver filas de forma síncrona sin bloquear el event loop (no existe un
  cliente Postgres síncrono en Node que sea aceptable en producción).
- El requisito de `for update skip locked` (§3.1) **exige** control explícito de la
  transacción en el momento del efecto, es decir, `await` en el camino de entrega.

Conclusión: el «mismo interfaz» es incompatible con un driver asíncrono. Hay tres
caminos y ninguno es un repositorio que se enchufa sin tocar firmas:

| Opción | Qué implica | Coste | Riesgo |
|---|---|---|---|
| **A. Migrar el dominio a asíncrono** (recomendada) | `Ctx.store` pasa a devolver promesas; todos los `ctx.store.*` se vuelven `await`; las firmas cambian y las 120 pruebas se actualizan | alto: 9 módulos, 121 accesos, ~120 pruebas | el contrato cambia: hay que justificarlo y hacerlo por fases |
| B. Repositorio asíncrono sólo en los bordes | el API/worker reclaman con SQL y el dominio sigue en memoria | medio | duplica `leaseIntents`/elegibilidad ⇒ deriva silenciosa; el handoff lo prohíbe |
| C. Dejar `MemoryStore` | nada se rompe | nulo | C06-G01/C22-G01 siguen `NOT_VERIFIED` para siempre |

**Recomendación:** opción A por rebanada vertical, no de golpe.

1. Hacer asíncrona sólo la ruta campaña → commit → lease → delivery → receipt, con
   el resto del store todavía en memoria detrás de la misma interfaz.
2. Cerrar las aceptaciones 3 y 4 (reinicio conserva intents y auditoría; aislamiento
   **a través del API** con datos reales) sobre esa rebanada.
3. Extender al resto de colecciones, campaña por campaña, sin cambiar gates hasta
   que cada una tenga su prueba de reinicio.

Nada de esto se ha hecho todavía: no hay código de persistencia en este repo, y por
eso `MKT-C06-G01`, `MKT-C22-G01` y `MKT-C22-G02` siguen en `PARTIAL` /
`NOT_VERIFIED_PRODUCT`. Lo que sí está hecho y no hay que repetir es toda la capa
SQL (`0001`–`0006`), sus pruebas y la evidencia del runner nativo.

### Actualización 2026-11-18: la autorización ya no depende de la memoria

Antes de la rebanada de datos se cerró un hueco que la bloqueaba. El proceso
arrancaba con `createStore()` vacío, así que `resolvePrincipal` no encontraba ni
tenant ni membership y **toda** ruta autenticada respondía `401 tenant_unknown`
por HTTP: la membership que `0005`/`0006` administran en Postgres no se leía.

Ahora `apps/api/src/principals.ts` implementa `PrincipalResolver`: lee `tenants` y
`memberships` como rol `authenticated` con `app.tenant_id` fijado (RLS decide) y
entrega los hechos a `principalFromFacts`, la misma función que usa el dominio.
Sin caché (revocar surte efecto en la petición siguiente), fail-closed (`503`) si
la base no responde y `424` si el login no puede asumir `authenticated`.

Lo verificado: humo por red con el servidor real, dos tenants, `audit.purge` y
`tenant.set-plan` por `marketing_admin`, `operator` rechazado y **repetición tras
reinicio** con `replayed:true / affected:0` y una sola fila por ticket
(`docs/evidence/admin-api-http-20261118/`, 137/137 pruebas, `tsc` exit 0).

Lo que **no** cambia: el estado de producto (campañas, intents, receipts,
audiencias) sigue en `MemoryStore`. La opción A de arriba, paso 1 —campaña →
commit → lease → delivery → receipt en Postgres—, sigue entera, y por eso
`MKT-C06-G01/G02` y `MKT-C22-G01/G02` conservan su estado. La aceptación 4
(aislamiento a través del API con datos reales) queda cubierta para la vía
administrativa y la resolución de principal, no para el camino de entrega.

### Actualización 2026-11-18 (2): la «rebanada» no era separable

Al leer el dominio antes de migrarlo apareció el problema que esta tabla no
anticipaba: `commitCampaign` revalida elegibilidad, frecuencia y supresión
leyendo `contacts` y `contactPolicies`, y `leaseIntents` vuelve a revalidar antes
del efecto. Persistir sólo el outbox y dejar los contactos en memoria habría dado
una persistencia falsa: tras un reinicio la revalidación vería cero contactos y
cancelaría todo. La rebanada arrastra casi todo el agregado.

Etapa 1 ejecutada (ver `docs/evidence/tenant-state-20261118/`): `0007` añade
`tenant_state(tenant_id, version, state jsonb)` y `apps/api/src/state.ts` exporta
el agregado del tenant, lo importa bajo `select … for update`, corre el dominio
síncrono y lo escribe antes de responder. El documento es la verdad; la memoria
es su caché de un turno.

Verificado: una app con store vacío lee la campaña, la compromete, la entrega y
la sigue viendo con un pool y un store nuevos; cada mutación sube la versión una
vez; un efecto rechazado no escribe; el token de otro tenant no ve el estado; y
un servidor HTTP real sirve tras reiniciar lo que escribió el proceso anterior
(142/142 pruebas, `tsc` exit 0).

Lo que sigue abierto y no hay que confundir: `tenant_state` **no** es la ruta
normalizada (reescribe el agregado y serializa al tenant), el claim sigue sin
`for update skip locked` (`MKT-C22-G01`), el worker de demostración sigue en
memoria y si el proceso muere entre el envío y la escritura el intent queda
`queued` con el mensaje ya salido (sin exactly-once). Por eso `MKT-C06-G01/G02`
conservan `PARTIAL`.

### Actualización 2026-11-21: el cerrojo, ejercitado con dos escritores

La etapa 1 afirmaba «un solo escritor por tenant, sin actualizaciones perdidas»,
pero las pruebas medían escrituras secuenciales. Se añadió una prueba con **dos
apps, dos pools y dos stores** —lo más parecido a dos procesos— lanzando dos
briefs en paralelo sobre el mismo tenant: la versión sube exactamente dos veces y
ambos briefs quedan en el documento. PASS, junto con la suite completa (142/142)
re-ejecutada sobre Postgres 18.7 tras restaurar el sandbox, y con los dos jobs de
CI en success sobre `1b93d17` (`docs/evidence/tenant-state-20261118/`).

Sigue abierto lo mismo que antes y no se maquilla: el cerrojo es por tenant, no
por rebanada; el worker de producto no existe sobre Postgres; no hay proveedor
real ni exactly-once. La opción A (dominio asíncrono) sigue siendo el camino para
`MKT-C22-G01`, y sigue siendo un cambio de contrato que conviene hacer por
rebanada vertical y con su propia prueba de reinicio.
