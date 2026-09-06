// Display adapters — pure reshaping of already-validated Structures
// metrics into the shape existing chart primitives expect (StackedBarRow
// for a 100%-stacked composition, RankedBucket for a ranked horizontal
// bar). Nothing here recomputes a statistic, same convention as
// lib/analytics/patterns/display.ts.

import type { RankedBucket } from "@/components/admin/charts/ranked-bar-chart"
import type { StackedBarRowData, StackedBarSegmentDef } from "@/components/admin/charts/stacked-percentage-bar"
import { categoricalColorVar } from "@/components/admin/charts/palette"
import { UNKNOWN_VALUE } from "../distributions"
import type { BranchFieldSummary } from "../patterns/branch-deep-dive"
import { BRANCH_LABELS, BRANCHES } from "../patterns/normalization"
import { INFLUENCE_CATEGORY, INFLUENCE_CATEGORY_LABEL } from "./normalization"
import type { MessFoodQualityByBranch, PlanChangeActions, RankedPrevalence } from "./metrics"
import { sampleFlag, type InfluenceRanking, type WholeSampleDistribution } from "./types"

export interface SingleRowBarDisplay {
  rows: StackedBarRowData[]
  segments: StackedBarSegmentDef[]
}

/** Buckets rendered muted-gray rather than a categorical color — an
 * "unanswered" bucket, or an explicitly non-ordinal escape hatch like
 * "not enough experience" (messFoodQuality) that must never blend into
 * the quality ramp as if it were a real quality rating. */
const MUTED_SEGMENT_VALUES = new Set<string>([UNKNOWN_VALUE, "not-enough-experience"])

function segmentColor(value: string, index: number): string {
  return MUTED_SEGMENT_VALUES.has(value) ? "var(--muted-foreground)" : categoricalColorVar(index)
}

function distributionToSingleRowBar(
  distribution: { value: string; label: string; count: number; percentage: number }[],
  n: number,
  rowLabel: string,
  rowKey: string = "all"
): SingleRowBarDisplay {
  const segments: StackedBarSegmentDef[] = distribution.map((bucket, index) => ({
    key: bucket.value,
    label: bucket.label,
    colorVar: segmentColor(bucket.value, index),
  }))
  const percentageBySegment: Record<string, number> = {}
  const countBySegment: Record<string, number> = {}
  for (const bucket of distribution) {
    percentageBySegment[bucket.value] = bucket.percentage
    countBySegment[bucket.value] = bucket.count
  }
  return {
    segments,
    rows: [
      {
        key: rowKey,
        label: rowLabel,
        n,
        flag: sampleFlag(n),
        percentageBySegment,
        countBySegment,
      },
    ],
  }
}

/** messDecision / breakfastPlanChangeFrequency / messFoodQuality — asked
 * of everyone, so the single row's n is the whole eligible sample. */
export function wholeSampleDistributionToSingleRowBar(
  result: WholeSampleDistribution,
  rowLabel: string
): SingleRowBarDisplay {
  return distributionToSingleRowBar(result.distribution, result.eligibility.answered, rowLabel)
}

/** Food quality split by breakfast branch (regular / conditional / rare
 * eaters) — one 100%-stacked row per branch, all sharing the same quality
 * segments/colors as the whole-sample view above, so the two charts read
 * as the same scale split three ways rather than a different chart. */
export function messFoodQualityByBranchToBars(result: MessFoodQualityByBranch): SingleRowBarDisplay {
  const perBranch = BRANCHES.map((branch) =>
    distributionToSingleRowBar(
      result[branch].distribution,
      result[branch].eligibility.answered,
      BRANCH_LABELS[branch],
      branch
    )
  )
  return {
    segments: perBranch[0]?.segments ?? [],
    rows: perBranch.map((bar) => bar.rows[0]),
  }
}

/** messConsistency (Branch A only) — same shape, branch-gated upstream by
 * computeBranchDeepDive rather than re-derived here. */
export function branchFieldToSingleRowBar(
  field: BranchFieldSummary,
  rowLabel: string
): SingleRowBarDisplay {
  return distributionToSingleRowBar(field.distribution, field.eligibility.answered, rowLabel)
}

function byDescendingPercentage<T extends { percentage: number }>(a: T, b: T): number {
  return b.percentage - a.percentage
}

/** messChangeDeterminants / unwantedMessActions / unusedAllottedMealActions
 * — branch-gated multi-select fields, sorted by prevalence for display
 * (branch-deep-dive.ts itself preserves option order, since Patterns never
 * needed a ranked view of these; Structures does, per spec). */
export function branchFieldToRankedBuckets(field: BranchFieldSummary): RankedBucket[] {
  return [...field.distribution].sort(byDescendingPercentage)
}

export function planChangeActionsToRankedBuckets(result: PlanChangeActions): RankedBucket[] {
  return [...result.distribution].sort(byDescendingPercentage)
}

export function rankedPrevalenceToBuckets(result: RankedPrevalence): RankedBucket[] {
  return [...result.distribution].sort(byDescendingPercentage)
}

/** Biggest influence (§11) — same ranked-prevalence shape, with the
 * analyst-defined system/personal/alternative tag appended to the label
 * (there is no dedicated "category badge" slot in the shared ranked-bar
 * chart, so the tag travels in the label text; the full breakdown is
 * still available, tagged in its own column, in the View data table). */
export function biggestInfluenceToRankedBuckets(result: RankedPrevalence): RankedBucket[] {
  return [...result.distribution]
    .map((bucket) => {
      const category = INFLUENCE_CATEGORY[bucket.value]
      const tag = category ? INFLUENCE_CATEGORY_LABEL[category] : undefined
      return tag ? { ...bucket, label: `${bucket.label} — ${tag}` } : bucket
    })
    .sort(byDescendingPercentage)
}

/** Structural Drivers (§10) / Service environment (§9B) / Alternative
 * ecosystem (§9C) — an InfluenceRanking's top-box percentage/count reshaped
 * into a ranked bar, category tag appended the same way as above. */
export function influenceRankingToRankedBuckets(
  ranking: InfluenceRanking,
  options: { withCategory?: boolean } = {}
): RankedBucket[] {
  return ranking.rows
    .map((row) => ({
      value: row.key,
      label: options.withCategory && row.category ? `${row.label} — ${row.category}` : row.label,
      count: row.topBoxCount,
      percentage: row.topBoxPercentage ?? 0,
      flag: row.flag,
    }))
    .sort(byDescendingPercentage)
}
