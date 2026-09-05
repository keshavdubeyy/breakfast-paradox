// Display adapters — pure reshaping of already-validated Patterns
// metrics into the shape the new chart primitives expect. Nothing here
// recomputes a statistic: every number returned already exists on the
// LikertMatrix/RowPercentageTable/PairedComparisonResult the caller
// passes in (see metrics.ts) — this file only picks which field goes in
// which chart slot, so the redesign changes what a number looks like,
// never what it is.

import type { Branch } from "../types"
import { BRANCHES } from "./normalization"
import type {
  LikertMatrix,
  RowPercentageTable,
  SampleFlag,
} from "./types"

export interface BarRowDisplay {
  key: string
  label: string
  n: number
  flag: SampleFlag
  percentageBySegment: Record<string, number>
  countBySegment: Record<string, number>
}

/** RowPercentageTable -> one 100%-stacked-bar row per table row. The
 * branch breakdown is already a set of percentages that sum to ~100 per
 * row (see buildRowPercentageTable) — this just renames the keys the
 * StackedPercentageBar component expects. */
export function rowPercentageTableToBars(table: RowPercentageTable): BarRowDisplay[] {
  return table.rows.map((row) => ({
    key: row.key,
    label: row.label,
    n: row.n,
    flag: row.flag,
    percentageBySegment: row.percentageByBranch,
    countBySegment: row.countByBranch,
  }))
}

export interface HeatmapCellDisplay {
  value: number | null
  n: number
  flag: SampleFlag
  detail: { label: string; value: string }[]
}

export interface HeatmapRowDisplay {
  key: string
  label: string
  cells: Record<Branch, HeatmapCellDisplay>
  sortMetric: number | null
}

function formatScore(value: number | null, digits = 2): string {
  return value === null ? "—" : value.toFixed(digits)
}

/** LikertMatrix -> one heatmap row per matrix row, one column per branch.
 * Cell color intensity is `topBoxPercentageByBranch` (already computed by
 * buildLikertMatrix) — median/mean move into the tooltip `detail` instead
 * of sharing the cell with the color-encoded number. */
export function likertMatrixToHeatmapRows(matrix: LikertMatrix): HeatmapRowDisplay[] {
  return matrix.rows.map((row) => {
    const cells = {} as Record<Branch, HeatmapCellDisplay>
    for (const branch of BRANCHES) {
      cells[branch] = {
        value: row.topBoxPercentageByBranch[branch],
        n: row.nByBranch[branch],
        flag: row.flagByBranch[branch],
        detail: [
          { label: "Median", value: formatScore(row.medianByBranch[branch], 0) },
          { label: "Mean", value: formatScore(row.meanByBranch[branch]) },
        ],
      }
    }
    return { key: row.key, label: row.label, cells, sortMetric: row.largestGap }
  })
}

export interface DotPointDisplay {
  seriesKey: Branch
  value: number | null
  n: number
  flag: SampleFlag
  detail?: string
}

export interface DotRowDisplay {
  key: string
  label: string
  points: DotPointDisplay[]
}

/** LikertMatrix (outcomes: -2..+2 comparison scale) -> one dot-plot row
 * per matrix row, one dot per branch positioned at that branch's median
 * — the primary figure for an ordinal scale, exactly as the matrix table
 * already treated it (see LikertMatrixTable). Mean moves into the
 * tooltip. */
export function likertMatrixToDotRows(matrix: LikertMatrix): DotRowDisplay[] {
  return matrix.rows.map((row) => ({
    key: row.key,
    label: row.label,
    points: BRANCHES.map((branch) => ({
      seriesKey: branch,
      value: row.medianByBranch[branch],
      n: row.nByBranch[branch],
      flag: row.flagByBranch[branch],
      detail:
        row.meanByBranch[branch] !== null
          ? `mean ${formatScore(row.meanByBranch[branch])}`
          : undefined,
    })),
  }))
}
