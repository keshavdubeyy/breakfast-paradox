"use client"

import { useMemo } from "react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { computeMessAttendanceMetrics } from "@/lib/analytics/mess-attendance/metrics"
import type { MessAttendanceRow } from "@/lib/analytics/mess-attendance/types"
import { DailyTrendChart } from "@/components/admin/mess-attendance/daily-trend-chart"
import { RushHourChart } from "@/components/admin/mess-attendance/rush-hour-chart"
import { RateBarChart, type RateBarDatum } from "@/components/admin/mess-attendance/rate-bar-chart"

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

interface MessAttendanceClientProps {
  rows: MessAttendanceRow[]
  isConfigured: boolean
}

export function MessAttendanceClient({ rows, isConfigured }: MessAttendanceClientProps) {
  const metrics = useMemo(() => computeMessAttendanceMetrics(rows), [rows])

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
  }))

  const weekdayRateData: RateBarDatum[] = metrics.byDayOfWeek.map((day) => ({
    label: day.dayOfWeek,
    rate: day.availRate,
    detail: `${formatCount(day.availed)} of ${formatCount(day.registered)}`,
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
            <CardDescription>Weekday vs. weekend, and which single day lags most.</CardDescription>
          </CardHeader>
          <CardContent>
            <RateBarChart data={weekdayRateData} height={260} />
          </CardContent>
        </Card>
      </div>

      <SectionHeading>Daily trend across the month</SectionHeading>
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
    </div>
  )
}
