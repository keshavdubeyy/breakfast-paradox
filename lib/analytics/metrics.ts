import { ARCHETYPE_IDS, ARCHETYPES, type ArchetypeId } from "@/lib/archetype-content"
import type { Confidence } from "@/lib/archetype-scoring"
import {
  BREAKFAST_FREQUENCY_OPTIONS,
  EARLY_COMMITMENT_OPTIONS,
  HOSTEL_OPTIONS,
  YEAR_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"
import {
  DURATION_HISTOGRAM_BUCKETS,
  SHORT_COMPLETION_THRESHOLD_SECONDS,
} from "./constants"
import type { AnalyticsRow, Branch } from "./types"

export interface DistributionBucket {
  value: string
  label: string
  count: number
  /** 0-100, rounded to one decimal. 0 when `total` is 0. */
  percentage: number
}

export interface OverviewMetrics {
  completedResponses: number
  medianDurationSeconds: number | null
  averageDurationSeconds: number | null
  archetypeCoverage: {
    withResult: number
    total: number
    percentage: number | null
  }

  branchCounts: Record<Branch, number>

  breakfastFrequencyDistribution: DistributionBucket[]
  earlyCommitmentDistribution: DistributionBucket[]
  hostelDistribution: DistributionBucket[]
  yearDistribution: DistributionBucket[]

  primaryArchetypeDistribution: DistributionBucket[]
  secondaryArchetypeDistribution: DistributionBucket[]
  confidenceDistribution: DistributionBucket[]

  durationHistogram: DistributionBucket[]

  dataQuality: {
    /** Percentage among rows where the attention-check row was actually
     * answered — rows missing that row entirely don't count against it. */
    attentionCheckPassRate: number | null
    attentionCheckKnownCount: number
    missingArchetypeCount: number
    shortCompletionCount: number
  }

  /** Plain numbers behind the "Initial descriptive observations" section —
   * kept numeric (not pre-written sentences) so the UI layer decides the
   * wording and this stays independently testable. */
  snapshot: {
    regularEaterPercentage: number | null
    threeOrMoreEarlyCommitmentsPercentage: number | null
    mostCommonPrimaryArchetype: {
      id: ArchetypeId
      name: string
      count: number
    } | null
  }
}

export function median(values: number[]): number | null {
  if (values.length === 0) {
    return null
  }
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function average(values: number[]): number | null {
  if (values.length === 0) {
    return null
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function percentageOf(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

const UNKNOWN_VALUE = "__unknown__"
const UNKNOWN_LABEL = "Not set"

/** Builds a distribution over a fixed, ordered option list (so a category
 * with zero responses still shows up as 0 rather than disappearing) plus
 * a trailing "Not set" bucket for rows where the field is null — only
 * included if at least one row actually has it, so it doesn't clutter
 * charts once the data is clean. */
function buildOrderedDistribution(
  rows: AnalyticsRow[],
  getValue: (row: AnalyticsRow) => string | null,
  options: SurveyOption[]
): DistributionBucket[] {
  const counts = new Map<string, number>()
  for (const option of options) {
    counts.set(option.value, 0)
  }

  let unknownCount = 0
  for (const row of rows) {
    const value = getValue(row)
    if (value === null) {
      unknownCount += 1
      continue
    }
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  const total = rows.length
  const buckets = options.map((option) => ({
    value: option.value,
    label: option.label,
    count: counts.get(option.value) ?? 0,
    percentage: percentageOf(counts.get(option.value) ?? 0, total),
  }))

  if (unknownCount > 0) {
    buckets.push({
      value: UNKNOWN_VALUE,
      label: UNKNOWN_LABEL,
      count: unknownCount,
      percentage: percentageOf(unknownCount, total),
    })
  }

  return buckets
}

function buildArchetypeDistribution(
  rows: AnalyticsRow[],
  getValue: (row: AnalyticsRow) => ArchetypeId | null
): DistributionBucket[] {
  const options = ARCHETYPE_IDS.map((id) => ({
    value: id,
    label: ARCHETYPES[id].name,
  }))
  return buildOrderedDistribution(rows, getValue, options)
}

function buildConfidenceDistribution(rows: AnalyticsRow[]): DistributionBucket[] {
  const withResult = rows.filter((row) => row.hasArchetypeResult)
  const options: SurveyOption[] = [
    { value: "strong" satisfies Confidence, label: "Strong" },
    { value: "mixed" satisfies Confidence, label: "Mixed" },
  ]
  return buildOrderedDistribution(
    withResult,
    (row) => row.archetypeConfidence,
    options
  )
}

function buildDurationHistogram(rows: AnalyticsRow[]): DistributionBucket[] {
  const total = rows.length
  return DURATION_HISTOGRAM_BUCKETS.map((bucket) => {
    const count = rows.filter((row) => {
      const minutes = row.durationSeconds / 60
      return (
        minutes >= bucket.min && (bucket.max === null || minutes < bucket.max)
      )
    }).length
    return {
      value: bucket.label,
      label: bucket.label,
      count,
      percentage: percentageOf(count, total),
    }
  })
}

export function computeOverviewMetrics(rows: AnalyticsRow[]): OverviewMetrics {
  const total = rows.length
  const durations = rows.map((row) => row.durationSeconds)
  const withResult = rows.filter((row) => row.hasArchetypeResult)

  const branchCounts: Record<Branch, number> = { A: 0, B: 0, C: 0 }
  for (const row of rows) {
    if (row.branch) {
      branchCounts[row.branch] += 1
    }
  }

  const attentionCheckKnown = rows.filter(
    (row) => row.attentionCheckPassed !== null
  )
  const attentionCheckPassed = attentionCheckKnown.filter(
    (row) => row.attentionCheckPassed === true
  )

  const threeOrMoreEarlyCommitments = rows.filter((row) =>
    row.earlyCommitmentDays !== null &&
    ["3", "4", "5+"].includes(row.earlyCommitmentDays)
  )

  const primaryArchetypeDistribution = buildArchetypeDistribution(
    rows,
    (row) => row.primaryArchetype
  )
  const topArchetypeBucket = primaryArchetypeDistribution
    .filter((bucket) => bucket.value !== UNKNOWN_VALUE)
    .reduce<DistributionBucket | null>(
      (best, bucket) =>
        !best || bucket.count > best.count ? bucket : best,
      null
    )

  return {
    completedResponses: total,
    medianDurationSeconds: median(durations),
    averageDurationSeconds: average(durations),
    archetypeCoverage: {
      withResult: withResult.length,
      total,
      percentage: total === 0 ? null : percentageOf(withResult.length, total),
    },

    branchCounts,

    breakfastFrequencyDistribution: buildOrderedDistribution(
      rows,
      (row) => row.breakfastFrequency,
      BREAKFAST_FREQUENCY_OPTIONS
    ),
    earlyCommitmentDistribution: buildOrderedDistribution(
      rows,
      (row) => row.earlyCommitmentDays,
      EARLY_COMMITMENT_OPTIONS
    ),
    hostelDistribution: buildOrderedDistribution(
      rows,
      (row) => row.hostel,
      HOSTEL_OPTIONS
    ),
    yearDistribution: buildOrderedDistribution(
      rows,
      (row) => row.year,
      YEAR_OPTIONS
    ),

    primaryArchetypeDistribution,
    secondaryArchetypeDistribution: buildArchetypeDistribution(
      rows,
      (row) => row.secondaryArchetype
    ),
    confidenceDistribution: buildConfidenceDistribution(rows),

    durationHistogram: buildDurationHistogram(rows),

    dataQuality: {
      attentionCheckPassRate:
        attentionCheckKnown.length === 0
          ? null
          : percentageOf(attentionCheckPassed.length, attentionCheckKnown.length),
      attentionCheckKnownCount: attentionCheckKnown.length,
      missingArchetypeCount: total - withResult.length,
      shortCompletionCount: rows.filter(
        (row) => row.durationSeconds < SHORT_COMPLETION_THRESHOLD_SECONDS
      ).length,
    },

    snapshot: {
      regularEaterPercentage:
        total === 0 ? null : percentageOf(branchCounts.A, total),
      threeOrMoreEarlyCommitmentsPercentage:
        total === 0 ? null : percentageOf(threeOrMoreEarlyCommitments.length, total),
      mostCommonPrimaryArchetype:
        topArchetypeBucket && topArchetypeBucket.count > 0
          ? {
              id: topArchetypeBucket.value as ArchetypeId,
              name: topArchetypeBucket.label,
              count: topArchetypeBucket.count,
            }
          : null,
    },
  }
}
