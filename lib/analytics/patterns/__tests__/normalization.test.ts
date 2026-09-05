import { describe, expect, it } from "vitest"

import type { AnalyticsRow } from "../../types"
import {
  breakfastFrequencyScore,
  earlyCommitmentFrequencyScore,
  earlyCommitmentPairedGap,
  hasValidPairedEarlyCommitmentFrequency,
  LATE_SLEEP_COHORTS,
  noEarlyCommitmentFrequencyScore,
  sleepScore,
  wakeScore,
} from "../normalization"

function makeRow(overrides: Partial<AnalyticsRow> = {}): AnalyticsRow {
  return {
    id: "r1",
    surveyVersion: 1,
    createdAt: "2026-09-01T08:00:00.000Z",
    startedAt: "2026-09-01T07:50:00.000Z",
    durationSeconds: 600,
    durationMinutes: 10,
    year: "2",
    hostel: "parijat",
    earlyCommitmentDays: "3",
    program: null,
    gender: null,
    sleepTimeWeekend: null,
    wakeTimeWeekend: null,
    beforeSleepActivities: [],
    beforeSleepMostTime: null,
    morningActivities: [],
    messDecision: null,
    messFoodQuality: null,
    messBreakfastTime: null,
    breakfastMoment: null,
    breakfastRoutineDuration: null,
    earlyClassRoutineChange: null,
    earlyClassRoutineChangeActions: [],
    unwantedMessActions: [],
    messConsistency: null,
    messChangeDeterminants: [],
    breakfastRoutineDescription: null,
    breakfastMotivationFactors: [],
    conditionalMessBreakfastTime: null,
    breakfastDecisionPoint: null,
    breakfastDayDifferentiators: [],
    breakfastAbsenceReason: null,
    breakfastAbsenceDecisionPoint: null,
    occasionalBreakfastFrequency: null,
    occasionalBreakfastDifferentiators: [],
    breakfastFrequencyChanged: null,
    weekendDifferentiators: [],
    previousNightAffectsBreakfast: null,
    previousNightFactors: [],
    influenceRatings: {},
    biggestInfluenceFactor: null,
    agreementRatings: {},
    mealValuePerception: null,
    breakfastImprovementOptions: [],
    semesterBreakfastChangeDescription: null,
    breakfastFrequencyChangeDescription: null,
    breakfastSystemChangeSuggestion: null,
    breakfastFrequency: "most-days",
    branch: "A",
    wakeTimeWeekday: null,
    earlyCommitmentBreakfastFrequency: null,
    noEarlyCommitmentBreakfastFrequency: null,
    weekendBreakfastComparison: null,
    semesterBreakfastChange: null,
    sleepTimeWeekday: null,
    breakfastPlanChangeFrequency: null,
    breakfastPlanChangeActions: [],
    missedBreakfastFrequency: null,
    missedBreakfastReasons: [],
    breakfastPlannedButSkippedFrequency: null,
    breakfastUnplannedButWentFrequency: null,
    breakfastPlanChangeReasons: [],
    breakfastServedTimeActivity: null,
    unusedAllottedMealActions: [],
    nonBreakfastMealSource: null,
    nextFoodTime: null,
    nonBreakfastSpendingFrequency: null,
    nonBreakfastSpendingAmount: null,
    comparisonRatings: {},
    attentionCheckPassed: null,
    hasArchetypeResult: false,
    primaryArchetype: null,
    secondaryArchetype: null,
    archetypeConfidence: null,
    ...overrides,
  }
}

describe("breakfastFrequencyScore", () => {
  it.each([
    ["almost-every-day", 4],
    ["most-days", 3],
    ["some-days", 2],
    ["rarely", 1],
    ["never", 0],
  ] as const)("%s -> %d", (value, expected) => {
    expect(breakfastFrequencyScore(makeRow({ breakfastFrequency: value }))).toBe(expected)
  })

  it("returns null when the field was never answered", () => {
    expect(breakfastFrequencyScore(makeRow({ breakfastFrequency: null }))).toBeNull()
  })
})

describe("sleepScore — weekday sleep ordinal", () => {
  it.each([
    ["before-11pm", 0],
    ["11pm-12am", 1],
    ["12am-1am", 2],
    ["1am-2am", 3],
    ["2am-3am", 4],
    ["after-3am", 5],
  ] as const)("%s -> %d", (value, expected) => {
    expect(sleepScore(makeRow({ sleepTimeWeekday: value }))).toBe(expected)
  })

  it("'no-consistent-time' has no ordinal position (null, not a score)", () => {
    expect(sleepScore(makeRow({ sleepTimeWeekday: "no-consistent-time" }))).toBeNull()
  })

  it("null (never asked / not answered) is also null, not a score", () => {
    expect(sleepScore(makeRow({ sleepTimeWeekday: null }))).toBeNull()
  })
})

describe("wakeScore — weekday wake ordinal", () => {
  it.each([
    ["before-630am", 0],
    ["630-700am", 1],
    ["700-730am", 2],
    ["730-800am", 3],
    ["800-830am", 4],
    ["830-900am", 5],
    ["900-1000am", 6],
    ["after-1000am", 7],
  ] as const)("%s -> %d", (value, expected) => {
    expect(wakeScore(makeRow({ wakeTimeWeekday: value }))).toBe(expected)
  })

  it("'no-consistent-time' is preserved categorically but excluded ordinally", () => {
    expect(wakeScore(makeRow({ wakeTimeWeekday: "no-consistent-time" }))).toBeNull()
  })
})

describe("early/non-early commitment frequency scores", () => {
  it.each([
    ["almost-always", 4],
    ["often", 3],
    ["sometimes", 2],
    ["rarely", 1],
    ["never", 0],
  ] as const)("earlyCommitmentBreakfastFrequency %s -> %d", (value, expected) => {
    expect(
      earlyCommitmentFrequencyScore(makeRow({ earlyCommitmentBreakfastFrequency: value }))
    ).toBe(expected)
  })

  it("'not-applicable' becomes null, never a substitute zero", () => {
    expect(
      earlyCommitmentFrequencyScore(
        makeRow({ earlyCommitmentBreakfastFrequency: "not-applicable" })
      )
    ).toBeNull()
  })

  it("a branch-unasked / never-answered field is null, not zero", () => {
    // Simulates a field the respondent was never shown a question for —
    // the parser already turns an absent/empty JSONB value into null
    // (see parse.ts's readString), so this is what that looks like here.
    const row = makeRow({ noEarlyCommitmentBreakfastFrequency: null })
    expect(noEarlyCommitmentFrequencyScore(row)).toBeNull()
    expect(noEarlyCommitmentFrequencyScore(row)).not.toBe(0)
  })
})

describe("hasValidPairedEarlyCommitmentFrequency", () => {
  it("true only when both sides resolve to a real score", () => {
    expect(
      hasValidPairedEarlyCommitmentFrequency(
        makeRow({
          earlyCommitmentBreakfastFrequency: "sometimes",
          noEarlyCommitmentBreakfastFrequency: "often",
        })
      )
    ).toBe(true)
  })

  it("false when the early side is 'not-applicable'", () => {
    expect(
      hasValidPairedEarlyCommitmentFrequency(
        makeRow({
          earlyCommitmentBreakfastFrequency: "not-applicable",
          noEarlyCommitmentBreakfastFrequency: "often",
        })
      )
    ).toBe(false)
  })

  it("false when either side was never answered", () => {
    expect(
      hasValidPairedEarlyCommitmentFrequency(
        makeRow({
          earlyCommitmentBreakfastFrequency: "sometimes",
          noEarlyCommitmentBreakfastFrequency: null,
        })
      )
    ).toBe(false)
  })
})

describe("earlyCommitmentPairedGap", () => {
  it("positive when breakfast is less frequent on early-commitment days", () => {
    // early = "rarely" (1), non-early = "often" (3) -> gap = 3 - 1 = +2
    const gap = earlyCommitmentPairedGap(
      makeRow({
        earlyCommitmentBreakfastFrequency: "rarely",
        noEarlyCommitmentBreakfastFrequency: "often",
      })
    )
    expect(gap).toBe(2)
  })

  it("negative when breakfast is more frequent on early-commitment days", () => {
    const gap = earlyCommitmentPairedGap(
      makeRow({
        earlyCommitmentBreakfastFrequency: "often",
        noEarlyCommitmentBreakfastFrequency: "rarely",
      })
    )
    expect(gap).toBe(-2)
  })

  it("zero when there's no difference", () => {
    const gap = earlyCommitmentPairedGap(
      makeRow({
        earlyCommitmentBreakfastFrequency: "sometimes",
        noEarlyCommitmentBreakfastFrequency: "sometimes",
      })
    )
    expect(gap).toBe(0)
  })

  it("null when not eligible", () => {
    expect(
      earlyCommitmentPairedGap(
        makeRow({
          earlyCommitmentBreakfastFrequency: "not-applicable",
          noEarlyCommitmentBreakfastFrequency: "often",
        })
      )
    ).toBeNull()
  })
})

describe("LATE_SLEEP_COHORTS — centralized, documented cohort definition", () => {
  it("is an explicit, named constant rather than inline literals in a metric", () => {
    expect(LATE_SLEEP_COHORTS.early).toEqual(["before-11pm", "11pm-12am"])
    expect(LATE_SLEEP_COHORTS.late).toEqual(["2am-3am", "after-3am"])
  })

  it("the two cohorts never overlap and exclude the middle categories", () => {
    const overlap = LATE_SLEEP_COHORTS.early.filter((v) =>
      LATE_SLEEP_COHORTS.late.includes(v)
    )
    expect(overlap).toEqual([])
    expect(LATE_SLEEP_COHORTS.early).not.toContain("12am-1am")
    expect(LATE_SLEEP_COHORTS.late).not.toContain("12am-1am")
  })
})
