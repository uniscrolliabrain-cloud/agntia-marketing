# Base de datos

**Estado: VERIFICADO en Postgres 16.15 real** (2026-11-18), sin Docker: se
extrajeron los binarios oficiales de Ubuntu en espacio de usuario y se levantó un
clúster propio. Las siete migraciones (`0001`–`0007`) aplican en un Postgres limpio y
`tests/db/postgres.test.ts` (13 pruebas) cubre RLS fail-closed, aislamiento por
tenant, FK cross-tenant, dedupe de outbox, `SKIP LOCKED` con dos workers,
rollback y el contador compartido de rate limit. Los ocho hallazgos P1 de la
revisión nativa (`PG-01` … `PG-08`) están corregidos en `0005` y revalidados con
`tests/postgres/native_postgres.py` (38/38) en
`docs/evidence/db-hardening-20261118/`.

**Actualización 2026-11-21.** El API ya usa Postgres: autoriza leyendo `tenants` y
`memberships`, guarda el agregado del tenant en `tenant_state` (`0007`) y el worker
de outbox entrega como proceso propio por la ruta interna, con exclusión por
cerrojo de tenant (`docs/evidence/worker-pg-20261121/`). Lo que sigue sin
verificarse es la **ruta normalizada**: `campaigns`, `outbound_intents` y
`receipts` existen y su `SKIP LOCKED` está probado en SQL, pero el producto no los
consume todavía — el estado vive en un documento JSONB por tenant, que serializa
al tenant entero. El worker tampoco habla con la base: entrega por HTTP.

Las operaciones que `0005` cerró al rol de datos —purga de auditoría, cambio de
membresías y de plan— tienen desde `0006` una vía propia y auditada
(`marketing_admin` + `admin_actions`), probada en `tests/db/postgres.test.ts`
(18 pruebas) y en el runner nativo (39/39,
`docs/evidence/admin-flows-20261118/`). El API la expone en
`POST /v1/marketing/admin/actions` desde el 2026-11-18; la verificación de esa
ruta está en `docs/evidence/admin-api-20261118/`.

## Migraciones

```bash
npm run db:migrate        # aplica db/migrations/*.sql en orden
```

| Migración | Contenido |
|---|---|
| `0001_schema.sql` | Tablas con `tenant_id` y claves compuestas |
| `0002_rls.sql` | RLS forzada + policy `tenant_isolation`; crea `anon`/`authenticated` si faltan |
| `0003_intent_scheduling.sql` | `journey_step_id`, `scheduled_for`, dedupe por paso e índice de vencimientos |
| `0004_rate_limit.sql` | `rate_limit_counters` + `consume_rate_limit(text,int,timestamptz)` |
| `0005_db_hardening.sql` | RLS en `tenants`, FK compuestas de `outbound_intents`, auditoría append-only y permisos mínimos |
| `0006_admin_flows.sql` | Rol `marketing_admin`, registro `admin_actions` y triggers que exigen ticket y registro previos |
| `0007_tenant_state.sql` | Documento de estado por tenant (`tenant_state`) con versión, RLS forzada y un escritor por tenant |

`0002` fallaba en un Postgres limpio (`role "anon" does not exist`) porque asumía
un proyecto Supabase; ahora los roles se crean de forma idempotente. `0003`
sustituye la unicidad `(tenant_id, campaign_id, subject_ref)`, que impedía más de
un paso por sujeto en un journey.

`0007` es **etapa intermedia**, no el destino: el dominio sigue siendo síncrono
sobre `MemoryStore`, así que `tenant_state` guarda el agregado del tenant como
documento JSONB y el borde del API lo carga bajo `select … for update`, deja
correr el dominio y lo escribe antes de responder (un escritor por tenant, sin
actualizaciones perdidas). Las tablas normalizadas de `0001` son el destino
cuando la rebanada asíncrona escriba `campaigns`, `outbound_intents` y
`receipts` con `for update skip locked`; hasta entonces el claim no está
verificado como cola SQL (`MKT-C22-G01`). Pruebas y límites en
`docs/evidence/tenant-state-20261118/`.

`0002_rls.sql` habilita y **fuerza** Row Level Security en todas las tablas con
`tenant_id` y crea la policy `tenant_isolation` contra `app_current_tenant()`.

## Permisos por rol (`0005`)

RLS limita **filas**; los `GRANT` limitan **operaciones**. Hacen falta los dos.

| Tabla | `authenticated` | Motivo |
|---|---|---|
| `tenants` | `select` | La policy compara `id = app_current_tenant()`; provisionar o cambiar de plan es administración. |
| `memberships` | `select` | Evita que un `operator` se auto-promocione a `owner` o amplíe scopes. |
| `audit_log` | `select`, `insert` | Append-only: `update`/`delete` revocados. La purga legítima va por un flujo administrativo auditado. |
| `outbound_intents` | sin cambio | `subject_ref`, `approval_ref` y `audience_snapshot_id` son FK compuestas por tenant. |

El INSERT de auditoría recibe `usage` sobre `audit_log_seq_seq` (y sólo eso), así
que generar el siguiente `seq` no requiere privilegios de tabla adicionales.

## Flujo administrativo (`0006`)

Lo que `0005` le quitó al rol de datos no se hace con escrituras directas: se hace
con un rol aparte, `marketing_admin`, y **dejando registro**.

```sql
begin;
select set_config('app.tenant_id', '<tenant verificado>', true);
select set_config('app.admin_ticket', 'CHG-2026-0042', true);
select set_config('app.admin_actor', '<operador autenticado>', true);

insert into admin_actions (tenant_id, id, actor_id, action, ticket, detail)
values ('<tenant>', 'adm_0001', '<operador autenticado>', 'audit.purge',
        'CHG-2026-0042', '{"retention_days":365}'::jsonb);

delete from audit_log where tenant_id = '<tenant>' and at < now() - interval '365 days';
commit;
```

| Operación | Acción exigida en `admin_actions` |
|---|---|
| `insert`/`update`/`delete` en `memberships` | `membership.%` |
| `update`/`delete` en `tenants` (plan, nombre) | `tenant.%` |
| `delete` en `audit_log` (purga) | `audit.purge` |

Sin `app.admin_ticket`/`app.admin_actor`, o sin la fila correspondiente en
`admin_actions`, el trigger responde `42501`. `admin_actions` no tiene `update` ni
`delete` para ningún rol con grants: el registro no se reescribe. La garantía
cubre los roles que se conceden a la aplicación, no a un superusuario ni a
`BYPASSRLS`, que ya pueden saltarse RLS.

La **provisión** de un tenant (`insert` en `tenants`) queda fuera del trigger a
propósito: la fila aún no existe y el registro la referencia por FK. Es un
bootstrap de plataforma; la acción se registra justo después, ya sobre el tenant
nuevo.

### Endpoint administrativo

`POST /v1/marketing/admin/actions` (capacidad `marketing.tenant.admin`) es el
único camino del API hacia `marketing_admin`. Exige **owner humano** y un ticket;
el `tenantId` y el `actorId` salen del JWT verificado y de la membership de
servidor, nunca del cuerpo.

```json
{ "kind": "audit.purge", "ticket": "CHG-2026-0042", "retentionDays": 365 }
```

```json
{
  "kind": "membership.upsert",
  "ticket": "CHG-2026-0042",
  "membership": { "actorId": "ops_2", "roles": ["reviewer"], "scopes": ["marketing.context.read"], "isHuman": true }
}
```

```json
{ "kind": "tenant.set-plan", "ticket": "CHG-2026-0042", "plan": "pilot" }
```

Requiere `Idempotency-Key`: el identificador de la acción se deriva de esa clave,
así que repetir la petición no duplica el registro ni vuelve a aplicar el efecto.
Sin `DATABASE_URL` la ruta responde `424 admin_persistence_unconfigured`: no se
simula en memoria. Si el tenant no existe en Postgres, la FK de `admin_actions`
lo rechaza con `23503` y el API responde `404`.

El rol de login del API debe poder asumir `marketing_admin`; sin esa concesión la
ruta responde `424 admin_role_not_granted`:

```sql
grant marketing_admin to <rol_de_login_del_api>;
```

### Autorización: tenant y membership desde Postgres

Desde el 2026-11-18 el API no deriva el principal del store en memoria. Con
`DATABASE_URL` (`apps/api/src/principals.ts`) lee `tenants` y `memberships`
**como rol `authenticated`**, fijando `app.tenant_id` con el tenant del JWT
verificado, así que la policy RLS decide. Los hechos (¿existe el tenant? ¿qué
membership tiene el actor?) se entregan a `principalFromFacts`, la misma función
de decisión que usa el dominio: no hay una segunda regla de autorización.

- **Sin caché**: revocar una membership en la base surte efecto en la petición
  siguiente.
- **Falla cerrado**: si la base no responde, `503 principal_lookup_failed`; no se
  autoriza con datos viejos.
- **Rol de login**: debe poder asumir `authenticated`
  (`grant authenticated to <rol>`). Si no puede, `424 principal_role_not_assumable`.
- Valores que el dominio no conoce se descartan: un rol inventado o un scope que
  no es una capacidad válida terminan en `403`, nunca en un permiso concedido.
- Sin `DATABASE_URL` el proceso avisa `principals=memory` y el store arranca
  vacío: no hay ruta autenticada que fingir.

Lo que sigue en memoria es el **estado de producto** (campañas, intents,
receipts, audiencias): un reinicio lo pierde. Ver
`docs/evidence/admin-api-http-20261118/` para el humo por red y sus límites.

**Antes de aplicar `0005` sobre datos existentes** hay que resolver las
referencias huérfanas; si no, la FK falla (correctamente) con `23503`:

```sql
select 'approval', i.tenant_id, i.id, i.approval_ref
  from outbound_intents i
  left join approvals a on a.tenant_id = i.tenant_id and a.approval_ref = i.approval_ref
 where a.approval_ref is null
union all
select 'snapshot', i.tenant_id, i.id, i.audience_snapshot_id
  from outbound_intents i
  left join audience_snapshots s on s.tenant_id = i.tenant_id and s.id = i.audience_snapshot_id
 where s.id is null
union all
select 'subject', i.tenant_id, i.id, i.subject_ref
  from outbound_intents i
  left join contacts c on c.tenant_id = i.tenant_id and c.id = i.subject_ref
 where c.id is null;
```

## Contrato de sesión

Cada transacción del API fija el tenant verificado (el worker no abre
transacciones: entrega por la ruta interna del API, que es quien fija el tenant):

```sql
begin;
set local app.tenant_id = 'tenant_a';
-- consultas...
commit;
```

`app.tenant_id` **nunca** se toma de un header, del cuerpo de la petición, de
`user_metadata` ni de un valor escrito por el modelo. Service role y
`BYPASSRLS` no sustituyen la policy: si se usan, siguen fijando el tenant.

## Rollback

Las migraciones son **forward-only** con rollback operativo, no borrado:

- El código se despliega con un flag de capacidad; desactivar el flag detiene
  nuevos efectos sin tocar datos.
- Para revertir un esquema: restaurar un snapshot verificado y reaplicar las
  supresiones (`contacts.suppressed`) desde el audit log. Nunca se borran
  `audit_log`, `service_events`, `receipts` ni `outbound_intents` para "simular"
  una reversión.
- `pause`/`cancel` no deshacen mensajes ya entregados ni costes remotos tardíos.

## Índices que sostienen invariantes

| Índice | Invariante |
|---|---|
| `outbound_intents (tenant_id, campaign_id, subject_ref)` | un envío lógico por campaña y sujeto |
| `outbound_intents (tenant_id, operation_key)` | idempotencia de entrega |
| `receipts (tenant_id, provider, remote_id)` | un receipt por efecto remoto |
| `conversions (tenant_id, source_id, dedup_key)` | dedup durable de conversiones |
| `idempotency_keys (tenant_id, capability, idempotency_key)` | replay de operaciones |
