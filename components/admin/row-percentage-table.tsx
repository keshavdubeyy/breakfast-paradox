import { SampleFlagBadge, shouldShowValue } from "@/components/admin/sample-flag-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Branch } from "@/lib/analytics/types"
import { BRANCH_LABELS } from "@/lib/analytics/patterns/normalization"
import type { RowPercentageTable } from "@/lib/analytics/patterns/types"

const BRANCHES: Branch[] = ["A", "B", "C"]

interface RowPercentageTableViewProps {
  table: RowPercentageTable
  rowHeaderLabel: string
}

/** Every populated row sums to ~100% across the three branches (a row
 * percentage table, not a column one) — a thin row is flagged rather
 * than hidden, so "not enough responses" is visible instead of a
 * confident-looking 100% built from one or two people. */
export function RowPercentageTableView({
  table,
  rowHeaderLabel,
}: RowPercentageTableViewProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{rowHeaderLabel}</TableHead>
              {BRANCHES.map((branch) => (
                <TableHead key={branch} className="text-right">
                  {BRANCH_LABELS[branch]}
                </TableHead>
              ))}
              <TableHead className="text-right">n</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="font-medium text-foreground">
                  {row.label}
                </TableCell>
                {shouldShowValue(row.flag) ? (
                  BRANCHES.map((branch) => (
                    <TableCell key={branch} className="text-right tabular-nums">
                      {row.percentageByBranch[branch]}%
                    </TableCell>
                  ))
                ) : (
                  <TableCell
                    colSpan={BRANCHES.length}
                    className="text-center text-xs text-muted-foreground"
                  >
                    Not enough responses to display safely
                  </TableCell>
                )}
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {row.n}
                  <SampleFlagBadge flag={row.flag} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        n = {table.eligibility.eligible} eligible · {table.eligibility.answered}{" "}
        answered · {table.eligibility.missing} missing
      </p>
    </div>
  )
}
