import { describe, expect, it } from "vitest"

import { applyFilters } from "../filters"
import { DEFAULT_FILTERS, type AnalyticsRow } from "../types"

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
    sleepTimeWeekday: "12am-1am",
    breakfastPlanChangeFrequency: "rarely",
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
    attentionCheckPassed: true,
    hasArchetypeResult: true,
    primaryArchetype: "routine-keeper",
    secondaryArchetype: "sleep-saver",
    archetypeConfidence: "strong",
    ...overrides,
  }
}

const ROWS: AnalyticsRow[] = [
  makeRow({ id: "a", hostel: "parijat", branch: "A", createdAt: "2026-09-01T08:00:00.000Z" }),
  makeRow({ id: "b", hostel: "obh", branch: "B", createdAt: "2026-09-03T08:00:00.000Z" }),
  makeRow({ id: "c", hostel: "bakul", branch: "C", surveyVersion: 2, createdAt: "2026-09-05T08:00:00.000Z" }),
]

describe("applyFilters", () => {
  it("returns every row when every filter is 'all'", () => {
    expect(applyFilters(ROWS, DEFAULT_FILTERS)).toHaveLength(3)
  })

  it("filters by a single field", () => {
    const result = applyFilters(ROWS, { ...DEFAULT_FILTERS, hostel: "obh" })
    expect(result.map((row) => row.id)).toEqual(["b"])
  })

  it("filters by survey version", () => {
    const result = applyFilters(ROWS, { ...DEFAULT_FILTERS, surveyVersion: 2 })
    expect(result.map((row) => row.id)).toEqual(["c"])
  })

  it("filters by branch", () => {
    const result = applyFilters(ROWS, { ...DEFAULT_FILTERS, branch: "B" })
    expect(result.map((row) => row.id)).toEqual(["b"])
  })

  it("combines multiple filters (AND, not OR)", () => {
    const result = applyFilters(ROWS, {
      ...DEFAULT_FILTERS,
      hostel: "parijat",
      branch: "A",
    })
    expect(result.map((row) => row.id)).toEqual(["a"])

    const noMatch = applyFilters(ROWS, {
      ...DEFAULT_FILTERS,
      hostel: "parijat",
      branch: "C",
    })
    expect(noMatch).toHaveLength(0)
  })

  it("applies an inclusive date range", () => {
    const result = applyFilters(ROWS, {
      ...DEFAULT_FILTERS,
      dateFrom: "2026-09-02",
      dateTo: "2026-09-04",
    })
    expect(result.map((row) => row.id)).toEqual(["b"])
  })

  it("treats dateFrom/dateTo boundaries as inclusive", () => {
    const result = applyFilters(ROWS, {
      ...DEFAULT_FILTERS,
      dateFrom: "2026-09-01",
      dateTo: "2026-09-01",
    })
    expect(result.map((row) => row.id)).toEqual(["a"])
  })
})
