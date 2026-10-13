import type { AdministrationMetrics, ClassScheduleRow, ScheduleSlotSummary } from "./types"

/** Groups courses into the distinct (startTime, days) slots they meet
 * in — e.g. every course at "08:30" on "Tue, Fri" is one slot, with its
 * own combined seat count. Order follows first appearance in `rows`
 * (already start-time sorted by the fetch layer), not a re-sort by size. */
function groupIntoSlots(rows: ClassScheduleRow[]): ScheduleSlotSummary[] {
  const slots: ScheduleSlotSummary[] = []
  const indexByKey = new Map<string, number>()

  for (const row of rows) {
    const key = `${row.startTime}-${row.endTime}-${row.days.join(",")}`
    const existingIndex = indexByKey.get(key)
    if (existingIndex === undefined) {
      indexByKey.set(key, slots.length)
      slots.push({
        key,
        startTime: row.startTime,
        endTime: row.endTime,
        days: row.days,
        courses: [row],
        totalRegisteredSeats: row.registeredCount,
      })
    } else {
      const slot = slots[existingIndex]
      slot.courses.push(row)
      if (row.registeredCount !== null) {
        slot.totalRegisteredSeats = (slot.totalRegisteredSeats ?? 0) + row.registeredCount
      }
    }
  }

  return slots
}

/** Sums registered counts across rows, or null when none of them have one
 * (e.g. a timetable-only import with no registration-portal data yet) —
 * never reported as a zero, which would misleadingly imply real data. */
function sumRegisteredCounts(rows: ClassScheduleRow[]): number | null {
  const withCounts = rows.filter((row) => row.registeredCount !== null)
  if (withCounts.length === 0) return null
  return withCounts.reduce((sum, row) => sum + (row.registeredCount ?? 0), 0)
}

export function computeAdministrationMetrics(rows: ClassScheduleRow[]): AdministrationMetrics {
  return {
    semester: rows[0]?.semester ?? null,
    totalCourses: rows.length,
    totalRegisteredSeats: sumRegisteredCounts(rows),
    slots: groupIntoSlots(rows),
  }
}
