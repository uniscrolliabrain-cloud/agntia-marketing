-- MKT-C19/C22 · Programación de intents por paso de journey
--
-- El modelo en memoria ya distingue el paso de un journey y su vencimiento; el
-- esquema no. Sin estas columnas un journey de varios pasos no se puede
-- persistir, y la unicidad `(tenant_id, campaign_id, subject_ref)` impedía más
-- de un paso por sujeto dentro del mismo journey.

alter table outbound_intents
  add column if not exists journey_step_id text,
  add column if not exists scheduled_for timestamptz not null default now();

-- Un intent de campaña no tiene paso (null) y se deduplica por sujeto; uno de
-- journey se deduplica por paso. `coalesce` evita que NULL rompa la unicidad.
alter table outbound_intents
  drop constraint if exists outbound_intents_tenant_id_campaign_id_subject_ref_key;

create unique index if not exists outbound_intents_campaign_step_subject
  on outbound_intents (tenant_id, campaign_id, coalesce(journey_step_id, ''), subject_ref);

-- El worker sólo debe ver lo que ya venció.
create index if not exists outbound_intents_due
  on outbound_intents (tenant_id, scheduled_for)
  where state = 'queued';

create index if not exists outbound_intents_lease_candidate
  on outbound_intents (tenant_id, state, scheduled_for, created_at);
