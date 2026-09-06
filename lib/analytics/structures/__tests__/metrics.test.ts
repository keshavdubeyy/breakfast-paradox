import { describe, expect, it } from "vitest"

import type { AnalyticsRow } from "../../types"
import {
  computeAutoAllocationCard,
  computeBiggestInfluenceRanking,
  computeCancellationCutoffCard,
  computeLeveragePointsRanking,
  computeMessChangeDeterminants,
  computeMessConsistency,
  computeMessDecision,
  computeMessFoodQuality,
  computeMessFoodQualityByBranch,
  computePlanChangeActions,
  computeServiceEnvironmentRanking,
  computeStructuralDriversRanking,
  computeTopLeveragePointCard,
  computeUnusedAllottedMealActions,
  computeUnusedMealTransferAttemptCard,
} from "../metrics"
import { STRUCTURAL_DRIVER_ITEMS } from "../normalization"

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

function rowsWithFrequency(n: number, frequency: string | null): AnalyticsRow[] {
  return Array.from({ length: n }, (_, i) =>
    makeRow({ id: `f-${i}`, breakfastPlanChangeFrequency: frequency })
  )
}

// --- 1. Plan-change-after-cutoff summary --------------------------------

describe("computeCancellationCutoffCard", () => {
  it("counts everything except 'never' as changing at least occasionally", () => {
    const rows: AnalyticsRow[] = [
      ...rowsWithFrequency(2, "almost-always"),
      ...rowsWithFrequency(2, "often"),
      ...rowsWithFrequency(2, "never"),
    ]
    const card = computeCancellationCutoffCard(rows)
    expect(card.n).toBe(6)
    // percentageOf rounds to one decimal place, so compare at that precision.
    expect(card.percentage).toBeCloseTo((4 / 6) * 100, 1)
  })

  it("excludes unanswered rows from the denominator, not treats them as 'never'", () => {
    const rows: AnalyticsRow[] = [
      ...rowsWithFrequency(3, "sometimes"),
      ...rowsWithFrequency(2, null),
    ]
    const card = computeCancellationCutoffCard(rows)
    expect(card.n).toBe(3)
    expect(card.percentage).toBe(100)
  })
})

// --- 2. Auto/mixed allocation summary ------------------------------------

describe("computeAutoAllocationCard", () => {
  it("counts auto-allotted and mixed, not self-registered/not-sure", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", messDecision: "self-registered" }),
      makeRow({ id: "2", messDecision: "auto-allotted" }),
      makeRow({ id: "3", messDecision: "mixed" }),
      makeRow({ id: "4", messDecision: "not-sure" }),
      makeRow({ id: "5", messDecision: "auto-allotted" }),
      makeRow({ id: "6", messDecision: null }),
    ]
    const card = computeAutoAllocationCard(rows)
    expect(card.n).toBe(5) // excludes the null row
    expect(card.percentage).toBeCloseTo((3 / 5) * 100, 5)
  })
})

// --- 3. Top-box influence calculation ------------------------------------

describe("computeServiceEnvironmentRanking — top-box calculation", () => {
  it("counts only scores >= 3 (a-lot / very-strongly) as top-box", () => {
    const rows: AnalyticsRow[] = [
      ...Array.from({ length: 3 }, (_, i) =>
        makeRow({ id: `a-${i}`, influenceRatings: { breakfastServingTimeInfluence: "a-lot" } })
      ),
      ...Array.from({ length: 2 }, (_, i) =>
        makeRow({ id: `v-${i}`, influenceRatings: { breakfastServingTimeInfluence: "very-strongly" } })
      ),
      ...Array.from({ length: 5 }, (_, i) =>
        makeRow({ id: `n-${i}`, influenceRatings: { breakfastServingTimeInfluence: "not-at-all" } })
      ),
    ]
    const ranking = computeServiceEnvironmentRanking(rows)
    const row = ranking.rows.find((r) => r.key === "breakfastServingTimeInfluence")!
    expect(row.n).toBe(10)
    expect(row.topBoxCount).toBe(5)
    expect(row.topBoxPercentage).toBe(50)
  })

  it("returns null topBoxPercentage (not zero) when nobody eligible answered", () => {
    const ranking = computeServiceEnvironmentRanking([])
    const row = ranking.rows.find((r) => r.key === "breakfastServingTimeInfluence")!
    expect(row.topBoxPercentage).toBeNull()
    expect(row.n).toBe(0)
  })
})

// --- 4. Attention-check exclusion ----------------------------------------

describe("Structural Drivers — attention-check exclusion", () => {
  it("never includes the attention-check row in the ranking", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", influenceRatings: { attentionCheckInfluence: "a-lot" } }),
    ]
    const ranking = computeStructuralDriversRanking(rows)
    expect(ranking.rows.some((r) => r.key === "attentionCheckInfluence")).toBe(false)
  })
})

// --- 5. Structural-factor inclusion/exclusion list -----------------------

describe("STRUCTURAL_DRIVER_ITEMS", () => {
  it("includes exactly the 10 service/access/allocation/alternative-ecosystem factors", () => {
    const keys = STRUCTURAL_DRIVER_ITEMS.map((item) => item.key).sort()
    expect(keys).toEqual(
      [
        "breakfastMenuInfluence",
        "breakfastServingTimeInfluence",
        "canteenAvailabilityInfluence",
        "distanceInfluence",
        "firstCommitmentTimeInfluence",
        "messAllocationInfluence",
        "morningTimeInfluence",
        "onlineOrderingInfluence",
        "queueWaitInfluence",
        "resaleAbilityInfluence",
      ].sort()
    )
  })

  it("excludes personal/social conditions and the attention check", () => {
    const keys = STRUCTURAL_DRIVER_ITEMS.map((item) => item.key)
    for (const excluded of [
      "sleepAmountInfluence",
      "hungerOnWakingInfluence",
      "ateLatePreviousNightInfluence",
      "friendsGoingInfluence",
      "attentionCheckInfluence",
    ]) {
      expect(keys).not.toContain(excluded)
    }
  })
})

// --- 6. Mess-decision distribution totals 100% ---------------------------

describe("computeMessDecision", () => {
  it("sums to 100% when every row answered", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", messDecision: "self-registered" }),
      makeRow({ id: "2", messDecision: "self-registered" }),
      makeRow({ id: "3", messDecision: "auto-allotted" }),
      makeRow({ id: "4", messDecision: "mixed" }),
      makeRow({ id: "5", messDecision: "not-sure" }),
    ]
    const result = computeMessDecision(rows)
    const total = result.distribution.reduce((sum, bucket) => sum + bucket.percentage, 0)
    expect(total).toBeCloseTo(100, 5)
  })
})

// --- 7. Conditional Branch A eligibility ----------------------------------

describe("computeMessConsistency / computeMessChangeDeterminants — Branch A only", () => {
  const rows: AnalyticsRow[] = [
    makeRow({ id: "a1", branch: "A", messConsistency: "changes-sometimes", messChangeDeterminants: ["menu"] }),
    makeRow({ id: "a2", branch: "A", messConsistency: "almost-always-same", messChangeDeterminants: [] }),
    makeRow({ id: "b1", branch: "B", messConsistency: "changes-sometimes" }),
    makeRow({ id: "c1", branch: "C" }),
  ]

  it("messConsistency only counts Branch A rows", () => {
    const field = computeMessConsistency(rows)
    expect(field.eligibility.totalFiltered).toBe(2)
    expect(field.eligibility.eligible).toBe(2)
  })

  it("messChangeDeterminants gates on messConsistency having actually changed", () => {
    const field = computeMessChangeDeterminants(rows)
    expect(field.eligibility.eligible).toBe(1) // only a1 (changes-sometimes)
    expect(field.eligibility.answered).toBe(1)
  })
})

// --- 8. Transfer-attempt eligibility (Branch C only) ----------------------

describe("computeUnusedMealTransferAttemptCard", () => {
  it("only counts Branch C respondents, never Branch A's own sell/exchange selections", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "a1", branch: "A", unwantedMessActions: ["sell"] }),
      makeRow({ id: "c1", branch: "C", unusedAllottedMealActions: ["sell"] }),
      makeRow({ id: "c2", branch: "C", unusedAllottedMealActions: ["leave-unused"] }),
      makeRow({ id: "c3", branch: "C", unusedAllottedMealActions: [] }),
    ]
    const card = computeUnusedMealTransferAttemptCard(rows)
    expect(card.n).toBe(2) // c1, c2 (c3 has no answer, a1 is Branch A)
    expect(card.percentage).toBeCloseTo(50, 5)
  })
})

// --- 9. Branch C unused-meal eligibility ----------------------------------

describe("computeUnusedAllottedMealActions — Branch C only", () => {
  it("excludes Branch A/B rows from eligibility entirely", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "a1", branch: "A", unusedAllottedMealActions: ["sell"] }),
      makeRow({ id: "c1", branch: "C", unusedAllottedMealActions: ["leave-unused"] }),
    ]
    const field = computeUnusedAllottedMealActions(rows)
    expect(field.eligibility.totalFiltered).toBe(1)
    expect(field.eligibility.eligible).toBe(1)
  })
})

// --- 10. Multi-select prevalence denominator (plan-change actions) -------

describe("computePlanChangeActions — denominator", () => {
  it("excludes rows whose plan never changes, and rows that never answered the frequency question", () => {
    const rows: AnalyticsRow[] = [
      makeRow({
        id: "1",
        breakfastPlanChangeFrequency: "sometimes",
        breakfastPlanChangeActions: ["exchange"],
      }),
      makeRow({ id: "2", breakfastPlanChangeFrequency: "never", breakfastPlanChangeActions: [] }),
      makeRow({ id: "3", breakfastPlanChangeFrequency: null, breakfastPlanChangeActions: [] }),
    ]
    const result = computePlanChangeActions(rows)
    expect(result.eligibility.totalFiltered).toBe(3)
    expect(result.eligibility.eligible).toBe(1)
    expect(result.eligibility.answered).toBe(1)
  })
})

// --- 11. Multi-select totals may exceed 100% ------------------------------

describe("computeLeveragePointsRanking — totals may exceed 100%", () => {
  it("does not cap the sum of percentages at 100 when respondents select multiple options", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", breakfastImprovementOptions: ["better-timing", "grab-and-go", "shorter-queues"] }),
      makeRow({ id: "2", breakfastImprovementOptions: ["better-timing", "grab-and-go"] }),
      makeRow({ id: "3", breakfastImprovementOptions: ["better-timing"] }),
    ]
    const result = computeLeveragePointsRanking(rows)
    const total = result.distribution.reduce((sum, bucket) => sum + bucket.percentage, 0)
    expect(total).toBeGreaterThan(100)
  })

  it("uses all respondents (not just those who selected something) as the denominator", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", breakfastImprovementOptions: ["better-timing"] }),
      makeRow({ id: "2", breakfastImprovementOptions: [] }),
    ]
    const result = computeLeveragePointsRanking(rows)
    expect(result.eligibility.eligible).toBe(2)
    expect(result.eligibility.answered).toBe(1)
    const bucket = result.distribution.find((b) => b.value === "better-timing")!
    expect(bucket.percentage).toBe(50)
  })
})

// --- 12. "Not enough experience" is not treated as poor -------------------

describe("computeMessFoodQuality — not-enough-experience handling", () => {
  it("keeps 'not-enough-experience' as its own bucket, separate from poor/very-poor", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", messFoodQuality: "poor" }),
      makeRow({ id: "2", messFoodQuality: "very-poor" }),
      makeRow({ id: "3", messFoodQuality: "not-enough-experience" }),
      makeRow({ id: "4", messFoodQuality: "not-enough-experience" }),
    ]
    const result = computeMessFoodQuality(rows)
    const poor = result.distribution.find((b) => b.value === "poor")!
    const veryPoor = result.distribution.find((b) => b.value === "very-poor")!
    const notEnough = result.distribution.find((b) => b.value === "not-enough-experience")!
    expect(poor.count).toBe(1)
    expect(veryPoor.count).toBe(1)
    expect(notEnough.count).toBe(2)
  })
})

describe("computeMessFoodQualityByBranch", () => {
  it("splits food quality into its own per-branch composition, each using only that branch's rows", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "a1", branch: "A", messFoodQuality: "good" }),
      makeRow({ id: "a2", branch: "A", messFoodQuality: "good" }),
      makeRow({ id: "a3", branch: "A", messFoodQuality: "poor" }),
      makeRow({ id: "b1", branch: "B", messFoodQuality: "average" }),
      makeRow({ id: "c1", branch: "C", messFoodQuality: "very-good" }),
    ]
    const byBranch = computeMessFoodQualityByBranch(rows)

    expect(byBranch.A.eligibility.eligible).toBe(3)
    expect(byBranch.A.eligibility.answered).toBe(3)
    expect(byBranch.A.distribution.find((b) => b.value === "good")!.count).toBe(2)

    expect(byBranch.B.eligibility.eligible).toBe(1)
    expect(byBranch.C.eligibility.eligible).toBe(1)

    // Branch A's rows never leak into Branch B/C's counts.
    expect(byBranch.B.distribution.find((b) => b.value === "good")!.count).toBe(0)
    expect(byBranch.C.distribution.find((b) => b.value === "poor")!.count).toBe(0)
  })

  it("returns a defined-but-empty shape for a branch with nobody in it", () => {
    const rows: AnalyticsRow[] = [makeRow({ id: "a1", branch: "A", messFoodQuality: "good" })]
    const byBranch = computeMessFoodQualityByBranch(rows)
    expect(byBranch.C.eligibility.eligible).toBe(0)
    expect(byBranch.C.eligibility.totalFiltered).toBe(0)
  })
})

// --- 13. Improvement-option prevalence (denominator = everyone) ----------

describe("computeBiggestInfluenceRanking — denominator", () => {
  it("uses every row as eligible, regardless of whether they answered", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", biggestInfluenceFactor: "distanceInfluence" }),
      makeRow({ id: "2", biggestInfluenceFactor: null }),
    ]
    const result = computeBiggestInfluenceRanking(rows)
    expect(result.eligibility.eligible).toBe(2)
    expect(result.eligibility.answered).toBe(1)
  })

  it("never surfaces the attention-check row as an option", () => {
    const rows: AnalyticsRow[] = [makeRow({ id: "1", biggestInfluenceFactor: "distanceInfluence" })]
    const result = computeBiggestInfluenceRanking(rows)
    expect(result.distribution.some((b) => b.value === "attentionCheckInfluence")).toBe(false)
  })
})

// --- 14. "Nothing would change it" retained as a valid answer ------------

describe("computeTopLeveragePointCard", () => {
  it("returns 'nothing-would-change' when it is genuinely the most-selected option", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", breakfastImprovementOptions: ["nothing-would-change"] }),
      makeRow({ id: "2", breakfastImprovementOptions: ["nothing-would-change"] }),
      makeRow({ id: "3", breakfastImprovementOptions: ["nothing-would-change"] }),
      makeRow({ id: "4", breakfastImprovementOptions: ["nothing-would-change"] }),
      makeRow({ id: "5", breakfastImprovementOptions: ["nothing-would-change"] }),
      makeRow({ id: "6", breakfastImprovementOptions: ["better-timing"] }),
    ]
    const card = computeTopLeveragePointCard(rows)
    expect(card.detailLabel).toBe("Nothing would significantly change my routine")
  })
})

// --- 15 & 16. Suppression boundaries --------------------------------------

describe("sample-size suppression boundaries", () => {
  it("suppresses (n=4) below MIN_CELL_N", () => {
    const rows = rowsWithFrequency(4, "often")
    const card = computeCancellationCutoffCard(rows)
    expect(card.flag).toBe("suppressed")
  })

  it("flags small (n=5..19) but still shows the value", () => {
    const rows = rowsWithFrequency(5, "often")
    const card = computeCancellationCutoffCard(rows)
    expect(card.flag).toBe("small")
    expect(card.percentage).not.toBeNull()
  })

  it("is 'ok' at n>=20", () => {
    const rows = rowsWithFrequency(20, "often")
    const card = computeCancellationCutoffCard(rows)
    expect(card.flag).toBe("ok")
  })
})

// --- 17. Filters don't change denominator semantics -----------------------

describe("whole-sample distributions — eligibility tracks the rows actually passed in", () => {
  it("eligible always equals the length of the (already filtered) rows array", () => {
    const rows: AnalyticsRow[] = [
      makeRow({ id: "1", messDecision: "self-registered" }),
      makeRow({ id: "2", messDecision: null }),
      makeRow({ id: "3", messDecision: "mixed" }),
    ]
    const result = computeMessDecision(rows)
    expect(result.eligibility.totalFiltered).toBe(rows.length)
    expect(result.eligibility.eligible).toBe(rows.length)
  })
})
