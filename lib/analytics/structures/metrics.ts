import {
  BREAKFAST_CHANGE_ACTION_OPTIONS,
  BREAKFAST_IMPROVEMENT_OPTIONS,
  FREQUENCY_OPTIONS,
  MESS_DECISION_OPTIONS,
  MESS_FOOD_QUALITY_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"
import {
  buildMultiSelectDistribution,
  buildOrderedDistribution,
  percentageOf,
  UNKNOWN_VALUE,
} from "../distributions"
import { median } from "../metrics"
import type { AnalyticsRow, Branch } from "../types"
import {
  computeBranchDeepDive,
  type BranchDeepDive,
  type BranchFieldSummary,
} from "../patterns/branch-deep-dive"
import { BRANCHES, influenceRowScore, SUBSTANTIVE_INFLUENCE_ITEMS } from "../patterns/normalization"
import {
  ALTERNATIVE_ECOSYSTEM_ITEMS,
  INFLUENCE_CATEGORY,
  SERVICE_ENVIRONMENT_ITEMS,
  STRUCTURAL_DRIVER_CATEGORY,
  STRUCTURAL_DRIVER_ITEMS,
  TRANSFER_ACTION_VALUES,
} from "./normalization"
import {
  computeEligibility,
  sampleFlag,
  type Eligibility,
  type InfluenceRanking,
  type SampleFlag,
  type SummaryCard,
  type TopFactorCard,
  type WholeSampleDistribution,
  type WholeSampleDistributionBucket,
} from "./types"

// --- Whole-sample categorical/ordinal breakdowns ----------------------
//
// Shared shape behind messDecision (§6A), breakfastPlanChangeFrequency
// (§7A), and messFoodQuality (§9A) — each asked of every respondent, so
// unlike Patterns there's no branch to filter by; `eligible` is just
// `rows.length`. Category order is always the caller's `options` order
// (never re-sorted), so an ordinal question's natural order survives
// (e.g. almost-always -> never for plan-change frequency).
function buildWholeSampleDistribution(
  rows: AnalyticsRow[],
  getValue: (row: AnalyticsRow) => string | null,
  options: SurveyOption[]
): WholeSampleDistribution {
  const answered = rows.filter((row) => getValue(row) !== null)
  const distribution: WholeSampleDistributionBucket[] = buildOrderedDistribution(
    rows,
    getValue,
    options
  ).map((bucket) => ({ ...bucket, flag: sampleFlag(bucket.count) }))
  return {
    distribution,
    eligibility: computeEligibility(rows.length, rows.length, answered.length),
  }
}

export function computeMessDecision(rows: AnalyticsRow[]): WholeSampleDistribution {
  return buildWholeSampleDistribution(rows, (row) => row.messDecision, MESS_DECISION_OPTIONS)
}

export function computePlanChangeFrequency(rows: AnalyticsRow[]): WholeSampleDistribution {
  return buildWholeSampleDistribution(
    rows,
    (row) => row.breakfastPlanChangeFrequency,
    FREQUENCY_OPTIONS
  )
}

export function computeMessFoodQuality(rows: AnalyticsRow[]): WholeSampleDistribution {
  return buildWholeSampleDistribution(rows, (row) => row.messFoodQuality, MESS_FOOD_QUALITY_OPTIONS)
}

/** Food quality is asked of everyone, not gated by branch — this splits
 * the same whole-sample composition above by regular/conditional/rare
 * eaters purely as a display breakdown (not a survey eligibility gate),
 * so each branch's `eligible` is that branch's own respondent count, the
 * same "Branch A/B/C only" convention already used for messConsistency
 * etc. above. */
export type MessFoodQualityByBranch = Record<Branch, WholeSampleDistribution>

export function computeMessFoodQualityByBranch(rows: AnalyticsRow[]): MessFoodQualityByBranch {
  const byBranch = {} as MessFoodQualityByBranch
  for (const branch of BRANCHES) {
    const branchRows = rows.filter((row) => row.branch === branch)
    byBranch[branch] = buildWholeSampleDistribution(
      branchRows,
      (row) => row.messFoodQuality,
      MESS_FOOD_QUALITY_OPTIONS
    )
  }
  return byBranch
}

// --- Branch-gated fields — delegate to the already-validated branch
// deep-dive gating (Branch A for mess allocation/consistency questions,
// Branch C for the unused-meal question) rather than re-deriving
// eligibility rules Patterns already got right. --------------------------

function requireBranchField(deepDive: BranchDeepDive, key: string): BranchFieldSummary {
  const field = deepDive.fields.find((candidate) => candidate.key === key)
  if (!field) {
    throw new Error(
      `lib/analytics/structures/metrics: expected field "${key}" in branch ${deepDive.branch} deep dive`
    )
  }
  return field
}

/** Branch A only (asked unconditionally of every regular eater). */
export function computeMessConsistency(rows: AnalyticsRow[]): BranchFieldSummary {
  return requireBranchField(computeBranchDeepDive(rows, "A"), "messConsistency")
}

/** Branch A only, gated on messConsistency !== "almost-always-same" (the
 * same secondary gate branch-deep-dive.ts already applies). */
export function computeMessChangeDeterminants(rows: AnalyticsRow[]): BranchFieldSummary {
  return requireBranchField(computeBranchDeepDive(rows, "A"), "messChangeDeterminants")
}

/** Branch A only, unconditional — what students do when the allotted
 * mess doesn't work for them. */
export function computeUnwantedMessActions(rows: AnalyticsRow[]): BranchFieldSummary {
  return requireBranchField(computeBranchDeepDive(rows, "A"), "unwantedMessActions")
}

/** Branch C only, unconditional — what happens to a registered/allotted
 * meal a rare/non-eater doesn't use. */
export function computeUnusedAllottedMealActions(rows: AnalyticsRow[]): BranchFieldSummary {
  return requireBranchField(computeBranchDeepDive(rows, "C"), "unusedAllottedMealActions")
}

// --- Plan-change actions — everyone, gated on the plan actually having
// changed at least sometimes (not a branch gate). ------------------------

export interface PlanChangeActions {
  distribution: (ReturnType<typeof buildMultiSelectDistribution>[number] & { flag: SampleFlag })[]
  eligibility: Eligibility
}

export function computePlanChangeActions(rows: AnalyticsRow[]): PlanChangeActions {
  const eligible = rows.filter(
    (row) => row.breakfastPlanChangeFrequency !== null && row.breakfastPlanChangeFrequency !== "never"
  )
  const answered = eligible.filter((row) => row.breakfastPlanChangeActions.length > 0)
  const distribution = buildMultiSelectDistribution(
    eligible,
    (row) => row.breakfastPlanChangeActions,
    BREAKFAST_CHANGE_ACTION_OPTIONS
  ).map((bucket) => ({ ...bucket, flag: sampleFlag(bucket.count) }))

  return {
    distribution,
    eligibility: computeEligibility(rows.length, eligible.length, answered.length),
  }
}

// --- Influence-grid rankings (no branch breakdown — Structures asks "how
// strong is this condition overall", not "does it track with branch"). --

function buildInfluenceRanking(
  rows: AnalyticsRow[],
  items: { key: string; label: string }[],
  categoryFor: (key: string) => string | undefined,
  topBoxThreshold = 3
): InfluenceRanking {
  const rankRows = items.map((item) => {
    const scores = rows
      .map((row) => influenceRowScore(row, item.key))
      .filter((score): score is number => score !== null)
    const n = scores.length
    const topBoxCount = scores.filter((score) => score >= topBoxThreshold).length

    return {
      key: item.key,
      label: item.label,
      category: categoryFor(item.key),
      topBoxPercentage: n === 0 ? null : percentageOf(topBoxCount, n),
      topBoxCount,
      median: median(scores),
      mean: n === 0 ? null : scores.reduce((sum, score) => sum + score, 0) / n,
      n,
      flag: sampleFlag(n),
    }
  })

  const answered = rows.filter((row) =>
    items.some((item) => influenceRowScore(row, item.key) !== null)
  )

  return {
    rows: rankRows,
    eligibility: computeEligibility(rows.length, rows.length, answered.length),
  }
}

/** Structures §9B — service/access conditions of the mess breakfast. */
export function computeServiceEnvironmentRanking(rows: AnalyticsRow[]): InfluenceRanking {
  return buildInfluenceRanking(rows, SERVICE_ENVIRONMENT_ITEMS, () => undefined)
}

/** Structures §9C — competing/substitute infrastructure. */
export function computeAlternativeEcosystemRanking(rows: AnalyticsRow[]): InfluenceRanking {
  return buildInfluenceRanking(rows, ALTERNATIVE_ECOSYSTEM_ITEMS, () => undefined)
}

/** Structures §10 — the page's primary ranking: every structural/
 * contextual influence factor, tagged with its analyst-defined category. */
export function computeStructuralDriversRanking(rows: AnalyticsRow[]): InfluenceRanking {
  return buildInfluenceRanking(rows, STRUCTURAL_DRIVER_ITEMS, (key) => STRUCTURAL_DRIVER_CATEGORY[key])
}

// --- Biggest influence (§11) and Perceived leverage points (§12) — both
// single- or multi-select prevalence over the whole eligible sample. ----

export interface RankedPrevalence {
  distribution: (ReturnType<typeof buildOrderedDistribution>[number] & { flag: SampleFlag })[]
  eligibility: Eligibility
}

/** Single-select over the 14 substantive influence items (attention-check
 * row excluded via SUBSTANTIVE_INFLUENCE_ITEMS, the same registry Patterns
 * uses) — asked of everyone, so eligible = totalFiltered. */
export function computeBiggestInfluenceRanking(rows: AnalyticsRow[]): RankedPrevalence {
  const options: SurveyOption[] = SUBSTANTIVE_INFLUENCE_ITEMS.map((item) => ({
    value: item.key,
    label: item.label,
  }))
  const answered = rows.filter((row) => row.biggestInfluenceFactor !== null)
  const distribution = buildOrderedDistribution(rows, (row) => row.biggestInfluenceFactor, options)
    .filter((bucket) => bucket.value !== UNKNOWN_VALUE)
    .map((bucket) => ({ ...bucket, flag: sampleFlag(bucket.count) }))

  return {
    distribution,
    eligibility: computeEligibility(rows.length, rows.length, answered.length),
  }
}

/** Multi-select, up to 3 selections — asked of everyone, so percentages
 * are "of all respondents" and are not required to total 100%. Includes
 * "nothing-would-change" as a normal, retained option (see
 * BREAKFAST_IMPROVEMENT_OPTIONS) rather than filtering it out. */
export function computeLeveragePointsRanking(rows: AnalyticsRow[]): RankedPrevalence {
  const answered = rows.filter((row) => row.breakfastImprovementOptions.length > 0)
  const distribution = buildMultiSelectDistribution(
    rows,
    (row) => row.breakfastImprovementOptions,
    BREAKFAST_IMPROVEMENT_OPTIONS
  ).map((bucket) => ({ ...bucket, flag: sampleFlag(bucket.count) }))

  return {
    distribution,
    eligibility: computeEligibility(rows.length, rows.length, answered.length),
  }
}

// --- Structural Snapshot — the four KPI cards (§4) ----------------------

function summaryCard(label: string, percentage: number | null, n: number): SummaryCard {
  return { label, percentage, n, flag: sampleFlag(n) }
}

/** Card 1 — share reporting their plan changes at least occasionally
 * after the cancellation cutoff. Deliberately NOT called "cancellation
 * failure": the survey only measures timing mismatch, not whether a
 * cancellation was attempted or refused. */
export function computeCancellationCutoffCard(rows: AnalyticsRow[]): SummaryCard {
  const answered = rows.filter((row) => row.breakfastPlanChangeFrequency !== null)
  const changesAtLeastSometimes = answered.filter(
    (row) => row.breakfastPlanChangeFrequency !== "never"
  )
  return summaryCard(
    "Report their breakfast plan changing at least occasionally after it's too late to cancel",
    answered.length === 0 ? null : percentageOf(changesAtLeastSometimes.length, answered.length),
    answered.length
  )
}

/** Card 2 — share relying at least partly on automatic mess allocation. */
export function computeAutoAllocationCard(rows: AnalyticsRow[]): SummaryCard {
  const answered = rows.filter((row) => row.messDecision !== null)
  const autoOrMixed = answered.filter(
    (row) => row.messDecision === "auto-allotted" || row.messDecision === "mixed"
  )
  return summaryCard(
    "Rely at least partly on automatic mess allocation",
    answered.length === 0 ? null : percentageOf(autoOrMixed.length, answered.length),
    answered.length
  )
}

function topRankRow<T extends { topBoxPercentage: number | null }>(rows: T[]): T | null {
  let best: T | null = null
  for (const row of rows) {
    if (row.topBoxPercentage === null) continue
    if (best === null || row.topBoxPercentage > (best.topBoxPercentage ?? -1)) {
      best = row
    }
  }
  return best
}

/** Card 3 — the single structural/contextual factor with the highest
 * top-box ("a lot" / "very strongly") rate, drawn from the same 10-item
 * Structural Drivers ranking used in §10 (never a different factor list). */
export function computeTopStructuralConstraintCard(rows: AnalyticsRow[]): TopFactorCard {
  const ranking = computeStructuralDriversRanking(rows)
  const top = topRankRow(ranking.rows)
  if (!top) {
    return { detailLabel: "No eligible responses", percentage: null, n: 0, flag: sampleFlag(0) }
  }
  return { detailLabel: top.label, percentage: top.topBoxPercentage, n: top.n, flag: top.flag }
}

/** Card 4 — the single most-selected perceived leverage point. If
 * "nothing would change it" is genuinely the highest, it's shown as-is
 * rather than silently excluded (see computeLeveragePointsRanking). */
export function computeTopLeveragePointCard(rows: AnalyticsRow[]): TopFactorCard {
  const ranking = computeLeveragePointsRanking(rows)
  let top: RankedPrevalence["distribution"][number] | null = null
  for (const bucket of ranking.distribution) {
    if (top === null || bucket.percentage > top.percentage) {
      top = bucket
    }
  }
  if (!top) {
    return { detailLabel: "No eligible responses", percentage: null, n: 0, flag: sampleFlag(0) }
  }
  return {
    detailLabel: top.label,
    percentage: top.flag === "suppressed" ? null : top.percentage,
    n: top.count,
    flag: top.flag,
  }
}

/** For the System Structure Map's "transfer / resell" node — Branch C
 * respondents who selected any of sell/exchange/give-away for their
 * unused allotted meal, computed as a proper per-respondent boolean over
 * the real multi-select field (never by summing the three options'
 * individual prevalence percentages, which would double-count a
 * respondent who selected more than one). */
export function computeUnusedMealTransferAttemptCard(rows: AnalyticsRow[]): SummaryCard {
  const branchC = rows.filter((row) => row.branch === "C")
  const answered = branchC.filter((row) => row.unusedAllottedMealActions.length > 0)
  const attempted = answered.filter((row) =>
    row.unusedAllottedMealActions.some((value) =>
      (TRANSFER_ACTION_VALUES as readonly string[]).includes(value)
    )
  )
  return summaryCard(
    "Rare/non-eaters (Branch C) who report trying to sell, exchange, or give away an unused meal",
    answered.length === 0 ? null : percentageOf(attempted.length, answered.length),
    answered.length
  )
}

// --- Everything together ------------------------------------------------

export interface StructuresSnapshot {
  cancellationCutoff: SummaryCard
  autoAllocation: SummaryCard
  topStructuralConstraint: TopFactorCard
  topLeveragePoint: TopFactorCard
}

export interface StructuresMetrics {
  snapshot: StructuresSnapshot
  messDecision: WholeSampleDistribution
  messConsistency: BranchFieldSummary
  messChangeDeterminants: BranchFieldSummary
  unwantedMessActions: BranchFieldSummary
  planChangeFrequency: WholeSampleDistribution
  planChangeActions: PlanChangeActions
  unusedAllottedMealActions: BranchFieldSummary
  messFoodQuality: WholeSampleDistribution
  messFoodQualityByBranch: MessFoodQualityByBranch
  serviceEnvironment: InfluenceRanking
  alternativeEcosystem: InfluenceRanking
  structuralDrivers: InfluenceRanking
  biggestInfluence: RankedPrevalence
  leveragePoints: RankedPrevalence
  unusedMealTransferAttempt: SummaryCard
}

export function computeStructuresMetrics(rows: AnalyticsRow[]): StructuresMetrics {
  return {
    snapshot: {
      cancellationCutoff: computeCancellationCutoffCard(rows),
      autoAllocation: computeAutoAllocationCard(rows),
      topStructuralConstraint: computeTopStructuralConstraintCard(rows),
      topLeveragePoint: computeTopLeveragePointCard(rows),
    },
    messDecision: computeMessDecision(rows),
    messConsistency: computeMessConsistency(rows),
    messChangeDeterminants: computeMessChangeDeterminants(rows),
    unwantedMessActions: computeUnwantedMessActions(rows),
    planChangeFrequency: computePlanChangeFrequency(rows),
    planChangeActions: computePlanChangeActions(rows),
    unusedAllottedMealActions: computeUnusedAllottedMealActions(rows),
    messFoodQuality: computeMessFoodQuality(rows),
    messFoodQualityByBranch: computeMessFoodQualityByBranch(rows),
    serviceEnvironment: computeServiceEnvironmentRanking(rows),
    alternativeEcosystem: computeAlternativeEcosystemRanking(rows),
    structuralDrivers: computeStructuralDriversRanking(rows),
    biggestInfluence: computeBiggestInfluenceRanking(rows),
    leveragePoints: computeLeveragePointsRanking(rows),
    unusedMealTransferAttempt: computeUnusedMealTransferAttemptCard(rows),
  }
}

export { INFLUENCE_CATEGORY }
