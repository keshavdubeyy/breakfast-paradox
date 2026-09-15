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
  courseNo: string
  courseName: string
  facultyNames: string[]
  slotCode: string | null
  /** "HH:MM", 24-hour, as stored — e.g. "08:30". */
  startTime: string
  endTime: string
  days: string[]
  registeredCount: number
}

/** One distinct (startTime, days) slot, with every course that meets in
 * it and the combined seat count. A "seat count" sums registrations
 * across courses — a single student registered in more than one course
 * in the same slot would be counted more than once, so this is never
 * presented as a headcount of distinct students. */
export interface ScheduleSlotSummary {
  key: string
  startTime: string
  endTime: string
  days: string[]
  courses: ClassScheduleRow[]
  totalRegisteredSeats: number
}

export interface AdministrationMetrics {
  semester: string | null
  totalCourses: number
  totalRegisteredSeats: number
  slots: ScheduleSlotSummary[]
}
