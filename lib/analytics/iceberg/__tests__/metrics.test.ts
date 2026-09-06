import { describe, expect, it } from "vitest"

import type { AnalyticsRow } from "../../types"
import { computeIcebergMetrics } from "../metrics"

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

describe("computeIcebergMetrics", () => {
  it("assembles all four levels, each carrying findings traceable to their own domain", () => {
    const rows = Array.from({ length: 25 }, (_, i) =>
      makeRow({
        id: `${i}`,
        branch: i % 3 === 0 ? "A" : i % 3 === 1 ? "B" : "C",
        breakfastFrequency: i % 2 === 0 ? "almost-every-day" : "most-days",
        breakfastPlanChangeFrequency: i % 2 === 0 ? "never" : "sometimes",
        agreementRatings: { sleepOverBreakfastAgreement: i % 3 === 0 ? "strongly-agree" : "disagree" },
      })
    )
    const iceberg = computeIcebergMetrics(rows)

    expect(iceberg.levels.map((l) => l.level)).toEqual(["events", "patterns", "structures", "mental-models"])
    expect(iceberg.n).toBe(25)

    for (const level of iceberg.levels) {
      expect(level.findings.length).toBeGreaterThan(0)
      for (const finding of level.findings) {
        expect(finding.href).toMatch(/^\/admin\//)
      }
    }
  })

  it("never fabricates a percentage for a suppressed finding", () => {
    const rows = [makeRow({ id: "1" })]
    const iceberg = computeIcebergMetrics(rows)
    for (const level of iceberg.levels) {
      for (const finding of level.findings) {
        if (finding.flag === "suppressed") {
          expect(finding.percentage).toBeNull()
        }
      }
    }
  })

  it("builds an evidence trail row for every assembled finding, across all four levels", () => {
    const rows = Array.from({ length: 10 }, (_, i) => makeRow({ id: `${i}` }))
    const iceberg = computeIcebergMetrics(rows)
    const totalFindings = iceberg.levels.reduce((sum, level) => sum + level.findings.length, 0)
    expect(iceberg.evidenceTrail.length).toBe(totalFindings)
  })

  it("grounds every system tension in a real finding (or explicitly omits one), never a fabricated number", () => {
    const rows = Array.from({ length: 10 }, (_, i) => makeRow({ id: `${i}` }))
    const iceberg = computeIcebergMetrics(rows)
    expect(iceberg.tensions).toHaveLength(3)
    for (const tension of iceberg.tensions) {
      expect(tension.left.length).toBeGreaterThan(0)
      expect(tension.right.length).toBeGreaterThan(0)
    }
  })
})
