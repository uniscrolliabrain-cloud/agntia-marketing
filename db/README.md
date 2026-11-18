# Base de datos

**Estado: VERIFICADO en Postgres 16.15 real** (2026-11-18), sin Docker: se
extrajeron los binarios oficiales de Ubuntu en espacio de usuario y se levantó un
clúster propio. Las cuatro migraciones aplican en un Postgres limpio y
`tests/db/postgres.test.ts` (13 pruebas) cubre RLS fail-closed, aislamiento por
tenant, FK cross-tenant, dedupe de outbox, `SKIP LOCKED` con dos workers,
rollback y el contador compartido de rate limit.

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

`0002` fallaba en un Postgres limpio (`role "anon" does not exist`) porque asumía
un proyecto Supabase; ahora los roles se crean de forma idempotente. `0003`
sustituye la unicidad `(tenant_id, campaign_id, subject_ref)`, que impedía más de
un paso por sujeto en un journey.

`0002_rls.sql` habilita y **fuerza** Row Level Security en todas las tablas con
`tenant_id` y crea la policy `tenant_isolation` contra `app_current_tenant()`.

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
