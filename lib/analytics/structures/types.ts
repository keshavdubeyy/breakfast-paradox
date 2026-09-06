// Structures-specific result shapes. Sample-size safeguards and the
// eligible/answered/missing eligibility bookkeeping are NOT redefined
// here — they're the same rules Patterns already validated, so
// Structures imports them directly from lib/analytics/patterns/types
// rather than forking a second copy (see that file's own comment: it's
// the shared home for these primitives, despite the folder name).
export {
  computeEligibility,
  MIN_CELL_N,
  sampleFlag,
  SMALL_SAMPLE_N,
  type Eligibility,
  type SampleFlag,
  type SummaryCard,
} from "../patterns/types"

import type { Eligibility, SampleFlag } from "../patterns/types"

/** A whole-sample (or single-branch) categorical/ordinal breakdown drawn
 * as one 100%-stacked bar — "how does this one population split across
 * categories", as opposed to Patterns' RowPercentageTable ("how does
 * membership in category X split across the three branches"). Structures
 * has no branch cross-tab to make for these fields; they're either asked
 * of everyone (messDecision, plan-change frequency, food quality) or
 * already branch-gated upstream (messConsistency via Branch A). */
export interface WholeSampleDistributionBucket {
  value: string
  label: string
  count: number
  /** 0-100, of `eligibility.eligible` (not of total selections — only
   * meaningful as "of everyone eligible for this question"). */
  percentage: number
  flag: SampleFlag
}

export interface WholeSampleDistribution {
  distribution: WholeSampleDistributionBucket[]
  eligibility: Eligibility
}

/** One structural/contextual influence factor's aggregate rating —
 * Structures' analogue of Patterns' LikertMatrixRow, minus the branch
 * breakdown (Structures asks "how strong is this condition, overall",
 * not "does it track with branch membership" — that comparison belongs
 * to Patterns). `category` is an optional analyst-defined tag (see
 * lib/analytics/structures/normalization.ts) for display grouping only —
 * never something a respondent selected. */
export interface InfluenceRankRow {
  key: string
  label: string
  category?: string
  /** Share (0-100) scoring at or above the top two points of the 0-4
   * influence scale ("a lot" / "very strongly"). Null when nobody eligible
   * answered this row. */
  topBoxPercentage: number | null
  topBoxCount: number
  median: number | null
  mean: number | null
  n: number
  flag: SampleFlag
}

export interface InfluenceRanking {
  rows: InfluenceRankRow[]
  eligibility: Eligibility
}

/** The four Structural Snapshot KPI cards — same shape as Patterns'
 * SummaryCard (label/percentage/n/flag) but with a `detailLabel` for the
 * cards that headline a single factor/option rather than a fixed
 * question (e.g. "Serving time — 64%" rather than a fixed card title). */
export interface TopFactorCard {
  detailLabel: string
  percentage: number | null
  n: number
  flag: SampleFlag
}
