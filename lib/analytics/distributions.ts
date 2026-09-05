import type { SurveyOption } from "@/lib/survey-options"
import type { AnalyticsRow } from "./types"

export interface DistributionBucket {
  value: string
  label: string
  count: number
  /** 0-100, rounded to one decimal. 0 when `total` is 0. */
  percentage: number
}

/** Sentinel bucket value/label for rows where a field is null — shared
 * across every distribution builder so callers (e.g. drill-down) can
 * recognize it without re-deriving the string. */
export const UNKNOWN_VALUE = "__unknown__"
export const UNKNOWN_LABEL = "Not set"

export function percentageOf(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

/** Looks up a SurveyOption's label by value, falling back to the raw
 * value itself if it's not in the list (keeps a stale/unknown value
 * visible instead of silently disappearing from a drill-down table). */
export function labelFor(options: SurveyOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
}

/** Builds a distribution over a fixed, ordered option list (so a category
 * with zero responses still shows up as 0 rather than disappearing) plus
 * a trailing "Not set" bucket for rows where the field is null — only
 * included if at least one row actually has it, so it doesn't clutter
 * charts once the data is clean. */
export function buildOrderedDistribution(
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

/** Builds a distribution for a multi-select field, where a single
 * respondent can land in more than one bucket — percentages are
 * therefore "of respondents who were asked this question" (the
 * `denominatorRows` you pass in), not "of selections", and won't sum to
 * 100%. Only rows actually asked the question should be passed as
 * `denominatorRows` (e.g. exclude rows for whom the gating question
 * made this field not applicable) — a row with an empty array here is
 * assumed to mean "asked, selected nothing", which shouldn't happen for
 * a required field, but is not treated as "not asked". */
export function buildMultiSelectDistribution(
  denominatorRows: AnalyticsRow[],
  getValues: (row: AnalyticsRow) => string[],
  options: SurveyOption[]
): DistributionBucket[] {
  const counts = new Map<string, number>()
  for (const option of options) {
    counts.set(option.value, 0)
  }

  for (const row of denominatorRows) {
    for (const value of getValues(row)) {
      if (counts.has(value)) {
        counts.set(value, (counts.get(value) ?? 0) + 1)
      }
    }
  }

  const total = denominatorRows.length
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    count: counts.get(option.value) ?? 0,
    percentage: percentageOf(counts.get(option.value) ?? 0, total),
  }))
}
