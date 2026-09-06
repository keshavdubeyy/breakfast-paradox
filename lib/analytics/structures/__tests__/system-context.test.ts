import { describe, expect, it } from "vitest"

import { SYSTEM_CONTEXT } from "../system-context"

// 18. System-rule values are never calculated from survey rows — enforced
// here structurally: SYSTEM_CONTEXT is a plain literal (no function of any
// row array can appear inside it), and its values are the fixed facts the
// rest of Structures reads instead of re-deriving inline.
describe("SYSTEM_CONTEXT", () => {
  it("is a plain object of literal facts, not a function of survey data", () => {
    for (const value of Object.values(SYSTEM_CONTEXT)) {
      expect(typeof value === "function").toBe(false)
      expect(["boolean", "string"]).toContain(typeof value)
    }
  })

  it("documents advance registration, automatic allocation, and no same-day cancellation", () => {
    expect(SYSTEM_CONTEXT.registrationIsAdvance).toBe(true)
    expect(SYSTEM_CONTEXT.automaticAllocation).toBe(true)
    expect(SYSTEM_CONTEXT.sameDayCancellationAvailable).toBe(false)
  })
})
