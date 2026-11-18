-- MKT-C06/C19 · Flujo administrativo auditado
--
-- `0005` dejó al rol de datos sin permiso para provisionar tenants, cambiar
-- roles/scopes o purgar auditoría, y eso es correcto: son operaciones de
-- administración. Faltaba el camino que sí puede hacerlas. Esta migración lo
-- añade con tres reglas:
--
--   1. `authenticated` no gana ningún permiso nuevo (sólo lee `admin_actions`
--      de su tenant).
--   2. Existe un rol propio, `marketing_admin`, con los grants mínimos.
--   3. `marketing_admin` sólo puede escribir si antes dejó el registro en
--      `admin_actions`, en la misma transacción, con el mismo `ticket` y el
--      mismo `actor` que declara la sesión. Sin registro no hay escritura.
--
-- No usa `security definer`: la garantía sale de grants + policy + trigger, así
-- que no existe una función que pueda saltarse RLS por accidente.
--
-- Aditiva e idempotente, como `0005`: los runners reaplican la cadena completa.

-- ── Rol administrativo ────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'marketing_admin') then
    create role marketing_admin nologin noinherit;
  end if;
end $$;

grant usage on schema public to marketing_admin;

-- ── Registro de acciones administrativas (append-only) ────────────────────
-- `tenant_id` referencia `tenants(id)`: el registro siempre pertenece a un
-- tenant existente. Por eso la provisión de un tenant nuevo (INSERT en
-- `tenants`) no pasa por el trigger: la fila todavía no existe y la acción se
-- registra justo después, ya con el rol administrativo sobre ese tenant.
create table if not exists admin_actions (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  actor_id text not null,
  action text not null,
  ticket text not null,
  detail jsonb not null default '{}'::jsonb,
  at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create index if not exists admin_actions_ticket_idx
  on admin_actions (tenant_id, ticket, action);

alter table admin_actions enable row level security;
alter table admin_actions force row level security;

drop policy if exists tenant_isolation on admin_actions;
create policy tenant_isolation on admin_actions
  using (tenant_id = app_current_tenant())
  with check (tenant_id = app_current_tenant());

-- El operador puede leer la historia administrativa de su propio tenant; no
-- puede escribirla. Nadie con grants tiene UPDATE ni DELETE: el registro no se
-- reescribe ni se borra (si el tenant desaparece, cae por el FK).
revoke all on admin_actions from authenticated;
grant select on admin_actions to authenticated;
grant select, insert on admin_actions to marketing_admin;

-- ── Permisos del rol administrativo ───────────────────────────────────────
grant select, update on tenants to marketing_admin;
grant select, insert, update, delete on memberships to marketing_admin;
grant select, insert, delete on audit_log to marketing_admin;

do $$
declare
  seq text := pg_get_serial_sequence('audit_log', 'seq');
begin
  if seq is null then
    raise exception 'audit_log.seq no tiene secuencia asociada';
  end if;
  execute format('grant usage on sequence %s to marketing_admin', seq);
end $$;

-- ── Guarda: sin acción registrada no hay escritura administrativa ─────────
create or replace function require_admin_action() returns trigger
language plpgsql as $$
declare
  -- Prefijo `v_` deliberado: `ticket` y `actor_id` son también columnas de
  -- `admin_actions`, y plpgsql falla con 42702 si un nombre puede ser las dos
  -- cosas.
  v_ticket text := nullif(current_setting('app.admin_ticket', true), '');
  v_actor text := nullif(current_setting('app.admin_actor', true), '');
begin
  -- La garantía cubre los roles que se conceden a la aplicación. Un
  -- superusuario o un rol con BYPASSRLS ya puede saltarse RLS, así que
  -- enlazarlo aquí sólo daría una falsa sensación de control.
  if current_user <> 'marketing_admin' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if v_ticket is null or v_actor is null then
    raise exception 'admin_ticket_required'
      using errcode = '42501',
            hint = 'fija app.admin_ticket y app.admin_actor en la misma transacción';
  end if;

  if not exists (
    select 1
      from admin_actions a
     where a.tenant_id = app_current_tenant()
       and a.ticket = v_ticket
       and a.actor_id = v_actor
       and a.action like tg_argv[0]
  ) then
    raise exception 'admin_action_not_recorded'
      using errcode = '42501',
            hint = format('registra antes la acción %s con el ticket %s', tg_argv[0], v_ticket);
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;

-- Cambiar roles, scopes o membresías exige una acción `membership.*`.
drop trigger if exists memberships_require_admin_action on memberships;
create trigger memberships_require_admin_action
  before insert or update or delete on memberships
  for each row execute function require_admin_action('membership.%');

-- Cambiar el plan o el nombre de un tenant exige una acción `tenant.*`. El
-- INSERT queda fuera a propósito: es el bootstrap de provisión (ver arriba).
drop trigger if exists tenants_require_admin_action on tenants;
create trigger tenants_require_admin_action
  before update or delete on tenants
  for each row execute function require_admin_action('tenant.%');

-- La purga de auditoría exige una acción `audit.purge`. `audit_log` sigue sin
-- UPDATE ni DELETE para `authenticated`, así que el camino de datos no puede
-- reescribir historia: sólo el rol administrativo, y sólo dejando el registro.
drop trigger if exists audit_log_require_admin_action on audit_log;
create trigger audit_log_require_admin_action
  before delete on audit_log
  for each row execute function require_admin_action('audit.purge');
