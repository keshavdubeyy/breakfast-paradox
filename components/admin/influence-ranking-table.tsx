import { SampleFlagBadge, shouldShowValue } from "@/components/admin/sample-flag-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { InfluenceRanking } from "@/lib/analytics/structures/types"

interface InfluenceRankingTableProps {
  ranking: InfluenceRanking
  itemHeaderLabel: string
  /** Whether to show the analyst-defined category column — omit for
   * rankings with no category tag (Service environment, Alternative
   * ecosystem). */
  showCategory?: boolean
}

/** The "View data" table behind an InfluenceRanking (Structural Drivers,
 * Service environment, Alternative ecosystem, Biggest influence) — median
 * is the primary figure (equal-interval spacing on a Likert scale isn't
 * guaranteed to be equal psychologically), mean and top-box as secondary
 * context, mirroring LikertMatrixTable's convention minus the branch
 * columns Structures doesn't need. */
export function InfluenceRankingTable({
  ranking,
  itemHeaderLabel,
  showCategory = false,
}: InfluenceRankingTableProps) {
  const sortedRows = [...ranking.rows].sort(
    (a, b) => (b.topBoxPercentage ?? -1) - (a.topBoxPercentage ?? -1)
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{itemHeaderLabel}</TableHead>
              {showCategory ? <TableHead>Category</TableHead> : null}
              <TableHead className="text-right">Top box %</TableHead>
              <TableHead className="text-right">Median</TableHead>
              <TableHead className="text-right">Mean</TableHead>
              <TableHead className="text-right">n</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="max-w-xs min-w-48 font-medium whitespace-normal text-foreground">
                  {row.label}
                </TableCell>
                {showCategory ? (
                  <TableCell className="text-xs text-muted-foreground">{row.category ?? "—"}</TableCell>
                ) : null}
                {shouldShowValue(row.flag) ? (
                  <>
                    <TableCell className="text-right tabular-nums">
                      {row.topBoxPercentage ?? "—"}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.median ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.mean !== null ? row.mean.toFixed(2) : "—"}
                    </TableCell>
                  </>
                ) : (
                  <TableCell
                    colSpan={3}
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
        n = {ranking.eligibility.eligible} eligible · {ranking.eligibility.answered} answered ·{" "}
        {ranking.eligibility.missing} missing. Scale: 0 (not at all) to 4 (very strongly). Sorted by
        top-box % — association, not causation.
      </p>
    </div>
  )
}
