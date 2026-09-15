import { describe, expect, it } from "vitest"

import type { ClassScheduleRow } from "../types"
import { computeAdministrationMetrics } from "../metrics"

function makeRow(overrides: Partial<ClassScheduleRow> & { id: string }): ClassScheduleRow {
  return {
    semester: "Monsoon 2026",
    courseNo: "XX0.000",
    courseName: "Sample Course",
    facultyNames: ["Someone"],
    slotCode: "B1",
    startTime: "08:30",
    endTime: "09:55",
    days: ["Tue", "Fri"],
    registeredCount: 10,
    ...overrides,
  }
}

describe("computeAdministrationMetrics", () => {
  it("returns zeroed-out metrics for an empty dataset, never fabricating a value", () => {
    const metrics = computeAdministrationMetrics([])
    expect(metrics.semester).toBeNull()
    expect(metrics.totalCourses).toBe(0)
    expect(metrics.totalRegisteredSeats).toBe(0)
    expect(metrics.slots).toEqual([])
  })

  it("groups courses sharing the same time and days into one slot", () => {
    const rows: ClassScheduleRow[] = [
      makeRow({ id: "1", courseNo: "A1", registeredCount: 20 }),
      makeRow({ id: "2", courseNo: "A2", registeredCount: 30 }),
      makeRow({
        id: "3",
        courseNo: "B1",
        startTime: "09:00",
        endTime: "10:25",
        days: ["Mon", "Thu"],
        registeredCount: 15,
      }),
    ]
    const metrics = computeAdministrationMetrics(rows)
    expect(metrics.slots).toHaveLength(2)

    const firstSlot = metrics.slots.find((s) => s.startTime === "08:30")!
    expect(firstSlot.courses.map((c) => c.courseNo)).toEqual(["A1", "A2"])
    expect(firstSlot.totalRegisteredSeats).toBe(50)

    const secondSlot = metrics.slots.find((s) => s.startTime === "09:00")!
    expect(secondSlot.totalRegisteredSeats).toBe(15)
  })

  it("keeps courses with the same start/end time but different days as separate slots", () => {
    const rows: ClassScheduleRow[] = [
      makeRow({ id: "1", courseNo: "A1", days: ["Tue", "Fri"], registeredCount: 20 }),
      makeRow({ id: "2", courseNo: "B1", days: ["Wed", "Sat"], registeredCount: 30 }),
    ]
    const metrics = computeAdministrationMetrics(rows)
    expect(metrics.slots).toHaveLength(2)
  })

  it("sums registered seats across all courses as a seat count, never claiming it's a distinct-student headcount", () => {
    const rows: ClassScheduleRow[] = [
      makeRow({ id: "1", registeredCount: 11 }),
      makeRow({ id: "2", registeredCount: 49 }),
      makeRow({ id: "3", registeredCount: 7 }),
    ]
    const metrics = computeAdministrationMetrics(rows)
    expect(metrics.totalRegisteredSeats).toBe(67)
    expect(metrics.totalCourses).toBe(3)
  })

  it("reports the semester from the data rather than a hardcoded label", () => {
    const rows: ClassScheduleRow[] = [makeRow({ id: "1", semester: "Spring 2027" })]
    const metrics = computeAdministrationMetrics(rows)
    expect(metrics.semester).toBe("Spring 2027")
  })
})
