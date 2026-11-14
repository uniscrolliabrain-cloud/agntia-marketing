-- MKT-C06 · Row Level Security
-- `app.tenant_id` lo fija el servidor dentro de la transacción:
--   set local app.tenant_id = '<tenant verificado>';
-- Nunca se toma de user_metadata, del cuerpo de la petición ni de un header.

create or replace function app_current_tenant() returns text
language sql stable as $$
  select nullif(current_setting('app.tenant_id', true), '')
$$;

do $$
declare
  t text;
  tables text[] := array[
    'memberships','contacts','twins','briefs','audience_snapshots','creatives','claims',
    'approvals','campaigns','outbound_intents','receipts','connections','observations',
    'conversions','reports','privacy_requests','handoffs','service_events','audit_log',
    'idempotency_keys'
  ];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security', t);
    -- Fuerza RLS también para el owner de la tabla: la policy no se salta por ser dueño.
    execute format('alter table %I force row level security', t);
    execute format('drop policy if exists tenant_isolation on %I', t);
    execute format(
      'create policy tenant_isolation on %I using (tenant_id = app_current_tenant()) with check (tenant_id = app_current_tenant())',
      t
    );
  end loop;
end $$;

-- Nota operativa: service_role y BYPASSRLS no sustituyen a la policy. El worker
-- abre transacción, fija app.tenant_id del mandato verificado y sólo entonces
-- reclama intents con `for update skip locked`.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
