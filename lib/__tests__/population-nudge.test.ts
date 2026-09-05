import { describe, expect, it } from "vitest"

import {
  getPopulationNudgeMessage,
  POPULATION_MIN_SAMPLE_SIZE,
  POPULATION_UNAVAILABLE_MESSAGE,
} from "../population-nudge"

describe("getPopulationNudgeMessage", () => {
  it("shows the 'still learning' message when totalCompleted is below the minimum sample size", () => {
    expect(
      getPopulationNudgeMessage(50, POPULATION_MIN_SAMPLE_SIZE - 1)
    ).toBe(POPULATION_UNAVAILABLE_MESSAGE)
  })

  it("shows the 'still learning' message when data is missing entirely", () => {
    expect(getPopulationNudgeMessage(null, null)).toBe(
      POPULATION_UNAVAILABLE_MESSAGE
    )
    expect(getPopulationNudgeMessage(undefined, undefined)).toBe(
      POPULATION_UNAVAILABLE_MESSAGE
    )
    expect(getPopulationNudgeMessage(50, null)).toBe(
      POPULATION_UNAVAILABLE_MESSAGE
    )
    expect(getPopulationNudgeMessage(null, 84)).toBe(
      POPULATION_UNAVAILABLE_MESSAGE
    )
  })

  it("shows a rounded percentage once N is at least the minimum sample size", () => {
    expect(getPopulationNudgeMessage(19.18, 73)).toBe(
      "19% of respondents so far share a similar breakfast pattern."
    )
    expect(getPopulationNudgeMessage(20, 84)).toBe(
      "20% of respondents so far share a similar breakfast pattern."
    )
  })

  it("treats exactly the minimum sample size as sufficient", () => {
    expect(
      getPopulationNudgeMessage(50, POPULATION_MIN_SAMPLE_SIZE)
    ).toContain("%")
  })

  it("never fabricates a percentage from a number-shaped value without a valid sample size", () => {
    // If a caller mistakenly passed a raw archetype score (e.g. 88) as
    // populationShare without a valid, large-enough totalCompleted, it
    // must not be displayed as a percentage.
    expect(getPopulationNudgeMessage(88, 5)).toBe(
      POPULATION_UNAVAILABLE_MESSAGE
    )
  })
})
