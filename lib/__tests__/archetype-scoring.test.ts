import { describe, expect, it } from "vitest"

import {
  ALTERNATIVE_FORAGER_FIXTURE,
  ARCHETYPE_FIXTURES,
  LOW_CONFIDENCE_FIXTURE,
  MEAL_MAXIMIZER_FIXTURE,
  MISSING_BRANCH_DATA_FIXTURE,
  ROUTINE_KEEPER_FIXTURE,
  SCHEDULE_JUGGLER_FIXTURE,
  TIE_WITHIN_FIVE_POINTS_FIXTURE,
} from "../archetype-fixtures"
import {
  calculateArchetypeResult,
  calculateFlexibleSwitcher,
  calculateMealMaximizer,
  calculateRoutineKeeper,
  LOW_CONFIDENCE_THRESHOLD,
  TIE_GAP_THRESHOLD,
  type ArchetypeInputData,
} from "../archetype-scoring"
import { normalizeTransferBehaviour } from "../archetype-normalization"
import {
  defaultAfterMorningRoutineAnswers,
  defaultUsualRoutineAnswers,
} from "../survey-state"

// --- A-F. Each "strong" fixture must win its own archetype ----------------

describe("strong-signal fixtures each win their intended archetype", () => {
  for (const fixture of ARCHETYPE_FIXTURES) {
    it(`${fixture.label} → ${fixture.id}`, () => {
      const result = calculateArchetypeResult(fixture.data)
      expect(result.winner).toBe(fixture.id)
    })
  }
})

// --- Determinism -----------------------------------------------------------

describe("determinism", () => {
  it("the same input always produces the same output", () => {
    const first = calculateArchetypeResult(SCHEDULE_JUGGLER_FIXTURE.data)
    const second = calculateArchetypeResult(SCHEDULE_JUGGLER_FIXTURE.data)
    expect(second).toEqual(first)
  })

  it("a structurally identical but freshly-constructed input produces the same output", () => {
    const a = calculateArchetypeResult(
      JSON.parse(JSON.stringify(MEAL_MAXIMIZER_FIXTURE.data))
    )
    const b = calculateArchetypeResult(
      JSON.parse(JSON.stringify(MEAL_MAXIMIZER_FIXTURE.data))
    )
    expect(a).toEqual(b)
  })
})

// --- Missing branch-specific data is excluded, never scored as 0 ----------

describe("missing branch-specific data", () => {
  it("Routine Keeper's habit bonus is excluded (not zeroed) for a pure non-eater", () => {
    const breakdown = calculateRoutineKeeper(MISSING_BRANCH_DATA_FIXTURE)
    const habitBonus = breakdown.components.find((c) => c.key === "habitBonus")!
    expect(habitBonus.available).toBe(false)
    expect(habitBonus.normalizedValue).toBeNull()
    expect(habitBonus.weightedContribution).toBeNull()
    // Denominator drops to 0.90 (1 - the 0.10 habit-bonus weight), not 1.
    expect(breakdown.availableWeightTotal).toBeCloseTo(0.9, 10)
  })

  it("excluding a missing component is NOT equivalent to scoring it 0", () => {
    // breakfastFrequency stays "never" in both cases — the ONLY difference
    // is whether the habit-bonus question was shown at all.
    const withMissingData = calculateRoutineKeeper(MISSING_BRANCH_DATA_FIXTURE)

    const withAnsweredNo = calculateRoutineKeeper({
      usualRoutine: {
        ...MISSING_BRANCH_DATA_FIXTURE.usualRoutine,
        // Branch C, but reports occasional eating — so the shared
        // motivation question WAS shown, and answered without selecting
        // "part of my routine".
        occasionalBreakfastFrequency: "yes-sometimes",
        breakfastMotivationFactors: ["feel-hungry"],
      },
      afterMorningRoutine: MISSING_BRANCH_DATA_FIXTURE.afterMorningRoutine,
    })

    // If "not asked" were wrongly treated as "scored 0", these two would be
    // identical (both effectively contribute 0 for the habit-bonus term).
    // They must not be — renormalizing over the 4 available components
    // must score higher than diluting the average with an explicit 0.
    expect(withMissingData.scaledScore).toBeGreaterThan(
      withAnsweredNo.scaledScore
    )
  })

  it("Flexible Switcher's Branch-B-only components are excluded outside Branch B", () => {
    const breakdown = calculateFlexibleSwitcher(MISSING_BRANCH_DATA_FIXTURE)
    const decisionVariability = breakdown.components.find(
      (c) => c.key === "decisionVariability"
    )!
    const unexpectedChange = breakdown.components.find(
      (c) => c.key === "unexpectedChange"
    )!
    expect(decisionVariability.available).toBe(false)
    expect(unexpectedChange.available).toBe(false)
    // 0.30 + 0.25 + 0.15 = 0.70 of the original weight remains available.
    expect(breakdown.availableWeightTotal).toBeCloseTo(0.7, 10)
  })

  it("Meal Maximizer's transfer-behaviour and paid-motivation are excluded when unavailable", () => {
    const breakdown = calculateMealMaximizer(MISSING_BRANCH_DATA_FIXTURE)
    const transfer = breakdown.components.find(
      (c) => c.key === "transferBehaviour"
    )!
    const paidMotivation = breakdown.components.find(
      (c) => c.key === "paidMotivation"
    )!
    expect(transfer.available).toBe(false)
    expect(paidMotivation.available).toBe(false)
    // valueOrientation is also excluded in this fixture (mealValuePerception
    // is "not-applicable"), so only paidMealBelief (.30) + resaleInfluence
    // (.20) = 0.50 of the original weight remains available.
    expect(breakdown.availableWeightTotal).toBeCloseTo(0.5, 10)
  })
})

// --- "Not applicable" responses are excluded, same as unasked questions --

describe("N/A responses", () => {
  it("Schedule Juggler excludes the early-day gap when early commitments are N/A", () => {
    // Based on the Schedule Juggler fixture (so influence/agreement rows
    // are populated), but with early commitments marked not-applicable.
    const data: ArchetypeInputData = {
      usualRoutine: SCHEDULE_JUGGLER_FIXTURE.data.usualRoutine,
      afterMorningRoutine: {
        ...SCHEDULE_JUGGLER_FIXTURE.data.afterMorningRoutine,
        earlyCommitmentBreakfastFrequency: "not-applicable",
      },
    }
    const breakdown = calculateArchetypeResult(data).breakdowns[
      "schedule-juggler"
    ]
    const earlyDayGap = breakdown.components.find(
      (c) => c.key === "earlyDayGap"
    )!
    expect(earlyDayGap.available).toBe(false)
    // The other 4 components (.25 + .25 + .20 + .10) remain available.
    expect(breakdown.availableWeightTotal).toBeCloseTo(0.8, 10)
  })

  it("Meal Maximizer excludes value orientation when the respondent doesn't pay for a mess plan", () => {
    const breakdown = calculateMealMaximizer({
      usualRoutine: defaultUsualRoutineAnswers,
      afterMorningRoutine: {
        ...defaultAfterMorningRoutineAnswers,
        mealValuePerception: "not-applicable",
      },
    })
    const valueOrientation = breakdown.components.find(
      (c) => c.key === "valueOrientation"
    )!
    expect(valueOrientation.available).toBe(false)
  })
})

// --- Tie handling ------------------------------------------------------

describe("tie handling", () => {
  it("a within-5-point tie is resolved by the biggest-influence tie-breaker", () => {
    const result = calculateArchetypeResult(TIE_WITHIN_FIVE_POINTS_FIXTURE)
    const gap = Math.abs(
      result.scores["sleep-saver"] - result.scores["schedule-juggler"]
    )
    expect(gap).toBeLessThan(TIE_GAP_THRESHOLD)
    expect(result.tieBreakerUsed).toBe(true)
    // biggestInfluenceFactor = sleepAmountInfluence → maps to sleep-saver
    expect(result.tieBreakerFactor).toBe("sleepAmountInfluence")
    expect(result.winner).toBe("sleep-saver")
  })

  it("falls back to the higher raw score when the tie-breaker matches neither top candidate", () => {
    const data: ArchetypeInputData = {
      ...TIE_WITHIN_FIVE_POINTS_FIXTURE,
      afterMorningRoutine: {
        ...TIE_WITHIN_FIVE_POINTS_FIXTURE.afterMorningRoutine,
        // "distanceInfluence" maps to alternative-forager, which is
        // neither of the two tied candidates here.
        biggestInfluenceFactor: "distanceInfluence",
      },
    }
    const withTieBreaker = calculateArchetypeResult(
      TIE_WITHIN_FIVE_POINTS_FIXTURE
    )
    const withoutMatchingTieBreaker = calculateArchetypeResult(data)
    const higherRawScore =
      withoutMatchingTieBreaker.scores["sleep-saver"] >=
      withoutMatchingTieBreaker.scores["schedule-juggler"]
        ? "sleep-saver"
        : "schedule-juggler"

    expect(withoutMatchingTieBreaker.tieBreakerUsed).toBe(true)
    expect(withoutMatchingTieBreaker.tieBreakerFactor).toBeNull()
    expect(withoutMatchingTieBreaker.winner).toBe(higherRawScore)
    // Sanity: the two fixtures actually differ only in the tie-breaker field.
    expect(withTieBreaker.scores).toEqual(withoutMatchingTieBreaker.scores)
  })

  it("always returns a runner-up alongside the winner", () => {
    const result = calculateArchetypeResult(ROUTINE_KEEPER_FIXTURE.data)
    expect(result.runnerUp).toBeDefined()
    expect(result.runnerUp).not.toBe(result.winner)
  })
})

// --- Low-confidence result -------------------------------------------------

describe("low-confidence result", () => {
  it("marks confidence 'mixed' when the top score is below the threshold", () => {
    const result = calculateArchetypeResult(LOW_CONFIDENCE_FIXTURE)
    expect(result.scores[result.winner]).toBeLessThan(LOW_CONFIDENCE_THRESHOLD)
    expect(result.confidence).toBe("mixed")
  })

  it("marks confidence 'strong' for a decisive, unambiguous fixture", () => {
    const result = calculateArchetypeResult(MEAL_MAXIMIZER_FIXTURE.data)
    expect(result.scores[result.winner]).toBeGreaterThanOrEqual(
      LOW_CONFIDENCE_THRESHOLD
    )
    expect(result.difference).toBeGreaterThanOrEqual(TIE_GAP_THRESHOLD)
    expect(result.confidence).toBe("strong")
  })
})

// --- Multi-select values use MAX, never SUM --------------------------------

describe("multi-select values use MAX, not SUM", () => {
  it("normalizeTransferBehaviour: exchange + sell + give-away scores 1, not 2.8", () => {
    expect(normalizeTransferBehaviour(["exchange", "sell", "give-away"])).toBe(
      1
    )
  })

  it("a single low-value selection scores lower than a mix that includes a high value", () => {
    expect(normalizeTransferBehaviour(["leave-unused"])).toBe(0)
    expect(
      normalizeTransferBehaviour(["leave-unused", "give-away", "sell"])
    ).toBe(1)
  })

  it("Meal Maximizer's transfer-behaviour component reflects MAX across selections", () => {
    const breakdown = calculateMealMaximizer(MEAL_MAXIMIZER_FIXTURE.data)
    const transfer = breakdown.components.find(
      (c) => c.key === "transferBehaviour"
    )!
    // Fixture selects exchange (1), sell (1), give-away (.8) → MAX = 1.
    expect(transfer.normalizedValue).toBe(1)
    expect(transfer.weightedContribution).toBeCloseTo(0.2 * 1, 10)
  })
})

// --- Editing an earlier response and changing branches --------------------

describe("changing branches after an earlier answer", () => {
  it("stale Branch-B data is ignored once the respondent is no longer in Branch B", () => {
    const staleData: ArchetypeInputData = {
      usualRoutine: {
        ...defaultUsualRoutineAnswers,
        // Respondent originally answered as Branch B, then went back and
        // changed Q7 to a Branch-A answer — breakfastDecisionPoint is
        // left over from the old Branch B answer and never cleared.
        breakfastFrequency: "almost-every-day",
        breakfastDecisionPoint: "varies",
        breakfastPlanChangeReasons: ["unexpected-event"],
      },
      afterMorningRoutine: defaultAfterMorningRoutineAnswers,
    }
    const breakdown = calculateFlexibleSwitcher(staleData)
    const decisionVariability = breakdown.components.find(
      (c) => c.key === "decisionVariability"
    )!
    const unexpectedChange = breakdown.components.find(
      (c) => c.key === "unexpectedChange"
    )!

    expect(decisionVariability.available).toBe(false)
    expect(decisionVariability.rawInput).toBeNull()
    expect(unexpectedChange.available).toBe(false)
    expect(unexpectedChange.rawInput).toBeNull()
  })
})

// --- Empty optional ("Other") fields never affect scoring ------------------

describe("empty optional fields", () => {
  it("filling in a free-text 'Other' field doesn't change any score", () => {
    const withoutOtherText = calculateArchetypeResult(
      ROUTINE_KEEPER_FIXTURE.data
    )
    const withOtherText = calculateArchetypeResult({
      ...ROUTINE_KEEPER_FIXTURE.data,
      usualRoutine: {
        ...ROUTINE_KEEPER_FIXTURE.data.usualRoutine,
        breakfastMomentOther: "Whatever I feel like that day",
        missedBreakfastReasonOther: "Overslept",
        breakfastRoutineDescriptionOther: "It just happens",
      },
      afterMorningRoutine: {
        ...ROUTINE_KEEPER_FIXTURE.data.afterMorningRoutine,
        nonBreakfastMealSourceOther: "Leftover snacks",
        weekendDifferentiatorOther: "Nothing really",
        previousNightFactorOther: "Stayed up studying",
        breakfastImprovementOptionOther: "More toast options",
      },
    })
    expect(withOtherText.scores).toEqual(withoutOtherText.scores)
  })
})

// --- Excluded demographic and non-behavioral fields ------------------------

describe("excluded fields never affect scoring", () => {
  it("changing gender, hostel, program, or year produces identical scores", () => {
    // AboutYouAnswers isn't even part of ArchetypeInputData — these two
    // calls prove that structurally: the exact same usualRoutine /
    // afterMorningRoutine data is scored while imagining two respondents
    // with completely different demographics.
    const respondentOne = {
      aboutYou: {
        program: "btech-cse",
        programOther: "",
        year: "1",
        hostel: "bakul",
        gender: "woman",
        earlyCommitmentDays: "3",
      },
      ...MEAL_MAXIMIZER_FIXTURE.data,
    }
    const respondentTwo = {
      aboutYou: {
        program: "mtech-mechanical",
        programOther: "",
        year: "5",
        hostel: "kadamba",
        gender: "man",
        earlyCommitmentDays: "0",
      },
      ...MEAL_MAXIMIZER_FIXTURE.data,
    }

    const resultOne = calculateArchetypeResult(respondentOne)
    const resultTwo = calculateArchetypeResult(respondentTwo)
    expect(resultOne.scores).toEqual(resultTwo.scores)
  })

  it("changing the attention-check answer doesn't change any score", () => {
    const base = calculateArchetypeResult(SCHEDULE_JUGGLER_FIXTURE.data)
    const changed = calculateArchetypeResult({
      ...SCHEDULE_JUGGLER_FIXTURE.data,
      afterMorningRoutine: {
        ...SCHEDULE_JUGGLER_FIXTURE.data.afterMorningRoutine,
        influenceRatings: {
          ...SCHEDULE_JUGGLER_FIXTURE.data.afterMorningRoutine.influenceRatings,
          attentionCheckInfluence: "not-at-all",
        },
      },
    })
    expect(changed.scores).toEqual(base.scores)
  })

  it("changing the open-ended improvement suggestion doesn't change any score", () => {
    const base = calculateArchetypeResult(ALTERNATIVE_FORAGER_FIXTURE.data)
    const changed = calculateArchetypeResult({
      ...ALTERNATIVE_FORAGER_FIXTURE.data,
      afterMorningRoutine: {
        ...ALTERNATIVE_FORAGER_FIXTURE.data.afterMorningRoutine,
        breakfastSystemChangeSuggestion:
          "Completely different opinion that should have zero effect on scoring.",
        breakfastImprovementOptions: ["better-menu", "shorter-queues"],
        breakfastImprovementOptionOther: "Something else entirely",
      },
    })
    expect(changed.scores).toEqual(base.scores)
  })
})
