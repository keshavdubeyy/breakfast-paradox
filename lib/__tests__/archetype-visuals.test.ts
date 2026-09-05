import { describe, expect, it } from "vitest"

import { ARCHETYPE_IDS } from "../archetype-content"
import { ARCHETYPE_VISUALS, getArchetypeVisualSrc } from "../archetype-visuals"

describe("archetype → single illustration mapping", () => {
  it.each([
    ["routine-keeper", "/routine-keeper.png"],
    ["sleep-saver", "/Sleep Saver.png"],
    ["schedule-juggler", "/Schedule Juggler.png"],
    ["flexible-switcher", "/Flexible Switcher.png"],
    ["alternative-forager", "/Alternative Forager.png"],
    ["meal-maximizer", "/meal-maximizer.png"],
  ] as const)("%s → %s", (id, expected) => {
    expect(getArchetypeVisualSrc(id)).toBe(expected)
  })

  it("every archetype id resolves to exactly one string path (no per-variant branching)", () => {
    for (const id of ARCHETYPE_IDS) {
      expect(typeof ARCHETYPE_VISUALS[id]).toBe("string")
      expect(ARCHETYPE_VISUALS[id].length).toBeGreaterThan(0)
    }
  })
})

describe("gender never affects the resolved illustration", () => {
  it("getArchetypeVisualSrc's only parameter is the archetype id — there is no gender/variant parameter to pass", () => {
    // Function arity: exactly one declared parameter.
    expect(getArchetypeVisualSrc.length).toBe(1)
  })

  it("the same archetype resolves to the same image regardless of any gender value in scope", () => {
    // There's no gender parameter to thread through at all — calling with
    // just the archetype id, irrespective of any "gender" a caller might
    // have on hand, always yields the identical result.
    const genders = [
      "woman",
      "man",
      "non-binary",
      "transgender-woman",
      "transgender-man",
      "prefer-not-to-say",
      "",
      null,
      undefined,
    ]
    const results = new Set(
      genders.map(() => getArchetypeVisualSrc("sleep-saver"))
    )
    expect(results.size).toBe(1)
    expect([...results][0]).toBe("/Sleep Saver.png")
  })
})
