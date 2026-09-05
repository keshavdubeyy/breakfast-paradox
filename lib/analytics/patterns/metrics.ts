import {
  EARLY_COMMITMENT_OPTIONS,
  SLEEP_TIME_OPTIONS,
  WAKE_TIME_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"
import { percentageOf } from "../distributions"
import { median } from "../metrics"
import type { AnalyticsRow, Branch } from "../types"
import { cramersV, spearman } from "./associations"
import {
  agreementRowScore,
  AGREEMENT_STATEMENT_ITEMS,
  breakfastFrequencyScore,
  BRANCHES,
  comparisonRowScore,
  COMPARISON_ROW_ITEMS,
  earlyCommitmentPairedGap,
  hasValidPairedEarlyCommitmentFrequency,
  influenceRowScore,
  LATE_SLEEP_COHORTS,
  sleepScore,
  SUBSTANTIVE_INFLUENCE_ITEMS,
  wakeScore,
} from "./normalization"
import {
  computeEligibility,
  sampleFlag,
  type Eligibility,
  type LikertMatrix,
  type LikertMatrixRow,
  type PairedComparisonResult,
  type PatternsSummaryCards,
  type RowPercentageRow,
  type RowPercentageTable,
  type SampleFlag,
  type SpearmanResult,
  type SummaryCard,
} from "./types"

// --- Core Pattern 1 & 3 & 4: row-percentage tables --------------------------
//
// Shared builder: for each category of `getRowKey` (in the order given by
// `rowOptions`), what share of respondents *in that category* fall into
// each breakfast branch — i.e. every row sums to ~100%, not every column.
// Rows below MIN_CELL_N are flagged "suppressed"; the caller decides
// whether to still render them (as "not enough responses") or hide them.
function buildRowPercentageTable(
  rows: AnalyticsRow[],
  getRowKey: (row: AnalyticsRow) => string | null,
  rowOptions: SurveyOption[]
): RowPercentageTable {
  const eligibleRows = rows.filter((row) => row.branch !== null)
  const answeredRows = eligibleRows.filter((row) => getRowKey(row) !== null)

  const tableRows: RowPercentageRow[] = rowOptions.map((option) => {
    const rowMembers = answeredRows.filter(
      (row) => getRowKey(row) === option.value
    )
    const n = rowMembers.length
    const countByBranch = { A: 0, B: 0, C: 0 } as Record<Branch, number>
    for (const row of rowMembers) {
      countByBranch[row.branch!] += 1
    }
    const percentageByBranch = {
      A: percentageOf(countByBranch.A, n),
      B: percentageOf(countByBranch.B, n),
      C: percentageOf(countByBranch.C, n),
    } as Record<Branch, number>

    return {
      key: option.value,
      label: option.label,
      percentageByBranch,
      countByBranch,
      n,
      flag: sampleFlag(n),
    }
  })

  return {
    rows: tableRows,
    eligibility: computeEligibility(rows.length, eligibleRows.length, answeredRows.length),
  }
}

export function computeEarlyCommitmentsByBranch(rows: AnalyticsRow[]): RowPercentageTable {
  return buildRowPercentageTable(
    rows,
    (row) => row.earlyCommitmentDays,
    EARLY_COMMITMENT_OPTIONS
  )
}

export function computeSleepByBranch(rows: AnalyticsRow[]): RowPercentageTable {
  return buildRowPercentageTable(rows, (row) => row.sleepTimeWeekday, SLEEP_TIME_OPTIONS)
}

export function computeWakeByBranch(rows: AnalyticsRow[]): RowPercentageTable {
  return buildRowPercentageTable(rows, (row) => row.wakeTimeWeekday, WAKE_TIME_OPTIONS)
}

/** Spearman between an ordinal field and breakfast-frequency score, over
 * only the rows where both resolve to a real number — "no-consistent-time"
 * (which has no ordinal position) is excluded here exactly like the spec
 * requires, while still appearing as its own row in the table above. */
export function computeOrdinalVsBreakfastAssociation(
  rows: AnalyticsRow[],
  getOrdinalScore: (row: AnalyticsRow) => number | null
): SpearmanResult | null {
  const pairs: [number, number][] = []
  for (const row of rows) {
    const x = getOrdinalScore(row)
    const y = breakfastFrequencyScore(row)
    if (x !== null && y !== null) {
      pairs.push([x, y])
    }
  }
  return spearman(pairs)
}

// --- Core Pattern 2: within-person early vs non-early comparison ----------

export function computeEarlyCommitmentPairedComparison(
  rows: AnalyticsRow[]
): PairedComparisonResult {
  const eligible = rows.filter(hasValidPairedEarlyCommitmentFrequency)
  const gaps = eligible.map((row) => earlyCommitmentPairedGap(row)!)
  const n = gaps.length

  const lower = gaps.filter((gap) => gap > 0).length
  const same = gaps.filter((gap) => gap === 0).length
  const higher = gaps.filter((gap) => gap < 0).length

  return {
    lowerOnFirstPercentage: n === 0 ? null : percentageOf(lower, n),
    samePercentage: n === 0 ? null : percentageOf(same, n),
    higherOnFirstPercentage: n === 0 ? null : percentageOf(higher, n),
    medianGap: median(gaps),
    eligibility: computeEligibility(rows.length, rows.length, n),
  }
}

// --- Structural-influence × behaviour, and mental-model × behaviour --------
//
// Both matrices share the same shape: one row per Likert-grid item, broken
// down by breakfast branch, so "does this belief/influence track with
// actual breakfast behaviour (branch)" reads directly off the table. The
// scale is 0-4 for both influence and agreement items (see
// INFLUENCE_SCALE/AGREEMENT_SCALE), so a single top-box threshold applies
// to both — "top box" here means the top two points of the scale (a-lot /
// very-strongly, or agree / strongly-agree). The outcomes matrix below
// reuses the same shape on the -2..+2 comparison scale, so the threshold
// is a parameter rather than this fixed constant.
const LIKERT_TOP_BOX_THRESHOLD = 3

function buildLikertMatrix(
  rows: AnalyticsRow[],
  items: { key: string; label: string }[],
  getScore: (row: AnalyticsRow, key: string) => number | null,
  topBoxThreshold: number = LIKERT_TOP_BOX_THRESHOLD
): LikertMatrix {
  const eligibleRows = rows.filter((row) => row.branch !== null)

  const matrixRows: LikertMatrixRow[] = items.map((item) => {
    const meanByBranch = {} as Record<Branch, number | null>
    const medianByBranch = {} as Record<Branch, number | null>
    const topBoxPercentageByBranch = {} as Record<Branch, number | null>
    const nByBranch = {} as Record<Branch, number>
    const flagByBranch = {} as Record<Branch, SampleFlag>

    for (const branch of BRANCHES) {
      const branchRows = eligibleRows.filter((row) => row.branch === branch)
      const scores = branchRows
        .map((row) => getScore(row, item.key))
        .filter((score): score is number => score !== null)
      const n = scores.length

      nByBranch[branch] = n
      flagByBranch[branch] = sampleFlag(n)
      meanByBranch[branch] =
        n === 0 ? null : scores.reduce((sum, score) => sum + score, 0) / n
      medianByBranch[branch] = median(scores)
      topBoxPercentageByBranch[branch] =
        n === 0
          ? null
          : percentageOf(scores.filter((score) => score >= topBoxThreshold).length, n)
    }

    const validMeans = BRANCHES.map((branch) => meanByBranch[branch]).filter(
      (mean): mean is number => mean !== null
    )
    const largestGap =
      validMeans.length < 2 ? null : Math.max(...validMeans) - Math.min(...validMeans)

    return {
      key: item.key,
      label: item.label,
      meanByBranch,
      medianByBranch,
      topBoxPercentageByBranch,
      nByBranch,
      flagByBranch,
      largestGap,
    }
  })

  const answeredRows = eligibleRows.filter((row) =>
    items.some((item) => getScore(row, item.key) !== null)
  )

  return {
    rows: matrixRows,
    eligibility: computeEligibility(rows.length, eligibleRows.length, answeredRows.length),
  }
}

/** Structural-influence × behaviour: for each structural factor (mess
 * timing, class schedule, sleep, etc. — every row of the influence grid
 * except the attention check), how strongly branch A/B/C respondents say
 * it influences their breakfast decisions. A large `largestGap` flags a
 * factor that plausibly *drives* branch membership rather than merely
 * correlating with it — still just an association, not causal proof. */
export function computeInfluenceMatrix(rows: AnalyticsRow[]): LikertMatrix {
  return buildLikertMatrix(rows, SUBSTANTIVE_INFLUENCE_ITEMS, influenceRowScore)
}

/** Mental-model × behaviour: for each belief statement, how strongly
 * branch A/B/C respondents agree — the "does what people believe about
 * breakfast track with what they actually do" table. */
export function computeAgreementMatrix(rows: AnalyticsRow[]): LikertMatrix {
  return buildLikertMatrix(rows, AGREEMENT_STATEMENT_ITEMS, agreementRowScore)
}

/** Reported energy/concentration/hunger outcomes, by branch. Scale is -2
 * (much lower than usual) to +2 (much higher) rather than 0-4, so
 * "top box" here means the two most-positive points (slightly/much
 * higher) — reuses the same suppression, median-first, largest-gap shape
 * as the two matrices above rather than a new bespoke calculation. */
export function computeOutcomeMatrix(rows: AnalyticsRow[]): LikertMatrix {
  return buildLikertMatrix(rows, COMPARISON_ROW_ITEMS, comparisonRowScore, 1)
}

// --- Summary cards -----------------------------------------------------

const REGULAR_EATER_BRANCH: Branch = "A"

function regularEaterRate(rows: AnalyticsRow[]): { percentage: number | null; n: number } {
  const eligible = rows.filter((row) => row.branch !== null)
  const n = eligible.length
  if (n === 0) {
    return { percentage: null, n: 0 }
  }
  const regular = eligible.filter((row) => row.branch === REGULAR_EATER_BRANCH).length
  return { percentage: percentageOf(regular, n), n }
}

function summaryCard(
  label: string,
  percentage: number | null,
  n: number
): SummaryCard {
  return { label, percentage, n, flag: sampleFlag(n) }
}

export function computePatternsSummaryCards(rows: AnalyticsRow[]): PatternsSummaryCards {
  const paired = computeEarlyCommitmentPairedComparison(rows)

  const earlySleepers = rows.filter(
    (row) =>
      row.sleepTimeWeekday !== null &&
      LATE_SLEEP_COHORTS.early.includes(row.sleepTimeWeekday)
  )
  const lateSleepers = rows.filter(
    (row) =>
      row.sleepTimeWeekday !== null &&
      LATE_SLEEP_COHORTS.late.includes(row.sleepTimeWeekday)
  )
  const earlyRate = regularEaterRate(earlySleepers)
  const lateRate = regularEaterRate(lateSleepers)
  const lateSleepGapN = earlyRate.n + lateRate.n
  const lateSleepGapPercentage =
    earlyRate.percentage === null || lateRate.percentage === null
      ? null
      : earlyRate.percentage - lateRate.percentage

  const withWeekendComparison = rows.filter((row) => row.weekendBreakfastComparison !== null)
  const moreOftenWeekend = withWeekendComparison.filter(
    (row) => row.weekendBreakfastComparison === "more-often"
  ).length

  const withSemesterChange = rows.filter((row) => row.semesterBreakfastChange !== null)
  const changedSemester = withSemesterChange.filter((row) =>
    ["more-often-now", "less-often-now", "changed-back-and-forth"].includes(
      row.semesterBreakfastChange!
    )
  ).length

  return {
    earlyCommitmentGap: summaryCard(
      "Eat breakfast less often on early-commitment days",
      paired.lowerOnFirstPercentage,
      paired.eligibility.answered
    ),
    lateSleepGap: summaryCard(
      "Regular-breakfast gap, early vs. late sleepers (percentage points)",
      lateSleepGapPercentage,
      lateSleepGapN
    ),
    weekendShift: summaryCard(
      "Eat breakfast more often on weekends",
      withWeekendComparison.length === 0
        ? null
        : percentageOf(moreOftenWeekend, withWeekendComparison.length),
      withWeekendComparison.length
    ),
    semesterChange: summaryCard(
      "Report their breakfast behaviour changed this semester",
      withSemesterChange.length === 0
        ? null
        : percentageOf(changedSemester, withSemesterChange.length),
      withSemesterChange.length
    ),
  }
}

// --- Everything together ------------------------------------------------

export interface PatternsMetrics {
  summaryCards: PatternsSummaryCards
  earlyCommitmentsByBranch: RowPercentageTable
  pairedEarlyVsNonEarly: PairedComparisonResult
  sleepByBranch: RowPercentageTable
  sleepAssociation: SpearmanResult | null
  wakeByBranch: RowPercentageTable
  wakeAssociation: SpearmanResult | null
  influenceMatrix: LikertMatrix
  agreementMatrix: LikertMatrix
  outcomeMatrix: LikertMatrix
}

export function computePatternsMetrics(rows: AnalyticsRow[]): PatternsMetrics {
  return {
    summaryCards: computePatternsSummaryCards(rows),
    earlyCommitmentsByBranch: computeEarlyCommitmentsByBranch(rows),
    pairedEarlyVsNonEarly: computeEarlyCommitmentPairedComparison(rows),
    sleepByBranch: computeSleepByBranch(rows),
    sleepAssociation: computeOrdinalVsBreakfastAssociation(rows, sleepScore),
    wakeByBranch: computeWakeByBranch(rows),
    wakeAssociation: computeOrdinalVsBreakfastAssociation(rows, wakeScore),
    influenceMatrix: computeInfluenceMatrix(rows),
    agreementMatrix: computeAgreementMatrix(rows),
    outcomeMatrix: computeOutcomeMatrix(rows),
  }
}

export type { Eligibility, LikertMatrix, LikertMatrixRow }
export { cramersV }
