// Mess breakfast attendance data — actual registration/swipe-in records
// from the Kadamba mess (`data/april-data-clean.csv`, cleaned from the
// institute's own export by `scripts/clean_april_data.py`). This is a
// completely different data source from the anonymous student survey:
// there is no per-student identifier here at all, so a row is one
// registered breakfast slot, not a person. Never merge or cross-tabulate
// this with survey data as if they shared a sample — only present them
// side by side for context, same convention as Administration.

export type MessName = "kadamba-veg" | "kadamba-nonveg"

export interface MessAttendanceRow {
  /** ISO date (YYYY-MM-DD), the day the slot was registered/allotted for. */
  mealDate: string
  mealMess: MessName
  /** ISO timestamp with offset, or null when the slot was never availed. */
  availedAt: string | null
  availed: boolean
  dayOfWeek: string
  isWeekend: boolean
  /** "HH:MM:SS.ffffff" in IST, or null when never availed. */
  availedTimeIst: string | null
  availedHourIst: number | null
}

export interface MessTotals {
  registered: number
  availed: number
  /** 0-100, one decimal. 0 when registered is 0. */
  availRate: number
}

export interface MessBreakdown extends MessTotals {
  mess: MessName
  label: string
}

/** One row per calendar date in the dataset. */
export interface DailyAttendance extends MessTotals {
  date: string
  dayOfWeek: string
  isWeekend: boolean
}

/** One row per weekday (Monday..Sunday), aggregated across the month. */
export interface DayOfWeekAttendance extends MessTotals {
  dayOfWeek: string
}

/** One row per 10-minute bucket of the availed time-of-day, IST — the
 * "rush hour" view. Buckets with zero scans are still included so the
 * chart doesn't silently skip quiet periods. */
export interface RushHourBucket {
  /** "HH:MM", start of the 10-minute bucket. */
  bucket: string
  count: number
}

export interface MessAttendanceMetrics {
  dateRange: { start: string; end: string } | null
  totals: MessTotals
  byMess: MessBreakdown[]
  daily: DailyAttendance[]
  byDayOfWeek: DayOfWeekAttendance[]
  rushHour: RushHourBucket[]
}
