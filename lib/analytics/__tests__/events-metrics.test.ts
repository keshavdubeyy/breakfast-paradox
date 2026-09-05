import { describe, expect, it } from "vitest"

import {
  buildBreakfastPathwaySankey,
  computeComparisonRatingSummaries,
  computeEventsMetrics,
  computeKeyEventMetrics,
  filterRowsByArrayField,
  filterRowsByField,
} from "../events-metrics"
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

describe("computeKeyEventMetrics", () => {
  const rows: AnalyticsRow[] = [
    makeRow({ id: "r1", breakfastFrequency: "almost-every-day" }),
    makeRow({ id: "r2", breakfastFrequency: "most-days" }),
    makeRow({ id: "r3", breakfastFrequency: null }),
  ]

  it("excludes null-frequency rows from the denominator, not from the count", () => {
    const metrics = computeKeyEventMetrics(rows)
    const notEveryDay = metrics[0]
    expect(notEveryDay.denominator).toBe(2) // r3 excluded entirely
    expect(notEveryDay.count).toBe(1) // r2 only
    expect(notEveryDay.percentage).toBe(50)
  })

  it("returns null percentage (not zero) when nobody answered the gating question", () => {
    const metrics = computeKeyEventMetrics([
      makeRow({ id: "r1", breakfastFrequency: null }),
    ])
    expect(metrics[0].percentage).toBeNull()
    expect(metrics[0].denominator).toBe(0)
  })

  it("plan-change metric treats 'never' as no-change and anything else as change", () => {
    const metrics = computeKeyEventMetrics([
      makeRow({ id: "r1", breakfastPlanChangeFrequency: "never" }),
      makeRow({ id: "r2", breakfastPlanChangeFrequency: "sometimes" }),
      makeRow({ id: "r3", breakfastPlanChangeFrequency: "almost-always" }),
    ])
    const planChanges = metrics[1]
    expect(planChanges.denominator).toBe(3)
    expect(planChanges.count).toBe(2)
  })

  it("counts a redirected/unused meal from either plan-change actions or branch-C unused-meal actions, over the union of respondents asked either question", () => {
    const metrics = computeKeyEventMetrics([
      makeRow({ id: "r1", breakfastPlanChangeActions: ["use-allotted"] }), // asked, not redirected
      makeRow({ id: "r2", breakfastPlanChangeActions: ["sell"] }), // redirected
      makeRow({ id: "r3", unusedAllottedMealActions: ["leave-unused"] }), // redirected (branch C)
      makeRow({ id: "r4" }), // never asked either question — excluded from denominator
    ])
    const redirected = metrics[3]
    expect(redirected.denominator).toBe(3)
    expect(redirected.count).toBe(2)
  })
})

describe("computeComparisonRatingSummaries", () => {
  it("averages only rows that actually answered this row, excluding 'can't compare' from the average but not the distribution", () => {
    const rows: AnalyticsRow[] = [
      makeRow({
        id: "r1",
        comparisonRatings: { comparisonEnergyLevel: "much-lower" },
      }),
      makeRow({
        id: "r2",
        comparisonRatings: { comparisonEnergyLevel: "slightly-lower" },
      }),
      makeRow({
        id: "r3",
        comparisonRatings: { comparisonEnergyLevel: "cant-compare" },
      }),
      makeRow({ id: "r4", comparisonRatings: {} }), // grid not shown to this respondent
    ]
    const summaries = computeComparisonRatingSummaries(rows)
    const energy = summaries.find((s) => s.key === "comparisonEnergyLevel")!
    expect(energy.respondedCount).toBe(3) // r4 excluded — never answered
    expect(energy.averagePosition).toBe(-1.5) // (-2 + -1) / 2, r3 excluded from average
    const cantCompareBucket = energy.distribution.find(
      (b) => b.value === "cant-compare"
    )
    expect(cantCompareBucket?.count).toBe(1) // r3 still counted in the distribution
  })

  it("returns null average when every response was 'can't compare'", () => {
    const rows: AnalyticsRow[] = [
      makeRow({
        id: "r1",
        comparisonRatings: { comparisonConcentration: "cant-compare" },
      }),
    ]
    const summaries = computeComparisonRatingSummaries(rows)
    const concentration = summaries.find(
      (s) => s.key === "comparisonConcentration"
    )!
    expect(concentration.averagePosition).toBeNull()
  })
})

describe("buildBreakfastPathwaySankey", () => {
  it("conserves respondent counts from root through the branch and plan-change-status layers", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "r1", branch: "A", breakfastPlanChangeFrequency: "never" }),
      makeRow({ id: "r2", branch: "A", breakfastPlanChangeFrequency: "often" }),
      makeRow({ id: "r3", branch: "B", breakfastPlanChangeFrequency: "sometimes" }),
    ]
    const sankey = buildBreakfastPathwaySankey(rows)

    const nameOf = (index: number) => sankey.nodes[index].name
    const linksFrom = (name: string) =>
      sankey.links.filter((link) => nameOf(link.source) === name)

    const rootLinks = linksFrom("All respondents")
    expect(rootLinks.reduce((sum, l) => sum + l.value, 0)).toBe(3)

    const branchALinks = linksFrom("Regular eaters")
    expect(branchALinks.reduce((sum, l) => sum + l.value, 0)).toBe(2)
    expect(
      branchALinks.find((l) => nameOf(l.target) === "Plan stays fixed")?.value
    ).toBe(1)
    expect(
      branchALinks.find((l) => nameOf(l.target) === "Plan changes at least sometimes")
        ?.value
    ).toBe(1)
  })

  it("aggregates multi-select plan-change actions across branches into the same action nodes", () => {
    const rows: AnalyticsRow[] = [
      makeRow({
        id: "r1",
        branch: "A",
        breakfastPlanChangeFrequency: "often",
        breakfastPlanChangeActions: ["sell", "leave-unused"],
      }),
      makeRow({
        id: "r2",
        branch: "B",
        breakfastPlanChangeFrequency: "sometimes",
        breakfastPlanChangeActions: ["sell"],
      }),
    ]
    const sankey = buildBreakfastPathwaySankey(rows)
    const sellNode = sankey.nodes.findIndex((n) => n.name === "Sell it")
    const sellValue = sankey.links.find((l) => l.target === sellNode)?.value
    expect(sellValue).toBe(2) // both rows selected "sell", from two different branches
  })

  it("omits a branch/action entirely when it has zero respondents, rather than emitting a zero-value link", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "r1", branch: "A", breakfastPlanChangeFrequency: "never" }),
    ]
    const sankey = buildBreakfastPathwaySankey(rows)
    expect(sankey.nodes.some((n) => n.name === "Conditional eaters")).toBe(false)
    expect(sankey.links.every((link) => link.value > 0)).toBe(true)
  })
})

describe("filterRowsByField / filterRowsByArrayField", () => {
  it("matches scalar fields exactly, including null", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "r1", breakfastFrequency: "never" }),
      makeRow({ id: "r2", breakfastFrequency: null }),
    ]
    expect(filterRowsByField(rows, "breakfastFrequency", "never")).toHaveLength(1)
    expect(filterRowsByField(rows, "breakfastFrequency", null)).toHaveLength(1)
  })

  it("matches any row whose array field includes the given value", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "r1", breakfastPlanChangeActions: ["sell", "exchange"] }),
      makeRow({ id: "r2", breakfastPlanChangeActions: ["exchange"] }),
      makeRow({ id: "r3", breakfastPlanChangeActions: [] }),
    ]
    expect(
      filterRowsByArrayField(rows, "breakfastPlanChangeActions", "exchange")
    ).toHaveLength(2)
    expect(
      filterRowsByArrayField(rows, "breakfastPlanChangeActions", "sell")
    ).toHaveLength(1)
  })
})

describe("computeEventsMetrics — smoke test", () => {
  it("runs end-to-end over a small mixed-branch sample without throwing", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "r1", branch: "A", missedBreakfastFrequency: "sometimes" }),
      makeRow({
        id: "r2",
        branch: "B",
        breakfastPlannedButSkippedFrequency: "often",
      }),
      makeRow({
        id: "r3",
        branch: "C",
        breakfastServedTimeActivity: "sleeping",
      }),
    ]
    const metrics = computeEventsMetrics(rows)
    expect(metrics.branchA.count).toBe(1)
    expect(metrics.branchB.count).toBe(1)
    expect(metrics.branchC.count).toBe(1)
    expect(metrics.keyEventMetrics).toHaveLength(4)
  })
})
