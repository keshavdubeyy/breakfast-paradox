import type { DailyAttendance } from "@/lib/analytics/mess-attendance/types"
import type { MenuDayRow } from "./types"

export interface MenuAttendanceDay {
  date: string
  dayOfWeek: string
  dish1: string
  dish2: string | null
  nonVeg: string | null
  hasSecondMain: boolean
  /** "XLSX: week N" or "PDF: <date range>" — which menu sheet this day came from. */
  source: string
  registered: number
  availed: number
  availRate: number
}

export interface DishSummary {
  dish: string
  daysServed: number
  avgRegistered: number
  avgAvailRate: number
}

export interface NonVegSummary {
  item: string
  daysServed: number
  avgAvailRate: number
}

export interface VarietySummary {
  hasSecondMain: boolean
  daysServed: number
  avgAvailRate: number
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length
}

/** Joins per-day attendance totals with that day's menu, restricted to
 * dates present in both — so this automatically follows whatever
 * day/week/month filter produced `daily`. */
export function joinMenuWithAttendance(
  daily: DailyAttendance[],
  menu: MenuDayRow[]
): MenuAttendanceDay[] {
  const menuByDate = new Map(menu.map((row) => [row.date, row]))

  const joined: MenuAttendanceDay[] = []
  for (const day of daily) {
    const menuRow = menuByDate.get(day.date)
    if (!menuRow) continue
    joined.push({
      date: day.date,
      dayOfWeek: day.dayOfWeek,
      dish1: menuRow.dish1,
      dish2: menuRow.dish2,
      nonVeg: menuRow.nonVeg,
      hasSecondMain: menuRow.dish2 !== null,
      source: menuRow.source,
      registered: day.registered,
      availed: day.availed,
      availRate: day.availRate,
    })
  }
  return joined
}

/** One row per unique main dish (`dish1`), averaged across every day it
 * was served — sorted highest avail rate first (top to bottom = best to
 * worst), so the table reads as a ranking. */
export function computeDishLeaderboard(joined: MenuAttendanceDay[]): DishSummary[] {
  const byDish = new Map<string, MenuAttendanceDay[]>()
  for (const day of joined) {
    const existing = byDish.get(day.dish1)
    if (existing) {
      existing.push(day)
    } else {
      byDish.set(day.dish1, [day])
    }
  }

  return Array.from(byDish.entries())
    .map(([dish, days]) => ({
      dish,
      daysServed: days.length,
      avgRegistered: Math.round(average(days.map((d) => d.registered))),
      avgAvailRate: round1(average(days.map((d) => d.availRate))),
    }))
    .sort((a, b) => b.avgAvailRate - a.avgAvailRate)
}

/** One row per non-veg item — small sample (mostly Boiled Eggs, a
 * handful of Omlete days), so this is illustrative, not statistically
 * strong. */
export function computeNonVegSummary(joined: MenuAttendanceDay[]): NonVegSummary[] {
  const byItem = new Map<string, MenuAttendanceDay[]>()
  for (const day of joined) {
    if (!day.nonVeg) continue
    const existing = byItem.get(day.nonVeg)
    if (existing) {
      existing.push(day)
    } else {
      byItem.set(day.nonVeg, [day])
    }
  }

  return Array.from(byItem.entries())
    .map(([item, days]) => ({
      item,
      daysServed: days.length,
      avgAvailRate: round1(average(days.map((d) => d.availRate))),
    }))
    .sort((a, b) => b.avgAvailRate - a.avgAvailRate)
}

/** Single- vs. two-main days — tests whether serving a second main
 * (dish2) correlates with a higher avail rate. */
export function computeVarietySummary(joined: MenuAttendanceDay[]): VarietySummary[] {
  const withSecond = joined.filter((day) => day.hasSecondMain)
  const withoutSecond = joined.filter((day) => !day.hasSecondMain)

  return [
    {
      hasSecondMain: true,
      daysServed: withSecond.length,
      avgAvailRate: round1(average(withSecond.map((d) => d.availRate))),
    },
    {
      hasSecondMain: false,
      daysServed: withoutSecond.length,
      avgAvailRate: round1(average(withoutSecond.map((d) => d.availRate))),
    },
  ].filter((row) => row.daysServed > 0)
}
