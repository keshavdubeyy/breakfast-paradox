import { describe, expect, it } from "vitest"

import { associationStrength, cramersV, spearman } from "../associations"

describe("associationStrength", () => {
  it("labels by magnitude, sign-independent", () => {
    expect(associationStrength(0.1)).toBe("weak")
    expect(associationStrength(-0.1)).toBe("weak")
    expect(associationStrength(0.35)).toBe("moderate")
    expect(associationStrength(-0.35)).toBe("moderate")
    expect(associationStrength(0.7)).toBe("stronger")
    expect(associationStrength(-0.7)).toBe("stronger")
  })
})

describe("spearman", () => {
  it("returns null below the minimum cell size", () => {
    expect(spearman([[1, 1], [2, 2], [3, 3]])).toBeNull()
  })

  it("rho = 1 for a perfectly increasing relationship", () => {
    const pairs: [number, number][] = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
    const result = spearman(pairs)
    expect(result).not.toBeNull()
    expect(result!.rho).toBeCloseTo(1, 5)
    expect(result!.n).toBe(5)
    expect(result!.strength).toBe("stronger")
  })

  it("rho = -1 for a perfectly decreasing relationship", () => {
    const pairs: [number, number][] = [[1, 5], [2, 4], [3, 3], [4, 2], [5, 1]]
    const result = spearman(pairs)
    expect(result!.rho).toBeCloseTo(-1, 5)
  })

  it("handles tied values via average ranks without throwing", () => {
    const pairs: [number, number][] = [[1, 1], [1, 1], [2, 3], [2, 3], [3, 5]]
    const result = spearman(pairs)
    expect(result).not.toBeNull()
    expect(result!.rho).toBeGreaterThan(0.9)
  })

  it("rho near 0 when there's no relationship", () => {
    const pairs: [number, number][] = [[1, 3], [2, 1], [3, 5], [4, 2], [5, 4]]
    const result = spearman(pairs)
    expect(Math.abs(result!.rho)).toBeLessThan(0.5)
  })
})

describe("cramersV", () => {
  it("returns null below the minimum cell size", () => {
    expect(cramersV(["a", "b"], ["x", "y"])).toBeNull()
  })

  it("returns null when one variable has no variation", () => {
    expect(
      cramersV(["a", "a", "a", "a", "a"], ["x", "y", "x", "y", "x"])
    ).toBeNull()
  })

  it("V is high for a perfect (deterministic) association", () => {
    const x = ["a", "a", "a", "b", "b", "b", "a", "a", "a", "b"]
    const y = ["x", "x", "x", "y", "y", "y", "x", "x", "x", "y"]
    const result = cramersV(x, y)
    expect(result).not.toBeNull()
    expect(result!.v).toBeCloseTo(1, 5)
    expect(result!.strength).toBe("stronger")
  })

  it("V is near 0 for independent variables", () => {
    const x = ["a", "b", "a", "b", "a", "b", "a", "b", "a", "b"]
    const y = ["x", "x", "y", "y", "x", "x", "y", "y", "x", "y"]
    const result = cramersV(x, y)
    expect(result).not.toBeNull()
    expect(result!.v).toBeLessThan(0.3)
  })
})
