import { describe, expect, it } from "vitest"

import type { AnalyticsRow } from "../../types"
import { computeBranchDeepDive } from "../branch-deep-dive"

function makeRow(overrides: Partial<AnalyticsRow> & { id: string }): AnalyticsRow {
  return {
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
    nonBreakfastMealSource: [],
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

describe("computeBranchDeepDive — Branch A", () => {
  const rows: AnalyticsRow[] = [
    makeRow({ id: "1", branch: "A", earlyClassRoutineChange: "yes", earlyClassRoutineChangeActions: ["wake-up-earlier"] }),
    makeRow({ id: "2", branch: "A", earlyClassRoutineChange: "no", earlyClassRoutineChangeActions: [] }),
    makeRow({ id: "3", branch: "B" }),
    makeRow({ id: "4", branch: "C" }),
  ]
  const deepDive = computeBranchDeepDive(rows, "A")

  it("only includes rows from the requested branch in each field's denominator", () => {
    const messBreakfastTime = deepDive.fields.find((f) => f.key === "messBreakfastTime")!
    expect(messBreakfastTime.eligibility.totalFiltered).toBe(2)
    expect(messBreakfastTime.eligibility.eligible).toBe(2)
  })

  it("applies the secondary gate: routine-change actions only eligible for yes/sometimes", () => {
    const actions = deepDive.fields.find((f) => f.key === "earlyClassRoutineChangeActions")!
    expect(actions.eligibility.eligible).toBe(1) // only row 1 said "yes"
    expect(actions.eligibility.answered).toBe(1)
  })

  it("counts row 2 (said 'no') as ineligible for the gated follow-up, not as a missing answer", () => {
    const actions = deepDive.fields.find((f) => f.key === "earlyClassRoutineChangeActions")!
    expect(actions.eligibility.totalFiltered).toBe(2)
    expect(actions.eligibility.eligible).toBe(1)
  })
})

describe("computeBranchDeepDive — Branch A missed-breakfast gate", () => {
  it("only asks 'why missed' to those who said something other than 'never'", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", branch: "A", missedBreakfastFrequency: "often", missedBreakfastReasons: ["not-hungry"] }),
      makeRow({ id: "2", branch: "A", missedBreakfastFrequency: "never", missedBreakfastReasons: [] }),
      makeRow({ id: "3", branch: "A", missedBreakfastFrequency: null, missedBreakfastReasons: [] }),
    ]
    const deepDive = computeBranchDeepDive(rows, "A")
    const reasons = deepDive.fields.find((f) => f.key === "missedBreakfastReasons")!
    expect(reasons.eligibility.eligible).toBe(1)
    expect(reasons.eligibility.answered).toBe(1)
  })
})

describe("computeBranchDeepDive — Branch B", () => {
  it("gates plan-change reasons on either mismatch frequency being non-null and non-never", () => {
    const rows: AnalyticsRow[] = [
      makeRow({
        id: "1",
        branch: "B",
        breakfastPlannedButSkippedFrequency: "rarely",
        breakfastUnplannedButWentFrequency: "never",
        breakfastPlanChangeReasons: ["menu"],
      }),
      makeRow({
        id: "2",
        branch: "B",
        breakfastPlannedButSkippedFrequency: "never",
        breakfastUnplannedButWentFrequency: "never",
        breakfastPlanChangeReasons: [],
      }),
    ]
    const deepDive = computeBranchDeepDive(rows, "B")
    const reasons = deepDive.fields.find((f) => f.key === "breakfastPlanChangeReasons")!
    expect(reasons.eligibility.eligible).toBe(1)
  })
})

describe("computeBranchDeepDive — Branch C", () => {
  it("gates occasional-breakfast differentiators on frequency being non-null and non-never", () => {
    const rows: AnalyticsRow[] = [
      makeRow({
        id: "1",
        branch: "C",
        occasionalBreakfastFrequency: "yes-sometimes",
        occasionalBreakfastDifferentiators: ["more-time"],
      }),
      makeRow({ id: "2", branch: "C", occasionalBreakfastFrequency: "never", occasionalBreakfastDifferentiators: [] }),
    ]
    const deepDive = computeBranchDeepDive(rows, "C")
    const differentiators = deepDive.fields.find((f) => f.key === "occasionalBreakfastDifferentiators")!
    expect(differentiators.eligibility.eligible).toBe(1)
    expect(differentiators.eligibility.answered).toBe(1)
  })

  it("returns an empty-but-defined field list shape when nobody is in the branch", () => {
    const deepDive = computeBranchDeepDive([], "C")
    expect(deepDive.fields.length).toBeGreaterThan(0)
    for (const field of deepDive.fields) {
      expect(field.eligibility.totalFiltered).toBe(0)
    }
  })
})
