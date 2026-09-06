import { describe, expect, it } from "vitest"

import { AGREEMENT_STATEMENT_ITEMS } from "@/lib/survey-options"
import {
  AGREEMENT_SHORT_LABEL,
  ROUTINE_MINDSET_FROM_ABSENCE_REASON,
  ROUTINE_MINDSET_FROM_ROUTINE_DESCRIPTION,
  ROUTINE_MINDSET_OPTIONS,
} from "../normalization"

describe("AGREEMENT_SHORT_LABEL", () => {
  it("tags every agreement statement, and only those statements", () => {
    const itemKeys = AGREEMENT_STATEMENT_ITEMS.map((item) => item.key).sort()
    const labelKeys = Object.keys(AGREEMENT_SHORT_LABEL).sort()
    expect(labelKeys).toEqual(itemKeys)
  })
})

describe("Routine Mindset mapping tables", () => {
  const bucketValues = ROUTINE_MINDSET_OPTIONS.map((option) => option.value)

  it("maps every breakfastRoutineDescription (Branch A) value it defines onto a real bucket", () => {
    for (const bucket of Object.values(ROUTINE_MINDSET_FROM_ROUTINE_DESCRIPTION)) {
      expect(bucketValues).toContain(bucket)
    }
  })

  it("maps every breakfastAbsenceReason (Branch C) value it defines onto a real bucket", () => {
    for (const bucket of Object.values(ROUTINE_MINDSET_FROM_ABSENCE_REASON)) {
      expect(bucketValues).toContain(bucket)
    }
  })

  it("agrees with the Branch A mapping on the one literally shared option value", () => {
    expect(ROUTINE_MINDSET_FROM_ROUTINE_DESCRIPTION["depends-on-day"]).toBe(
      ROUTINE_MINDSET_FROM_ABSENCE_REASON["depends-on-day"]
    )
  })
})
