import { describe, expect, it } from "vitest"

import type { AnalyticsRow } from "../../types"
import { computeMentalModelsMetrics } from "../../mental-models/metrics"
import { computePatternsMetrics } from "../../patterns/metrics"
import { computeStructuresMetrics } from "../../structures/metrics"
import { computeActivity5Metrics } from "../metrics"

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

function rowsOfSize(n: number, factory: (i: number) => Partial<AnalyticsRow>): AnalyticsRow[] {
  return Array.from({ length: n }, (_, i) => makeRow({ id: `r${i}`, ...factory(i) }))
}

describe("computeActivity5Metrics — timeline structure", () => {
  it("has exactly the 7 documented stages, in day-sequence order", () => {
    const metrics = computeActivity5Metrics([])
    expect(metrics.timeline.map((stage) => stage.key)).toEqual([
      "previous-night",
      "morning-routine",
      "breakfast-window",
      "early-classes",
      "later-morning",
      "rest-of-day",
      "following-night",
    ])
  })

  it("leaves 'following night' with no evidence and an honest note, never an invented finding", () => {
    const rows = rowsOfSize(30, () => ({}))
    const metrics = computeActivity5Metrics(rows)
    const followingNight = metrics.timeline.find((s) => s.key === "following-night")!
    expect(followingNight.evidence).toEqual([])
    expect(followingNight.noEvidenceNote).toBeTruthy()
  })

  it("every other stage has at least one piece of evidence", () => {
    const rows = rowsOfSize(30, () => ({}))
    const metrics = computeActivity5Metrics(rows)
    for (const stage of metrics.timeline) {
      if (stage.key === "following-night") continue
      expect(stage.evidence.length).toBeGreaterThan(0)
    }
  })
})

describe("computeActivity5Metrics — genuine reuse, not reinvented numbers", () => {
  it("early-commitment gap matches computePatternsMetrics exactly", () => {
    const rows = rowsOfSize(30, (i) => ({
      earlyCommitmentBreakfastFrequency: i % 2 === 0 ? "rarely" : "often",
      noEarlyCommitmentBreakfastFrequency: i % 2 === 0 ? "often" : "rarely",
    }))
    const patterns = computePatternsMetrics(rows)
    const activity5 = computeActivity5Metrics(rows)
    const earlyClasses = activity5.timeline.find((s) => s.key === "early-classes")!
    const gapEvidence = earlyClasses.evidence.find((e) => e.key === "early-classes-commitment-gap")!
    expect(gapEvidence.percentage).toBe(patterns.summaryCards.earlyCommitmentGap.percentage)
    expect(gapEvidence.n).toBe(patterns.summaryCards.earlyCommitmentGap.n)
    expect(gapEvidence.flag).toBe(patterns.summaryCards.earlyCommitmentGap.flag)
  })

  it("top structural constraint matches computeStructuresMetrics exactly", () => {
    const rows = rowsOfSize(30, () => ({
      influenceRatings: { firstCommitmentTimeInfluence: "very-strongly" },
    }))
    const structures = computeStructuresMetrics(rows)
    const activity5 = computeActivity5Metrics(rows)
    const earlyClasses = activity5.timeline.find((s) => s.key === "early-classes")!
    const constraintEvidence = earlyClasses.evidence.find((e) => e.key === "early-classes-top-constraint")!
    expect(constraintEvidence.percentage).toBe(structures.snapshot.topStructuralConstraint.percentage)
    expect(constraintEvidence.n).toBe(structures.snapshot.topStructuralConstraint.n)
  })

  it("dominant belief in recurring patterns matches computeMentalModelsMetrics exactly", () => {
    const rows = rowsOfSize(30, () => ({
      agreementRatings: { sleepOverBreakfastAgreement: "strongly-agree" },
    }))
    const mentalModels = computeMentalModelsMetrics(rows)
    const activity5 = computeActivity5Metrics(rows)
    const dominantBeliefEvidence = activity5.recurringPatterns.find(
      (e) => e.key === "recurring-dominant-belief"
    )!
    expect(dominantBeliefEvidence.percentage).toBe(mentalModels.snapshot.dominantBelief.percentage)
  })
})

describe("computeActivity5Metrics — suppression is never bypassed", () => {
  it("suppresses a timeline finding's percentage below MIN_CELL_N, same as its source page", () => {
    const rows = rowsOfSize(2, () => ({ breakfastFrequency: "some-days" }))
    const activity5 = computeActivity5Metrics(rows)
    const breakfastWindow = activity5.timeline.find((s) => s.key === "breakfast-window")!
    const frequencyEvidence = breakfastWindow.evidence.find((e) => e.key === "breakfast-window-frequency")!
    expect(frequencyEvidence.flag).toBe("suppressed")
    expect(frequencyEvidence.percentage).toBeNull()
  })

  it("rest-of-day evidence never renders an average position as a percentage", () => {
    const rows = rowsOfSize(30, () => ({
      comparisonRatings: { comparisonEnergyLevel: "slightly-higher" },
    }))
    const activity5 = computeActivity5Metrics(rows)
    const restOfDay = activity5.timeline.find((s) => s.key === "rest-of-day")!
    for (const item of restOfDay.evidence) {
      expect(item.percentage).toBeNull()
    }
  })
})

describe("computeActivity5Metrics — feedback observations are honestly framed", () => {
  it("every observation states what's available, what's being investigated, and what's blocked", () => {
    const rows = rowsOfSize(30, () => ({}))
    const activity5 = computeActivity5Metrics(rows)
    expect(activity5.feedbackObservations.length).toBeGreaterThan(0)
    for (const observation of activity5.feedbackObservations) {
      expect(observation.available.length).toBeGreaterThan(0)
      expect(observation.investigating.length).toBeGreaterThan(0)
      expect(observation.blocked.length).toBeGreaterThan(0)
      expect(observation.supportingEvidence.length).toBeGreaterThan(0)
    }
  })

  it("mentions mess or administration data as the explicit blocker, never claims a confirmed loop", () => {
    const rows = rowsOfSize(30, () => ({}))
    const activity5 = computeActivity5Metrics(rows)
    for (const observation of activity5.feedbackObservations) {
      expect(observation.blocked.toLowerCase()).toMatch(/mess|administration/)
    }
  })
})

describe("computeActivity5Metrics — significant change reuses Patterns' semester-change card", () => {
  it("matches computePatternsMetrics.summaryCards.semesterChange exactly", () => {
    const rows = rowsOfSize(30, (i) => ({
      semesterBreakfastChange: i % 2 === 0 ? "more-often-now" : "about-the-same",
    }))
    const patterns = computePatternsMetrics(rows)
    const activity5 = computeActivity5Metrics(rows)
    expect(activity5.significantChange.percentage).toBe(patterns.summaryCards.semesterChange.percentage)
    expect(activity5.significantChange.n).toBe(patterns.summaryCards.semesterChange.n)
  })
})
