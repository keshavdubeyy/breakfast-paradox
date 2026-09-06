// Display adapters — pure reshaping of already-validated Mental Models
// metrics into the shape existing/new chart primitives expect. Nothing
// here recomputes a statistic, same convention as
// lib/analytics/patterns/display.ts and lib/analytics/structures/display.ts.

import { ARCHETYPES, type ArchetypeId } from "@/lib/archetype-content"
import { AGREEMENT_SCALE_OPTIONS } from "@/lib/survey-options"
import type { LikertRowData, LikertSegmentDef } from "@/components/admin/charts/diverging-likert-bar"
import type { DonutSegmentData } from "@/components/admin/charts/donut-chart"
import type { RankedBucket } from "@/components/admin/charts/ranked-bar-chart"
import { categoricalColorVar } from "@/components/admin/charts/palette"
import { ROUTINE_MINDSET_OPTIONS } from "./normalization"
import { sampleFlag, type AgreementOverview, type RoutineMindsetResult, type SampleFlag, type WholeSampleDistribution } from "./types"

/** Fixed diverging pair for the 5-point agreement scale — disagreement
 * in the negative (red) hue, agreement in the positive (blue) hue,
 * neutral as the gray midpoint. Two intensities per side so "strongly"
 * reads as more saturated than a plain "agree/disagree", using the same
 * diverging tokens Patterns' DivergingCompositionBar already validated. */
export const AGREEMENT_LIKERT_SEGMENTS: LikertSegmentDef[] = AGREEMENT_SCALE_OPTIONS.map((option) => {
  switch (option.value) {
    case "strongly-disagree":
      return { key: option.value, label: option.label, colorVar: "var(--diverging-negative)" }
    case "disagree":
      return { key: option.value, label: option.label, colorVar: "color-mix(in oklab, var(--diverging-negative) 55%, var(--diverging-neutral))" }
    case "neutral":
      return { key: option.value, label: option.label, colorVar: "var(--diverging-neutral)" }
    case "agree":
      return { key: option.value, label: option.label, colorVar: "color-mix(in oklab, var(--diverging-positive) 55%, var(--diverging-neutral))" }
    default:
      return { key: option.value, label: option.label, colorVar: "var(--diverging-positive)" }
  }
})

/** Agreement statements, sorted by agree+strongly-agree share (dominant
 * belief first) — the chart's row order is the same ranking the snapshot
 * cards use, so the top row and "Dominant Belief" card always agree. */
export function agreementOverviewToLikertRows(overview: AgreementOverview): LikertRowData[] {
  return [...overview.statements]
    .sort((a, b) => (b.agreeShare ?? -1) - (a.agreeShare ?? -1))
    .map((statement) => {
      const percentageBySegment: Record<string, number> = {}
      for (const bucket of statement.distribution) {
        percentageBySegment[bucket.value] = bucket.percentage
      }
      return {
        key: statement.key,
        label: statement.label,
        n: statement.n,
        flag: statement.flag,
        percentageBySegment,
      }
    })
}

const ROUTINE_MINDSET_COLOR: Record<string, string> = {
  "actively-decided": categoricalColorVar(0),
  "habit-automatic": categoricalColorVar(1),
  "depends-on-day": categoricalColorVar(2),
  "in-the-moment": categoricalColorVar(3),
}

export function routineMindsetToDonutSegments(result: RoutineMindsetResult): {
  segments: DonutSegmentData[]
  n: number
  flag: SampleFlag
} {
  const n = result.eligibility.answered
  return {
    n,
    flag: sampleFlag(n),
    segments: result.distribution.map((bucket) => ({
      key: bucket.value,
      label: ROUTINE_MINDSET_OPTIONS.find((o) => o.value === bucket.value)?.label ?? bucket.label,
      percentage: bucket.percentage,
      count: bucket.count,
      flag: bucket.flag,
      colorVar: ROUTINE_MINDSET_COLOR[bucket.value] ?? categoricalColorVar(4),
    })),
  }
}

function distributionToRankedBuckets(result: WholeSampleDistribution): RankedBucket[] {
  return [...result.distribution]
    .sort((a, b) => b.percentage - a.percentage)
    .map((bucket) => ({
      value: bucket.value,
      label: bucket.label,
      count: bucket.count,
      percentage: bucket.percentage,
      flag: bucket.flag,
    }))
}

export function mealValuePerceptionToRankedBuckets(result: WholeSampleDistribution): RankedBucket[] {
  return distributionToRankedBuckets(result)
}

export function motivationsToRankedBuckets(result: WholeSampleDistribution): RankedBucket[] {
  return distributionToRankedBuckets(result)
}

export interface ArchetypeCardDisplay {
  id: ArchetypeId
  name: string
  tagline: string
  percentage: number | null
  n: number
  flag: SampleFlag
}

/** Archetype distribution + its own display content (name/tagline) —
 * framed as supporting synthesis (does the quiz-derived archetype line
 * up with these same beliefs), not as primary mental-model evidence;
 * primary evidence is the agreement statements above. Respondents with no
 * archetype result (quiz not completed) are excluded from this card grid
 * — this shows the six real archetypes only, not a "not set" pseudo-card. */
export function archetypesToCards(result: WholeSampleDistribution): ArchetypeCardDisplay[] {
  return result.distribution
    .filter((bucket) => bucket.value in ARCHETYPES)
    .map((bucket) => {
      const id = bucket.value as ArchetypeId
      const info = ARCHETYPES[id]
      return {
        id,
        name: info?.name ?? bucket.label,
        tagline: info?.tagline ?? "",
        percentage: bucket.flag === "suppressed" ? null : bucket.percentage,
        n: result.eligibility.answered,
        flag: bucket.flag,
      }
    })
}
