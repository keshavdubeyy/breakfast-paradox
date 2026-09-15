-- Administration data: the institute's own class/course timetable, one
-- row per scheduled course-slot, imported per semester from the
-- registration portal.
--
-- Unlike survey_responses/archetype_results, this is a public
-- institutional record, not anonymous personal data — there is no
-- respondent to protect, so RLS simply denies all client access rather
-- than allowing an anonymous insert. Rows are loaded by an admin import
-- process (service-role key), never by the public survey flow, and the
-- admin dashboard reads them the same way it reads survey data — through
-- the service-role key, which bypasses RLS entirely.

create table if not exists class_schedule (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- e.g. "Monsoon 2026" — the exact label the timetable portal uses, so a
  -- later semester's import can't silently collide with this one.
  semester text not null,
  course_no text not null,
  course_name text not null,
  -- Split on the source table's comma-separated faculty list; empty
  -- array (never null) when the source row genuinely lists nobody.
  faculty_names text[] not null default '{}',
  -- The timetable's own period-slot code (e.g. "B1", "C1") — kept as-is
  -- rather than re-derived, since it's the institute's own scheduling
  -- unit, not something this dashboard should invent a replacement for.
  slot_code text,
  start_time time not null,
  end_time time not null,
  -- e.g. {"Tue","Fri"} — the specific weekdays this slot meets on.
  days text[] not null,
  registered_count int not null check (registered_count >= 0)
);

create index if not exists class_schedule_semester_idx
  on class_schedule (semester);

create index if not exists class_schedule_start_time_idx
  on class_schedule (start_time);

alter table class_schedule enable row level security;

-- No policies for anon (or any other role) — every row is deny-by-default
-- for the client-facing API. Only the service-role key (used by the
-- import process and by the admin dashboard's server-only fetch) can
-- read or write this table.
