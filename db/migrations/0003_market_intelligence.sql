-- M01–M10 · Inteligencia de mercado (C03)
-- Reversible: cada tabla puede eliminarse sin afectar a campañas ni medición.
-- Todas las tablas son tenant-scoped y las referencias externas usan claves
-- compuestas (tenant_id, id) para impedir cruces entre tenants.

create table if not exists market_sources (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  source_ref text not null,
  kind text not null check (kind in ('official','vendor','study','press','internal','user_research')),
  title text not null,
  url text check (url is null or url like 'https://%'),
  publisher text not null,
  published_at timestamptz not null,
  retrieved_at timestamptz not null,
  licence text not null check (licence in ('public','licensed','internal','unknown')),
  geography text not null default 'ES',
  note text,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  unique (tenant_id, source_ref),
  check (published_at <= retrieved_at)
);

create table if not exists market_observations (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  source_ref text not null,
  kind text not null check (kind in ('demand_signal','competitor_move','price','trend','audience_insight','regulatory')),
  topic text not null,
  statement text not null,
  geography text not null default 'ES',
  observed_at timestamptz not null,
  value numeric,
  unit text,
  confidence numeric not null check (confidence between 0 and 1),
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  foreign key (tenant_id, source_ref) references market_sources (tenant_id, source_ref) on delete restrict,
  unique (tenant_id, source_ref, topic, statement, observed_at)
);

create table if not exists competitors (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  name text not null,
  domain text not null,
  positioning text not null,
  offer text not null,
  price_band text not null check (price_band in ('low','mid','high','unknown')),
  channels text[] not null,
  last_seen_at timestamptz not null,
  evidence_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  unique (tenant_id, domain)
);

create table if not exists icp_hypotheses (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  name text not null,
  segment text not null,
  need text not null,
  triggers jsonb not null default '[]'::jsonb,
  disqualifiers jsonb not null default '[]'::jsonb,
  evidence_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create table if not exists opportunities (
  tenant_id text not null references tenants(id) on delete cascade,
  id text not null,
  title text not null,
  segment text not null,
  body jsonb not null,
  evidence_refs jsonb not null,
  evidence_grade text not null check (evidence_grade in ('E0','E1','E2','E3','E4','E5')),
  score numeric not null check (score >= 0),
  ranking_hash text not null,
  status text not null default 'proposed' check (status in ('proposed','accepted','rejected')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  unique (tenant_id, title, segment),
  check (expires_at > created_at)
);

create index if not exists market_sources_tenant_kind_idx on market_sources (tenant_id, kind);
create index if not exists market_observations_tenant_topic_idx on market_observations (tenant_id, topic);
create index if not exists opportunities_tenant_score_idx on opportunities (tenant_id, score desc);

-- RLS forzada también para el owner de la tabla (misma política que 0002).
do $$
declare
  t text;
  tables text[] := array['market_sources','market_observations','competitors','icp_hypotheses','opportunities'];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
    execute format('drop policy if exists tenant_isolation on %I', t);
    execute format(
      'create policy tenant_isolation on %I using (tenant_id = app_current_tenant()) with check (tenant_id = app_current_tenant())',
      t
    );
  end loop;
end $$;

revoke all on market_sources, market_observations, competitors, icp_hypotheses, opportunities from anon;
grant select, insert, update, delete on market_sources, market_observations, competitors, icp_hypotheses, opportunities to authenticated;
