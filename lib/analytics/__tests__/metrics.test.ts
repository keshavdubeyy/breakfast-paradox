import { describe, expect, it } from "vitest"

import { average, computeOverviewMetrics, median } from "../metrics"
import type { AnalyticsRow } from "../types"

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
    nonBreakfastMealSource: null,
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

describe("median", () => {
  it("returns null for an empty array", () => {
    expect(median([])).toBeNull()
  })
  it("returns the middle value for an odd-length array", () => {
    expect(median([3, 1, 2])).toBe(2)
  })
  it("averages the two middle values for an even-length array", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5)
  })
})

describe("average", () => {
  it("returns null for an empty array", () => {
    expect(average([])).toBeNull()
  })
  it("averages the values", () => {
    expect(average([2, 4, 6])).toBe(4)
  })
})

// One crafted 5-row sample exercising every section of the metrics at
// once — durations are chosen to land exactly on histogram bucket
// boundaries (5, 15, 20 minutes), since that's the easiest place for an
// off-by-one to hide.
const ROWS: AnalyticsRow[] = [
  makeRow({
    id: "r1",
    branch: "A",
    hostel: "bakul",
    year: "1",
    earlyCommitmentDays: "4",
    breakfastFrequency: "almost-every-day",
    durationSeconds: 300, // exactly 5.0 min
    hasArchetypeResult: true,
    primaryArchetype: "routine-keeper",
    archetypeConfidence: "strong",
    attentionCheckPassed: true,
  }),
  makeRow({
    id: "r2",
    branch: "A",
    hostel: "parijat",
    year: "2",
    earlyCommitmentDays: "3",
    breakfastFrequency: "most-days",
    durationSeconds: 100, // short completion
    hasArchetypeResult: true,
    primaryArchetype: "routine-keeper",
    archetypeConfidence: "mixed",
    attentionCheckPassed: false,
  }),
  makeRow({
    id: "r3",
    branch: "B",
    hostel: "obh",
    year: "2",
    earlyCommitmentDays: "1",
    breakfastFrequency: "some-days",
    durationSeconds: 900, // exactly 15.0 min
    hasArchetypeResult: false,
    primaryArchetype: null,
    secondaryArchetype: null,
    archetypeConfidence: null,
    attentionCheckPassed: null,
  }),
  makeRow({
    id: "r4",
    branch: "C",
    hostel: "bakul",
    year: "3",
    earlyCommitmentDays: "5+",
    breakfastFrequency: "rarely",
    durationSeconds: 1200, // exactly 20.0 min
    hasArchetypeResult: true,
    primaryArchetype: "sleep-saver",
    archetypeConfidence: "strong",
    attentionCheckPassed: true,
  }),
  makeRow({
    id: "r5",
    branch: "C",
    hostel: "obh",
    year: null,
    earlyCommitmentDays: null,
    breakfastFrequency: "never",
    durationSeconds: 50, // short completion
    hasArchetypeResult: true,
    primaryArchetype: "sleep-saver",
    archetypeConfidence: "mixed",
    attentionCheckPassed: true,
  }),
]

describe("computeOverviewMetrics", () => {
  const metrics = computeOverviewMetrics(ROWS)

  it("counts completed responses and duration stats", () => {
    expect(metrics.completedResponses).toBe(5)
    expect(metrics.medianDurationSeconds).toBe(300)
    expect(metrics.averageDurationSeconds).toBe(510)
  })

  it("computes archetype coverage from hasArchetypeResult", () => {
    expect(metrics.archetypeCoverage).toEqual({
      withResult: 4,
      total: 5,
      percentage: 80,
    })
  })

  it("counts branches", () => {
    expect(metrics.branchCounts).toEqual({ A: 2, B: 1, C: 2 })
  })

  it("puts a null field into a trailing 'Not set' bucket, not into an existing option", () => {
    const yearUnknown = metrics.yearDistribution.find(
      (bucket) => bucket.label === "Not set"
    )
    expect(yearUnknown).toEqual({
      value: "__unknown__",
      label: "Not set",
      count: 1,
      percentage: 20,
    })
  })

  it("computes confidence distribution only over rows with a result", () => {
    // 4 rows have a result: 2 strong, 2 mixed — percentages are of 4, not 5.
    expect(metrics.confidenceDistribution).toEqual([
      { value: "strong", label: "Strong", count: 2, percentage: 50 },
      { value: "mixed", label: "Mixed", count: 2, percentage: 50 },
    ])
  })

  it("buckets duration exactly on a boundary into the upper bucket (inclusive-min, exclusive-max)", () => {
    const byLabel = Object.fromEntries(
      metrics.durationHistogram.map((bucket) => [bucket.label, bucket.count])
    )
    expect(byLabel["<5 min"]).toBe(2) // r2 (1.67min), r5 (0.83min)
    expect(byLabel["5–8 min"]).toBe(1) // r1, exactly 5.0min
    expect(byLabel["8–12 min"]).toBe(0)
    expect(byLabel["12–15 min"]).toBe(0)
    expect(byLabel["15–20 min"]).toBe(1) // r3, exactly 15.0min
    expect(byLabel["20+ min"]).toBe(1) // r4, exactly 20.0min
  })

  it("computes data-quality indicators", () => {
    expect(metrics.dataQuality).toEqual({
      attentionCheckPassRate: 75, // 3 of 4 known (r3 excluded, unknown)
      attentionCheckKnownCount: 4,
      missingArchetypeCount: 1, // r3
      shortCompletionCount: 2, // r2, r5
    })
  })

  it("computes snapshot facts, breaking archetype ties by option order", () => {
    expect(metrics.snapshot.regularEaterPercentage).toBe(40) // branch A: 2/5
    expect(metrics.snapshot.threeOrMoreEarlyCommitmentsPercentage).toBe(60) // r1, r2, r4
    // routine-keeper and sleep-saver are tied at 2 each — routine-keeper
    // comes first in ARCHETYPE_IDS, so it wins the tie.
    expect(metrics.snapshot.mostCommonPrimaryArchetype).toEqual({
      id: "routine-keeper",
      name: "The Routine Keeper",
      count: 2,
    })
  })
})

describe("computeOverviewMetrics — rounding", () => {
  it("rounds a non-terminating percentage to one decimal place", () => {
    const rows = [
      makeRow({ id: "a", hostel: "bakul" }),
      makeRow({ id: "b", hostel: "parijat" }),
      makeRow({ id: "c", hostel: "parijat" }),
    ]
    const metrics = computeOverviewMetrics(rows)
    const bakul = metrics.hostelDistribution.find((b) => b.value === "bakul")
    expect(bakul?.percentage).toBeCloseTo(33.3, 1)
  })
})

describe("computeOverviewMetrics — empty input", () => {
  it("returns nulls/zeros instead of dividing by zero", () => {
    const metrics = computeOverviewMetrics([])
    expect(metrics.completedResponses).toBe(0)
    expect(metrics.medianDurationSeconds).toBeNull()
    expect(metrics.averageDurationSeconds).toBeNull()
    expect(metrics.archetypeCoverage.percentage).toBeNull()
    expect(metrics.snapshot.regularEaterPercentage).toBeNull()
    expect(metrics.snapshot.mostCommonPrimaryArchetype).toBeNull()
  })
})
