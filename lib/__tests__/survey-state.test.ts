import { describe, expect, it } from "vitest"

import {
  clearInactiveBreakfastBranchFields,
  defaultUsualRoutineAnswers,
} from "../survey-state"

describe("clearInactiveBreakfastBranchFields", () => {
  it("clears Branch A's fields when switching to Branch B (some-days)", () => {
    const staleFromBranchA = {
      ...defaultUsualRoutineAnswers,
      breakfastFrequency: "some-days",
      messBreakfastTime: "before-730am",
      breakfastRoutineDescription: "actively-plan",
      missedBreakfastReasons: ["woke-up-later"],
    }

    const cleaned = clearInactiveBreakfastBranchFields(staleFromBranchA)

    expect(cleaned.messBreakfastTime).toBe("")
    expect(cleaned.breakfastRoutineDescription).toBe("")
    expect(cleaned.missedBreakfastReasons).toEqual([])
    // The current branch (B) fields and the frequency answer itself are
    // left alone by this call (they aren't set in this fixture, but
    // proving the function doesn't touch breakfastFrequency matters).
    expect(cleaned.breakfastFrequency).toBe("some-days")
  })

  it("clears Branch B's fields when switching to Branch A (most-days)", () => {
    const staleFromBranchB = {
      ...defaultUsualRoutineAnswers,
      breakfastFrequency: "most-days",
      breakfastDecisionPoint: "varies",
      breakfastPlanChangeReasons: ["unexpected-event"],
    }

    const cleaned = clearInactiveBreakfastBranchFields(staleFromBranchB)

    expect(cleaned.breakfastDecisionPoint).toBe("")
    expect(cleaned.breakfastPlanChangeReasons).toEqual([])
  })

  it("clears Branch A and B's fields when switching to Branch C (never)", () => {
    const staleFromAAndB = {
      ...defaultUsualRoutineAnswers,
      breakfastFrequency: "never",
      messBreakfastTime: "before-730am",
      breakfastDecisionPoint: "varies",
    }

    const cleaned = clearInactiveBreakfastBranchFields(staleFromAAndB)

    expect(cleaned.messBreakfastTime).toBe("")
    expect(cleaned.breakfastDecisionPoint).toBe("")
  })

  it("preserves the currently-active branch's own fields", () => {
    const branchAInProgress = {
      ...defaultUsualRoutineAnswers,
      breakfastFrequency: "almost-every-day",
      messBreakfastTime: "before-730am",
      breakfastRoutineDescription: "actively-plan",
    }

    const cleaned = clearInactiveBreakfastBranchFields(branchAInProgress)

    expect(cleaned.messBreakfastTime).toBe("before-730am")
    expect(cleaned.breakfastRoutineDescription).toBe("actively-plan")
  })

  it("never touches shared fields outside the three branches", () => {
    const values = {
      ...defaultUsualRoutineAnswers,
      breakfastFrequency: "some-days",
      sleepTimeWeekday: "after-3am",
      messDecision: "not-sure",
      breakfastMotivationFactors: ["already-paid"],
      // stale Branch A data that should get cleared
      messBreakfastTime: "before-730am",
    }

    const cleaned = clearInactiveBreakfastBranchFields(values)

    expect(cleaned.sleepTimeWeekday).toBe("after-3am")
    expect(cleaned.messDecision).toBe("not-sure")
    expect(cleaned.breakfastMotivationFactors).toEqual(["already-paid"])
    expect(cleaned.messBreakfastTime).toBe("")
  })

  it("clears every branch's fields when breakfastFrequency is unanswered", () => {
    const values = {
      ...defaultUsualRoutineAnswers,
      breakfastFrequency: "",
      messBreakfastTime: "before-730am",
      breakfastDecisionPoint: "varies",
      occasionalBreakfastFrequency: "yes-sometimes",
    }

    const cleaned = clearInactiveBreakfastBranchFields(values)

    expect(cleaned.messBreakfastTime).toBe("")
    expect(cleaned.breakfastDecisionPoint).toBe("")
    expect(cleaned.occasionalBreakfastFrequency).toBe("")
  })
})
