"use client"

import { useMemo } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
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

import { computeAdministrationMetrics } from "@/lib/analytics/administration/metrics"
import type { ClassScheduleRow } from "@/lib/analytics/administration/types"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

function formatDays(days: string[]): string {
  return days.join(" & ")
}

function SlotCard({
  slot,
}: {
  slot: ReturnType<typeof computeAdministrationMetrics>["slots"][number]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {slot.startTime}–{slot.endTime} · {formatDays(slot.days)}
        </CardTitle>
        <CardDescription>
          {slot.courses.length} course{slot.courses.length === 1 ? "" : "s"} · {slot.totalRegisteredSeats}{" "}
          total registered seats (sum across courses — not a distinct-student count, since one
          student can register for more than one course).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead className="text-right">Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slot.courses.map((course: ClassScheduleRow) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{course.courseNo}</p>
                    <p className="text-xs text-muted-foreground">{course.courseName}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {course.facultyNames.join(", ")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{course.registeredCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

interface AdministrationClientProps {
  rows: ClassScheduleRow[]
  isConfigured: boolean
}

export function AdministrationClient({ rows, isConfigured }: AdministrationClientProps) {
  const metrics = useMemo(() => computeAdministrationMetrics(rows), [rows])

  if (!isConfigured) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Not connected</EmptyTitle>
          <EmptyDescription>
            <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> isn&apos;t set —
            there is no bundled sample dataset for institutional timetable data, so nothing is
            shown until this is configured.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No timetable data yet</EmptyTitle>
          <EmptyDescription>
            Import class-schedule rows into the <code className="font-mono text-xs">class_schedule</code>{" "}
            table to see them here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Administration</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The institute&apos;s own class timetable — a different data source and a different
          population from the anonymous student survey. There is no way to link a specific survey
          respondent to a specific course registration, so figures here are never merged or
          cross-tabulated with student-survey numbers, only shown alongside them for context.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <Badge variant="secondary" className="mr-2 text-[10px] tracking-wide uppercase">
          Partial import
        </Badge>
        {`This currently covers only the time slots that have been imported so far — not the full ${metrics.semester ?? "current"} timetable. More slots can be added as they're imported.`}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Semester</CardDescription>
            <CardTitle className="text-2xl">{metrics.semester ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Courses imported</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalCourses}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total registered seats (imported courses)</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalRegisteredSeats}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Sum across courses, not a distinct-student count.
            </p>
          </CardHeader>
        </Card>
      </div>

      <SectionHeading>Imported time slots</SectionHeading>
      <div className="flex flex-col gap-4">
        {metrics.slots.map((slot) => (
          <SlotCard key={slot.key} slot={slot} />
        ))}
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">For context, not a joined statistic:</p>
        <p className="mt-1">
          The anonymous student survey separately found that class timing is a strong factor in
          breakfast decisions — see{" "}
          <Link href="/admin/structures" className="underline underline-offset-2 hover:text-foreground">
            Structures
          </Link>{" "}
          (structural influence ranking) and{" "}
          <Link href="/admin/patterns" className="underline underline-offset-2 hover:text-foreground">
            Patterns
          </Link>{" "}
          (early-commitment gap) for those figures. This page cannot confirm how many of the
          students in that survey are actually registered in the courses above — the two datasets
          aren&apos;t linked.
        </p>
      </div>
    </div>
  )
}
