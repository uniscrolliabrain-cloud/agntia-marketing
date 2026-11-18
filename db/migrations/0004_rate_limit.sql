-- MKT-C38 · Contador de rate limit compartido entre instancias
--
-- El límite en memoria se multiplica por el número de procesos. Este contador
-- vive en la base y se consume en la misma transacción que fija el tenant, de
-- modo que dos instancias del API comparten la ventana.

create table if not exists rate_limit_counters (
  tenant_id text not null references tenants(id) on delete cascade,
  window_start timestamptz not null,
  used integer not null default 0 check (used >= 0),
  primary key (tenant_id, window_start)
);

alter table rate_limit_counters enable row level security;
alter table rate_limit_counters force row level security;

drop policy if exists tenant_isolation on rate_limit_counters;
create policy tenant_isolation on rate_limit_counters
  using (tenant_id = app_current_tenant())
  with check (tenant_id = app_current_tenant());

grant select, insert, update, delete on rate_limit_counters to authenticated;

-- Consume una unidad de la ventana actual. Falla si el tenant no coincide con
-- el de la sesión: el parámetro no puede ampliar el alcance.
-- Se elimina antes de recrear porque cambiar el tipo de retorno de una función
-- existente falla; volver a aplicar la migración debe ser seguro.
drop function if exists consume_rate_limit(text, integer, timestamptz);
create or replace function consume_rate_limit(p_tenant text, p_limit integer, p_at timestamptz)
returns table (allowed boolean, used_count integer, window_begin timestamptz)
language plpgsql
as $$
declare
  v_window timestamptz := date_trunc('minute', p_at);
  v_used integer;
begin
  if p_tenant is distinct from app_current_tenant() then
    raise exception 'rate_limit_tenant_mismatch' using errcode = '42501';
  end if;
  if p_limit < 1 then
    raise exception 'rate_limit_invalid_limit' using errcode = '22023';
  end if;

  insert into rate_limit_counters (tenant_id, window_start, used)
  values (p_tenant, v_window, 1)
  on conflict (tenant_id, window_start)
    do update set used = rate_limit_counters.used + 1
  returning rate_limit_counters.used into v_used;

  allowed := v_used <= p_limit;
  used_count := v_used;
  window_begin := v_window;
  return next;
end $$;

grant execute on function consume_rate_limit(text, integer, timestamptz) to authenticated;
