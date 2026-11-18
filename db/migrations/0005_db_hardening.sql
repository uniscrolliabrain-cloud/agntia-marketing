-- MKT-C06/C41 · Hardening de la capa SQL
--
-- Corrige los ocho hallazgos P1 de la revisión nativa en PostgreSQL 16
-- (`docs/evidence/postgres-native-20261118/`, PG-01 … PG-08).
--
-- Es una migración aditiva: 0001–0004 pueden estar ya aplicadas en una base
-- real, así que no se reescriben. Todo es idempotente porque los runners
-- (`npm run db:migrate`, `tests/db/postgres.test.ts`) reaplican la cadena
-- completa en cada arranque.
--
-- Antes de aplicarla sobre datos existentes hay que resolver las referencias
-- huérfanas; las FK nuevas fallan con 23503 y listan las filas culpables en
-- lugar de aceptar un grafo incoherente. Consultas de preflight en db/README.md.

-- PG-01 · El directorio `tenants` no tenía RLS: con `app.tenant_id='A'` se leía
-- también la fila de B, con su nombre y plan. La clave de `tenants` es `id`, no
-- `tenant_id`, así que necesita su propia policy.
alter table tenants enable row level security;
alter table tenants force row level security;

drop policy if exists tenant_isolation on tenants;
create policy tenant_isolation on tenants
  using (id = app_current_tenant())
  with check (id = app_current_tenant());

-- La lectura del propio tenant basta para la aplicación. Provisionar o cambiar
-- el plan es administración (rol propietario / flujo auditado), no una escritura
-- del rol de datos: si no, un tenant podría auto-promocionarse a 'production'.
revoke insert, update, delete on tenants from authenticated;
grant select on tenants to authenticated;

-- PG-02, PG-03, PG-04 · `outbound_intents` sólo tenía FK a `campaigns`. Un
-- intent de A podía apuntar `approval_ref`, `audience_snapshot_id` y
-- `subject_ref` a filas de B porque las columnas eran texto suelto. Las claves
-- pasan a ser compuestas por tenant, igual que el resto del grafo.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'outbound_intents_approval_fk'
      and conrelid = 'outbound_intents'::regclass
  ) then
    alter table outbound_intents
      add constraint outbound_intents_approval_fk
      foreign key (tenant_id, approval_ref) references approvals(tenant_id, approval_ref);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'outbound_intents_audience_snapshot_fk'
      and conrelid = 'outbound_intents'::regclass
  ) then
    alter table outbound_intents
      add constraint outbound_intents_audience_snapshot_fk
      foreign key (tenant_id, audience_snapshot_id) references audience_snapshots(tenant_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'outbound_intents_subject_fk'
      and conrelid = 'outbound_intents'::regclass
  ) then
    alter table outbound_intents
      add constraint outbound_intents_subject_fk
      foreign key (tenant_id, subject_ref) references contacts(tenant_id, id);
  end if;
end $$;

-- PG-05, PG-06 · `audit_log` no era append-only: el GRANT general daba UPDATE y
-- DELETE al rol de datos, así que tanto el API como el worker podían reescribir
-- o borrar historia de su tenant. RLS limita filas; no hace una tabla inmutable.
-- Se queda sólo SELECT + INSERT para `authenticated`. La purga/anonimización
-- legítima (p. ej. una solicitud de privacidad) va por un flujo administrativo
-- auditado, nunca por el rol de datos.
revoke update, delete on audit_log from authenticated;
grant select, insert on audit_log to authenticated;

-- PG-07 · `memberships` era mutable por el rol de datos: un operator podía
-- cambiarse a owner y ampliar sus scopes. La autorización se administra fuera
-- del camino de datos. Se conserva sólo lectura (RLS ya limita a su tenant).
revoke insert, update, delete on memberships from authenticated;
grant select on memberships to authenticated;

-- PG-08 · Insertar auditoría sin suministrar `seq` fallaba con
-- `42501: permission denied for sequence audit_log_seq_seq`: había INSERT en la
-- tabla pero no USAGE en la secuencia del `bigserial`. Se concede únicamente lo
-- necesario para generar el siguiente `seq` (nada de UPDATE en la secuencia).
do $$
declare
  seq text := pg_get_serial_sequence('audit_log', 'seq');
begin
  if seq is null then
    raise exception 'audit_log.seq no tiene secuencia asociada';
  end if;
  execute format('grant usage on sequence %s to authenticated', seq);
end $$;
