import {
  AGREEMENT_SCALE_OPTIONS,
  AGREEMENT_STATEMENT_ITEMS,
  BREAKFAST_MOTIVATION_OPTIONS,
  MEAL_VALUE_PERCEPTION_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"
import { ARCHETYPE_IDS, ARCHETYPES } from "@/lib/archetype-content"
import { buildMultiSelectDistribution, buildOrderedDistribution, percentageOf } from "../distributions"
import type { AnalyticsRow } from "../types"
import {
  AGREEMENT_SHORT_LABEL,
  ROUTINE_MINDSET_FROM_ABSENCE_REASON,
  ROUTINE_MINDSET_FROM_ROUTINE_DESCRIPTION,
  ROUTINE_MINDSET_OPTIONS,
  type RoutineMindsetBucket,
} from "./normalization"
import {
  computeEligibility,
  sampleFlag,
  type AgreementOverview,
  type AgreementStatementResult,
  type Eligibility,
  type RoutineMindsetResult,
  type SampleFlag,
  type WholeSampleDistribution,
  type WholeSampleDistributionBucket,
} from "./types"

// --- Whole-sample categorical breakdowns --------------------------------
//
// Same shape/convention as Structures' buildWholeSampleDistribution: asked
// of every respondent, category order is always the caller's `options`
// order (never re-sorted by frequency), so an evaluative scale's natural
// order survives.
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

// --- Beliefs & Attitudes (the 9 agreement statements) -------------------

const AGREE_VALUES = new Set(["agree", "strongly-agree"])

/** One statement's full 5-point whole-sample distribution, plus the
 * agree+strongly-agree share used to rank statements (dominant belief,
 * strongest trade-off) — every number here is the same
 * buildOrderedDistribution machinery every other domain uses, just kept
 * as the full 5-point spread instead of collapsing to top-box, since the
 * diverging Likert chart needs every point on the scale. */
function computeAgreementStatement(
  rows: AnalyticsRow[],
  item: { key: string; label: string }
): AgreementStatementResult {
  const getValue = (row: AnalyticsRow) => row.agreementRatings[item.key] ?? null
  const whole = buildWholeSampleDistribution(rows, getValue, AGREEMENT_SCALE_OPTIONS)
  const n = whole.eligibility.answered
  const agreeCount = whole.distribution
    .filter((bucket) => AGREE_VALUES.has(bucket.value))
    .reduce((sum, bucket) => sum + bucket.count, 0)

  return {
    key: item.key,
    label: item.label,
    shortLabel: AGREEMENT_SHORT_LABEL[item.key] ?? item.label,
    distribution: whole.distribution,
    agreeShare: n === 0 ? null : percentageOf(agreeCount, n),
    n,
    flag: sampleFlag(n),
  }
}

export function computeAgreementOverview(rows: AnalyticsRow[]): AgreementOverview {
  const statements = AGREEMENT_STATEMENT_ITEMS.map((item) => computeAgreementStatement(rows, item))
  const answeredAny = rows.filter((row) =>
    AGREEMENT_STATEMENT_ITEMS.some((item) => (row.agreementRatings[item.key] ?? null) !== null)
  )
  return {
    statements,
    eligibility: computeEligibility(rows.length, rows.length, answeredAny.length),
  }
}

// --- Routine Mindset composite ------------------------------------------
//
// See normalization.ts for the full rationale — Branch A's
// breakfastRoutineDescription and Branch C's breakfastAbsenceReason are
// mapped into one shared 4-bucket taxonomy; Branch B is excluded from
// both the numerator and denominator (not folded in), since it has no
// directly comparable question.
function routineMindsetBucketFor(row: AnalyticsRow): RoutineMindsetBucket | null {
  if (row.branch === "A") {
    return row.breakfastRoutineDescription
      ? (ROUTINE_MINDSET_FROM_ROUTINE_DESCRIPTION[row.breakfastRoutineDescription] ?? null)
      : null
  }
  if (row.branch === "C") {
    return row.breakfastAbsenceReason
      ? (ROUTINE_MINDSET_FROM_ABSENCE_REASON[row.breakfastAbsenceReason] ?? null)
      : null
  }
  return null
}

export function computeRoutineMindset(rows: AnalyticsRow[]): RoutineMindsetResult {
  const eligibleRows = rows.filter((row) => row.branch === "A" || row.branch === "C")
  const getValue = (row: AnalyticsRow) => routineMindsetBucketFor(row)
  const answered = eligibleRows.filter((row) => getValue(row) !== null)
  const distribution = buildOrderedDistribution(eligibleRows, getValue, ROUTINE_MINDSET_OPTIONS).map(
    (bucket) => ({ ...bucket, flag: sampleFlag(bucket.count) })
  )
  return {
    distribution,
    eligibility: computeEligibility(rows.length, eligibleRows.length, answered.length),
  }
}

// --- Meal value perception (everyone) -----------------------------------

export function computeMealValuePerception(rows: AnalyticsRow[]): WholeSampleDistribution {
  return buildWholeSampleDistribution(rows, (row) => row.mealValuePerception, MEAL_VALUE_PERCEPTION_OPTIONS)
}

// --- Motivations to eat breakfast (everyone, multi-select) --------------

export interface MotivationFactors {
  distribution: WholeSampleDistributionBucket[]
  eligibility: Eligibility
}

export function computeMotivationFactors(rows: AnalyticsRow[]): MotivationFactors {
  const answered = rows.filter((row) => row.breakfastMotivationFactors.length > 0)
  const distribution = buildMultiSelectDistribution(
    rows,
    (row) => row.breakfastMotivationFactors,
    BREAKFAST_MOTIVATION_OPTIONS
  ).map((bucket) => ({ ...bucket, flag: sampleFlag(bucket.count) }))
  return {
    distribution,
    eligibility: computeEligibility(rows.length, rows.length, answered.length),
  }
}

// --- Archetype interpretation (supporting synthesis, not primary evidence) --

const ARCHETYPE_OPTIONS: SurveyOption[] = ARCHETYPE_IDS.map((id) => ({
  value: id,
  label: ARCHETYPES[id].name,
}))

export function computeArchetypeDistribution(rows: AnalyticsRow[]): WholeSampleDistribution {
  return buildWholeSampleDistribution(rows, (row) => row.primaryArchetype, ARCHETYPE_OPTIONS)
}

// --- Mental Model Snapshot — the five KPI cards -------------------------

export interface TopFactorCard {
  detailLabel: string
  percentage: number | null
  n: number
  flag: SampleFlag
}

function topBucket(buckets: WholeSampleDistributionBucket[]): WholeSampleDistributionBucket | null {
  let best: WholeSampleDistributionBucket | null = null
  for (const bucket of buckets) {
    if (best === null || bucket.percentage > best.percentage) best = bucket
  }
  return best
}

function topFactorFromDistribution(result: WholeSampleDistribution): TopFactorCard {
  const top = topBucket(result.distribution)
  if (!top) {
    return { detailLabel: "No eligible responses", percentage: null, n: 0, flag: sampleFlag(0) }
  }
  return {
    detailLabel: top.label,
    percentage: top.flag === "suppressed" ? null : top.percentage,
    n: result.eligibility.answered,
    flag: top.flag,
  }
}

function topFactorFromStatement(statement: AgreementStatementResult | undefined): TopFactorCard {
  if (!statement) {
    return { detailLabel: "No eligible responses", percentage: null, n: 0, flag: sampleFlag(0) }
  }
  return {
    detailLabel: statement.shortLabel,
    percentage: statement.flag === "suppressed" ? null : statement.agreeShare,
    n: statement.n,
    flag: statement.flag,
  }
}

export interface MentalModelsSnapshot {
  dominantBelief: TopFactorCard
  strongestTradeOff: TopFactorCard
  routineOrientation: TopFactorCard
  valuePerception: TopFactorCard
  topMotivation: TopFactorCard
}

export function computeMentalModelsSnapshot(
  agreementOverview: AgreementOverview,
  routineMindset: RoutineMindsetResult,
  valuePerception: WholeSampleDistribution,
  motivations: MotivationFactors
): MentalModelsSnapshot {
  const rankedStatements = [...agreementOverview.statements].sort(
    (a, b) => (b.agreeShare ?? -1) - (a.agreeShare ?? -1)
  )

  return {
    dominantBelief: topFactorFromStatement(rankedStatements[0]),
    strongestTradeOff: topFactorFromStatement(rankedStatements[1]),
    routineOrientation: topFactorFromDistribution(routineMindset),
    valuePerception: topFactorFromDistribution(valuePerception),
    topMotivation: topFactorFromDistribution(motivations),
  }
}

// --- Everything together ------------------------------------------------

export interface MentalModelsMetrics {
  snapshot: MentalModelsSnapshot
  agreementOverview: AgreementOverview
  routineMindset: RoutineMindsetResult
  valuePerception: WholeSampleDistribution
  motivations: MotivationFactors
  archetypes: WholeSampleDistribution
}

export function computeMentalModelsMetrics(rows: AnalyticsRow[]): MentalModelsMetrics {
  const agreementOverview = computeAgreementOverview(rows)
  const routineMindset = computeRoutineMindset(rows)
  const valuePerception = computeMealValuePerception(rows)
  const motivations = computeMotivationFactors(rows)

  return {
    snapshot: computeMentalModelsSnapshot(agreementOverview, routineMindset, valuePerception, motivations),
    agreementOverview,
    routineMindset,
    valuePerception,
    motivations,
    archetypes: computeArchetypeDistribution(rows),
  }
}
