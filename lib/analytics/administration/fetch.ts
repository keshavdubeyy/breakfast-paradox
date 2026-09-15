import "server-only"

import { createAdminClient } from "@/lib/supabase/admin-client"
import type { ClassScheduleRow } from "./types"

interface RawClassScheduleRow {
  id: string
  semester: string
  course_no: string
  course_name: string
  faculty_names: string[] | null
  slot_code: string | null
  start_time: string
  end_time: string
  days: string[] | null
  registered_count: number
}

function parseClassScheduleRow(raw: RawClassScheduleRow): ClassScheduleRow {
  return {
    id: raw.id,
    semester: raw.semester,
    courseNo: raw.course_no,
    courseName: raw.course_name,
    facultyNames: raw.faculty_names ?? [],
    slotCode: raw.slot_code,
    // Postgres `time` comes back as "HH:MM:SS" — trimmed to "HH:MM" to
    // match how the rest of this dashboard formats times.
    startTime: raw.start_time.slice(0, 5),
    endTime: raw.end_time.slice(0, 5),
    days: raw.days ?? [],
    registeredCount: raw.registered_count,
  }
}

export interface ClassScheduleFetchResult {
  rows: ClassScheduleRow[]
  /** false when SUPABASE_SERVICE_ROLE_KEY isn't configured at all — unlike
   * the student survey, there is no bundled sample dataset for
   * institutional timetable data (never fabricate this), so an
   * unconfigured environment just shows nothing rather than a real
   * query failure. */
  isConfigured: boolean
}

/** Fetches every imported class-schedule row, oldest semester first then
 * by start time — the caller groups/aggregates, this only reads. */
export async function fetchClassSchedule(): Promise<ClassScheduleFetchResult> {
  const supabase = createAdminClient()

  if (!supabase) {
    return { rows: [], isConfigured: false }
  }

  const { data, error } = await supabase
    .from("class_schedule")
    .select(
      "id, semester, course_no, course_name, faculty_names, slot_code, start_time, end_time, days, registered_count"
    )
    .order("semester", { ascending: true })
    .order("start_time", { ascending: true })
    .returns<RawClassScheduleRow[]>()

  if (error) {
    throw new Error(`Failed to fetch class_schedule: ${error.message}`)
  }

  return { rows: data.map(parseClassScheduleRow), isConfigured: true }
}
