-- MKT-C06 · Estado del tenant durable (etapa 1 de la persistencia)
--
-- El API y el worker siguen con `MemoryStore`, y `MemoryStore` está bien: el
-- dominio lee y muta arrays sin `await` (121 accesos en 9 módulos), así que
-- hacerlo asíncrono no es un cambio de una tarde. Pero mientras tanto un
-- reinicio pierde campañas, intents y receipts, y eso impide verificar nada del
-- camino de datos.
--
-- Esta migración no cambia el modelo de dominio: añade **el documento de estado
-- de un tenant** con versión. El borde del API lo carga bajo `for update`, deja
-- correr el dominio síncrono y lo vuelve a escribir en la misma transacción, así
-- que el documento es la verdad y la memoria es su caché de un turno. Un
-- escritor por tenant a la vez: no hay actualizaciones perdidas.
--
-- Lo que esto **no** es: la tabla normalizada de `0001` sigue siendo el destino.
-- `tenant_state` es una etapa intermedia, documentada como tal, que se retira
-- cuando la rebanada asíncrona escriba en `campaigns`, `outbound_intents` y
-- `receipts` con `for update skip locked`.

create table if not exists tenant_state (
  tenant_id text primary key references tenants(id) on delete cascade,
  -- Se incrementa en cada escritura: sirve para diagnostico y para que una
  -- lectura pueda detectar que el documento cambio mientras lo tenia cargado.
  version bigint not null default 0,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table tenant_state enable row level security;
alter table tenant_state force row level security;

drop policy if exists tenant_isolation on tenant_state;
create policy tenant_isolation on tenant_state
  using (tenant_id = app_current_tenant())
  with check (tenant_id = app_current_tenant());

-- `anon` no la ve; `authenticated` sólo la de su tenant (policy + GUC), y nunca
-- la reescribe fuera del borde que fija `app.tenant_id`.
revoke all on tenant_state from anon;
grant select, insert, update on tenant_state to authenticated;
