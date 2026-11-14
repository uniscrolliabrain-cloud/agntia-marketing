-- MKT-C06 · Esquema Postgres
-- Todas las tablas llevan tenant_id y las referencias externas usan claves
-- compuestas (tenant_id, id) para impedir cruces entre tenants.

create extension if not exists "pgcrypto";

create table if not exists tenants (
  id text primary key,
  name text not null,
  plan text not null check (plan in ('sandbox','pilot','production')),
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  tenant_id text not null references tenants(id) on delete cascade,
  actor_id text not null,
  roles text[] not null,
  scopes text[] not null,
  is_human boolean not null default true,
  primary key (tenant_id, actor_id)
);

create table if not exists contacts (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  email_ref text not null,
  country text not null,
  locale text not null check (locale in ('es','en','fr')),
  lifecycle_stage text not null,
  interest_topic text not null,
  consent jsonb not null default '{}'::jsonb,
  engaged_days integer not null default 0,
  is_business boolean not null default false,
  suppressed boolean not null default false,
  suppression_version integer not null default 1,
  last_contacted_at jsonb not null default '{}'::jsonb,
  primary key (tenant_id, id)
);

create table if not exists twins (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  canonical_agent_sha text not null check (canonical_agent_sha ~ '^[0-9a-f]{40}$'),
  display_name text not null,
  provenance text not null,
  status text not null default 'active' check (status in ('active','revoked')),
  primary key (tenant_id, id)
);

create table if not exists briefs (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  version integer not null,
  status text not null check (status in ('draft','accepted')),
  body jsonb not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create table if not exists audience_snapshots (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  rule_hash text not null,
  rule jsonb not null,
  member_refs jsonb not null,
  eligible_count integer not null,
  excluded_count integer not null,
  members_hash text not null,
  policy_version text not null,
  source_watermark bigint not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (tenant_id, id),
  check (expires_at > created_at)
);

create table if not exists creatives (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  revision integer not null,
  body jsonb not null,
  hash text not null,
  status text not null default 'draft',
  primary key (tenant_id, id)
);

create table if not exists claims (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  claim text not null,
  support text not null check (support in ('supported','contradicted','unverified')),
  body jsonb not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create table if not exists approvals (
  tenant_id text not null references tenants(id) on delete cascade,
  approval_ref text not null,
  approver_actor_id text not null,
  approver_is_human boolean not null check (approver_is_human),
  revision_hash text not null,
  audience_max_hash text not null,
  purpose text not null,
  channel text not null,
  cost_ceiling_amount numeric(14,4) not null,
  cost_ceiling_currency char(3) not null,
  policy_version text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  primary key (tenant_id, approval_ref)
);

create table if not exists campaigns (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  name text not null,
  brief_id text not null,
  channel text not null,
  revision integer not null,
  audience_snapshot_id text not null,
  creative_id text not null,
  approval_ref text,
  cost_ceiling_amount numeric(14,4) not null,
  cost_ceiling_currency char(3) not null,
  state text not null,
  version integer not null,
  history jsonb not null default '[]'::jsonb,
  primary key (tenant_id, id),
  foreign key (tenant_id, brief_id) references briefs(tenant_id, id),
  foreign key (tenant_id, audience_snapshot_id) references audience_snapshots(tenant_id, id),
  foreign key (tenant_id, creative_id) references creatives(tenant_id, id),
  foreign key (tenant_id, approval_ref) references approvals(tenant_id, approval_ref)
);

create table if not exists outbound_intents (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  operation_key text not null,
  campaign_id text not null,
  subject_ref text not null,
  channel text not null,
  payload_hash text not null,
  approval_ref text not null,
  audience_snapshot_id text not null,
  eligibility_ref text not null,
  state text not null check (state in ('queued','leased','confirmed','failed','unknown','cancelled')),
  lease_fence integer not null default 0,
  attempts integer not null default 0,
  remote_refs jsonb not null default '[]'::jsonb,
  last_error text,
  reconciliation_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, id),
  unique (tenant_id, campaign_id, subject_ref),
  foreign key (tenant_id, campaign_id) references campaigns(tenant_id, id)
);

create unique index if not exists outbound_intents_operation_key
  on outbound_intents (tenant_id, operation_key);

create table if not exists receipts (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  intent_id text not null,
  provider text not null,
  remote_id text not null,
  state text not null,
  received_at timestamptz not null default now(),
  primary key (tenant_id, id),
  foreign key (tenant_id, intent_id) references outbound_intents(tenant_id, id)
);

create unique index if not exists receipts_provider_remote
  on receipts (tenant_id, provider, remote_id);

create table if not exists connections (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  provider text not null,
  endpoint_ref text not null,
  secret_ref text not null check (secret_ref like 'secret://%'),
  remote_account_id text,
  scopes text[] not null,
  state text not null default 'disabled',
  capability_report jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  primary key (tenant_id, id),
  unique (tenant_id, provider)
);

create table if not exists observations (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  source_id text not null,
  metric text not null,
  metric_version text not null,
  value numeric,
  coverage numeric not null check (coverage between 0 and 1),
  window_from timestamptz not null,
  window_to timestamptz not null,
  occurred_at timestamptz not null,
  body jsonb not null default '{}'::jsonb,
  primary key (tenant_id, id),
  check (window_to > window_from)
);

create table if not exists conversions (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  source_id text not null,
  dedup_key text not null,
  body jsonb not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  unique (tenant_id, source_id, dedup_key)
);

create table if not exists reports (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  body jsonb not null,
  hash text not null,
  generated_at timestamptz not null,
  expires_at timestamptz not null,
  primary key (tenant_id, id)
);

create table if not exists privacy_requests (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  kind text not null,
  subject_ref text not null,
  state text not null check (state in ('received','verified','fulfilled','rejected')),
  outcome text,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create table if not exists handoffs (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  to_service text not null,
  effect text not null,
  resource_ref text not null,
  owner_service text not null,
  state text not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create table if not exists service_events (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  type text not null,
  actor_ref text not null,
  correlation_id text not null,
  payload_refs jsonb not null default '[]'::jsonb,
  occurred_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create table if not exists audit_log (
  tenant_id text not null references tenants(id) on delete cascade,
  seq bigserial,
  actor_id text not null,
  action text not null,
  detail text not null,
  at timestamptz not null default now(),
  primary key (tenant_id, seq)
);

create table if not exists idempotency_keys (
  tenant_id text not null references tenants(id) on delete cascade,
  capability text not null,
  idempotency_key text not null,
  payload_hash text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, capability, idempotency_key)
);
