import { describe, expect, it, vi } from "vitest"

import {
  parseAnalyticsRow,
  type RawArchetypeResultRow,
  type RawSurveyResponseRow,
} from "../parse"

function rawResponse(
  overrides: Partial<RawSurveyResponseRow> = {}
): RawSurveyResponseRow {
  return {
    id: "resp-1",
    survey_version: 1,
    created_at: "2026-09-01T08:10:00.000Z",
    started_at: "2026-09-01T08:00:00.000Z",
    duration_seconds: 600,
    duration_minutes: 10,
    about_you: { year: "2", hostel: "parijat", earlyCommitmentDays: "3" },
    usual_routine: { breakfastFrequency: "most-days" },
    after_morning_routine: { influenceRatings: { attentionCheckInfluence: "a-lot" } },
    ...overrides,
  }
}

function rawArchetype(
  overrides: Partial<RawArchetypeResultRow> = {}
): RawArchetypeResultRow {
  return {
    response_id: "resp-1",
    primary_archetype: "routine-keeper",
    secondary_archetype: "sleep-saver",
    confidence: "strong",
    ...overrides,
  }
}

describe("parseAnalyticsRow — branch derivation", () => {
  it.each([
    ["almost-every-day", "A"],
    ["most-days", "A"],
    ["some-days", "B"],
    ["rarely", "C"],
    ["never", "C"],
  ] as const)("%s -> branch %s", (breakfastFrequency, expectedBranch) => {
    const row = parseAnalyticsRow(
      rawResponse({ usual_routine: { breakfastFrequency } }),
      null
    )
    expect(row.branch).toBe(expectedBranch)
  })

  it("returns null branch when breakfastFrequency is missing", () => {
    const row = parseAnalyticsRow(rawResponse({ usual_routine: {} }), null)
    expect(row.branch).toBeNull()
    expect(row.breakfastFrequency).toBeNull()
  })
})

describe("parseAnalyticsRow — archetype linkage", () => {
  it("flags hasArchetypeResult and copies fields when a matching result exists", () => {
    const row = parseAnalyticsRow(rawResponse(), rawArchetype())
    expect(row.hasArchetypeResult).toBe(true)
    expect(row.primaryArchetype).toBe("routine-keeper")
    expect(row.secondaryArchetype).toBe("sleep-saver")
    expect(row.archetypeConfidence).toBe("strong")
  })

  it("leaves archetype fields null when no result is linked", () => {
    const row = parseAnalyticsRow(rawResponse(), null)
    expect(row.hasArchetypeResult).toBe(false)
    expect(row.primaryArchetype).toBeNull()
    expect(row.secondaryArchetype).toBeNull()
    expect(row.archetypeConfidence).toBeNull()
  })

  it("never trusts an invalid archetype id or confidence value from the database", () => {
    const row = parseAnalyticsRow(
      rawResponse(),
      rawArchetype({
        primary_archetype: "not-a-real-archetype",
        confidence: "somewhat",
      })
    )
    expect(row.primaryArchetype).toBeNull()
    expect(row.archetypeConfidence).toBeNull()
  })
})

describe("parseAnalyticsRow — attention check", () => {
  it("passes when the row matches the expected value", () => {
    const row = parseAnalyticsRow(rawResponse(), null)
    expect(row.attentionCheckPassed).toBe(true)
  })

  it("fails when the row holds a different value", () => {
    const row = parseAnalyticsRow(
      rawResponse({
        after_morning_routine: {
          influenceRatings: { attentionCheckInfluence: "not-at-all" },
        },
      }),
      null
    )
    expect(row.attentionCheckPassed).toBe(false)
  })

  it("is null (not false) when the row is missing entirely", () => {
    const row = parseAnalyticsRow(
      rawResponse({ after_morning_routine: {} }),
      null
    )
    expect(row.attentionCheckPassed).toBeNull()
  })
})

describe("parseAnalyticsRow — unknown survey version", () => {
  it("falls back to v1 field accessors instead of throwing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    // 999 is deliberately never registered in FIELD_ACCESSORS_BY_VERSION —
    // versions 1 and 2 are both real, accessor-backed versions now.
    const row = parseAnalyticsRow(rawResponse({ survey_version: 999 }), null)
    expect(row.breakfastFrequency).toBe("most-days")
    expect(row.surveyVersion).toBe(999)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})

describe("parseAnalyticsRow — nonBreakfastMealSource version handling", () => {
  it("v1: wraps the old single-string answer into a one-element array", () => {
    const row = parseAnalyticsRow(
      rawResponse({
        survey_version: 1,
        after_morning_routine: { nonBreakfastMealSource: "buy-vc-canteen" },
      }),
      null
    )
    expect(row.nonBreakfastMealSource).toEqual(["buy-vc-canteen"])
  })

  it("v1: an unanswered field becomes an empty array, not [null]", () => {
    const row = parseAnalyticsRow(
      rawResponse({ survey_version: 1, after_morning_routine: {} }),
      null
    )
    expect(row.nonBreakfastMealSource).toEqual([])
  })

  it("v2: reads the field natively as an array (checkboxes)", () => {
    const row = parseAnalyticsRow(
      rawResponse({
        survey_version: 2,
        after_morning_routine: {
          nonBreakfastMealSource: ["buy-vc-canteen", "order-online"],
        },
      }),
      null
    )
    expect(row.nonBreakfastMealSource).toEqual(["buy-vc-canteen", "order-online"])
  })

  it("v2: an unanswered field becomes an empty array", () => {
    const row = parseAnalyticsRow(
      rawResponse({ survey_version: 2, after_morning_routine: {} }),
      null
    )
    expect(row.nonBreakfastMealSource).toEqual([])
  })
})
