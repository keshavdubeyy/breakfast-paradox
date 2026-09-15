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
      slots[existingIndex].courses.push(row)
      slots[existingIndex].totalRegisteredSeats += row.registeredCount
    }
  }

  return slots
}

export function computeAdministrationMetrics(rows: ClassScheduleRow[]): AdministrationMetrics {
  return {
    semester: rows[0]?.semester ?? null,
    totalCourses: rows.length,
    totalRegisteredSeats: rows.reduce((sum, row) => sum + row.registeredCount, 0),
    slots: groupIntoSlots(rows),
  }
}
