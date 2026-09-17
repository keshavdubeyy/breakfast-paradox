"use client"

import { useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { computeMessAttendanceMetrics } from "@/lib/analytics/mess-attendance/metrics"
import type { MessAttendanceRow } from "@/lib/analytics/mess-attendance/types"
import {
  computeDishLeaderboard,
  computeNonVegSummary,
  computeVarietySummary,
  joinMenuWithAttendance,
} from "@/lib/analytics/mess-menu/metrics"
import type { MenuDayRow } from "@/lib/analytics/mess-menu/types"
import { DailyTrendChart } from "@/components/admin/mess-attendance/daily-trend-chart"
import { MenuTimelineChart } from "@/components/admin/mess-attendance/menu-timeline-chart"
import { RushHourChart } from "@/components/admin/mess-attendance/rush-hour-chart"
import { RateBarChart, type RateBarDatum } from "@/components/admin/mess-attendance/rate-bar-chart"

type Granularity = "day" | "week" | "month"

const WEEK_OPTIONS = [1, 2, 3, 4] as const

/** Week N of the month = calendar days [7*(N-1)+1, 7*N], with week 4
 * open-ended to absorb the trailing days of longer months. */
function weekOfMonth(mealDate: string): number {
  const dayOfMonth = Number(mealDate.slice(8, 10))
  return Math.min(4, Math.ceil(dayOfMonth / 7))
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

function formatCount(value: number): string {
  return value.toLocaleString("en-IN")
}

function formatDateLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })
}

interface MessAttendanceClientProps {
  rows: MessAttendanceRow[]
  isConfigured: boolean
  menuRows: MenuDayRow[]
}

export function MessAttendanceClient({ rows, isConfigured, menuRows }: MessAttendanceClientProps) {
  const [granularity, setGranularity] = useState<Granularity>("month")
  const [selectedWeek, setSelectedWeek] = useState<(typeof WEEK_OPTIONS)[number]>(1)

  const availableDates = useMemo(
    () => Array.from(new Set(rows.map((row) => row.mealDate))).sort(),
    [rows]
  )
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const effectiveDate = selectedDate ?? availableDates[0] ?? null

  const filteredRows = useMemo(() => {
    if (granularity === "day") {
      return effectiveDate ? rows.filter((row) => row.mealDate === effectiveDate) : []
    }
    if (granularity === "week") {
      return rows.filter((row) => weekOfMonth(row.mealDate) === selectedWeek)
    }
    return rows
  }, [rows, granularity, selectedWeek, effectiveDate])

  const metrics = useMemo(() => computeMessAttendanceMetrics(filteredRows), [filteredRows])

  const menuJoined = useMemo(
    () => joinMenuWithAttendance(metrics.daily, menuRows),
    [metrics.daily, menuRows]
  )
  const dishLeaderboard = useMemo(() => computeDishLeaderboard(menuJoined), [menuJoined])
  const nonVegSummary = useMemo(() => computeNonVegSummary(menuJoined), [menuJoined])
  const varietySummary = useMemo(() => computeVarietySummary(menuJoined), [menuJoined])
  const sourceKindsInRange = useMemo(
    () => new Set(menuJoined.map((day) => day.source.split(":")[0])),
    [menuJoined]
  )

  if (!isConfigured) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Not available</EmptyTitle>
          <EmptyDescription>
            <code className="font-mono text-xs">data/april-data-clean.csv</code> isn&apos;t
            present — run <code className="font-mono text-xs">scripts/clean_april_data.py</code>{" "}
            to generate it.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No attendance data yet</EmptyTitle>
          <EmptyDescription>The cleaned export is empty.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const messRateData: RateBarDatum[] = metrics.byMess.map((mess) => ({
    label: mess.label,
    rate: mess.availRate,
    detail: `${formatCount(mess.availed)} of ${formatCount(mess.registered)}`,
    registered: mess.registered,
    availed: mess.availed,
  }))

  const weekdayRateData: RateBarDatum[] = metrics.byDayOfWeek.map((day) => ({
    label: day.dayOfWeek,
    rate: day.availRate,
    detail: `${formatCount(day.availed)} of ${formatCount(day.registered)}`,
    registered: day.registered,
    availed: day.availed,
  }))

  const busiestBucket = metrics.rushHour.reduce((max, bucket) =>
    bucket.count > max.count ? bucket : max
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Mess Breakfast Attendance
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The Kadamba mess&apos;s own registration and swipe-in records for{" "}
          {metrics.dateRange
            ? `${metrics.dateRange.start} to ${metrics.dateRange.end}`
            : "the imported month"}
          . There is no per-student identifier in this export — a row is one registered
          breakfast slot, not a person — so this is never merged or cross-tabulated with the
          anonymous student survey, only shown alongside it for context.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={granularity}
          onValueChange={(value) => setGranularity(value as Granularity)}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: string) =>
                value === "day" ? "1 day" : value === "week" ? "7 days" : "Month"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">1 day</SelectItem>
            <SelectItem value="week">7 days</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>

        {granularity === "week" && (
          <Select
            value={String(selectedWeek)}
            onValueChange={(value) =>
              setSelectedWeek(Number(value) as (typeof WEEK_OPTIONS)[number])
            }
          >
            <SelectTrigger>
              <SelectValue>{(value: string) => `Week ${value}`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WEEK_OPTIONS.map((week) => (
                <SelectItem key={week} value={String(week)}>
                  Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {granularity === "day" && (
          <Select
            value={effectiveDate ?? undefined}
            onValueChange={(value) => setSelectedDate(value)}
          >
            <SelectTrigger>
              <SelectValue>
                {(value: string) => (value ? formatDateLabel(value) : "Select date")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDateLabel(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filteredRows.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No attendance data for this range</EmptyTitle>
            <EmptyDescription>Try a different day or week.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Registered</CardDescription>
            <CardTitle className="text-2xl">{formatCount(metrics.totals.registered)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Availed</CardDescription>
            <CardTitle className="text-2xl">{formatCount(metrics.totals.availed)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Avail rate</CardDescription>
            <CardTitle className="text-2xl">{metrics.totals.availRate}%</CardTitle>
            <p className="text-xs text-muted-foreground">
              {formatCount(metrics.totals.registered - metrics.totals.availed)} registered slots
              went unused.
            </p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Busiest 10-min window</CardDescription>
            <CardTitle className="text-2xl">{busiestBucket.bucket}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {formatCount(busiestBucket.count)} scans, IST
            </p>
          </CardHeader>
        </Card>
      </div>

      <SectionHeading>Rush hour — scans per 10-minute window</SectionHeading>
      <Card>
        <CardHeader>
          <CardDescription>
            When students actually swipe in, not when breakfast is served — shows the real queue
            crunch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RushHourChart data={metrics.rushHour} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registered vs. availed by mess</CardTitle>
            <CardDescription>
              Veg carries most of the volume, but non-veg is availed more reliably.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mess</TableHead>
                    <TableHead className="text-right">Registered</TableHead>
                    <TableHead className="text-right">Availed</TableHead>
                    <TableHead className="text-right">Avail rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.byMess.map((mess) => (
                    <TableRow key={mess.mess}>
                      <TableCell className="font-medium text-foreground">{mess.label}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(mess.registered)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(mess.availed)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{mess.availRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <RateBarChart data={messRateData} height={120} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avail rate by day of week</CardTitle>
            <CardDescription>
              Weekday vs. weekend, and which single day lags most. Each bar&apos;s full length is
              that day&apos;s registered volume — the dark share is what was availed, the light
              share went unused.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RateBarChart data={weekdayRateData} height={260} />
          </CardContent>
        </Card>
      </div>

      <SectionHeading>
        {granularity === "day"
          ? "Daily trend"
          : granularity === "week"
            ? `Daily trend — week ${selectedWeek}`
            : "Daily trend across the month"}
      </SectionHeading>
      <Card>
        <CardHeader>
          <CardDescription>
            Registered slots are roughly flat day to day — the gap to the availed line is the
            day-by-day no-show volume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DailyTrendChart data={metrics.daily} />
        </CardContent>
      </Card>

      {menuJoined.length > 0 && (
        <>
          <SectionHeading>Avail rate against the menu</SectionHeading>

          {sourceKindsInRange.size > 1 && (
            <p className="text-xs text-muted-foreground">
              This range mixes menu sources — most days come from the mess&apos;s weekly XLSX
              sheets, the last few days of April from a PDF sheet with a different week boundary.
              Dish comparisons below are still per-day, but treat the two sources as
              provenance, not a single consistent weekly cycle.
            </p>
          )}

          <Card>
            <CardHeader>
              <CardDescription>
                Same registered volume as the daily trend above, one stacked bar per day — dark
                is availed, light went unused — but hover a bar to see what was actually served,
                so a short dark share is easier to explain once it&apos;s next to the dish.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MenuTimelineChart data={menuJoined} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avail rate by main dish</CardTitle>
                <CardDescription>
                  Best-attended dish first, worst at the bottom — the bottom of the table is
                  the starting point for what to reconsider on the menu. Days-served count is
                  small (this is one month), so treat single-digit samples as suggestive, not
                  conclusive.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dish</TableHead>
                        <TableHead className="text-right">Days</TableHead>
                        <TableHead className="text-right">Registered</TableHead>
                        <TableHead className="text-right">Avail rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dishLeaderboard.map((dish) => (
                        <TableRow key={dish.dish}>
                          <TableCell className="font-medium text-foreground">
                            {dish.dish}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {dish.daysServed}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCount(dish.avgRegistered)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {dish.avgAvailRate}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Non-veg item &amp; menu variety</CardTitle>
                <CardDescription>
                  Small samples — mostly illustrative rather than statistically strong.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Non-veg item</TableHead>
                        <TableHead className="text-right">Days</TableHead>
                        <TableHead className="text-right">Avail rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nonVegSummary.map((item) => (
                        <TableRow key={item.item}>
                          <TableCell className="font-medium text-foreground">
                            {item.item}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {item.daysServed}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {item.avgAvailRate}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Menu that day</TableHead>
                        <TableHead className="text-right">Days</TableHead>
                        <TableHead className="text-right">Avail rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {varietySummary.map((row) => (
                        <TableRow key={String(row.hasSecondMain)}>
                          <TableCell className="font-medium text-foreground">
                            {row.hasSecondMain ? "Two mains" : "One main"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.daysServed}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.avgAvailRate}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
