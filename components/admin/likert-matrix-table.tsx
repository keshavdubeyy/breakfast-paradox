import { SampleFlagBadge, shouldShowValue } from "@/components/admin/sample-flag-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BRANCH_LABELS, BRANCHES } from "@/lib/analytics/patterns/normalization"
import type { LikertMatrix } from "@/lib/analytics/patterns/types"

interface LikertMatrixTableProps {
  matrix: LikertMatrix
  itemHeaderLabel: string
  /** Plain-language description of the underlying scale, shown in the
   * footnote — the influence/agreement 0-4 scale and the outcomes -2..+2
   * scale need different wording here, so it's a prop, not a constant. */
  scaleDescription?: string
}

/** One row per Likert-grid item, one column per branch. Median is the
 * primary figure per branch (equal-interval spacing on a Likert scale
 * isn't guaranteed to be equal psychologically) with mean and "top box"
 * (top two points of the 0-4 scale) shown as secondary context — each
 * branch cell is suppressed independently, so one thin branch never
 * hides the others' real numbers. */
export function LikertMatrixTable({
  matrix,
  itemHeaderLabel,
  scaleDescription = "Scale: 0 (not at all / strongly disagree) to 4 (very strongly / strongly agree).",
}: LikertMatrixTableProps) {
  const sortedRows = [...matrix.rows].sort((a, b) => (b.largestGap ?? -1) - (a.largestGap ?? -1))

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{itemHeaderLabel}</TableHead>
              {BRANCHES.map((branch) => (
                <TableHead key={branch} className="text-right">
                  {BRANCH_LABELS[branch]}
                </TableHead>
              ))}
              <TableHead className="text-right">Largest gap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="max-w-xs min-w-48 font-medium whitespace-normal text-foreground">
                  {row.label}
                </TableCell>
                {BRANCHES.map((branch) => {
                  const flag = row.flagByBranch[branch]
                  if (!shouldShowValue(flag)) {
                    return (
                      <TableCell
                        key={branch}
                        className="text-right text-xs text-muted-foreground"
                      >
                        Not enough responses
                        <SampleFlagBadge flag={flag} />
                      </TableCell>
                    )
                  }
                  return (
                    <TableCell key={branch} className="text-right tabular-nums">
                      <span className="font-medium text-foreground">
                        {row.medianByBranch[branch] ?? "—"}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        (mean {row.meanByBranch[branch]?.toFixed(2) ?? "—"})
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {row.topBoxPercentageByBranch[branch] ?? "—"}% top box · n=
                        {row.nByBranch[branch]}
                        <SampleFlagBadge flag={flag} />
                      </div>
                    </TableCell>
                  )
                })}
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {row.largestGap !== null ? row.largestGap.toFixed(2) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        n = {matrix.eligibility.eligible} eligible · {matrix.eligibility.answered} answered ·{" "}
        {matrix.eligibility.missing} missing. {scaleDescription} Sorted by largest cross-branch
        gap — association, not causation.
      </p>
    </div>
  )
}
