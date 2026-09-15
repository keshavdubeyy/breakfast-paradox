import { describe, expect, it } from "vitest"

import type { MessAttendanceRow } from "../types"
import { computeMessAttendanceMetrics } from "../metrics"

function makeRow(overrides: Partial<MessAttendanceRow> = {}): MessAttendanceRow {
  return {
    mealDate: "2026-04-01",
    mealMess: "kadamba-veg",
    availedAt: null,
    availed: false,
    dayOfWeek: "Wednesday",
    isWeekend: false,
    availedTimeIst: null,
    availedHourIst: null,
    ...overrides,
  }
}

describe("computeMessAttendanceMetrics", () => {
  it("returns zeroed-out metrics for an empty dataset, never fabricating a value", () => {
    const metrics = computeMessAttendanceMetrics([])
    expect(metrics.dateRange).toBeNull()
    expect(metrics.totals).toEqual({ registered: 0, availed: 0, availRate: 0 })
    expect(metrics.daily).toEqual([])
    expect(metrics.byMess.every((m) => m.registered === 0)).toBe(true)
  })

  it("computes overall totals and avail rate", () => {
    const rows = [
      makeRow({ availed: true, availedAt: "x" }),
      makeRow({ availed: true, availedAt: "x" }),
      makeRow({ availed: false }),
      makeRow({ availed: false }),
    ]
    const metrics = computeMessAttendanceMetrics(rows)
    expect(metrics.totals).toEqual({ registered: 4, availed: 2, availRate: 50 })
  })

  it("keeps kadamba-veg and kadamba-nonveg as separate breakdown rows, even when one has zero rows", () => {
    const rows = [makeRow({ mealMess: "kadamba-veg", availed: true })]
    const metrics = computeMessAttendanceMetrics(rows)
    const veg = metrics.byMess.find((m) => m.mess === "kadamba-veg")!
    const nonveg = metrics.byMess.find((m) => m.mess === "kadamba-nonveg")!
    expect(veg.registered).toBe(1)
    expect(veg.availed).toBe(1)
    expect(nonveg.registered).toBe(0)
  })

  it("derives the date range from the data rather than a hardcoded month", () => {
    const rows = [
      makeRow({ mealDate: "2026-04-05" }),
      makeRow({ mealDate: "2026-04-01" }),
      makeRow({ mealDate: "2026-04-30" }),
    ]
    const metrics = computeMessAttendanceMetrics(rows)
    expect(metrics.dateRange).toEqual({ start: "2026-04-01", end: "2026-04-30" })
  })

  it("aggregates daily registered/availed counts per calendar date", () => {
    const rows = [
      makeRow({ mealDate: "2026-04-01", availed: true }),
      makeRow({ mealDate: "2026-04-01", availed: false }),
      makeRow({ mealDate: "2026-04-02", availed: true }),
    ]
    const metrics = computeMessAttendanceMetrics(rows)
    expect(metrics.daily).toEqual([
      { date: "2026-04-01", dayOfWeek: "Wednesday", isWeekend: false, registered: 2, availed: 1, availRate: 50 },
      { date: "2026-04-02", dayOfWeek: "Wednesday", isWeekend: false, registered: 1, availed: 1, availRate: 100 },
    ])
  })

  it("always returns all seven weekdays in order, even if some never appear in the data", () => {
    const rows = [makeRow({ dayOfWeek: "Monday", availed: true })]
    const metrics = computeMessAttendanceMetrics(rows)
    expect(metrics.byDayOfWeek.map((d) => d.dayOfWeek)).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    expect(metrics.byDayOfWeek.find((d) => d.dayOfWeek === "Monday")!.availed).toBe(1)
  })

  it("buckets availed times into 10-minute rush-hour windows", () => {
    const rows = [
      makeRow({ availed: true, availedTimeIst: "09:12:00.000000" }),
      makeRow({ availed: true, availedTimeIst: "09:17:30.000000" }),
      makeRow({ availed: true, availedTimeIst: "07:05:00.000000" }),
    ]
    const metrics = computeMessAttendanceMetrics(rows)
    const bucket0910 = metrics.rushHour.find((b) => b.bucket === "09:10")!
    const bucket0700 = metrics.rushHour.find((b) => b.bucket === "07:00")!
    expect(bucket0910.count).toBe(2)
    expect(bucket0700.count).toBe(1)
  })

  it("excludes rows with no availed_at from the rush-hour distribution", () => {
    const rows = [makeRow({ availed: false, availedTimeIst: null })]
    const metrics = computeMessAttendanceMetrics(rows)
    expect(metrics.rushHour.every((b) => b.count === 0)).toBe(true)
  })
})
