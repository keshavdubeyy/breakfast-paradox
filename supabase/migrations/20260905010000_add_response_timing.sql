-- Breakfast Paradox: capture per-response start time and fill duration.
--
-- `survey_responses.id` (already a UUID primary key, generated client-side
-- at the moment a respondent begins the survey) is the unique identifier
-- for each individual respondent — there is no login, so this is the only
-- "person" ID that exists, and it already satisfies that requirement.
-- `created_at` already captures the submission timestamp. This migration
-- adds the missing piece: when the respondent *started* the survey, and
-- how long they took.

alter table survey_responses
  add column if not exists started_at timestamptz not null default now();

comment on column survey_responses.started_at is
  'Wall-clock time the respondent began the survey (set by the app when '
  'the consent screen is accepted), not the insert time. The `default '
  'now()` is only a safety net for rows inserted without an explicit '
  'value; the app always supplies the real one.';

-- Generated (not app-computed) so it can never drift from the two
-- timestamps it's derived from, and stays correct even for rows inserted
-- some other way in the future.
alter table survey_responses
  add column if not exists duration_seconds integer
    generated always as (
      greatest(0, extract(epoch from (created_at - started_at))::integer)
    ) stored;

alter table survey_responses
  add column if not exists duration_minutes numeric(10, 2)
    generated always as (
      round(
        greatest(0, extract(epoch from (created_at - started_at))) / 60.0,
        2
      )
    ) stored;
