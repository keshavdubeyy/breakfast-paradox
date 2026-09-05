-- Breakfast Paradox: survey responses + archetype results.
--
-- The survey is anonymous (no login) — respondents can INSERT their own
-- response but can never SELECT/UPDATE/DELETE any row, their own or
-- anyone else's. The only thing readable by the client is the
-- `archetype_population_stats` view below, which exposes aggregate
-- counts only, never individual responses.

create extension if not exists "pgcrypto";

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  survey_version int not null,
  about_you jsonb not null,
  usual_routine jsonb not null,
  after_morning_routine jsonb not null
);

create table if not exists archetype_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  response_id uuid not null references survey_responses (id) on delete cascade,
  survey_version int not null,
  primary_archetype text not null,
  secondary_archetype text not null,
  confidence text not null check (confidence in ('strong', 'mixed')),
  scores jsonb not null,
  computed_at timestamptz not null
);

create index if not exists archetype_results_version_archetype_idx
  on archetype_results (survey_version, primary_archetype);

alter table survey_responses enable row level security;
alter table archetype_results enable row level security;

-- Anonymous respondents may insert their own response and result...
create policy "anon can insert survey_responses"
  on survey_responses for insert
  to anon
  with check (true);

create policy "anon can insert archetype_results"
  on archetype_results for insert
  to anon
  with check (true);

-- ...but never read, edit, or delete any row (their own or anyone
-- else's) — deliberately no select/update/delete policies for anon.

-- Aggregate-only view for the "population nudge" — how many completed
-- responses share a given primary archetype, for a given survey
-- version. Exposes counts only, never a raw response.
create or replace view archetype_population_stats as
select
  survey_version,
  primary_archetype,
  count(*) as archetype_count,
  sum(count(*)) over (partition by survey_version) as total_completed
from archetype_results
group by survey_version, primary_archetype;

grant select on archetype_population_stats to anon;
