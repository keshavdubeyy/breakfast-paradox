import type { PersistedArchetypeResult } from "./archetype-scoring"

export interface AboutYouAnswers {
  program: string
  programOther: string
  year: string
  hostel: string
  gender: string
  earlyCommitmentDays: string
}

export interface UsualRoutineAnswers {
  sleepTimeWeekday: string
  sleepTimeWeekend: string
  beforeSleepActivities: string[]
  beforeSleepActivityOther: string
  beforeSleepMostTime: string
  wakeTimeWeekday: string
  wakeTimeWeekend: string
  morningActivities: string[]
  morningActivityOther: string
  messDecision: string
  messFoodQuality: string
  breakfastPlanChangeFrequency: string
  breakfastPlanChangeActions: string[]
  breakfastPlanChangeActionOther: string
  breakfastFrequency: string

  // Branch A: regular breakfast eaters (almost every day / most days)
  messBreakfastTime: string
  breakfastMoment: string
  breakfastMomentOther: string
  breakfastRoutineDuration: string
  earlyClassRoutineChange: string
  earlyClassRoutineChangeActions: string[]
  earlyClassRoutineChangeActionOther: string
  missedBreakfastFrequency: string
  missedBreakfastReasons: string[]
  missedBreakfastReasonOther: string
  unwantedMessActions: string[]
  unwantedMessActionOther: string
  messConsistency: string
  messChangeDeterminants: string[]
  messChangeDeterminantOther: string
  breakfastRoutineDescription: string
  breakfastRoutineDescriptionOther: string

  // Branch B: conditional breakfast eaters (Q7 = some days)
  conditionalMessBreakfastTime: string
  breakfastDecisionPoint: string
  breakfastDayDifferentiators: string[]
  breakfastDayDifferentiatorOther: string
  breakfastPlannedButSkippedFrequency: string
  breakfastUnplannedButWentFrequency: string
  breakfastPlanChangeReasons: string[]
  breakfastPlanChangeReasonOther: string

  // Branch C: rare / non-breakfast eaters (Q7 = rarely / never)
  breakfastServedTimeActivity: string
  breakfastServedTimeActivityOther: string
  breakfastAbsenceReason: string
  breakfastAbsenceDecisionPoint: string
  occasionalBreakfastFrequency: string
  occasionalBreakfastDifferentiators: string[]
  occasionalBreakfastDifferentiatorOther: string
  unusedAllottedMealActions: string[]
  unusedAllottedMealActionOther: string
  breakfastFrequencyChanged: string
  breakfastFrequencyChangeDescription: string

  // Shared follow-up asked at the end of whichever branch fired above
  // (skipped entirely for Branch C respondents who never eat breakfast)
  breakfastMotivationFactors: string[]
  breakfastMotivationFactorOther: string
}

// Section 4: "After your morning routine" — asked of everyone, after the
// Branch A/B/C follow-up on the Breakfast Routine page.
export interface AfterMorningRoutineAnswers {
  nonBreakfastMealSource: string
  nonBreakfastMealSourceOther: string
  nextFoodTime: string
  earlyCommitmentBreakfastFrequency: string
  noEarlyCommitmentBreakfastFrequency: string
  weekendBreakfastComparison: string
  weekendDifferentiators: string[]
  weekendDifferentiatorOther: string
  nonBreakfastSpendingFrequency: string
  nonBreakfastSpendingAmount: string
  semesterBreakfastChange: string
  semesterBreakfastChangeDescription: string
  // Q4: keyed by ScaleRowItem.key from COMPARISON_ROW_ITEMS
  comparisonRatings: Record<string, string>
  previousNightAffectsBreakfast: string
  previousNightFactors: string[]
  previousNightFactorOther: string
  // Q7: keyed by ScaleRowItem.key from INFLUENCE_FACTOR_ITEMS
  influenceRatings: Record<string, string>
  biggestInfluenceFactor: string
  // Q9: keyed by ScaleRowItem.key from AGREEMENT_STATEMENT_ITEMS
  agreementRatings: Record<string, string>
  breakfastImprovementOptions: string[]
  breakfastImprovementOptionOther: string
  breakfastSystemChangeSuggestion: string
  mealValuePerception: string
}

export interface SurveyState {
  aboutYou: AboutYouAnswers
  usualRoutine: UsualRoutineAnswers
  afterMorningRoutine: AfterMorningRoutineAnswers
  // Computed exactly once, at successful submission (see the After Your
  // Morning Routine page's Continue handler) — never recomputed by the
  // result page. Null until that submission happens.
  archetypeResult: PersistedArchetypeResult | null
  // Assigned once, when the respondent accepts consent (see
  // `ensureSurveySession`) — reused as `survey_responses.id` at
  // submission, so it doubles as that row's unique respondent ID.
  respondentId: string
  // ISO timestamp for the same moment, used to compute how long the
  // respondent took to fill the survey (`created_at - started_at` in the
  // database, see the `20260905010000_add_response_timing` migration).
  startedAt: string
}

export const defaultAboutYouAnswers: AboutYouAnswers = {
  program: "",
  programOther: "",
  year: "",
  hostel: "",
  gender: "",
  earlyCommitmentDays: "",
}

export const defaultUsualRoutineAnswers: UsualRoutineAnswers = {
  sleepTimeWeekday: "",
  sleepTimeWeekend: "",
  beforeSleepActivities: [],
  beforeSleepActivityOther: "",
  beforeSleepMostTime: "",
  wakeTimeWeekday: "",
  wakeTimeWeekend: "",
  morningActivities: [],
  morningActivityOther: "",
  messDecision: "",
  messFoodQuality: "",
  breakfastPlanChangeFrequency: "",
  breakfastPlanChangeActions: [],
  breakfastPlanChangeActionOther: "",
  breakfastFrequency: "",

  messBreakfastTime: "",
  breakfastMoment: "",
  breakfastMomentOther: "",
  breakfastRoutineDuration: "",
  earlyClassRoutineChange: "",
  earlyClassRoutineChangeActions: [],
  earlyClassRoutineChangeActionOther: "",
  missedBreakfastFrequency: "",
  missedBreakfastReasons: [],
  missedBreakfastReasonOther: "",
  unwantedMessActions: [],
  unwantedMessActionOther: "",
  messConsistency: "",
  messChangeDeterminants: [],
  messChangeDeterminantOther: "",
  breakfastRoutineDescription: "",
  breakfastRoutineDescriptionOther: "",

  conditionalMessBreakfastTime: "",
  breakfastDecisionPoint: "",
  breakfastDayDifferentiators: [],
  breakfastDayDifferentiatorOther: "",
  breakfastPlannedButSkippedFrequency: "",
  breakfastUnplannedButWentFrequency: "",
  breakfastPlanChangeReasons: [],
  breakfastPlanChangeReasonOther: "",

  breakfastServedTimeActivity: "",
  breakfastServedTimeActivityOther: "",
  breakfastAbsenceReason: "",
  breakfastAbsenceDecisionPoint: "",
  occasionalBreakfastFrequency: "",
  occasionalBreakfastDifferentiators: [],
  occasionalBreakfastDifferentiatorOther: "",
  unusedAllottedMealActions: [],
  unusedAllottedMealActionOther: "",
  breakfastFrequencyChanged: "",
  breakfastFrequencyChangeDescription: "",

  breakfastMotivationFactors: [],
  breakfastMotivationFactorOther: "",
}

export const defaultAfterMorningRoutineAnswers: AfterMorningRoutineAnswers = {
  nonBreakfastMealSource: "",
  nonBreakfastMealSourceOther: "",
  nextFoodTime: "",
  earlyCommitmentBreakfastFrequency: "",
  noEarlyCommitmentBreakfastFrequency: "",
  weekendBreakfastComparison: "",
  weekendDifferentiators: [],
  weekendDifferentiatorOther: "",
  nonBreakfastSpendingFrequency: "",
  nonBreakfastSpendingAmount: "",
  semesterBreakfastChange: "",
  semesterBreakfastChangeDescription: "",
  comparisonRatings: {},
  previousNightAffectsBreakfast: "",
  previousNightFactors: [],
  previousNightFactorOther: "",
  influenceRatings: {},
  biggestInfluenceFactor: "",
  agreementRatings: {},
  breakfastImprovementOptions: [],
  breakfastImprovementOptionOther: "",
  breakfastSystemChangeSuggestion: "",
  mealValuePerception: "",
}

// --- Clearing stale branch data on a branch switch ------------------------
//
// Q7 (breakfastFrequency) decides which of Branch A/B/C's fields get
// asked next on the Breakfast Routine page. Going back and changing that
// answer switches which branch is shown, but doesn't by itself erase
// whatever was typed into the branch no longer active — that's exactly
// what clearInactiveBreakfastBranchFields is for, called whenever
// breakfastFrequency changes (see app/usual-routine/page.tsx).
//
// Scoring already ignores an inactive branch's fields regardless (every
// formula gates on the CURRENT breakfastFrequency, never on whether a
// field happens to be non-empty) — this is about keeping the stored
// data itself clean, not about correctness of the archetype result.

type BreakfastBranch = "A" | "B" | "C" | null

function getBreakfastBranch(breakfastFrequency: string): BreakfastBranch {
  if (
    breakfastFrequency === "almost-every-day" ||
    breakfastFrequency === "most-days"
  ) {
    return "A"
  }
  if (breakfastFrequency === "some-days") {
    return "B"
  }
  if (breakfastFrequency === "rarely" || breakfastFrequency === "never") {
    return "C"
  }
  return null
}

const BRANCH_A_DEFAULTS: Partial<UsualRoutineAnswers> = {
  messBreakfastTime: "",
  breakfastMoment: "",
  breakfastMomentOther: "",
  breakfastRoutineDuration: "",
  earlyClassRoutineChange: "",
  earlyClassRoutineChangeActions: [],
  earlyClassRoutineChangeActionOther: "",
  missedBreakfastFrequency: "",
  missedBreakfastReasons: [],
  missedBreakfastReasonOther: "",
  unwantedMessActions: [],
  unwantedMessActionOther: "",
  messConsistency: "",
  messChangeDeterminants: [],
  messChangeDeterminantOther: "",
  breakfastRoutineDescription: "",
  breakfastRoutineDescriptionOther: "",
}

const BRANCH_B_DEFAULTS: Partial<UsualRoutineAnswers> = {
  conditionalMessBreakfastTime: "",
  breakfastDecisionPoint: "",
  breakfastDayDifferentiators: [],
  breakfastDayDifferentiatorOther: "",
  breakfastPlannedButSkippedFrequency: "",
  breakfastUnplannedButWentFrequency: "",
  breakfastPlanChangeReasons: [],
  breakfastPlanChangeReasonOther: "",
}

const BRANCH_C_DEFAULTS: Partial<UsualRoutineAnswers> = {
  breakfastServedTimeActivity: "",
  breakfastServedTimeActivityOther: "",
  breakfastAbsenceReason: "",
  breakfastAbsenceDecisionPoint: "",
  occasionalBreakfastFrequency: "",
  occasionalBreakfastDifferentiators: [],
  occasionalBreakfastDifferentiatorOther: "",
  unusedAllottedMealActions: [],
  unusedAllottedMealActionOther: "",
  breakfastFrequencyChanged: "",
  breakfastFrequencyChangeDescription: "",
}

/**
 * Returns `values` with every branch's fields reset to their defaults
 * EXCEPT the branch that `values.breakfastFrequency` currently selects.
 * Shared fields (breakfastMotivationFactors and everything outside the
 * three branch sections) are left untouched — they aren't specific to
 * any one branch.
 */
export function clearInactiveBreakfastBranchFields(
  values: UsualRoutineAnswers
): UsualRoutineAnswers {
  const branch = getBreakfastBranch(values.breakfastFrequency)
  return {
    ...values,
    ...(branch !== "A" ? BRANCH_A_DEFAULTS : null),
    ...(branch !== "B" ? BRANCH_B_DEFAULTS : null),
    ...(branch !== "C" ? BRANCH_C_DEFAULTS : null),
  }
}

const defaultSurveyState: SurveyState = {
  aboutYou: defaultAboutYouAnswers,
  usualRoutine: defaultUsualRoutineAnswers,
  afterMorningRoutine: defaultAfterMorningRoutineAnswers,
  archetypeResult: null,
  respondentId: "",
  startedAt: "",
}

const STORAGE_KEY = "breakfast-paradox:survey-state"

function readSurveyState(): SurveyState {
  if (typeof window === "undefined") {
    return defaultSurveyState
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultSurveyState
    }

    const parsed = JSON.parse(raw) as Partial<SurveyState>
    return {
      ...defaultSurveyState,
      ...parsed,
      aboutYou: { ...defaultAboutYouAnswers, ...parsed.aboutYou },
      usualRoutine: { ...defaultUsualRoutineAnswers, ...parsed.usualRoutine },
      afterMorningRoutine: {
        ...defaultAfterMorningRoutineAnswers,
        ...parsed.afterMorningRoutine,
      },
      archetypeResult: parsed.archetypeResult ?? null,
    }
  } catch {
    return defaultSurveyState
  }
}

function writeSurveyState(state: SurveyState) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sessionStorage may be unavailable (e.g. private browsing) — the
    // survey still works within the current render, it just won't persist.
  }
}

// Called once from the consent page's Continue handler, and again
// (idempotently) right before submission — so a respondent who somehow
// reaches submission without having gone through consent (e.g. a reload
// deep in the flow) still gets a valid id/timestamp pair rather than
// submitting one built from empty strings.
export function ensureSurveySession(): {
  respondentId: string
  startedAt: string
} {
  const state = readSurveyState()
  if (state.respondentId && state.startedAt) {
    return { respondentId: state.respondentId, startedAt: state.startedAt }
  }

  const respondentId = state.respondentId || crypto.randomUUID()
  const startedAt = state.startedAt || new Date().toISOString()
  writeSurveyState({ ...state, respondentId, startedAt })
  return { respondentId, startedAt }
}

export function getAboutYouAnswers(): AboutYouAnswers {
  return readSurveyState().aboutYou
}

export function getUsualRoutineAnswers(): UsualRoutineAnswers {
  return readSurveyState().usualRoutine
}

export function getAfterMorningRoutineAnswers(): AfterMorningRoutineAnswers {
  return readSurveyState().afterMorningRoutine
}

export function getArchetypeResult(): PersistedArchetypeResult | null {
  return readSurveyState().archetypeResult
}

// --- useSyncExternalStore wiring -------------------------------------
//
// sessionStorage lives outside React, so reading it needs to go through
// useSyncExternalStore rather than "load in an effect + setState": that
// pattern renders defaults on the server, then real (different) answers
// on the client's first paint, which React flags as a hydration mismatch.
// useSyncExternalStore renders the server snapshot through hydration and
// only swaps in the real client value right after, with no mismatch.
//
// All survey sections share one sessionStorage key, so a save to any one
// of them changes the raw string every cache is keyed on — every listener
// is notified on every save, and each snapshot getter below independently
// decides (via its own cachedRaw) whether its slice actually changed.

type Listener = () => void

const listeners = new Set<Listener>()

let cachedRawAboutYou: string | null = null
let cachedSnapshotAboutYou: AboutYouAnswers = defaultAboutYouAnswers

function readCachedAboutYouSnapshot(): AboutYouAnswers {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRawAboutYou) {
    cachedRawAboutYou = raw
    cachedSnapshotAboutYou = readSurveyState().aboutYou
  }
  return cachedSnapshotAboutYou
}

export function subscribeAboutYou(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAboutYouSnapshot(): AboutYouAnswers {
  if (typeof window === "undefined") {
    return defaultAboutYouAnswers
  }
  return readCachedAboutYouSnapshot()
}

export function getAboutYouServerSnapshot(): AboutYouAnswers {
  return defaultAboutYouAnswers
}

export function saveAboutYouAnswers(answers: AboutYouAnswers) {
  writeSurveyState({ ...readSurveyState(), aboutYou: answers })
  cachedRawAboutYou = window.sessionStorage.getItem(STORAGE_KEY)
  cachedSnapshotAboutYou = answers
  listeners.forEach((listener) => listener())
}

let cachedRawUsualRoutine: string | null = null
let cachedSnapshotUsualRoutine: UsualRoutineAnswers = defaultUsualRoutineAnswers

function readCachedUsualRoutineSnapshot(): UsualRoutineAnswers {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRawUsualRoutine) {
    cachedRawUsualRoutine = raw
    cachedSnapshotUsualRoutine = readSurveyState().usualRoutine
  }
  return cachedSnapshotUsualRoutine
}

export function subscribeUsualRoutine(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getUsualRoutineSnapshot(): UsualRoutineAnswers {
  if (typeof window === "undefined") {
    return defaultUsualRoutineAnswers
  }
  return readCachedUsualRoutineSnapshot()
}

export function getUsualRoutineServerSnapshot(): UsualRoutineAnswers {
  return defaultUsualRoutineAnswers
}

export function saveUsualRoutineAnswers(answers: UsualRoutineAnswers) {
  writeSurveyState({ ...readSurveyState(), usualRoutine: answers })
  cachedRawUsualRoutine = window.sessionStorage.getItem(STORAGE_KEY)
  cachedSnapshotUsualRoutine = answers
  listeners.forEach((listener) => listener())
}

let cachedRawAfterMorningRoutine: string | null = null
let cachedSnapshotAfterMorningRoutine: AfterMorningRoutineAnswers =
  defaultAfterMorningRoutineAnswers

function readCachedAfterMorningRoutineSnapshot(): AfterMorningRoutineAnswers {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRawAfterMorningRoutine) {
    cachedRawAfterMorningRoutine = raw
    cachedSnapshotAfterMorningRoutine = readSurveyState().afterMorningRoutine
  }
  return cachedSnapshotAfterMorningRoutine
}

export function subscribeAfterMorningRoutine(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAfterMorningRoutineSnapshot(): AfterMorningRoutineAnswers {
  if (typeof window === "undefined") {
    return defaultAfterMorningRoutineAnswers
  }
  return readCachedAfterMorningRoutineSnapshot()
}

export function getAfterMorningRoutineServerSnapshot(): AfterMorningRoutineAnswers {
  return defaultAfterMorningRoutineAnswers
}

export function saveAfterMorningRoutineAnswers(
  answers: AfterMorningRoutineAnswers
) {
  writeSurveyState({ ...readSurveyState(), afterMorningRoutine: answers })
  cachedRawAfterMorningRoutine = window.sessionStorage.getItem(STORAGE_KEY)
  cachedSnapshotAfterMorningRoutine = answers
  listeners.forEach((listener) => listener())
}

let cachedRawArchetypeResult: string | null = null
let cachedSnapshotArchetypeResult: PersistedArchetypeResult | null = null

function readCachedArchetypeResultSnapshot(): PersistedArchetypeResult | null {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRawArchetypeResult) {
    cachedRawArchetypeResult = raw
    cachedSnapshotArchetypeResult = readSurveyState().archetypeResult
  }
  return cachedSnapshotArchetypeResult
}

export function subscribeArchetypeResult(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getArchetypeResultSnapshot(): PersistedArchetypeResult | null {
  if (typeof window === "undefined") {
    return null
  }
  return readCachedArchetypeResultSnapshot()
}

export function getArchetypeResultServerSnapshot(): PersistedArchetypeResult | null {
  return null
}

/**
 * Called exactly once, at successful survey submission — see the Continue
 * handler on the After Your Morning Routine page. The result page reads
 * this saved value; it must never call calculateArchetypeResult itself.
 */
export function saveArchetypeResult(result: PersistedArchetypeResult) {
  writeSurveyState({ ...readSurveyState(), archetypeResult: result })
  cachedRawArchetypeResult = window.sessionStorage.getItem(STORAGE_KEY)
  cachedSnapshotArchetypeResult = result
  listeners.forEach((listener) => listener())
}
