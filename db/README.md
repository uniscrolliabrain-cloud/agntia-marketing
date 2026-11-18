# Base de datos

**Estado: VERIFICADO en Postgres 16.15 real** (2026-11-18), sin Docker: se
extrajeron los binarios oficiales de Ubuntu en espacio de usuario y se levantó un
clúster propio. Las cinco migraciones aplican en un Postgres limpio y
`tests/db/postgres.test.ts` (13 pruebas) cubre RLS fail-closed, aislamiento por
tenant, FK cross-tenant, dedupe de outbox, `SKIP LOCKED` con dos workers,
rollback y el contador compartido de rate limit. Los ocho hallazgos P1 de la
revisión nativa (`PG-01` … `PG-08`) están corregidos en `0005` y revalidados con
`tests/postgres/native_postgres.py` (38/38) en
`docs/evidence/db-hardening-20261118/`.

Lo que sigue sin verificarse: **el API y el worker no usan Postgres todavía**.
La persistencia real es la campaña pendiente; hoy el dominio corre en memoria y
estas migraciones son la base que debe consumir ese repositorio.

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

`0002` fallaba en un Postgres limpio (`role "anon" does not exist`) porque asumía
un proyecto Supabase; ahora los roles se crean de forma idempotente. `0003`
sustituye la unicidad `(tenant_id, campaign_id, subject_ref)`, que impedía más de
un paso por sujeto en un journey.

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

Cada transacción del API o del worker fija el tenant verificado:

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
