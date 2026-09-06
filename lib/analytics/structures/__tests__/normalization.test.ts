import { describe, expect, it } from "vitest"

import { SUBSTANTIVE_INFLUENCE_ITEMS } from "../../patterns/normalization"
import {
  ALTERNATIVE_ECOSYSTEM_ITEMS,
  INFLUENCE_CATEGORY,
  SERVICE_ENVIRONMENT_ITEMS,
  STRUCTURAL_DRIVER_CATEGORY,
  STRUCTURAL_DRIVER_ITEMS,
} from "../normalization"

describe("STRUCTURAL_DRIVER_CATEGORY", () => {
  it("tags every Structural Driver item, and only those items", () => {
    const itemKeys = STRUCTURAL_DRIVER_ITEMS.map((item) => item.key).sort()
    const categoryKeys = Object.keys(STRUCTURAL_DRIVER_CATEGORY).sort()
    expect(categoryKeys).toEqual(itemKeys)
  })

  it("is exactly the union of Service environment and Alternative ecosystem items", () => {
    const union = [...SERVICE_ENVIRONMENT_ITEMS, ...ALTERNATIVE_ECOSYSTEM_ITEMS]
      .map((item) => item.key)
      .sort()
    expect(STRUCTURAL_DRIVER_ITEMS.map((item) => item.key).sort()).toEqual(union)
  })
})

describe("INFLUENCE_CATEGORY", () => {
  it("covers every substantive influence item (all 14 non-attention-check rows), and only those", () => {
    const substantiveKeys = SUBSTANTIVE_INFLUENCE_ITEMS.map((item) => item.key).sort()
    const categoryKeys = Object.keys(INFLUENCE_CATEGORY).sort()
    expect(categoryKeys).toEqual(substantiveKeys)
  })

  it("only ever assigns system / personal / alternative", () => {
    for (const category of Object.values(INFLUENCE_CATEGORY)) {
      expect(["system", "personal", "alternative"]).toContain(category)
    }
  })
})
