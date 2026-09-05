import type { Branch } from "../types"

// --- Denominator/eligibility metadata --------------------------------------
//
// Every Patterns metric carries this alongside its result so the UI can
// show "n = X eligible, Y answered, Z missing" rather than a bare
// percentage — see the "denominator rules" requirement: a branch-unasked
// blank is not the same as a missing answer, and both are different from
// "excluded by a filter".
export interface Eligibility {
  /** Rows in the filtered sample, before considering whether this
   * specific question applies to them. */
  totalFiltered: number
  /** Rows for whom this question applies at all (right branch, right
   * survey version, gating condition met). */
  eligible: number
  /** Eligible rows that actually have a non-null value. */
  answered: number
  /** eligible - answered. */
  missing: number
}

export function computeEligibility(
  totalFiltered: number,
  eligibleCount: number,
  answeredCount: number
): Eligibility {
  return {
    totalFiltered,
    eligible: eligibleCount,
    answered: answeredCount,
    missing: eligibleCount - answeredCount,
  }
}

// --- Sample-size safeguards -------------------------------------------------

export const MIN_CELL_N = 5
export const SMALL_SAMPLE_N = 20

export type SampleFlag = "suppressed" | "small" | "ok"

export function sampleFlag(n: number): SampleFlag {
  if (n < MIN_CELL_N) return "suppressed"
  if (n < SMALL_SAMPLE_N) return "small"
  return "ok"
}

// --- Row-percentage tables (Core Patterns 1, 3, 4) --------------------------

export interface RowPercentageRow {
  key: string
  label: string
  /** Percentage of this row's `n` in each branch — sums to ~100 across
   * the three branches, unless the row is suppressed. */
  percentageByBranch: Record<Branch, number>
  countByBranch: Record<Branch, number>
  n: number
  flag: SampleFlag
}

export interface RowPercentageTable {
  rows: RowPercentageRow[]
  eligibility: Eligibility
}

// --- Paired within-person comparison (Core Pattern 2) -----------------------

export interface PairedComparisonResult {
  lowerOnFirstPercentage: number | null
  samePercentage: number | null
  higherOnFirstPercentage: number | null
  medianGap: number | null
  eligibility: Eligibility
}

// --- Summary cards -----------------------------------------------------

export interface SummaryCard {
  label: string
  /** The headline number, already formatted as a percentage (0-100) or
   * null if there isn't enough data to say anything. */
  percentage: number | null
  n: number
  flag: SampleFlag
}

export interface PatternsSummaryCards {
  earlyCommitmentGap: SummaryCard
  lateSleepGap: SummaryCard
  weekendShift: SummaryCard
  semesterChange: SummaryCard
}

// --- Associations (used by both Core Patterns and the Explorer) ------------

export type AssociationStrength = "weak" | "moderate" | "stronger"

export interface SpearmanResult {
  method: "spearman"
  rho: number
  n: number
  strength: AssociationStrength
}

export interface CramersVResult {
  method: "cramers-v"
  v: number
  n: number
  strength: AssociationStrength
}

// --- Structural-influence / mental-model matrices ---------------------------
//
// One row per Likert-grid item (an influence factor, or an agreement
// statement), broken down by breakfast branch. Mirrors the row-percentage
// tables above in spirit — every branch cell carries its own n and flag,
// so a suppressed cell in one branch never hides the others.
export interface LikertMatrixRow {
  key: string
  label: string
  /** Mean score (0-based scale) per branch, null if that branch has no
   * eligible respondents for this item. */
  meanByBranch: Record<Branch, number | null>
  /** Median score per branch — same null rules as mean. */
  medianByBranch: Record<Branch, number | null>
  /** Share (0-100) of respondents in that branch scoring at or above the
   * "agree"/"strongly influences" end of the scale (top two points). */
  topBoxPercentageByBranch: Record<Branch, number | null>
  nByBranch: Record<Branch, number>
  flagByBranch: Record<Branch, SampleFlag>
  /** Largest gap between any two branches' means, or null if fewer than
   * two branches have a usable mean. Always >= 0. */
  largestGap: number | null
}

export interface LikertMatrix {
  rows: LikertMatrixRow[]
  eligibility: Eligibility
}
