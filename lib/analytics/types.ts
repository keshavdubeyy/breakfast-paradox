import type { ArchetypeId } from "@/lib/archetype-content"
import type { Confidence } from "@/lib/archetype-scoring"

export type Branch = "A" | "B" | "C"

/** One respondent, flattened out of the raw `survey_responses` +
 * `archetype_results` JSONB rows into typed fields the dashboard can
 * filter/aggregate directly — see `lib/analytics/parse.ts`. */
export interface AnalyticsRow {
  id: string
  surveyVersion: number
  createdAt: string
  startedAt: string
  durationSeconds: number
  durationMinutes: number

  year: string | null
  hostel: string | null
  earlyCommitmentDays: string | null
  program: string | null
  gender: string | null

  breakfastFrequency: string | null
  branch: Branch | null

  // Patterns Phase 2 — structural/routine fields, common to (almost)
  // everyone. Same convention throughout this file: raw survey values,
  // never pre-bucketed, so the Patterns layer decides eligibility and a
  // drill-down can always show the exact answer.
  sleepTimeWeekend: string | null
  wakeTimeWeekend: string | null
  beforeSleepActivities: string[]
  beforeSleepMostTime: string | null
  morningActivities: string[]
  messDecision: string | null
  messFoodQuality: string | null

  // Branch A only (regular eaters)
  messBreakfastTime: string | null
  breakfastMoment: string | null
  breakfastRoutineDuration: string | null
  earlyClassRoutineChange: string | null
  earlyClassRoutineChangeActions: string[]
  unwantedMessActions: string[]
  messConsistency: string | null
  messChangeDeterminants: string[]
  breakfastRoutineDescription: string | null
  /** Asked of Branch A always; also asked of B and C once they clear
   * their own branch gate (see showsComparisonMatrix-style gating in the
   * survey pages) — never assume "asked of A only". */
  breakfastMotivationFactors: string[]

  // Branch B only (conditional eaters)
  conditionalMessBreakfastTime: string | null
  breakfastDecisionPoint: string | null
  breakfastDayDifferentiators: string[]

  // Branch C only (rare/non-eaters)
  breakfastAbsenceReason: string | null
  breakfastAbsenceDecisionPoint: string | null
  occasionalBreakfastFrequency: string | null
  occasionalBreakfastDifferentiators: string[]
  breakfastFrequencyChanged: string | null

  weekendDifferentiators: string[]
  previousNightAffectsBreakfast: string | null
  previousNightFactors: string[]

  /** Keyed by ScaleRowItem.key from INFLUENCE_FACTOR_ITEMS — includes the
   * attentionCheckInfluence row; substantive analysis must exclude it
   * explicitly (see ATTENTION_CHECK_INFLUENCE_KEY), it is not filtered
   * out here. */
  influenceRatings: Record<string, string>
  biggestInfluenceFactor: string | null
  /** Keyed by ScaleRowItem.key from AGREEMENT_STATEMENT_ITEMS. */
  agreementRatings: Record<string, string>
  mealValuePerception: string | null
  breakfastImprovementOptions: string[]

  // Open text — qualitative evidence, never converted into a quantitative
  // claim (see lib/analytics/patterns/qualitative.ts). Kept as the exact
  // respondent wording.
  semesterBreakfastChangeDescription: string | null
  breakfastFrequencyChangeDescription: string | null
  breakfastSystemChangeSuggestion: string | null

  // Patterns-page fields — added alongside lib/analytics/patterns/* (see
  // that directory for the normalized/derived versions of these). Kept
  // as raw survey values here for the same reason as the Events fields
  // below: the version-aware parser is the only place that should know
  // which JSONB key holds a given answer.
  wakeTimeWeekday: string | null
  earlyCommitmentBreakfastFrequency: string | null
  noEarlyCommitmentBreakfastFrequency: string | null
  weekendBreakfastComparison: string | null
  semesterBreakfastChange: string | null

  // Events-page fields — observable behaviour, not interpretation. Kept
  // as the raw survey values (not pre-bucketed) so the Events metrics
  // layer decides denominators/filters and drill-downs can show the
  // exact answer, same convention as the fields above.
  sleepTimeWeekday: string | null

  breakfastPlanChangeFrequency: string | null
  breakfastPlanChangeActions: string[]

  // Branch A only (regular eaters)
  missedBreakfastFrequency: string | null
  missedBreakfastReasons: string[]

  // Branch B only (conditional eaters)
  breakfastPlannedButSkippedFrequency: string | null
  breakfastUnplannedButWentFrequency: string | null
  breakfastPlanChangeReasons: string[]

  // Branch C only (rare/non-eaters)
  breakfastServedTimeActivity: string | null
  unusedAllottedMealActions: string[]

  // After Your Morning Routine — asked of everyone
  /** Multi-select as of survey_version 2 — a v1 row's single answer is
   * wrapped into a one-element array by V1_ACCESSORS in parse.ts, so
   * every consumer here always sees an array regardless of source
   * version. */
  nonBreakfastMealSource: string[]
  nextFoodTime: string | null
  nonBreakfastSpendingFrequency: string | null
  nonBreakfastSpendingAmount: string | null
  /** Keyed by ScaleRowItem.key from COMPARISON_ROW_ITEMS (energy/
   * concentration/hunger) — empty object means the grid wasn't shown to
   * this respondent (branch-dependent visibility), not "answered zero". */
  comparisonRatings: Record<string, string>

  attentionCheckPassed: boolean | null

  hasArchetypeResult: boolean
  primaryArchetype: ArchetypeId | null
  secondaryArchetype: ArchetypeId | null
  archetypeConfidence: Confidence | null
}

export interface AnalyticsFilters {
  surveyVersion: number | "all"
  hostel: string | "all"
  year: string | "all"
  earlyCommitmentDays: string | "all"
  breakfastFrequency: string | "all"
  branch: Branch | "all"
  primaryArchetype: ArchetypeId | "all"
  /** Inclusive, ISO date strings (yyyy-mm-dd) or null for "unbounded". */
  dateFrom: string | null
  dateTo: string | null
}

export const DEFAULT_FILTERS: AnalyticsFilters = {
  surveyVersion: "all",
  hostel: "all",
  year: "all",
  earlyCommitmentDays: "all",
  breakfastFrequency: "all",
  branch: "all",
  primaryArchetype: "all",
  dateFrom: null,
  dateTo: null,
}
