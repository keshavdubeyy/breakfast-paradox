// Administration data — the institute's own class/course timetable
// (table `class_schedule`), not the anonymous student survey. This is a
// completely different population and data source: a course-registration
// count here is a seat count in the institute's system, not a survey
// respondent, and there is no way to link a specific survey respondent to
// a specific course registration. Never merge or cross-tabulate these two
// datasets as if they were the same sample — only present them side by
// side for context.

export interface ClassScheduleRow {
  id: string
  semester: string
  /** Not every import has this — the Spring 2026 timetable import doesn't
   * (it has no course codes, only names), while a registration-portal
   * import does. */
  courseNo: string | null
  courseName: string
  facultyNames: string[]
  slotCode: string | null
  /** "HH:MM", 24-hour, as stored — e.g. "08:30". */
  startTime: string
  endTime: string
  days: string[]
  /** Seat count from a registration-portal import; null when the source
   * (e.g. the published timetable PDF) never had this — never fabricated. */
  registeredCount: number | null
  /** Room/venue, e.g. "H101" — from the timetable import; null when the
   * source row doesn't carry one. */
  room: string | null
  /** The timetable's own tutorial-group tag, e.g. "H1", "H2", "H1/H2" —
   * null when the source row doesn't carry one. */
  tag: string | null
}

/** One distinct (startTime, days) slot, with every course that meets in
 * it and the combined seat count. A "seat count" sums registrations
 * across courses — a single student registered in more than one course
 * in the same slot would be counted more than once, so this is never
 * presented as a headcount of distinct students. Null when none of the
 * courses in this slot have a registered count. */
export interface ScheduleSlotSummary {
  key: string
  startTime: string
  endTime: string
  days: string[]
  courses: ClassScheduleRow[]
  totalRegisteredSeats: number | null
}

export interface AdministrationMetrics {
  semester: string | null
  totalCourses: number
  /** Null when none of the imported rows have a registered count (e.g. a
   * timetable-only import with no registration-portal data yet). */
  totalRegisteredSeats: number | null
  slots: ScheduleSlotSummary[]
}
