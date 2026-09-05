import { describe, expect, it } from "vitest"

import type { AnalyticsRow } from "../../types"
import {
  computeAgreementMatrix,
  computeEarlyCommitmentPairedComparison,
  computeInfluenceMatrix,
  computeOutcomeMatrix,
  computePatternsSummaryCards,
  computeSleepByBranch,
} from "../metrics"

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

describe("computeSleepByBranch — row percentages", () => {
  const rows: AnalyticsRow[] = [
    makeRow({ id: "1", sleepTimeWeekday: "1am-2am", branch: "A" }),
    makeRow({ id: "2", sleepTimeWeekday: "1am-2am", branch: "A" }),
    makeRow({ id: "3", sleepTimeWeekday: "1am-2am", branch: "A" }),
    makeRow({ id: "4", sleepTimeWeekday: "1am-2am", branch: "B" }),
    makeRow({ id: "5", sleepTimeWeekday: "1am-2am", branch: "C" }),
    // Only 2 respondents in this row — below MIN_CELL_N, should suppress.
    makeRow({ id: "6", sleepTimeWeekday: "12am-1am", branch: "C" }),
    makeRow({ id: "7", sleepTimeWeekday: "12am-1am", branch: "C" }),
  ]
  const table = computeSleepByBranch(rows)

  it("each populated row's branch percentages sum to ~100%", () => {
    const row1am = table.rows.find((r) => r.key === "1am-2am")!
    const sum =
      row1am.percentageByBranch.A + row1am.percentageByBranch.B + row1am.percentageByBranch.C
    expect(sum).toBeCloseTo(100, 5)
    expect(row1am.percentageByBranch.A).toBeCloseTo(60, 5)
    expect(row1am.percentageByBranch.B).toBeCloseTo(20, 5)
    expect(row1am.percentageByBranch.C).toBeCloseTo(20, 5)
    expect(row1am.n).toBe(5)
    expect(row1am.flag).toBe("small") // n=5 is >= MIN_CELL_N(5) but < SMALL_SAMPLE_N(20)
  })

  it("flags a thin row as suppressed rather than showing a misleading 100%", () => {
    const row12am = table.rows.find((r) => r.key === "12am-1am")!
    expect(row12am.n).toBe(2)
    expect(row12am.flag).toBe("suppressed")
  })

  it("still lists 'no-consistent-time' as its own row, with n=0 when nobody's in it", () => {
    const noConsistent = table.rows.find((r) => r.key === "no-consistent-time")!
    expect(noConsistent).toBeDefined()
    expect(noConsistent.n).toBe(0)
    expect(noConsistent.flag).toBe("suppressed")
  })

  it("eligibility counts only rows with a derived branch, not the raw filtered total", () => {
    const rowsWithOneIneligible = [...rows, makeRow({ id: "8", branch: null, sleepTimeWeekday: "1am-2am" })]
    const tableWithIneligible = computeSleepByBranch(rowsWithOneIneligible)
    expect(tableWithIneligible.eligibility.totalFiltered).toBe(8)
    expect(tableWithIneligible.eligibility.eligible).toBe(7)
  })
})

describe("computeEarlyCommitmentPairedComparison", () => {
  const rows: AnalyticsRow[] = [
    // gap = often(3) - rarely(1) = +2 -> "less often on early days"
    makeRow({
      id: "1",
      earlyCommitmentBreakfastFrequency: "rarely",
      noEarlyCommitmentBreakfastFrequency: "often",
    }),
    makeRow({
      id: "2",
      earlyCommitmentBreakfastFrequency: "rarely",
      noEarlyCommitmentBreakfastFrequency: "often",
    }),
    // gap = rarely(1) - often(3) = -2 -> "more often on early days"
    makeRow({
      id: "3",
      earlyCommitmentBreakfastFrequency: "often",
      noEarlyCommitmentBreakfastFrequency: "rarely",
    }),
    // gap = 0 -> "no difference"
    makeRow({
      id: "4",
      earlyCommitmentBreakfastFrequency: "sometimes",
      noEarlyCommitmentBreakfastFrequency: "sometimes",
    }),
    // not-applicable -> excluded from the denominator entirely
    makeRow({
      id: "5",
      earlyCommitmentBreakfastFrequency: "not-applicable",
      noEarlyCommitmentBreakfastFrequency: "often",
    }),
  ]
  const result = computeEarlyCommitmentPairedComparison(rows)

  it("excludes not-applicable/never-answered rows from the eligible denominator", () => {
    expect(result.eligibility.totalFiltered).toBe(5)
    expect(result.eligibility.answered).toBe(4)
    expect(result.eligibility.missing).toBe(1)
  })

  it("computes the three-way percentage split correctly over the eligible n", () => {
    expect(result.lowerOnFirstPercentage).toBeCloseTo(50, 5) // 2 of 4
    expect(result.higherOnFirstPercentage).toBeCloseTo(25, 5) // 1 of 4
    expect(result.samePercentage).toBeCloseTo(25, 5) // 1 of 4
  })

  it("computes the median gap over eligible rows only", () => {
    // gaps: +2, +2, -2, 0 -> sorted: -2, 0, 2, 2 -> median = (0+2)/2 = 1
    expect(result.medianGap).toBe(1)
  })
})

describe("computePatternsSummaryCards", () => {
  it("returns null percentages (not 0) when there's no eligible data at all", () => {
    const cards = computePatternsSummaryCards([])
    expect(cards.earlyCommitmentGap.percentage).toBeNull()
    expect(cards.lateSleepGap.percentage).toBeNull()
    expect(cards.weekendShift.percentage).toBeNull()
    expect(cards.semesterChange.percentage).toBeNull()
  })

  it("computes the weekend-shift card from weekendBreakfastComparison", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", weekendBreakfastComparison: "more-often" }),
      makeRow({ id: "2", weekendBreakfastComparison: "more-often" }),
      makeRow({ id: "3", weekendBreakfastComparison: "about-the-same" }),
      makeRow({ id: "4", weekendBreakfastComparison: "less-often" }),
      // Not asked / no answer — must not count in the denominator.
      makeRow({ id: "5", weekendBreakfastComparison: null }),
    ]
    const cards = computePatternsSummaryCards(rows)
    expect(cards.weekendShift.n).toBe(4)
    expect(cards.weekendShift.percentage).toBeCloseTo(50, 5) // 2 of 4
  })

  it("computes the semester-change card, counting only the three 'changed' answers", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", semesterBreakfastChange: "more-often-now" }),
      makeRow({ id: "2", semesterBreakfastChange: "less-often-now" }),
      makeRow({ id: "3", semesterBreakfastChange: "changed-back-and-forth" }),
      makeRow({ id: "4", semesterBreakfastChange: "about-the-same" }),
      makeRow({ id: "5", semesterBreakfastChange: "not-sure" }),
    ]
    const cards = computePatternsSummaryCards(rows)
    expect(cards.semesterChange.n).toBe(5)
    expect(cards.semesterChange.percentage).toBeCloseTo(60, 5) // 3 of 5
  })

  it("computes the late-sleep gap using LATE_SLEEP_COHORTS, excluding the middle categories", () => {
    const rows: AnalyticsRow[] = [
      // Early cohort (before-11pm/11pm-12am): 3 of 4 are branch A -> 75%
      makeRow({ id: "1", sleepTimeWeekday: "before-11pm", branch: "A" }),
      makeRow({ id: "2", sleepTimeWeekday: "before-11pm", branch: "A" }),
      makeRow({ id: "3", sleepTimeWeekday: "11pm-12am", branch: "A" }),
      makeRow({ id: "4", sleepTimeWeekday: "11pm-12am", branch: "B" }),
      // Late cohort (2am-3am/after-3am): 1 of 4 is branch A -> 25%
      makeRow({ id: "5", sleepTimeWeekday: "2am-3am", branch: "B" }),
      makeRow({ id: "6", sleepTimeWeekday: "2am-3am", branch: "C" }),
      makeRow({ id: "7", sleepTimeWeekday: "after-3am", branch: "C" }),
      makeRow({ id: "8", sleepTimeWeekday: "after-3am", branch: "A" }),
      // Middle categories must NOT be pulled into either cohort.
      makeRow({ id: "9", sleepTimeWeekday: "12am-1am", branch: "A" }),
      makeRow({ id: "10", sleepTimeWeekday: "1am-2am", branch: "A" }),
    ]
    const cards = computePatternsSummaryCards(rows)
    expect(cards.lateSleepGap.percentage).toBeCloseTo(50, 5) // 75% - 25%
    expect(cards.lateSleepGap.n).toBe(8) // 4 early + 4 late, middle excluded
  })
})

describe("computeInfluenceMatrix — structural-influence × behaviour", () => {
  const rows: AnalyticsRow[] = [
    // Branch A: a-lot(3), very-strongly(4), moderately(2) -> mean=3, median=3
    makeRow({
      id: "1",
      branch: "A",
      influenceRatings: { sleepAmountInfluence: "a-lot" },
    }),
    makeRow({
      id: "2",
      branch: "A",
      influenceRatings: { sleepAmountInfluence: "very-strongly" },
    }),
    makeRow({
      id: "3",
      branch: "A",
      influenceRatings: { sleepAmountInfluence: "moderately" },
    }),
    // Branch B: slightly(1), not-at-all(0) -> mean=0.5, median=0.5
    makeRow({
      id: "4",
      branch: "B",
      influenceRatings: { sleepAmountInfluence: "slightly" },
    }),
    makeRow({
      id: "5",
      branch: "B",
      influenceRatings: { sleepAmountInfluence: "not-at-all" },
    }),
    // Branch C: nobody answered this row -> suppressed, not just "no data"
    makeRow({ id: "6", branch: "C", influenceRatings: {} }),
  ]
  const matrix = computeInfluenceMatrix(rows)
  const sleepRow = matrix.rows.find((r) => r.key === "sleepAmountInfluence")!

  it("excludes the attention-check row from the matrix entirely", () => {
    expect(matrix.rows.some((r) => r.key === "attentionCheckInfluence")).toBe(false)
  })

  it("computes mean/median/top-box per branch from the 0-4 influence scale", () => {
    expect(sleepRow.meanByBranch.A).toBeCloseTo(3, 5)
    expect(sleepRow.medianByBranch.A).toBe(3)
    expect(sleepRow.topBoxPercentageByBranch.A).toBeCloseTo(66.7, 1) // a-lot & very-strongly

    expect(sleepRow.meanByBranch.B).toBeCloseTo(0.5, 5)
    expect(sleepRow.medianByBranch.B).toBe(0.5)
    expect(sleepRow.topBoxPercentageByBranch.B).toBe(0)
  })

  it("flags a branch with zero answers as suppressed rather than zero", () => {
    expect(sleepRow.nByBranch.C).toBe(0)
    expect(sleepRow.meanByBranch.C).toBeNull()
    expect(sleepRow.flagByBranch.C).toBe("suppressed")
  })

  it("reports the largest gap only across branches with a usable mean", () => {
    expect(sleepRow.largestGap).toBeCloseTo(2.5, 5) // 3 (A) - 0.5 (B), C excluded
  })

  it("eligibility counts rows with a branch, answered counts rows with at least one item answered", () => {
    expect(matrix.eligibility.totalFiltered).toBe(6)
    expect(matrix.eligibility.eligible).toBe(6)
    expect(matrix.eligibility.answered).toBe(5) // row 6 answered nothing
  })
})

describe("computeAgreementMatrix — mental-model × behaviour", () => {
  const rows: AnalyticsRow[] = [
    makeRow({
      id: "1",
      branch: "A",
      agreementRatings: { sleepOverBreakfastAgreement: "strongly-agree" },
    }),
    makeRow({
      id: "2",
      branch: "A",
      agreementRatings: { sleepOverBreakfastAgreement: "agree" },
    }),
    makeRow({
      id: "3",
      branch: "C",
      agreementRatings: { sleepOverBreakfastAgreement: "strongly-disagree" },
    }),
  ]
  const matrix = computeAgreementMatrix(rows)
  const row = matrix.rows.find((r) => r.key === "sleepOverBreakfastAgreement")!

  it("scores agreement on the same 0-4 scale as influence", () => {
    expect(row.meanByBranch.A).toBeCloseTo(3.5, 5) // strongly-agree(4) + agree(3) / 2
    expect(row.topBoxPercentageByBranch.A).toBe(100)
    expect(row.meanByBranch.C).toBeCloseTo(0, 5)
    expect(row.topBoxPercentageByBranch.C).toBe(0)
  })

  it("flags branch B as suppressed since nobody in it answered", () => {
    expect(row.nByBranch.B).toBe(0)
    expect(row.flagByBranch.B).toBe("suppressed")
    expect(row.meanByBranch.B).toBeNull()
  })
})

describe("computeOutcomeMatrix — reported energy/concentration/hunger", () => {
  const rows: AnalyticsRow[] = [
    makeRow({
      id: "1",
      branch: "A",
      comparisonRatings: { comparisonEnergyLevel: "much-higher" },
    }),
    makeRow({
      id: "2",
      branch: "A",
      comparisonRatings: { comparisonEnergyLevel: "slightly-higher" },
    }),
    makeRow({
      id: "3",
      branch: "C",
      comparisonRatings: { comparisonEnergyLevel: "much-lower" },
    }),
    // "Can't really compare" excluded from the score, not a substitute 0.
    makeRow({
      id: "4",
      branch: "A",
      comparisonRatings: { comparisonEnergyLevel: "cant-compare" },
    }),
  ]
  const matrix = computeOutcomeMatrix(rows)
  const row = matrix.rows.find((r) => r.key === "comparisonEnergyLevel")!

  it("scores on the -2..+2 comparison scale, excluding 'cant-compare'", () => {
    expect(row.nByBranch.A).toBe(2) // the cant-compare row is excluded
    expect(row.meanByBranch.A).toBeCloseTo(1.5, 5) // (2 + 1) / 2
    expect(row.meanByBranch.C).toBeCloseTo(-2, 5)
  })

  it("uses a top-box threshold of >=1 (slightly/much higher) on this scale", () => {
    expect(row.topBoxPercentageByBranch.A).toBe(100)
    expect(row.topBoxPercentageByBranch.C).toBe(0)
  })
})
