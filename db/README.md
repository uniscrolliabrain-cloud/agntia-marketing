# Base de datos

**Estado: NOT_VERIFIED.** El esquema y las políticas están escritos y revisados
por tests estáticos, pero **no se ha ejecutado Postgres**: en esta máquina no hay
servidor ni Docker daemon disponible. Ningún gate de persistencia real puede
declararse PASS hasta correr ambas migraciones contra Postgres 16.

## Migraciones

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0001_schema.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0002_rls.sql
```

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
