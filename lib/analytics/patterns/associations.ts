// Statistical machinery for Patterns — kept separate from metrics.ts
// (which decides *what* to compute) so the calculations themselves are
// independently testable. Every result here is descriptive: an
// association, never a causal claim — see AssociationStrength's labels.

import type { AssociationStrength, CramersVResult, SpearmanResult } from "./types"
import { MIN_CELL_N } from "./types"

export function associationStrength(effectSize: number): AssociationStrength {
  const magnitude = Math.abs(effectSize)
  if (magnitude < 0.3) return "weak"
  if (magnitude < 0.5) return "moderate"
  return "stronger"
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/** Ranks values 1..n, averaging ranks across ties (the standard approach
 * for Spearman's rho with tied values — e.g. several respondents sharing
 * the same ordinal sleep-time score). */
function rank(values: number[]): number[] {
  const indexed = values.map((value, index) => ({ value, index }))
  indexed.sort((a, b) => a.value - b.value)

  const ranks = new Array<number>(values.length)
  let i = 0
  while (i < indexed.length) {
    let j = i
    while (j + 1 < indexed.length && indexed[j + 1].value === indexed[i].value) {
      j += 1
    }
    // Positions i..j (0-indexed) are tied — 1-indexed average rank.
    const averageRank = (i + 1 + j + 1) / 2
    for (let k = i; k <= j; k += 1) {
      ranks[indexed[k].index] = averageRank
    }
    i = j + 1
  }
  return ranks
}

/** Spearman's rank correlation for paired ordinal/numeric values — `pairs`
 * must already have nulls filtered out by the caller (this file doesn't
 * know which fields are eligible for which respondents, e.g.
 * "no-consistent-time" or "not-applicable" exclusions). Returns null when
 * there's nothing to correlate (n=0) or too few pairs to be meaningful
 * (n below MIN_CELL_N) rather than a misleading rho from a handful of
 * points. */
export function spearman(pairs: [number, number][]): SpearmanResult | null {
  const n = pairs.length
  if (n < MIN_CELL_N) {
    return null
  }

  const xRanks = rank(pairs.map(([x]) => x))
  const yRanks = rank(pairs.map(([, y]) => y))
  const meanX = average(xRanks)
  const meanY = average(yRanks)

  let numerator = 0
  let sumSqX = 0
  let sumSqY = 0
  for (let i = 0; i < n; i += 1) {
    const dx = xRanks[i] - meanX
    const dy = yRanks[i] - meanY
    numerator += dx * dy
    sumSqX += dx * dx
    sumSqY += dy * dy
  }

  const denominator = Math.sqrt(sumSqX * sumSqY)
  const rho = denominator === 0 ? 0 : numerator / denominator

  return {
    method: "spearman",
    rho,
    n,
    strength: associationStrength(rho),
  }
}

/** Cramér's V for two paired categorical arrays (same length, same
 * respondent per index). Returns null below MIN_CELL_N, same reasoning
 * as spearman(). */
export function cramersV(
  xValues: string[],
  yValues: string[]
): CramersVResult | null {
  const n = xValues.length
  if (n < MIN_CELL_N || n !== yValues.length) {
    return null
  }

  const xCategories = Array.from(new Set(xValues))
  const yCategories = Array.from(new Set(yValues))
  if (xCategories.length < 2 || yCategories.length < 2) {
    // No variation in one of the two variables — no association to measure.
    return null
  }

  const xIndex = new Map(xCategories.map((value, i) => [value, i]))
  const yIndex = new Map(yCategories.map((value, i) => [value, i]))

  const table: number[][] = xCategories.map(() => yCategories.map(() => 0))
  for (let i = 0; i < n; i += 1) {
    const xi = xIndex.get(xValues[i])!
    const yi = yIndex.get(yValues[i])!
    table[xi][yi] += 1
  }

  const rowTotals = table.map((row) => row.reduce((sum, count) => sum + count, 0))
  const colTotals = yCategories.map((_, colIndex) =>
    table.reduce((sum, row) => sum + row[colIndex], 0)
  )

  let chiSquare = 0
  for (let i = 0; i < xCategories.length; i += 1) {
    for (let j = 0; j < yCategories.length; j += 1) {
      const expected = (rowTotals[i] * colTotals[j]) / n
      if (expected === 0) continue
      const observed = table[i][j]
      chiSquare += (observed - expected) ** 2 / expected
    }
  }

  const minDimension = Math.min(xCategories.length - 1, yCategories.length - 1)
  const v = minDimension === 0 ? 0 : Math.sqrt(chiSquare / (n * minDimension))

  return {
    method: "cramers-v",
    v,
    n,
    strength: associationStrength(v),
  }
}
