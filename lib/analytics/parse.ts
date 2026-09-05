import { ARCHETYPE_IDS, type ArchetypeId } from "@/lib/archetype-content"
import type { Confidence } from "@/lib/archetype-scoring"
import {
  ATTENTION_CHECK_EXPECTED_VALUE,
  ATTENTION_CHECK_INFLUENCE_KEY,
} from "@/lib/survey-options"
import type { AnalyticsRow, Branch } from "./types"

export interface RawSurveyResponseRow {
  id: string
  survey_version: number
  created_at: string
  started_at: string
  duration_seconds: number
  duration_minutes: number
  about_you: Record<string, unknown>
  usual_routine: Record<string, unknown>
  after_morning_routine: Record<string, unknown>
}

export interface RawArchetypeResultRow {
  response_id: string
  primary_archetype: string
  secondary_archetype: string
  confidence: string
}

function readString(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key]
  return typeof value === "string" && value.length > 0 ? value : null
}

function readStringArray(obj: Record<string, unknown>, key: string): string[] {
  const value = obj[key]
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function readStringRecord(
  obj: Record<string, unknown>,
  key: string
): Record<string, string> {
  const value = obj[key]
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {}
  }
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") {
      result[k] = v
    }
  }
  return result
}

function deriveBranch(breakfastFrequency: string | null): Branch | null {
  switch (breakfastFrequency) {
    case "almost-every-day":
    case "most-days":
      return "A"
    case "some-days":
      return "B"
    case "rarely":
    case "never":
      return "C"
    default:
      return null
  }
}

function asArchetypeId(value: string | null): ArchetypeId | null {
  return value && (ARCHETYPE_IDS as string[]).includes(value)
    ? (value as ArchetypeId)
    : null
}

function asConfidence(value: string | null): Confidence | null {
  return value === "strong" || value === "mixed" ? value : null
}

// --- Version-aware field access --------------------------------------------
//
// The three JSONB blobs have no fixed schema — their shape just mirrors
// whatever the app's survey-state TypeScript types looked like at the
// time of submission. When a later survey version renames or merges a
// question, its key changes too (e.g. a hypothetical v2 might replace
// `breakfastPlannedButSkippedFrequency` with `breakfastPlanStability`).
// Reading fields through this per-version registry — rather than a
// single hardcoded key name — means adding v2 later is "add a new entry
// below", not "silently misread new rows using v1's key names".
interface FieldAccessors {
  year: (aboutYou: Record<string, unknown>) => string | null
  hostel: (aboutYou: Record<string, unknown>) => string | null
  earlyCommitmentDays: (aboutYou: Record<string, unknown>) => string | null
  program: (aboutYou: Record<string, unknown>) => string | null
  gender: (aboutYou: Record<string, unknown>) => string | null
  breakfastFrequency: (usualRoutine: Record<string, unknown>) => string | null
  attentionCheckPassed: (
    afterMorningRoutine: Record<string, unknown>
  ) => boolean | null

  sleepTimeWeekday: (usualRoutine: Record<string, unknown>) => string | null
  sleepTimeWeekend: (usualRoutine: Record<string, unknown>) => string | null
  wakeTimeWeekday: (usualRoutine: Record<string, unknown>) => string | null
  wakeTimeWeekend: (usualRoutine: Record<string, unknown>) => string | null
  beforeSleepActivities: (usualRoutine: Record<string, unknown>) => string[]
  beforeSleepMostTime: (usualRoutine: Record<string, unknown>) => string | null
  morningActivities: (usualRoutine: Record<string, unknown>) => string[]
  messDecision: (usualRoutine: Record<string, unknown>) => string | null
  messFoodQuality: (usualRoutine: Record<string, unknown>) => string | null
  breakfastPlanChangeFrequency: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  breakfastPlanChangeActions: (
    usualRoutine: Record<string, unknown>
  ) => string[]
  missedBreakfastFrequency: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  missedBreakfastReasons: (usualRoutine: Record<string, unknown>) => string[]
  breakfastPlannedButSkippedFrequency: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  breakfastUnplannedButWentFrequency: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  breakfastPlanChangeReasons: (
    usualRoutine: Record<string, unknown>
  ) => string[]
  breakfastServedTimeActivity: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  unusedAllottedMealActions: (
    usualRoutine: Record<string, unknown>
  ) => string[]

  // Branch A only
  messBreakfastTime: (usualRoutine: Record<string, unknown>) => string | null
  breakfastMoment: (usualRoutine: Record<string, unknown>) => string | null
  breakfastRoutineDuration: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  earlyClassRoutineChange: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  earlyClassRoutineChangeActions: (
    usualRoutine: Record<string, unknown>
  ) => string[]
  unwantedMessActions: (usualRoutine: Record<string, unknown>) => string[]
  messConsistency: (usualRoutine: Record<string, unknown>) => string | null
  messChangeDeterminants: (usualRoutine: Record<string, unknown>) => string[]
  breakfastRoutineDescription: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  breakfastMotivationFactors: (
    usualRoutine: Record<string, unknown>
  ) => string[]

  // Branch B only
  conditionalMessBreakfastTime: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  breakfastDecisionPoint: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  breakfastDayDifferentiators: (
    usualRoutine: Record<string, unknown>
  ) => string[]

  // Branch C only
  breakfastAbsenceReason: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  breakfastAbsenceDecisionPoint: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  occasionalBreakfastFrequency: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  occasionalBreakfastDifferentiators: (
    usualRoutine: Record<string, unknown>
  ) => string[]
  breakfastFrequencyChanged: (
    usualRoutine: Record<string, unknown>
  ) => string | null

  nonBreakfastMealSource: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  nextFoodTime: (afterMorningRoutine: Record<string, unknown>) => string | null
  nonBreakfastSpendingFrequency: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  nonBreakfastSpendingAmount: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  comparisonRatings: (
    afterMorningRoutine: Record<string, unknown>
  ) => Record<string, string>

  weekendDifferentiators: (
    afterMorningRoutine: Record<string, unknown>
  ) => string[]
  previousNightAffectsBreakfast: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  previousNightFactors: (
    afterMorningRoutine: Record<string, unknown>
  ) => string[]
  influenceRatings: (
    afterMorningRoutine: Record<string, unknown>
  ) => Record<string, string>
  biggestInfluenceFactor: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  agreementRatings: (
    afterMorningRoutine: Record<string, unknown>
  ) => Record<string, string>
  mealValuePerception: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  breakfastImprovementOptions: (
    afterMorningRoutine: Record<string, unknown>
  ) => string[]
  semesterBreakfastChangeDescription: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  breakfastFrequencyChangeDescription: (
    usualRoutine: Record<string, unknown>
  ) => string | null
  breakfastSystemChangeSuggestion: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null

  earlyCommitmentBreakfastFrequency: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  noEarlyCommitmentBreakfastFrequency: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  weekendBreakfastComparison: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
  semesterBreakfastChange: (
    afterMorningRoutine: Record<string, unknown>
  ) => string | null
}

const V1_ACCESSORS: FieldAccessors = {
  year: (aboutYou) => readString(aboutYou, "year"),
  hostel: (aboutYou) => readString(aboutYou, "hostel"),
  earlyCommitmentDays: (aboutYou) => readString(aboutYou, "earlyCommitmentDays"),
  program: (aboutYou) => readString(aboutYou, "program"),
  gender: (aboutYou) => readString(aboutYou, "gender"),
  breakfastFrequency: (usualRoutine) =>
    readString(usualRoutine, "breakfastFrequency"),
  attentionCheckPassed: (afterMorningRoutine) => {
    const influenceRatings = afterMorningRoutine.influenceRatings
    if (
      typeof influenceRatings !== "object" ||
      influenceRatings === null ||
      Array.isArray(influenceRatings)
    ) {
      return null
    }
    const value = (influenceRatings as Record<string, unknown>)[
      ATTENTION_CHECK_INFLUENCE_KEY
    ]
    if (typeof value !== "string" || value.length === 0) {
      return null
    }
    return value === ATTENTION_CHECK_EXPECTED_VALUE
  },

  sleepTimeWeekday: (usualRoutine) => readString(usualRoutine, "sleepTimeWeekday"),
  sleepTimeWeekend: (usualRoutine) => readString(usualRoutine, "sleepTimeWeekend"),
  wakeTimeWeekday: (usualRoutine) => readString(usualRoutine, "wakeTimeWeekday"),
  wakeTimeWeekend: (usualRoutine) => readString(usualRoutine, "wakeTimeWeekend"),
  beforeSleepActivities: (usualRoutine) =>
    readStringArray(usualRoutine, "beforeSleepActivities"),
  beforeSleepMostTime: (usualRoutine) =>
    readString(usualRoutine, "beforeSleepMostTime"),
  morningActivities: (usualRoutine) =>
    readStringArray(usualRoutine, "morningActivities"),
  messDecision: (usualRoutine) => readString(usualRoutine, "messDecision"),
  messFoodQuality: (usualRoutine) =>
    readString(usualRoutine, "messFoodQuality"),
  breakfastPlanChangeFrequency: (usualRoutine) =>
    readString(usualRoutine, "breakfastPlanChangeFrequency"),
  breakfastPlanChangeActions: (usualRoutine) =>
    readStringArray(usualRoutine, "breakfastPlanChangeActions"),
  missedBreakfastFrequency: (usualRoutine) =>
    readString(usualRoutine, "missedBreakfastFrequency"),
  missedBreakfastReasons: (usualRoutine) =>
    readStringArray(usualRoutine, "missedBreakfastReasons"),
  breakfastPlannedButSkippedFrequency: (usualRoutine) =>
    readString(usualRoutine, "breakfastPlannedButSkippedFrequency"),
  breakfastUnplannedButWentFrequency: (usualRoutine) =>
    readString(usualRoutine, "breakfastUnplannedButWentFrequency"),
  breakfastPlanChangeReasons: (usualRoutine) =>
    readStringArray(usualRoutine, "breakfastPlanChangeReasons"),
  breakfastServedTimeActivity: (usualRoutine) =>
    readString(usualRoutine, "breakfastServedTimeActivity"),
  unusedAllottedMealActions: (usualRoutine) =>
    readStringArray(usualRoutine, "unusedAllottedMealActions"),

  messBreakfastTime: (usualRoutine) =>
    readString(usualRoutine, "messBreakfastTime"),
  breakfastMoment: (usualRoutine) =>
    readString(usualRoutine, "breakfastMoment"),
  breakfastRoutineDuration: (usualRoutine) =>
    readString(usualRoutine, "breakfastRoutineDuration"),
  earlyClassRoutineChange: (usualRoutine) =>
    readString(usualRoutine, "earlyClassRoutineChange"),
  earlyClassRoutineChangeActions: (usualRoutine) =>
    readStringArray(usualRoutine, "earlyClassRoutineChangeActions"),
  unwantedMessActions: (usualRoutine) =>
    readStringArray(usualRoutine, "unwantedMessActions"),
  messConsistency: (usualRoutine) =>
    readString(usualRoutine, "messConsistency"),
  messChangeDeterminants: (usualRoutine) =>
    readStringArray(usualRoutine, "messChangeDeterminants"),
  breakfastRoutineDescription: (usualRoutine) =>
    readString(usualRoutine, "breakfastRoutineDescription"),
  breakfastMotivationFactors: (usualRoutine) =>
    readStringArray(usualRoutine, "breakfastMotivationFactors"),

  conditionalMessBreakfastTime: (usualRoutine) =>
    readString(usualRoutine, "conditionalMessBreakfastTime"),
  breakfastDecisionPoint: (usualRoutine) =>
    readString(usualRoutine, "breakfastDecisionPoint"),
  breakfastDayDifferentiators: (usualRoutine) =>
    readStringArray(usualRoutine, "breakfastDayDifferentiators"),

  breakfastAbsenceReason: (usualRoutine) =>
    readString(usualRoutine, "breakfastAbsenceReason"),
  breakfastAbsenceDecisionPoint: (usualRoutine) =>
    readString(usualRoutine, "breakfastAbsenceDecisionPoint"),
  occasionalBreakfastFrequency: (usualRoutine) =>
    readString(usualRoutine, "occasionalBreakfastFrequency"),
  occasionalBreakfastDifferentiators: (usualRoutine) =>
    readStringArray(usualRoutine, "occasionalBreakfastDifferentiators"),
  breakfastFrequencyChanged: (usualRoutine) =>
    readString(usualRoutine, "breakfastFrequencyChanged"),
  breakfastFrequencyChangeDescription: (usualRoutine) =>
    readString(usualRoutine, "breakfastFrequencyChangeDescription"),

  nonBreakfastMealSource: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "nonBreakfastMealSource"),
  nextFoodTime: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "nextFoodTime"),
  nonBreakfastSpendingFrequency: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "nonBreakfastSpendingFrequency"),
  nonBreakfastSpendingAmount: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "nonBreakfastSpendingAmount"),
  comparisonRatings: (afterMorningRoutine) =>
    readStringRecord(afterMorningRoutine, "comparisonRatings"),

  weekendDifferentiators: (afterMorningRoutine) =>
    readStringArray(afterMorningRoutine, "weekendDifferentiators"),
  previousNightAffectsBreakfast: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "previousNightAffectsBreakfast"),
  previousNightFactors: (afterMorningRoutine) =>
    readStringArray(afterMorningRoutine, "previousNightFactors"),
  influenceRatings: (afterMorningRoutine) =>
    readStringRecord(afterMorningRoutine, "influenceRatings"),
  biggestInfluenceFactor: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "biggestInfluenceFactor"),
  agreementRatings: (afterMorningRoutine) =>
    readStringRecord(afterMorningRoutine, "agreementRatings"),
  mealValuePerception: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "mealValuePerception"),
  breakfastImprovementOptions: (afterMorningRoutine) =>
    readStringArray(afterMorningRoutine, "breakfastImprovementOptions"),
  semesterBreakfastChangeDescription: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "semesterBreakfastChangeDescription"),
  breakfastSystemChangeSuggestion: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "breakfastSystemChangeSuggestion"),

  earlyCommitmentBreakfastFrequency: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "earlyCommitmentBreakfastFrequency"),
  noEarlyCommitmentBreakfastFrequency: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "noEarlyCommitmentBreakfastFrequency"),
  weekendBreakfastComparison: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "weekendBreakfastComparison"),
  semesterBreakfastChange: (afterMorningRoutine) =>
    readString(afterMorningRoutine, "semesterBreakfastChange"),
}

const FIELD_ACCESSORS_BY_VERSION: Record<number, FieldAccessors> = {
  1: V1_ACCESSORS,
}

function accessorsFor(surveyVersion: number): FieldAccessors {
  const accessors = FIELD_ACCESSORS_BY_VERSION[surveyVersion]
  if (accessors) {
    return accessors
  }
  // Unknown version (e.g. a v2 not yet added above) — fall back to the
  // latest known accessors rather than crashing the whole dashboard, but
  // make it visible in server logs so the registry actually gets updated.
  console.warn(
    `[analytics] no field accessors registered for survey_version=${surveyVersion}; falling back to v1`
  )
  return V1_ACCESSORS
}

export function parseAnalyticsRow(
  raw: RawSurveyResponseRow,
  archetype: RawArchetypeResultRow | null
): AnalyticsRow {
  const accessors = accessorsFor(raw.survey_version)
  const breakfastFrequency = accessors.breakfastFrequency(raw.usual_routine)

  return {
    id: raw.id,
    surveyVersion: raw.survey_version,
    createdAt: raw.created_at,
    startedAt: raw.started_at,
    durationSeconds: raw.duration_seconds,
    durationMinutes: raw.duration_minutes,

    year: accessors.year(raw.about_you),
    hostel: accessors.hostel(raw.about_you),
    earlyCommitmentDays: accessors.earlyCommitmentDays(raw.about_you),
    program: accessors.program(raw.about_you),
    gender: accessors.gender(raw.about_you),

    breakfastFrequency,
    branch: deriveBranch(breakfastFrequency),

    sleepTimeWeekday: accessors.sleepTimeWeekday(raw.usual_routine),
    sleepTimeWeekend: accessors.sleepTimeWeekend(raw.usual_routine),
    wakeTimeWeekday: accessors.wakeTimeWeekday(raw.usual_routine),
    wakeTimeWeekend: accessors.wakeTimeWeekend(raw.usual_routine),
    beforeSleepActivities: accessors.beforeSleepActivities(raw.usual_routine),
    beforeSleepMostTime: accessors.beforeSleepMostTime(raw.usual_routine),
    morningActivities: accessors.morningActivities(raw.usual_routine),
    messDecision: accessors.messDecision(raw.usual_routine),
    messFoodQuality: accessors.messFoodQuality(raw.usual_routine),

    breakfastPlanChangeFrequency: accessors.breakfastPlanChangeFrequency(
      raw.usual_routine
    ),
    breakfastPlanChangeActions: accessors.breakfastPlanChangeActions(
      raw.usual_routine
    ),

    missedBreakfastFrequency: accessors.missedBreakfastFrequency(
      raw.usual_routine
    ),
    missedBreakfastReasons: accessors.missedBreakfastReasons(
      raw.usual_routine
    ),

    breakfastPlannedButSkippedFrequency:
      accessors.breakfastPlannedButSkippedFrequency(raw.usual_routine),
    breakfastUnplannedButWentFrequency:
      accessors.breakfastUnplannedButWentFrequency(raw.usual_routine),
    breakfastPlanChangeReasons: accessors.breakfastPlanChangeReasons(
      raw.usual_routine
    ),

    breakfastServedTimeActivity: accessors.breakfastServedTimeActivity(
      raw.usual_routine
    ),
    unusedAllottedMealActions: accessors.unusedAllottedMealActions(
      raw.usual_routine
    ),

    messBreakfastTime: accessors.messBreakfastTime(raw.usual_routine),
    breakfastMoment: accessors.breakfastMoment(raw.usual_routine),
    breakfastRoutineDuration: accessors.breakfastRoutineDuration(
      raw.usual_routine
    ),
    earlyClassRoutineChange: accessors.earlyClassRoutineChange(
      raw.usual_routine
    ),
    earlyClassRoutineChangeActions: accessors.earlyClassRoutineChangeActions(
      raw.usual_routine
    ),
    unwantedMessActions: accessors.unwantedMessActions(raw.usual_routine),
    messConsistency: accessors.messConsistency(raw.usual_routine),
    messChangeDeterminants: accessors.messChangeDeterminants(
      raw.usual_routine
    ),
    breakfastRoutineDescription: accessors.breakfastRoutineDescription(
      raw.usual_routine
    ),
    breakfastMotivationFactors: accessors.breakfastMotivationFactors(
      raw.usual_routine
    ),

    conditionalMessBreakfastTime: accessors.conditionalMessBreakfastTime(
      raw.usual_routine
    ),
    breakfastDecisionPoint: accessors.breakfastDecisionPoint(
      raw.usual_routine
    ),
    breakfastDayDifferentiators: accessors.breakfastDayDifferentiators(
      raw.usual_routine
    ),

    breakfastAbsenceReason: accessors.breakfastAbsenceReason(
      raw.usual_routine
    ),
    breakfastAbsenceDecisionPoint: accessors.breakfastAbsenceDecisionPoint(
      raw.usual_routine
    ),
    occasionalBreakfastFrequency: accessors.occasionalBreakfastFrequency(
      raw.usual_routine
    ),
    occasionalBreakfastDifferentiators:
      accessors.occasionalBreakfastDifferentiators(raw.usual_routine),
    breakfastFrequencyChanged: accessors.breakfastFrequencyChanged(
      raw.usual_routine
    ),
    breakfastFrequencyChangeDescription:
      accessors.breakfastFrequencyChangeDescription(raw.usual_routine),

    nonBreakfastMealSource: accessors.nonBreakfastMealSource(
      raw.after_morning_routine
    ),
    nextFoodTime: accessors.nextFoodTime(raw.after_morning_routine),
    nonBreakfastSpendingFrequency: accessors.nonBreakfastSpendingFrequency(
      raw.after_morning_routine
    ),
    nonBreakfastSpendingAmount: accessors.nonBreakfastSpendingAmount(
      raw.after_morning_routine
    ),
    comparisonRatings: accessors.comparisonRatings(raw.after_morning_routine),

    weekendDifferentiators: accessors.weekendDifferentiators(
      raw.after_morning_routine
    ),
    previousNightAffectsBreakfast: accessors.previousNightAffectsBreakfast(
      raw.after_morning_routine
    ),
    previousNightFactors: accessors.previousNightFactors(
      raw.after_morning_routine
    ),
    influenceRatings: accessors.influenceRatings(raw.after_morning_routine),
    biggestInfluenceFactor: accessors.biggestInfluenceFactor(
      raw.after_morning_routine
    ),
    agreementRatings: accessors.agreementRatings(raw.after_morning_routine),
    mealValuePerception: accessors.mealValuePerception(
      raw.after_morning_routine
    ),
    breakfastImprovementOptions: accessors.breakfastImprovementOptions(
      raw.after_morning_routine
    ),
    semesterBreakfastChangeDescription:
      accessors.semesterBreakfastChangeDescription(raw.after_morning_routine),
    breakfastSystemChangeSuggestion:
      accessors.breakfastSystemChangeSuggestion(raw.after_morning_routine),

    earlyCommitmentBreakfastFrequency:
      accessors.earlyCommitmentBreakfastFrequency(raw.after_morning_routine),
    noEarlyCommitmentBreakfastFrequency:
      accessors.noEarlyCommitmentBreakfastFrequency(raw.after_morning_routine),
    weekendBreakfastComparison: accessors.weekendBreakfastComparison(
      raw.after_morning_routine
    ),
    semesterBreakfastChange: accessors.semesterBreakfastChange(
      raw.after_morning_routine
    ),

    attentionCheckPassed: accessors.attentionCheckPassed(
      raw.after_morning_routine
    ),

    hasArchetypeResult: archetype !== null,
    primaryArchetype: asArchetypeId(archetype?.primary_archetype ?? null),
    secondaryArchetype: asArchetypeId(archetype?.secondary_archetype ?? null),
    archetypeConfidence: asConfidence(archetype?.confidence ?? null),
  }
}
