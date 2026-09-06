// Metrics for the Events page — observable behaviour only. Strict rule
// (per the page spec): no correlations, no "why", no structural
// interpretation. Every function here answers "what happened", and
// leaves "why" to the Patterns/Structures/Mental Models pages.

import {
  BREAKFAST_CHANGE_ACTION_OPTIONS,
  BREAKFAST_FREQUENCY_OPTIONS,
  BREAKFAST_PLAN_CHANGE_REASON_OPTIONS,
  BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS,
  COMPARISON_ROW_ITEMS,
  COMPARISON_SCALE_OPTIONS,
  FREQUENCY_OPTIONS,
  MISSED_BREAKFAST_FREQUENCY_OPTIONS,
  MISSED_BREAKFAST_REASON_OPTIONS,
  NEXT_FOOD_TIME_OPTIONS,
  NON_BREAKFAST_MEAL_SOURCE_OPTIONS,
  NON_BREAKFAST_SPENDING_AMOUNT_OPTIONS,
  NON_BREAKFAST_SPENDING_FREQUENCY_OPTIONS,
  UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS,
} from "@/lib/survey-options"
import {
  buildMultiSelectDistribution,
  buildOrderedDistribution,
  percentageOf,
  type DistributionBucket,
} from "./distributions"
import type { AnalyticsRow, Branch } from "./types"

// --- Generic row filters, used for chart drill-downs -----------------------

/** Rows where `field` equals `value` — pass `null` to match the "Not set"
 * bucket (a distribution's UNKNOWN_VALUE bucket always means the field
 * was null on the underlying row). */
export function filterRowsByField<K extends keyof AnalyticsRow>(
  rows: AnalyticsRow[],
  field: K,
  value: AnalyticsRow[K] | null
): AnalyticsRow[] {
  return rows.filter((row) => row[field] === value)
}

/** Rows whose array-valued `field` includes `value` (multi-select
 * drill-down — a row can match more than one bucket). */
export function filterRowsByArrayField(
  rows: AnalyticsRow[],
  field: {
    [K in keyof AnalyticsRow]: AnalyticsRow[K] extends string[] ? K : never
  }[keyof AnalyticsRow],
  value: string
): AnalyticsRow[] {
  return rows.filter((row) => (row[field] as string[]).includes(value))
}

// --- 1. Top event cards ------------------------------------------------

export interface KeyEventMetric {
  label: string
  description: string
  percentage: number | null
  count: number
  denominator: number
}

const PLAN_CHANGE_REDIRECT_VALUES = [
  "exchange",
  "sell",
  "give-away",
  "buy-others-meal",
  "leave-unused",
]
const UNUSED_ALLOTTED_REDIRECT_VALUES = [
  "sell",
  "exchange",
  "give-away",
  "leave-unused",
  "try-transfer-sometimes-cant",
]

export function computeKeyEventMetrics(rows: AnalyticsRow[]): KeyEventMetric[] {
  const withFrequency = rows.filter((row) => row.breakfastFrequency !== null)
  const notEveryDay = withFrequency.filter(
    (row) => row.breakfastFrequency !== "almost-every-day"
  )

  const withPlanChangeFrequency = rows.filter(
    (row) => row.breakfastPlanChangeFrequency !== null
  )
  const planChanges = withPlanChangeFrequency.filter(
    (row) => row.breakfastPlanChangeFrequency !== "never"
  )

  const withSpendingFrequency = rows.filter(
    (row) => row.nonBreakfastSpendingFrequency !== null
  )
  const spendsBeforeLunch = withSpendingFrequency.filter(
    (row) => row.nonBreakfastSpendingFrequency !== "never"
  )

  const askedAboutUnusedMeals = rows.filter(
    (row) =>
      row.breakfastPlanChangeActions.length > 0 ||
      row.unusedAllottedMealActions.length > 0
  )
  const redirectedOrUnused = askedAboutUnusedMeals.filter(
    (row) =>
      row.breakfastPlanChangeActions.some((action) =>
        PLAN_CHANGE_REDIRECT_VALUES.includes(action)
      ) ||
      row.unusedAllottedMealActions.some((action) =>
        UNUSED_ALLOTTED_REDIRECT_VALUES.includes(action)
      )
  )

  return [
    {
      label: "Don't eat at the mess every day",
      description: "Breakfast frequency is anything other than “almost every day.”",
      percentage:
        withFrequency.length === 0
          ? null
          : percentageOf(notEveryDay.length, withFrequency.length),
      count: notEveryDay.length,
      denominator: withFrequency.length,
    },
    {
      label: "Plans change after cancellation closes",
      description:
        "Breakfast plan changes at least sometimes after it's too late to cancel.",
      percentage:
        withPlanChangeFrequency.length === 0
          ? null
          : percentageOf(planChanges.length, withPlanChangeFrequency.length),
      count: planChanges.length,
      denominator: withPlanChangeFrequency.length,
    },
    {
      label: "Buy or eat something else before lunch",
      description:
        "Spend money on food/drinks before lunch at least sometimes, on days without mess breakfast.",
      percentage:
        withSpendingFrequency.length === 0
          ? null
          : percentageOf(spendsBeforeLunch.length, withSpendingFrequency.length),
      count: spendsBeforeLunch.length,
      denominator: withSpendingFrequency.length,
    },
    {
      label: "Meals left unused or redirected",
      description:
        "Reported exchanging, selling, giving away, leaving unused, or trying to transfer a mess breakfast.",
      percentage:
        askedAboutUnusedMeals.length === 0
          ? null
          : percentageOf(redirectedOrUnused.length, askedAboutUnusedMeals.length),
      count: redirectedOrUnused.length,
      denominator: askedAboutUnusedMeals.length,
    },
  ]
}

// --- Redirect-destination breakdown, for the Iceberg Summary's "meals
// left unused or redirected" headline — a plain-language "where did it
// go" breakdown, not a new metric. The underlying answer comes from two
// different multi-select fields depending on which branch a respondent
// is in (breakfastPlanChangeActions for anyone whose plan changes,
// unusedAllottedMealActions for branch C specifically), so a canonical
// destination merges the semantically-equivalent values from both
// fields into one bucket, tallied over the same `askedAboutUnusedMeals`
// population computeKeyEventMetrics already uses for this card's own
// percentage — same denominator, so the breakdown always adds up
// consistently with the headline figure it supports. */
export interface DestinationBucket {
  label: string
  count: number
  percentage: number
}

const REDIRECT_DESTINATIONS: {
  label: string
  planChangeValues: string[]
  unusedAllottedValues: string[]
}[] = [
  { label: "exchanged it with another student", planChangeValues: ["exchange"], unusedAllottedValues: ["exchange"] },
  { label: "left it unused", planChangeValues: ["leave-unused"], unusedAllottedValues: ["leave-unused"] },
  { label: "gave it away", planChangeValues: ["give-away"], unusedAllottedValues: ["give-away"] },
  { label: "sold it", planChangeValues: ["sell"], unusedAllottedValues: ["sell"] },
  { label: "took another student's allotted meal instead", planChangeValues: ["buy-others-meal"], unusedAllottedValues: [] },
  { label: "tried to transfer it but sometimes couldn't", planChangeValues: [], unusedAllottedValues: ["try-transfer-sometimes-cant"] },
]

export function computeRedirectDestinationBreakdown(rows: AnalyticsRow[]): {
  buckets: DestinationBucket[]
  denominator: number
} {
  const askedAboutUnusedMeals = rows.filter(
    (row) =>
      row.breakfastPlanChangeActions.length > 0 ||
      row.unusedAllottedMealActions.length > 0
  )
  const denominator = askedAboutUnusedMeals.length

  const buckets = REDIRECT_DESTINATIONS.map((destination) => {
    const count = askedAboutUnusedMeals.filter(
      (row) =>
        destination.planChangeValues.some((value) => row.breakfastPlanChangeActions.includes(value)) ||
        destination.unusedAllottedValues.some((value) => row.unusedAllottedMealActions.includes(value))
    ).length
    return { label: destination.label, count, percentage: percentageOf(count, denominator) }
  })

  return { buckets, denominator }
}

// --- 8. Self-reported effects before lunch (comparisonRatings) --------

const SCALE_POSITION: Record<string, number> = {
  "much-lower": -2,
  "slightly-lower": -1,
  "about-the-same": 0,
  "slightly-higher": 1,
  "much-higher": 2,
}

export interface ScaleRowSummary {
  key: string
  label: string
  helperText?: string
  distribution: DistributionBucket[]
  /** -2 (much lower) to +2 (much higher), averaged over rows that gave a
   * comparable answer — "can't really compare" responses are excluded
   * from the average but still counted in `distribution`. Null when
   * nobody gave a comparable answer. */
  averagePosition: number | null
  respondedCount: number
}

export function computeComparisonRatingSummaries(
  rows: AnalyticsRow[]
): ScaleRowSummary[] {
  return COMPARISON_ROW_ITEMS.map((item) => {
    const responded = rows.filter(
      (row) => row.comparisonRatings[item.key] !== undefined
    )
    const comparable = responded
      .map((row) => row.comparisonRatings[item.key])
      .filter((value) => value in SCALE_POSITION)

    return {
      key: item.key,
      label: item.label,
      helperText: item.helperText,
      distribution: buildOrderedDistribution(
        responded,
        (row) => row.comparisonRatings[item.key] ?? null,
        COMPARISON_SCALE_OPTIONS
      ),
      averagePosition:
        comparable.length === 0
          ? null
          : comparable.reduce((sum, value) => sum + SCALE_POSITION[value], 0) /
            comparable.length,
      respondedCount: responded.length,
    }
  })
}

// --- 9. Reported breakfast pathways (Sankey) ---------------------------

export interface PathwaySankeyNode {
  name: string
  /** Total respondent count flowing through this node — incoming links
   * summed where the node has any (every node but the root), otherwise
   * outgoing. Baked in here (rather than left to a chart tooltip) so the
   * label can show a count without needing Recharts' Sankey tooltip
   * wired up to a non-standard payload shape.
   *
   * Deliberately NOT called `value` — Recharts' Sankey layout algorithm
   * computes and overwrites a node payload's `value` field itself
   * (`max(incoming, outgoing)`, see node_modules/recharts/lib/chart/
   * Sankey.js), so a same-named field here gets silently clobbered
   * before the custom node renderer ever sees it. */
  respondentCount: number
}
export interface PathwaySankeyLink {
  source: number
  target: number
  value: number
}
export interface PathwaySankeyData {
  nodes: PathwaySankeyNode[]
  links: PathwaySankeyLink[]
}

const BRANCH_LABELS: Record<Branch, string> = {
  A: "Regular eaters",
  B: "Conditional eaters",
  C: "Rare / non-eaters",
}

/** Every edge here is a real per-respondent linkage: branch is derived
 * from breakfastFrequency on the same row, and the plan-change split
 * uses that same row's breakfastPlanChangeFrequency. The final layer
 * (specific actions) is a multi-select, so those link weights are
 * selection counts, not mutually-exclusive respondents — labelled as
 * such in the UI rather than implied to sum to the node above them.
 * What students do *after skipping* breakfast (a different question,
 * asked of everyone regardless of branch) is deliberately left out of
 * this diagram and shown as its own charts instead, since chaining it
 * on here would imply a per-respondent link the data doesn't actually
 * support. */
export function buildBreakfastPathwaySankey(
  rows: AnalyticsRow[]
): PathwaySankeyData {
  const nodeLabels: string[] = []
  const nodeIndex = new Map<string, number>()

  function nodeFor(key: string, label: string): number {
    let index = nodeIndex.get(key)
    if (index === undefined) {
      index = nodeLabels.length
      nodeLabels.push(label)
      nodeIndex.set(key, index)
    }
    return index
  }

  const links: PathwaySankeyLink[] = []
  function addLink(
    source: { key: string; label: string },
    target: { key: string; label: string },
    value: number
  ) {
    if (value <= 0) return
    links.push({
      source: nodeFor(source.key, source.label),
      target: nodeFor(target.key, target.label),
      value,
    })
  }

  const ROOT = { key: "root", label: "All respondents" }
  const STAYS_FIXED = { key: "stays-fixed", label: "Plan stays fixed" }
  const CHANGES = { key: "changes", label: "Plan changes at least sometimes" }

  const changingRowsAcrossBranches: AnalyticsRow[] = []

  for (const branch of ["A", "B", "C"] as Branch[]) {
    const branchNode = { key: `branch:${branch}`, label: BRANCH_LABELS[branch] }
    const branchRows = rows.filter((row) => row.branch === branch)
    if (branchRows.length === 0) continue

    addLink(ROOT, branchNode, branchRows.length)

    const stableCount = branchRows.filter(
      (row) => row.breakfastPlanChangeFrequency === "never"
    ).length
    const changingRows = branchRows.filter(
      (row) =>
        row.breakfastPlanChangeFrequency !== null &&
        row.breakfastPlanChangeFrequency !== "never"
    )

    addLink(branchNode, STAYS_FIXED, stableCount)
    addLink(branchNode, CHANGES, changingRows.length)
    changingRowsAcrossBranches.push(...changingRows)
  }

  const actionCounts = new Map<string, number>()
  for (const row of changingRowsAcrossBranches) {
    for (const action of row.breakfastPlanChangeActions) {
      actionCounts.set(action, (actionCounts.get(action) ?? 0) + 1)
    }
  }
  for (const option of BREAKFAST_CHANGE_ACTION_OPTIONS) {
    addLink(
      CHANGES,
      { key: `action:${option.value}`, label: option.label },
      actionCounts.get(option.value) ?? 0
    )
  }

  const incomingByNode = new Map<number, number>()
  const outgoingByNode = new Map<number, number>()
  for (const link of links) {
    incomingByNode.set(link.target, (incomingByNode.get(link.target) ?? 0) + link.value)
    outgoingByNode.set(link.source, (outgoingByNode.get(link.source) ?? 0) + link.value)
  }

  return {
    nodes: nodeLabels.map((name, index) => ({
      name,
      respondentCount: incomingByNode.get(index) ?? outgoingByNode.get(index) ?? 0,
    })),
    links,
  }
}

// --- Denominator predicates, exported so a chart's drill-down filters
// the exact same subset of rows the chart itself was built from ------

export function rowsAskedPlanChangeActions(rows: AnalyticsRow[]): AnalyticsRow[] {
  return rows.filter(
    (row) =>
      row.breakfastPlanChangeFrequency !== null &&
      row.breakfastPlanChangeFrequency !== "never"
  )
}

export function rowsAskedMissedBreakfastReasons(
  rows: AnalyticsRow[]
): AnalyticsRow[] {
  return rows.filter(
    (row) =>
      row.branch === "A" &&
      row.missedBreakfastFrequency !== null &&
      row.missedBreakfastFrequency !== "never"
  )
}

export function rowsAskedPlanChangeReasonsB(rows: AnalyticsRow[]): AnalyticsRow[] {
  return rows.filter(
    (row) =>
      row.branch === "B" &&
      ((row.breakfastPlannedButSkippedFrequency !== null &&
        row.breakfastPlannedButSkippedFrequency !== "never") ||
        (row.breakfastUnplannedButWentFrequency !== null &&
          row.breakfastUnplannedButWentFrequency !== "never"))
  )
}

export function rowsAskedSpendingAmount(rows: AnalyticsRow[]): AnalyticsRow[] {
  return rows.filter(
    (row) =>
      row.nonBreakfastSpendingFrequency !== null &&
      row.nonBreakfastSpendingFrequency !== "never"
  )
}

// --- Everything else: straightforward distributions --------------------

export interface EventsMetrics {
  keyEventMetrics: KeyEventMetric[]

  breakfastUsageDistribution: DistributionBucket[]

  planChangeFrequencyDistribution: DistributionBucket[]
  planChangeActionsDistribution: DistributionBucket[]
  planChangeActionsDenominatorCount: number

  branchA: {
    count: number
    missedFrequencyDistribution: DistributionBucket[]
    missedReasonsDistribution: DistributionBucket[]
    missedReasonsDenominatorCount: number
  }
  branchB: {
    count: number
    plannedButSkippedDistribution: DistributionBucket[]
    unplannedButWentDistribution: DistributionBucket[]
    planChangeReasonsDistribution: DistributionBucket[]
    planChangeReasonsDenominatorCount: number
  }
  branchC: {
    count: number
    servedTimeActivityDistribution: DistributionBucket[]
    unusedAllottedMealActionsDistribution: DistributionBucket[]
    unusedAllottedMealActionsDenominatorCount: number
  }

  nonBreakfastMealSourceDistribution: DistributionBucket[]
  nextFoodTimeDistribution: DistributionBucket[]
  nonBreakfastSpendingFrequencyDistribution: DistributionBucket[]
  nonBreakfastSpendingAmountDistribution: DistributionBucket[]
  nonBreakfastSpendingAmountDenominatorCount: number

  comparisonRatingSummaries: ScaleRowSummary[]

  pathwaySankey: PathwaySankeyData
}

export function computeEventsMetrics(rows: AnalyticsRow[]): EventsMetrics {
  const branchA = rows.filter((row) => row.branch === "A")
  const branchB = rows.filter((row) => row.branch === "B")
  const branchC = rows.filter((row) => row.branch === "C")

  const planChangeActionRows = rowsAskedPlanChangeActions(rows)
  const missedReasonRows = rowsAskedMissedBreakfastReasons(rows)
  const planChangeReasonRows = rowsAskedPlanChangeReasonsB(rows)
  const spendingAmountRows = rowsAskedSpendingAmount(rows)

  return {
    keyEventMetrics: computeKeyEventMetrics(rows),

    breakfastUsageDistribution: buildOrderedDistribution(
      rows,
      (row) => row.breakfastFrequency,
      BREAKFAST_FREQUENCY_OPTIONS
    ),

    planChangeFrequencyDistribution: buildOrderedDistribution(
      rows,
      (row) => row.breakfastPlanChangeFrequency,
      FREQUENCY_OPTIONS
    ),
    planChangeActionsDistribution: buildMultiSelectDistribution(
      planChangeActionRows,
      (row) => row.breakfastPlanChangeActions,
      BREAKFAST_CHANGE_ACTION_OPTIONS
    ),
    planChangeActionsDenominatorCount: planChangeActionRows.length,

    branchA: {
      count: branchA.length,
      missedFrequencyDistribution: buildOrderedDistribution(
        branchA,
        (row) => row.missedBreakfastFrequency,
        MISSED_BREAKFAST_FREQUENCY_OPTIONS
      ),
      missedReasonsDistribution: buildMultiSelectDistribution(
        missedReasonRows,
        (row) => row.missedBreakfastReasons,
        MISSED_BREAKFAST_REASON_OPTIONS
      ),
      missedReasonsDenominatorCount: missedReasonRows.length,
    },

    branchB: {
      count: branchB.length,
      plannedButSkippedDistribution: buildOrderedDistribution(
        branchB,
        (row) => row.breakfastPlannedButSkippedFrequency,
        FREQUENCY_OPTIONS
      ),
      unplannedButWentDistribution: buildOrderedDistribution(
        branchB,
        (row) => row.breakfastUnplannedButWentFrequency,
        FREQUENCY_OPTIONS
      ),
      planChangeReasonsDistribution: buildMultiSelectDistribution(
        planChangeReasonRows,
        (row) => row.breakfastPlanChangeReasons,
        BREAKFAST_PLAN_CHANGE_REASON_OPTIONS
      ),
      planChangeReasonsDenominatorCount: planChangeReasonRows.length,
    },

    branchC: {
      count: branchC.length,
      servedTimeActivityDistribution: buildOrderedDistribution(
        branchC,
        (row) => row.breakfastServedTimeActivity,
        BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS
      ),
      unusedAllottedMealActionsDistribution: buildMultiSelectDistribution(
        branchC,
        (row) => row.unusedAllottedMealActions,
        UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS
      ),
      unusedAllottedMealActionsDenominatorCount: branchC.length,
    },

    nonBreakfastMealSourceDistribution: buildMultiSelectDistribution(
      rows,
      (row) => row.nonBreakfastMealSource,
      NON_BREAKFAST_MEAL_SOURCE_OPTIONS
    ),
    nextFoodTimeDistribution: buildOrderedDistribution(
      rows,
      (row) => row.nextFoodTime,
      NEXT_FOOD_TIME_OPTIONS
    ),
    nonBreakfastSpendingFrequencyDistribution: buildOrderedDistribution(
      rows,
      (row) => row.nonBreakfastSpendingFrequency,
      NON_BREAKFAST_SPENDING_FREQUENCY_OPTIONS
    ),
    nonBreakfastSpendingAmountDistribution: buildOrderedDistribution(
      spendingAmountRows,
      (row) => row.nonBreakfastSpendingAmount,
      NON_BREAKFAST_SPENDING_AMOUNT_OPTIONS
    ),
    nonBreakfastSpendingAmountDenominatorCount: spendingAmountRows.length,

    comparisonRatingSummaries: computeComparisonRatingSummaries(rows),

    pathwaySankey: buildBreakfastPathwaySankey(rows),
  }
}
