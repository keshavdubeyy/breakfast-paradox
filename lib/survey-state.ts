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
  morningActivityOrder: string[]
  messDecision: string
  messFoodQuality: string
  breakfastPlanChangeFrequency: string
  breakfastPlanChangeActions: string[]
  breakfastPlanChangeActionOther: string
  breakfastResaleSuccessRate: string
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
  morningActivityOrder: [],
  messDecision: "",
  messFoodQuality: "",
  breakfastPlanChangeFrequency: "",
  breakfastPlanChangeActions: [],
  breakfastPlanChangeActionOther: "",
  breakfastResaleSuccessRate: "",
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

const defaultSurveyState: SurveyState = {
  aboutYou: defaultAboutYouAnswers,
  usualRoutine: defaultUsualRoutineAnswers,
  afterMorningRoutine: defaultAfterMorningRoutineAnswers,
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

export function getAboutYouAnswers(): AboutYouAnswers {
  return readSurveyState().aboutYou
}

export function getUsualRoutineAnswers(): UsualRoutineAnswers {
  return readSurveyState().usualRoutine
}

export function getAfterMorningRoutineAnswers(): AfterMorningRoutineAnswers {
  return readSurveyState().afterMorningRoutine
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
