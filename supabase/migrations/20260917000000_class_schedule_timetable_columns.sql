-- The Spring 2026 lecture timetable (unlike the earlier Monsoon 2026 import)
-- comes from the institute's published timetable PDF, not the registration
-- portal — it has no course numbers, no faculty list, and no registered-seat
-- counts, but it does carry a room and an H1/H2/H tutorial-group tag that the
-- registration-portal import never had. Loosen the columns the timetable
-- can't fill and add the columns it can.

alter table class_schedule
  alter column course_no drop not null,
  alter column registered_count drop not null;

alter table class_schedule
  add column if not exists room text,
  add column if not exists tag text;
