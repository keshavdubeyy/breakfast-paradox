// Generic, genuinely-shared normalization primitives — anything specific
// to one page's analysis (e.g. Patterns' paired early/non-early gap, or
// its Spearman/Cramér's V machinery) belongs in that page's own
// lib/analytics/<page>/ directory instead, not here. This file only
// holds the small set of ordinal-scale lookup tables that more than one
// page could plausibly reuse.

/** Looks a value up in an ordinal scale map. Returns null for both "value
 * is null" and "value isn't in this scale" (e.g. `not-applicable` on a
 * scale that only defines the answerable options) — callers that need to
 * tell those two cases apart should check the raw value themselves. */
export function scoreOrdinal(
  value: string | null,
  scale: Record<string, number | null>
): number | null {
  if (value === null) {
    return null
  }
  const score = scale[value];
  return score === undefined ? null : score
}

// almost-every-day / most-days / some-days / rarely / never — the
// breakfast-frequency question's own wording, distinct from the generic
// almost-always/often/... scale below.
export const BREAKFAST_FREQUENCY_SCALE: Record<string, number> = {
  "almost-every-day": 4,
  "most-days": 3,
  "some-days": 2,
  rarely: 1,
  never: 0,
}

// Shared by every other "how often" question in the survey
// (earlyCommitmentBreakfastFrequency, noEarlyCommitmentBreakfastFrequency,
// breakfastPlanChangeFrequency, missedBreakfastFrequency, and more).
// `not-applicable` is deliberately absent — scoreOrdinal already returns
// null for values missing from the scale, and "not applicable" must
// never be silently read as "never" (score 0).
export const GENERIC_FREQUENCY_SCALE: Record<string, number> = {
  "almost-always": 4,
  often: 3,
  sometimes: 2,
  rarely: 1,
  never: 0,
}

// Ordered weekday sleep-time bands, earliest to latest. `no-consistent-time`
// is intentionally absent (see scoreOrdinal) — it's a real, frequently
// selected category, not a missing answer, and must stay visible in
// distribution charts while being excluded from ordinal statistics.
export const SLEEP_TIME_SCALE: Record<string, number> = {
  "before-11pm": 0,
  "11pm-12am": 1,
  "12am-1am": 2,
  "1am-2am": 3,
  "2am-3am": 4,
  "after-3am": 5,
}

// Same convention as SLEEP_TIME_SCALE, for wakeTimeWeekday.
export const WAKE_TIME_SCALE: Record<string, number> = {
  "before-630am": 0,
  "630-700am": 1,
  "700-730am": 2,
  "730-800am": 3,
  "800-830am": 4,
  "830-900am": 5,
  "900-1000am": 6,
  "after-1000am": 7,
}

export const INFLUENCE_SCALE: Record<string, number> = {
  "not-at-all": 0,
  slightly: 1,
  moderately: 2,
  "a-lot": 3,
  "very-strongly": 4,
}

export const AGREEMENT_SCALE: Record<string, number> = {
  "strongly-disagree": 0,
  disagree: 1,
  neutral: 2,
  agree: 3,
  "strongly-agree": 4,
}

// -2..+2, matching the wording the survey uses for the comparison grid
// (energy/concentration/hunger). `can't compare` is deliberately absent.
export const COMPARISON_SCALE: Record<string, number> = {
  "much-lower": -2,
  "slightly-lower": -1,
  "about-the-same": 0,
  "slightly-higher": 1,
  "much-higher": 2,
}
