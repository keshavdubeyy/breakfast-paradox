"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import type {
  ClassScheduleRow,
  ScheduleSlotSummary,
} from "@/lib/analytics/administration/types"

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

/** The table of individual courses inside one slot — shared between the
 * calendar event popup and (implicitly) anywhere else a slot's full detail
 * needs to be listed. */
function SlotCoursesTable({ courses }: { courses: ClassScheduleRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead className="text-right">Registered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                {course.courseNo && <p className="font-medium text-foreground">{course.courseNo}</p>}
                <p
                  className={
                    course.courseNo ? "text-xs text-muted-foreground" : "font-medium text-foreground"
                  }
                >
                  {course.courseName}
                </p>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{course.tag ?? "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{course.room ?? "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {course.facultyNames.length > 0 ? course.facultyNames.join(", ") : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">{course.registeredCount ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const CALENDAR_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
const CALENDAR_DAY_LABELS: Record<(typeof CALENDAR_DAYS)[number], string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
}

// The timetable's own slots run 8:30 AM–6:40 PM; the grid gives each side a
// half-hour of margin so the first/last blocks aren't flush against the edge.
const CALENDAR_START_MINUTES = 8 * 60
const CALENDAR_END_MINUTES = 19 * 60
const CALENDAR_SPAN_MINUTES = CALENDAR_END_MINUTES - CALENDAR_START_MINUTES
const CALENDAR_HOUR_MARKS = Array.from(
  { length: CALENDAR_SPAN_MINUTES / 60 + 1 },
  (_, i) => CALENDAR_START_MINUTES + i * 60
)

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function formatHourMark(minutes: number): string {
  const hour24 = Math.floor(minutes / 60)
  const period = hour24 < 12 || hour24 === 24 ? "AM" : "PM"
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12} ${period}`
}

interface CalendarEvent {
  key: string
  day: (typeof CALENDAR_DAYS)[number]
  slot: ScheduleSlotSummary
}

/** One slot placed on one of its meeting days — a slot meeting Mon & Thu
 * becomes two events, one per day column, since this is a day-of-week grid
 * rather than a specific-date one. */
function buildCalendarEvents(slots: ScheduleSlotSummary[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (const slot of slots) {
    for (const day of slot.days) {
      if ((CALENDAR_DAYS as readonly string[]).includes(day)) {
        events.push({ key: `${slot.key}-${day}`, day: day as CalendarEvent["day"], slot })
      }
    }
  }
  return events
}

interface EventColumn {
  col: number
  colCount: number
}

/** Lays out one day's events into side-by-side columns wherever two events
 * overlap in time (e.g. Tuesday has both the Tue/Fri-wide 10:05 slot and a
 * Tuesday-only "Engineering Virtual Reality Systems" slot at the same
 * time) — otherwise they'd render stacked on top of each other. Standard
 * greedy interval-column assignment: events are grouped into clusters that
 * transitively overlap, and each cluster gets its own column count. */
function layoutDayEvents(dayEvents: CalendarEvent[]): Map<string, EventColumn> {
  const withTimes = dayEvents
    .map((event) => ({
      event,
      start: timeToMinutes(event.slot.startTime),
      end: timeToMinutes(event.slot.endTime),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const result = new Map<string, EventColumn>()
  let cluster: typeof withTimes = []
  let clusterMaxEnd = -Infinity

  function flushCluster() {
    if (cluster.length === 0) return
    const columnEnds: number[] = []
    const assignments: { key: string; col: number }[] = []
    for (const item of cluster) {
      let col = columnEnds.findIndex((end) => end <= item.start)
      if (col === -1) {
        col = columnEnds.length
        columnEnds.push(item.end)
      } else {
        columnEnds[col] = item.end
      }
      assignments.push({ key: item.event.key, col })
    }
    for (const { key, col } of assignments) {
      result.set(key, { col, colCount: columnEnds.length })
    }
    cluster = []
    clusterMaxEnd = -Infinity
  }

  for (const item of withTimes) {
    if (cluster.length > 0 && item.start >= clusterMaxEnd) {
      flushCluster()
    }
    cluster.push(item)
    clusterMaxEnd = Math.max(clusterMaxEnd, item.end)
  }
  flushCluster()

  return result
}

function CalendarEventBlock({
  event,
  column,
  onSelect,
}: {
  event: CalendarEvent
  column: EventColumn
  onSelect: (event: CalendarEvent) => void
}) {
  const { slot } = event
  const startMinutes = timeToMinutes(slot.startTime)
  const endMinutes = timeToMinutes(slot.endTime)
  const top = ((startMinutes - CALENDAR_START_MINUTES) / CALENDAR_SPAN_MINUTES) * 100
  const height = ((endMinutes - startMinutes) / CALENDAR_SPAN_MINUTES) * 100
  const widthPct = 100 / column.colCount
  const leftPct = column.col * widthPct
  const firstCourse = slot.courses[0]

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="absolute flex flex-col overflow-hidden rounded-md border border-primary/30 bg-primary/10 px-1.5 py-1 text-left transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      style={{
        top: `${top}%`,
        height: `${Math.max(height, 3)}%`,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
    >
      <span className="truncate text-[11px] leading-tight font-medium text-foreground">
        {slot.courses.length > 1
          ? `${slot.courses.length} courses`
          : (firstCourse?.courseName ?? "Course")}
      </span>
      <span className="truncate text-[10px] leading-tight text-muted-foreground">
        {slot.startTime}–{slot.endTime}
      </span>
    </button>
  )
}

function WeekCalendar({ slots }: { slots: ScheduleSlotSummary[] }) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null)
  const events = useMemo(() => buildCalendarEvents(slots), [slots])

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[56px_repeat(6,1fr)] border-b border-border/60">
            <div />
            {CALENDAR_DAYS.map((day) => (
              <div
                key={day}
                className="border-l border-border/60 px-2 py-2 text-center text-xs font-semibold tracking-wide text-foreground uppercase"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[56px_repeat(6,1fr)]">
            <div className="relative" style={{ height: 880 }}>
              {CALENDAR_HOUR_MARKS.map((minutes) => (
                <div
                  key={minutes}
                  className="absolute right-2 -translate-y-1/2 text-[10px] text-muted-foreground"
                  style={{ top: `${((minutes - CALENDAR_START_MINUTES) / CALENDAR_SPAN_MINUTES) * 100}%` }}
                >
                  {formatHourMark(minutes)}
                </div>
              ))}
            </div>
            {CALENDAR_DAYS.map((day) => {
              const dayEvents = events.filter((event) => event.day === day)
              const columns = layoutDayEvents(dayEvents)
              return (
                <div key={day} className="relative border-l border-border/60" style={{ height: 880 }}>
                  {CALENDAR_HOUR_MARKS.map((minutes) => (
                    <div
                      key={minutes}
                      className="absolute right-0 left-0 border-t border-border/30"
                      style={{ top: `${((minutes - CALENDAR_START_MINUTES) / CALENDAR_SPAN_MINUTES) * 100}%` }}
                    />
                  ))}
                  {dayEvents.map((event) => (
                    <CalendarEventBlock
                      key={event.key}
                      event={event}
                      column={columns.get(event.key) ?? { col: 0, colCount: 1 }}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {CALENDAR_DAY_LABELS[selected.day]} · {selected.slot.startTime}–{selected.slot.endTime}
                </DialogTitle>
                <DialogDescription>
                  Meets {formatDays(selected.slot.days)} · {selected.slot.courses.length} course
                  {selected.slot.courses.length === 1 ? "" : "s"}
                  {selected.slot.totalRegisteredSeats !== null && (
                    <>
                      {" "}
                      · {selected.slot.totalRegisteredSeats} total registered seats (sum across courses,
                      not a distinct-student count).
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <SlotCoursesTable courses={selected.slot.courses} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
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
            <CardTitle className="text-2xl">{metrics.totalRegisteredSeats ?? "—"}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {metrics.totalRegisteredSeats !== null
                ? "Sum across courses, not a distinct-student count."
                : "Not available — this import has no registration-portal seat counts."}
            </p>
          </CardHeader>
        </Card>
      </div>

      <SectionHeading>Weekly timetable</SectionHeading>
      <p className="-mt-4 text-xs text-muted-foreground">
        Click a block to see the courses meeting in that slot.
      </p>
      <WeekCalendar slots={metrics.slots} />

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
