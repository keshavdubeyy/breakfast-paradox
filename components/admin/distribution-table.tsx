import { SampleFlagBadge, shouldShowValue } from "@/components/admin/sample-flag-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

export interface DistributionTableRow {
  label: string
  count: number
  percentage: number
  flag: SampleFlag
}

interface DistributionTableProps {
  data: DistributionTableRow[]
  labelHeader: string
  /** e.g. "n = 214 eligible · 198 answered · 16 missing". */
  footnote?: string
  /** Shown under the header — e.g. "Respondents could select more than
   * one option; percentages do not total 100%." for a multi-select. */
  caption?: string
}

/** The generic "View data" table behind any Structures ranked/ordinal
 * breakdown (messDecision, plan-change frequency, food quality, or any
 * branch-gated multi-select) — exact count/percentage/n/flag per
 * category, never showing a suppressed row's real value (same rule as
 * every other Patterns/Structures table). */
export function DistributionTable({ data, labelHeader, footnote, caption }: DistributionTableProps) {
  return (
    <div className="flex flex-col gap-2">
      {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labelHeader}</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">n</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {shouldShowValue(row.flag) ? `${row.percentage}%` : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {row.count}
                  <SampleFlagBadge flag={row.flag} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {footnote ? <p className="text-xs text-muted-foreground">{footnote}</p> : null}
    </div>
  )
}
