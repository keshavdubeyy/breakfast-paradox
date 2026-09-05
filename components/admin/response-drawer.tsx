"use client"

import { ARCHETYPES } from "@/lib/archetype-content"
import { labelFor } from "@/lib/analytics/distributions"
import type { AnalyticsRow, Branch } from "@/lib/analytics/types"
import {
  BREAKFAST_FREQUENCY_OPTIONS,
  EARLY_COMMITMENT_OPTIONS,
  HOSTEL_OPTIONS,
  SLEEP_TIME_OPTIONS,
  YEAR_OPTIONS,
} from "@/lib/survey-options"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const BRANCH_LABELS: Record<Branch, string> = {
  A: "Regular eaters",
  B: "Conditional eaters",
  C: "Rare / non-eaters",
}

export interface ResponseDrawerColumn {
  label: string
  getValue: (row: AnalyticsRow) => string
}

interface ResponseDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  rows: AnalyticsRow[]
  /** Columns specific to whichever chart bucket was clicked, shown after
   * the shared context columns — the "exact relevant answers" the
   * Events spec calls for, alongside enough context to make sense of
   * them (hostel, year, branch, etc.), never a name or email. */
  extraColumns?: ResponseDrawerColumn[]
}

/** Drill-down for "View responses" on any Events chart — a chart click
 * hands this a pre-filtered row list, and this only ever renders it;
 * it doesn't know or care which chart it came from. */
export function ResponseDrawer({
  open,
  onOpenChange,
  title,
  rows,
  extraColumns = [],
}: ResponseDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {rows.length} anonymous response{rows.length === 1 ? "" : "s"} — no
            names or emails collected.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto px-6 pb-6">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No matching responses.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anonymous ID</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Early commitments</TableHead>
                  <TableHead>Breakfast frequency</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Sleep time</TableHead>
                  <TableHead>Primary archetype</TableHead>
                  {extraColumns.map((column) => (
                    <TableHead key={column.label}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {row.hostel ? labelFor(HOSTEL_OPTIONS, row.hostel) : "—"}
                    </TableCell>
                    <TableCell>
                      {row.year ? labelFor(YEAR_OPTIONS, row.year) : "—"}
                    </TableCell>
                    <TableCell>
                      {row.earlyCommitmentDays
                        ? labelFor(EARLY_COMMITMENT_OPTIONS, row.earlyCommitmentDays)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {row.breakfastFrequency
                        ? labelFor(BREAKFAST_FREQUENCY_OPTIONS, row.breakfastFrequency)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {row.branch ? BRANCH_LABELS[row.branch] : "—"}
                    </TableCell>
                    <TableCell>
                      {row.sleepTimeWeekday
                        ? labelFor(SLEEP_TIME_OPTIONS, row.sleepTimeWeekday)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {row.primaryArchetype
                        ? ARCHETYPES[row.primaryArchetype].name
                        : "—"}
                    </TableCell>
                    {extraColumns.map((column) => (
                      <TableCell key={column.label}>
                        {column.getValue(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
