import type {
  DailyAttendance,
  DayOfWeekAttendance,
  MessAttendanceMetrics,
  MessAttendanceRow,
  MessBreakdown,
  MessName,
  MessTotals,
  RushHourBucket,
} from "./types"

const MESS_LABELS: Record<MessName, string> = {
  "kadamba-veg": "Kadamba · Veg",
  "kadamba-nonveg": "Kadamba · Non-veg",
}

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

// Scans cluster tightly in a ~6:30am-10am window; bucketing the rest of
// the day would just add a long flat tail of zeros to the chart.
const RUSH_HOUR_START_MINUTES = 6 * 60
const RUSH_HOUR_END_MINUTES = 10 * 60
const BUCKET_SIZE_MINUTES = 10

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function totals(registered: number, availed: number): MessTotals {
  return {
    registered,
    availed,
    availRate: registered === 0 ? 0 : round1((availed / registered) * 100),
  }
}

function computeByMess(rows: MessAttendanceRow[]): MessBreakdown[] {
  const byMess = new Map<MessName, { registered: number; availed: number }>()
  for (const mess of Object.keys(MESS_LABELS) as MessName[]) {
    byMess.set(mess, { registered: 0, availed: 0 })
  }

  for (const row of rows) {
    const bucket = byMess.get(row.mealMess)!
    bucket.registered += 1
    if (row.availed) bucket.availed += 1
  }

  return Array.from(byMess.entries()).map(([mess, counts]) => ({
    mess,
    label: MESS_LABELS[mess],
    ...totals(counts.registered, counts.availed),
  }))
}

function computeDaily(rows: MessAttendanceRow[]): DailyAttendance[] {
  const byDate = new Map<
    string,
    { registered: number; availed: number; dayOfWeek: string; isWeekend: boolean }
  >()

  for (const row of rows) {
    const existing = byDate.get(row.mealDate)
    if (existing) {
      existing.registered += 1
      if (row.availed) existing.availed += 1
    } else {
      byDate.set(row.mealDate, {
        registered: 1,
        availed: row.availed ? 1 : 0,
        dayOfWeek: row.dayOfWeek,
        isWeekend: row.isWeekend,
      })
    }
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, day]) => ({
      date,
      dayOfWeek: day.dayOfWeek,
      isWeekend: day.isWeekend,
      ...totals(day.registered, day.availed),
    }))
}

function computeByDayOfWeek(rows: MessAttendanceRow[]): DayOfWeekAttendance[] {
  const byWeekday = new Map<string, { registered: number; availed: number }>()
  for (const day of WEEKDAY_ORDER) {
    byWeekday.set(day, { registered: 0, availed: 0 })
  }

  for (const row of rows) {
    const bucket = byWeekday.get(row.dayOfWeek)
    if (!bucket) continue
    bucket.registered += 1
    if (row.availed) bucket.availed += 1
  }

  return WEEKDAY_ORDER.map((dayOfWeek) => ({
    dayOfWeek,
    ...totals(byWeekday.get(dayOfWeek)!.registered, byWeekday.get(dayOfWeek)!.availed),
  }))
}

function bucketLabel(minutesSinceMidnight: number): string {
  const hour = Math.floor(minutesSinceMidnight / 60)
  const minute = minutesSinceMidnight % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function computeRushHour(rows: MessAttendanceRow[]): RushHourBucket[] {
  const buckets = new Map<number, number>()
  for (
    let minutes = RUSH_HOUR_START_MINUTES;
    minutes < RUSH_HOUR_END_MINUTES;
    minutes += BUCKET_SIZE_MINUTES
  ) {
    buckets.set(minutes, 0)
  }

  for (const row of rows) {
    if (!row.availedTimeIst) continue
    const [hourStr, minuteStr] = row.availedTimeIst.split(":")
    const totalMinutes = Number(hourStr) * 60 + Number(minuteStr)
    const bucketStart =
      Math.floor(totalMinutes / BUCKET_SIZE_MINUTES) * BUCKET_SIZE_MINUTES
    // Scans outside the expected 6:30-10am window (data errors, edge
    // cases) still get counted rather than silently dropped — extend the
    // map on demand instead of clamping them away.
    buckets.set(bucketStart, (buckets.get(bucketStart) ?? 0) + 1)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([minutes, count]) => ({ bucket: bucketLabel(minutes), count }))
}

/** Pure aggregation over cleaned mess-attendance rows — no I/O, no
 * fabricated values. An empty dataset returns zeroed-out totals and empty
 * series rather than throwing. */
export function computeMessAttendanceMetrics(
  rows: MessAttendanceRow[]
): MessAttendanceMetrics {
  if (rows.length === 0) {
    return {
      dateRange: null,
      totals: totals(0, 0),
      byMess: computeByMess([]),
      daily: [],
      byDayOfWeek: computeByDayOfWeek([]),
      rushHour: computeRushHour([]),
    }
  }

  const dates = rows.map((row) => row.mealDate).sort()
  const availedCount = rows.reduce((sum, row) => sum + (row.availed ? 1 : 0), 0)

  return {
    dateRange: { start: dates[0], end: dates[dates.length - 1] },
    totals: totals(rows.length, availedCount),
    byMess: computeByMess(rows),
    daily: computeDaily(rows),
    byDayOfWeek: computeByDayOfWeek(rows),
    rushHour: computeRushHour(rows),
  }
}
