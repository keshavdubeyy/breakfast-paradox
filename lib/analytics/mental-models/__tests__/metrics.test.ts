import { describe, expect, it } from "vitest"

import type { AnalyticsRow } from "../../types"
import {
  computeAgreementOverview,
  computeArchetypeDistribution,
  computeMealValuePerception,
  computeMentalModelsSnapshot,
  computeMotivationFactors,
  computeRoutineMindset,
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

describe("computeAgreementOverview", () => {
  it("computes a full 5-point distribution per statement from agreementRatings", () => {
    // 6 answered (clears MIN_CELL_N) so agreeShare isn't suppressed.
    const rows = [
      makeRow({ id: "1", agreementRatings: { sleepOverBreakfastAgreement: "strongly-agree" } }),
      makeRow({ id: "2", agreementRatings: { sleepOverBreakfastAgreement: "strongly-agree" } }),
      makeRow({ id: "3", agreementRatings: { sleepOverBreakfastAgreement: "agree" } }),
      makeRow({ id: "4", agreementRatings: { sleepOverBreakfastAgreement: "neutral" } }),
      makeRow({ id: "5", agreementRatings: { sleepOverBreakfastAgreement: "disagree" } }),
      makeRow({ id: "6", agreementRatings: { sleepOverBreakfastAgreement: "disagree" } }),
      makeRow({ id: "7", agreementRatings: {} }), // unanswered — excluded from n
    ]
    const overview = computeAgreementOverview(rows)
    const statement = overview.statements.find((s) => s.key === "sleepOverBreakfastAgreement")!
    expect(statement.n).toBe(6)
    expect(statement.agreeShare).toBe(50) // 3 of 6 agree/strongly-agree
    expect(statement.shortLabel).toBe("Rest is a priority")
  })

  it("suppresses agreeShare (not just distribution values) below MIN_CELL_N", () => {
    const rows = [
      makeRow({ id: "1", agreementRatings: { sleepOverBreakfastAgreement: "strongly-agree" } }),
      makeRow({ id: "2", agreementRatings: { sleepOverBreakfastAgreement: "strongly-agree" } }),
    ]
    const overview = computeAgreementOverview(rows)
    const statement = overview.statements.find((s) => s.key === "sleepOverBreakfastAgreement")!
    expect(statement.n).toBe(2)
    expect(statement.flag).toBe("suppressed")
    expect(statement.agreeShare).toBeNull()
  })

  it("never confuses an unanswered statement with a real disagree/neutral score", () => {
    const rows = [makeRow({ id: "1", agreementRatings: {} })]
    const overview = computeAgreementOverview(rows)
    const statement = overview.statements[0]
    expect(statement.n).toBe(0)
    expect(statement.agreeShare).toBeNull()
  })
})

describe("computeRoutineMindset", () => {
  it("maps Branch A and Branch C onto the shared bucket scale and excludes Branch B entirely", () => {
    const rows = [
      makeRow({ id: "a1", branch: "A", breakfastRoutineDescription: "actively-plan" }),
      makeRow({ id: "a2", branch: "A", breakfastRoutineDescription: "depends-on-day" }),
      makeRow({ id: "c1", branch: "C", breakfastAbsenceReason: "depends-on-day" }),
      makeRow({ id: "c2", branch: "C", breakfastAbsenceReason: "havent-thought-about-it" }),
      makeRow({ id: "b1", branch: "B", breakfastDecisionPoint: "previous-night" }),
    ]
    const result = computeRoutineMindset(rows)
    expect(result.eligibility.totalFiltered).toBe(5)
    expect(result.eligibility.eligible).toBe(4) // Branch B excluded from the denominator
    expect(result.eligibility.answered).toBe(4)

    const dependsOnDay = result.distribution.find((b) => b.value === "depends-on-day")!
    expect(dependsOnDay.count).toBe(2)
    const activelyDecided = result.distribution.find((b) => b.value === "actively-decided")!
    expect(activelyDecided.count).toBe(1)
    const inTheMoment = result.distribution.find((b) => b.value === "in-the-moment")!
    expect(inTheMoment.count).toBe(1)
  })

  it("drops an unmappable value (e.g. 'other') rather than guessing a bucket", () => {
    const rows = [
      makeRow({ id: "a1", branch: "A", breakfastRoutineDescription: "other" }),
      makeRow({ id: "a2", branch: "A", breakfastRoutineDescription: "actively-plan" }),
    ]
    const result = computeRoutineMindset(rows)
    expect(result.eligibility.eligible).toBe(2)
    expect(result.eligibility.answered).toBe(1)
  })
})

describe("computeMealValuePerception / computeMotivationFactors / computeArchetypeDistribution", () => {
  it("computes a whole-sample distribution for meal value perception", () => {
    const rows = [
      makeRow({ id: "1", mealValuePerception: "good-value" }),
      makeRow({ id: "2", mealValuePerception: "good-value" }),
      makeRow({ id: "3", mealValuePerception: "very-wasteful" }),
    ]
    const result = computeMealValuePerception(rows)
    const good = result.distribution.find((b) => b.value === "good-value")!
    expect(good.count).toBe(2)
    expect(good.percentage).toBeCloseTo(66.7, 1)
  })

  it("computes multi-select prevalence for motivation factors without requiring 100% total", () => {
    const rows = [
      makeRow({ id: "1", breakfastMotivationFactors: ["feel-hungry", "part-of-routine"] }),
      makeRow({ id: "2", breakfastMotivationFactors: ["feel-hungry"] }),
    ]
    const result = computeMotivationFactors(rows)
    const hungry = result.distribution.find((b) => b.value === "feel-hungry")!
    expect(hungry.percentage).toBe(100)
    const routine = result.distribution.find((b) => b.value === "part-of-routine")!
    expect(routine.percentage).toBe(50)
  })

  it("computes the primary-archetype distribution as supporting synthesis", () => {
    const rows = [
      makeRow({ id: "1", primaryArchetype: "routine-keeper" }),
      makeRow({ id: "2", primaryArchetype: "sleep-saver" }),
      makeRow({ id: "3", primaryArchetype: null }),
    ]
    const result = computeArchetypeDistribution(rows)
    const routineKeeper = result.distribution.find((b) => b.value === "routine-keeper")!
    expect(routineKeeper.count).toBe(1)
    expect(result.eligibility.answered).toBe(2)
  })
})

describe("computeMentalModelsSnapshot", () => {
  it("ranks dominant belief and strongest trade-off by agree share, highest first", () => {
    // 5 rows clears MIN_CELL_N so the card's percentage isn't suppressed.
    // Both agreement rows set here are genuine trade-off statements (see
    // TRADE_OFF_AGREEMENT_KEYS), and sleepOverBreakfastAgreement is the
    // more-agreed of the two — so it's correctly both the dominant belief
    // AND the strongest trade-off. That's not a duplicate/bug: it's an
    // accurate finding that the single most popular belief happens to be
    // trade-off-framed.
    const rows = Array.from({ length: 5 }, (_, i) =>
      makeRow({
        id: `${i}`,
        agreementRatings: {
          sleepOverBreakfastAgreement: "strongly-agree",
          classOnTimeOverBreakfastAgreement: i === 0 ? "agree" : "disagree",
        },
      })
    )
    const agreementOverview = computeAgreementOverview(rows)
    const routineMindset = computeRoutineMindset(rows)
    const valuePerception = computeMealValuePerception(rows)
    const motivations = computeMotivationFactors(rows)

    const snapshot = computeMentalModelsSnapshot(agreementOverview, routineMindset, valuePerception, motivations)
    expect(snapshot.dominantBelief.detailLabel).toBe("Rest is a priority")
    expect(snapshot.dominantBelief.percentage).toBe(100)
    expect(snapshot.strongestTradeOff.detailLabel).toBe("Rest is a priority")
    expect(snapshot.strongestTradeOff.percentage).toBe(100)
  })

  it("never picks a non-trade-off belief for 'strongest trade-off', even when it ranks 2nd overall", () => {
    // breakfastPlannedInAdvanceAgreement (dominant, 100%) and
    // noHungerNoReasonAgreement (2nd overall, 80%) are NOT trade-off
    // statements (see TRADE_OFF_AGREEMENT_KEYS) — the old "just take rank
    // #2 overall" logic would have shown "Hunger-led eating" as the
    // strongest trade-off, which it isn't. classOnTimeOverBreakfastAgreement
    // is the higher-agreement of the two genuine trade-offs and must be
    // the one shown, even though it ranks below both non-trade-off beliefs
    // overall.
    const rows = Array.from({ length: 10 }, (_, i) =>
      makeRow({
        id: `${i}`,
        agreementRatings: {
          breakfastPlannedInAdvanceAgreement: "strongly-agree", // dominant, 100% — not a trade-off
          noHungerNoReasonAgreement: i < 8 ? "agree" : "disagree", // 2nd overall, 80% — not a trade-off
          classOnTimeOverBreakfastAgreement: i < 3 ? "agree" : "disagree", // 30% — a real trade-off
          sleepOverBreakfastAgreement: i < 1 ? "agree" : "disagree", // 10% — the other real trade-off
        },
      })
    )
    const agreementOverview = computeAgreementOverview(rows)
    const routineMindset = computeRoutineMindset(rows)
    const valuePerception = computeMealValuePerception(rows)
    const motivations = computeMotivationFactors(rows)

    const snapshot = computeMentalModelsSnapshot(agreementOverview, routineMindset, valuePerception, motivations)
    expect(snapshot.dominantBelief.detailLabel).toBe("Plans in advance")
    // Would have been "Hunger-led eating" (80%, rank #2 overall) under the
    // old logic — must be the higher-agreement genuine trade-off instead.
    expect(snapshot.strongestTradeOff.detailLabel).toBe("Academic priority")
    expect(snapshot.strongestTradeOff.percentage).toBe(30)
  })

  it("suppresses the card's percentage (not just the value) below MIN_CELL_N, same as every other card", () => {
    const rows = [makeRow({ id: "1", agreementRatings: { sleepOverBreakfastAgreement: "strongly-agree" } })]
    const agreementOverview = computeAgreementOverview(rows)
    const routineMindset = computeRoutineMindset(rows)
    const valuePerception = computeMealValuePerception(rows)
    const motivations = computeMotivationFactors(rows)

    const snapshot = computeMentalModelsSnapshot(agreementOverview, routineMindset, valuePerception, motivations)
    expect(snapshot.dominantBelief.flag).toBe("suppressed")
    expect(snapshot.dominantBelief.percentage).toBeNull()
  })
})
