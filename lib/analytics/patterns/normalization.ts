import {
  AGREEMENT_STATEMENT_ITEMS,
  ATTENTION_CHECK_INFLUENCE_KEY,
  COMPARISON_ROW_ITEMS,
  INFLUENCE_FACTOR_ITEMS,
} from "@/lib/survey-options"
import {
  AGREEMENT_SCALE,
  BREAKFAST_FREQUENCY_SCALE,
  COMPARISON_SCALE,
  GENERIC_FREQUENCY_SCALE,
  INFLUENCE_SCALE,
  scoreOrdinal,
  SLEEP_TIME_SCALE,
  WAKE_TIME_SCALE,
} from "../normalization"
import type { AnalyticsRow, Branch } from "../types"

/** INFLUENCE_FACTOR_ITEMS minus the embedded attention-check row — the
 * one substantive-influence list every module (Explorer registry, the
 * structural-influence matrix) should iterate over, defined once so
 * excluding the attention check can't be forgotten in a second place. */
export const SUBSTANTIVE_INFLUENCE_ITEMS = INFLUENCE_FACTOR_ITEMS.filter(
  (item) => item.key !== ATTENTION_CHECK_INFLUENCE_KEY
)

export { AGREEMENT_STATEMENT_ITEMS, COMPARISON_ROW_ITEMS }

export const BRANCH_LABELS: Record<Branch, string> = {
  A: "Regular eaters",
  B: "Conditional eaters",
  C: "Rare / non-eaters",
}

export const BRANCHES: Branch[] = ["A", "B", "C"]

/** The exact, named cohort definition behind the "late-sleep breakfast
 * gap" summary card — deliberately exposed here (not inlined in
 * metrics.ts) so the cutoff is a single documented, reviewable constant
 * rather than something a later change could silently move and quietly
 * shift the headline finding. Middle categories (12–1 AM, 1–2 AM) are
 * intentionally excluded from this specific comparison — they're neither
 * cohort, so including them would blur "early" vs "late" into each
 * other. They still appear, uncollapsed, in the full sleep×branch table
 * (Core Pattern 3) — this cohort split only governs the one summary
 * card. */
export const LATE_SLEEP_COHORTS: { early: string[]; late: string[] } = {
  early: ["before-11pm", "11pm-12am"],
  late: ["2am-3am", "after-3am"],
}

export function breakfastFrequencyScore(row: AnalyticsRow): number | null {
  return scoreOrdinal(row.breakfastFrequency, BREAKFAST_FREQUENCY_SCALE)
}

export function sleepScore(row: AnalyticsRow): number | null {
  return scoreOrdinal(row.sleepTimeWeekday, SLEEP_TIME_SCALE)
}

export function wakeScore(row: AnalyticsRow): number | null {
  return scoreOrdinal(row.wakeTimeWeekday, WAKE_TIME_SCALE)
}

/** Same category vocabulary as the weekday fields (SLEEP_TIME_SCALE/
 * WAKE_TIME_SCALE) — the survey asks the identical time-bucket question,
 * just for weekends. Previously collected but never scored anywhere. */
export function weekendSleepScore(row: AnalyticsRow): number | null {
  return scoreOrdinal(row.sleepTimeWeekend, SLEEP_TIME_SCALE)
}

export function weekendWakeScore(row: AnalyticsRow): number | null {
  return scoreOrdinal(row.wakeTimeWeekend, WAKE_TIME_SCALE)
}

/** `not-applicable` is a real, meaningful answer (there is no such thing
 * as an early-commitment day for this respondent) — scoreOrdinal already
 * returns null for it (it's absent from GENERIC_FREQUENCY_SCALE), so it's
 * automatically excluded from every ordinal calculation below without
 * ever being confused with "never" (score 0). */
export function earlyCommitmentFrequencyScore(row: AnalyticsRow): number | null {
  return scoreOrdinal(row.earlyCommitmentBreakfastFrequency, GENERIC_FREQUENCY_SCALE)
}

export function noEarlyCommitmentFrequencyScore(row: AnalyticsRow): number | null {
  return scoreOrdinal(row.noEarlyCommitmentBreakfastFrequency, GENERIC_FREQUENCY_SCALE)
}

/** Eligible for the within-person early-vs-non-early comparison only when
 * *both* sides resolved to a real score — excludes respondents missing
 * either answer and respondents for whom "not-applicable" wiped one side
 * out, without ever treating either as a zero. */
export function hasValidPairedEarlyCommitmentFrequency(row: AnalyticsRow): boolean {
  return (
    earlyCommitmentFrequencyScore(row) !== null &&
    noEarlyCommitmentFrequencyScore(row) !== null
  )
}

/** A single row's score out of a Likert grid, keyed by ScaleRowItem.key.
 * Missing from the record entirely means the grid wasn't shown to this
 * respondent (branch-dependent visibility) — that's null, same as any
 * other unanswered field, never a substitute zero. */
export function influenceRowScore(row: AnalyticsRow, key: string): number | null {
  return scoreOrdinal(row.influenceRatings[key] ?? null, INFLUENCE_SCALE)
}

export function agreementRowScore(row: AnalyticsRow, key: string): number | null {
  return scoreOrdinal(row.agreementRatings[key] ?? null, AGREEMENT_SCALE)
}

/** -2 (much lower) to +2 (much higher); "cant-compare" is absent from
 * COMPARISON_SCALE, so it resolves to null (excluded), same treatment as
 * every other "doesn't apply" value in this file — never a substitute 0. */
export function comparisonRowScore(row: AnalyticsRow, key: string): number | null {
  return scoreOrdinal(row.comparisonRatings[key] ?? null, COMPARISON_SCALE)
}

/** Positive → breakfast less often on early-commitment days (non-early
 * score is higher than early score); negative → more often; 0 → no
 * difference. Null when the respondent isn't eligible (see above). */
export function earlyCommitmentPairedGap(row: AnalyticsRow): number | null {
  const early = earlyCommitmentFrequencyScore(row)
  const nonEarly = noEarlyCommitmentFrequencyScore(row)
  if (early === null || nonEarly === null) {
    return null
  }
  return nonEarly - early
}
