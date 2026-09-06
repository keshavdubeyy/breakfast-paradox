// Iceberg synthesis — assembles findings already computed and validated
// by the four other domains (Events, Patterns, Structures, Mental
// Models) into one cross-layer narrative. Nothing here recomputes a
// statistic: every number traces back to computeEventsMetrics /
// computePatternsMetrics / computeStructuresMetrics /
// computeMentalModelsMetrics. "System insight" and "System tensions" are
// fixed templates with live numbers interpolated in, not free-form
// generated text — every sentence is traceable to a specific finding
// below (see the evidence trail).

import {
  computeEventsMetrics,
  computeRedirectDestinationBreakdown,
  type EventsMetrics,
} from "../events-metrics"
import { computeMentalModelsMetrics } from "../mental-models/metrics"
import { computePatternsMetrics } from "../patterns/metrics"
import { computeStructuresMetrics } from "../structures/metrics"
import type { AnalyticsRow } from "../types"
import {
  sampleFlag,
  type EvidenceTrailRow,
  type IcebergFinding,
  type IcebergLevel,
  type LeveragePoint,
  type SystemTension,
} from "./types"

function pct(value: number | null): string {
  return value === null ? "not enough responses to display safely" : `${value}%`
}

/** Joins the top `limit` non-zero buckets into a natural-language clause
 * ("A (30%), B (20%), and C (10%)") for a headline's supporting detail —
 * only ever called when the finding's own percentage isn't suppressed,
 * so this never surfaces a breakdown the headline itself is hiding. */
function topBucketsClause(
  buckets: { label: string; count: number; percentage: number }[],
  limit: number
): string | null {
  const top = buckets
    .filter((bucket) => bucket.count > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit)
  if (top.length === 0) return null
  const parts = top.map((bucket) => `${bucket.label} (${bucket.percentage}%)`)
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`
}

/** One full-sentence headline per Events key metric, in the same order
 * computeKeyEventMetrics returns them — written by hand rather than
 * templated, since each reads naturally only with its own phrasing.
 * `percentage` here is the already-suppression-aware value (null once
 * the caller has nulled it out for a too-small sample), so the
 * suppressed branch never states a number that the card itself hides. */
function eventHeadline(
  index: number,
  percentage: number | null,
  rows: AnalyticsRow[],
  events: EventsMetrics
): string {
  switch (index) {
    case 0:
      return percentage === null
        ? "Not enough responses to safely report how many students skip mess breakfast on some days."
        : `${percentage}% of students don't eat breakfast at the mess every day.`
    case 1:
      return percentage === null
        ? "Not enough responses to safely report how often breakfast plans change once it's too late to cancel."
        : `${percentage}% of students say their breakfast plan changes at least sometimes after it's too late to cancel it.`
    case 2: {
      if (percentage === null) {
        return "Not enough responses to safely report how many students buy or eat something else before lunch."
      }
      const clause = topBucketsClause(
        events.nonBreakfastMealSourceDistribution.map((bucket) => ({
          // Lowercase only the leading letter so this reads naturally
          // mid-sentence after "most often" — a blanket .toLowerCase()
          // would also mangle "VC" (a campus canteen) into "vc".
          label: bucket.label.charAt(0).toLowerCase() + bucket.label.slice(1),
          count: bucket.count,
          percentage: bucket.percentage,
        })),
        2
      )
      return (
        `${percentage}% of students buy or eat something else before lunch on days they skip the mess breakfast` +
        (clause ? ` — most often ${clause}.` : ".")
      )
    }
    case 3: {
      if (percentage === null) {
        return "Not enough responses to safely report how many students' meals go unused or get redirected."
      }
      const { buckets } = computeRedirectDestinationBreakdown(rows)
      const clause = topBucketsClause(buckets, 3)
      return (
        `${percentage}% of students report their allotted breakfast going unused or redirected to someone else` +
        (clause ? ` — most often they ${clause}.` : ".")
      )
    }
    default:
      return ""
  }
}

export function computeIcebergMetrics(rows: AnalyticsRow[]) {
  const events = computeEventsMetrics(rows)
  const patterns = computePatternsMetrics(rows)
  const structures = computeStructuresMetrics(rows)
  const mentalModels = computeMentalModelsMetrics(rows)

  // --- Events layer — computeKeyEventMetrics already IS "what happened",
  // asked with no branch/theory attached. It doesn't carry a sample flag
  // itself (Events shows every metric as-is), so one is derived here —
  // and, unlike the other three domains (which already null out a
  // suppressed percentage themselves), that suppression has to be
  // applied here too, not just labeled.
  const eventFindings: IcebergFinding[] = events.keyEventMetrics.map((metric, index) => {
    const flag = sampleFlag(metric.denominator)
    const percentage = flag === "suppressed" ? null : metric.percentage
    return {
      key: `event-${index}`,
      label: metric.label,
      detail: metric.description,
      headline: eventHeadline(index, percentage, rows, events),
      percentage,
      n: metric.denominator,
      flag,
      evidenceType: "Direct self-report",
      href: "/admin/events",
    }
  })

  // --- Patterns layer — the same summary cards already headlining
  // /admin/patterns, reused verbatim.
  const earlyCommitmentGap = patterns.summaryCards.earlyCommitmentGap
  const lateSleepGap = patterns.summaryCards.lateSleepGap
  const weekendShift = patterns.summaryCards.weekendShift

  const patternFindings: IcebergFinding[] = [
    {
      key: "pattern-early-commitment-gap",
      label: "Early commitments predict less frequent breakfast",
      detail: earlyCommitmentGap.label,
      headline:
        earlyCommitmentGap.percentage === null
          ? "Not enough paired responses to safely report the early-commitment breakfast gap."
          : `${earlyCommitmentGap.percentage}% of students eat breakfast less often on days with an early commitment than on their own non-early days.`,
      percentage: earlyCommitmentGap.percentage,
      n: earlyCommitmentGap.n,
      flag: earlyCommitmentGap.flag,
      evidenceType: "Within-person association",
      href: "/admin/patterns",
    },
    {
      key: "pattern-late-sleep-gap",
      label: "Later sleep tracks with less regular breakfast",
      detail: lateSleepGap.label,
      // This one is a percentage-POINT GAP between two groups' rates,
      // not a share of students — phrased accordingly, sign-aware since
      // the gap can run either direction.
      headline:
        lateSleepGap.percentage === null
          ? "Not enough responses to safely compare breakfast regularity between early and late sleepers."
          : `Early sleepers have a regular-breakfast rate ${Math.abs(lateSleepGap.percentage)} percentage points ${lateSleepGap.percentage >= 0 ? "higher" : "lower"} than late sleepers.`,
      percentage: lateSleepGap.percentage,
      n: lateSleepGap.n,
      flag: lateSleepGap.flag,
      evidenceType: "Between-group association",
      href: "/admin/patterns",
    },
    {
      key: "pattern-weekend-shift",
      label: "Weekend breakfast behaviour shifts from weekdays",
      detail: weekendShift.label,
      headline:
        weekendShift.percentage === null
          ? "Not enough responses to safely report the weekend-vs-weekday breakfast shift."
          : `${weekendShift.percentage}% of students eat breakfast more often on weekends than on weekdays.`,
      percentage: weekendShift.percentage,
      n: weekendShift.n,
      flag: weekendShift.flag,
      evidenceType: "Reported comparison",
      href: "/admin/patterns",
    },
  ]

  // --- Structures layer — the Structural Snapshot cards plus the
  // strongest item off the same Structural Drivers ranking /admin/
  // structures already surfaces.
  const topDrivers = [...structures.structuralDrivers.rows]
    .filter((row) => row.topBoxPercentage !== null)
    .sort((a, b) => (b.topBoxPercentage ?? 0) - (a.topBoxPercentage ?? 0))
    .slice(0, 2)

  const cancellationCutoff = structures.snapshot.cancellationCutoff
  const autoAllocation = structures.snapshot.autoAllocation

  const structureFindings: IcebergFinding[] = [
    {
      key: "structure-cancellation-cutoff",
      label: "Plans stay changeable past the cancellation cutoff",
      detail: cancellationCutoff.label,
      headline:
        cancellationCutoff.percentage === null
          ? "Not enough responses to safely report how often plans change after the cancellation cutoff."
          : `${cancellationCutoff.percentage}% of students say their breakfast plan changes at least occasionally after it's too late to cancel.`,
      percentage: cancellationCutoff.percentage,
      n: cancellationCutoff.n,
      flag: cancellationCutoff.flag,
      evidenceType: "Direct self-report",
      href: "/admin/structures",
    },
    {
      key: "structure-auto-allocation",
      label: "Mess allocation is often automatic, not chosen",
      detail: "Rely at least partly on automatic mess allocation",
      headline:
        autoAllocation.percentage === null
          ? "Not enough responses to safely report how many students' mess allocation is automatic."
          : `${autoAllocation.percentage}% of students rely at least partly on automatic mess allocation rather than choosing it themselves.`,
      percentage: autoAllocation.percentage,
      n: autoAllocation.n,
      flag: autoAllocation.flag,
      evidenceType: "Direct self-report",
      href: "/admin/structures",
    },
    ...topDrivers.map((row, index) => {
      // InfluenceRankRow only nulls topBoxPercentage at n===0, not at
      // MIN_CELL_N — the same suppression gap as KeyEventMetric above,
      // fixed the same way here rather than upstream.
      const percentage = row.flag === "suppressed" ? null : row.topBoxPercentage
      return {
        key: `structure-driver-${index}`,
        label: row.label,
        detail: `Rated "a lot" or "very strongly" influential${row.category ? ` — ${row.category}` : ""}`,
        headline:
          percentage === null
            ? `Not enough responses to safely report how many students rate "${row.label}" as a strong influence.`
            : `${percentage}% of students rate "${row.label}" as a strong influence on their breakfast decisions.`,
        percentage,
        n: row.n,
        flag: row.flag,
        evidenceType: "Direct self-report",
        href: "/admin/structures",
      }
    }),
  ]

  // --- Mental Models layer — the top-ranked belief statements, the same
  // ranking the Mental Models snapshot cards use.
  const rankedStatements = [...mentalModels.agreementOverview.statements].sort(
    (a, b) => (b.agreeShare ?? -1) - (a.agreeShare ?? -1)
  )
  const beliefFindings: IcebergFinding[] = rankedStatements.slice(0, 4).map((statement) => ({
    key: `belief-${statement.key}`,
    label: `"${statement.label}"`,
    detail: statement.shortLabel,
    headline:
      statement.agreeShare === null
        ? `Not enough responses to safely report how many students agree: "${statement.label}"`
        : `${statement.agreeShare}% of students agree: "${statement.label}"`,
    percentage: statement.agreeShare,
    n: statement.n,
    flag: statement.flag,
    evidenceType: "Attitudinal (self-report)",
    href: "/admin/mental-models",
  }))

  const levels: IcebergLevel[] = [
    { level: "events", title: "Events", question: "What happened?", findings: eventFindings },
    { level: "patterns", title: "Patterns", question: "What keeps happening?", findings: patternFindings },
    {
      level: "structures",
      title: "Systemic structures",
      question: "What produces these patterns?",
      findings: structureFindings,
    },
    {
      level: "mental-models",
      title: "Mental models",
      question: "What beliefs sustain the structure?",
      findings: beliefFindings,
    },
  ]

  // --- System insight — a fixed template, live numbers interpolated.
  const topDriver = topDrivers[0]
  const dominantBelief = mentalModels.snapshot.dominantBelief
  const systemInsight =
    `Breakfast is registered and prepared in advance, but students' morning decisions stay ` +
    `highly dynamic: ${pct(patterns.summaryCards.earlyCommitmentGap.percentage)} report eating ` +
    `breakfast less often on days with early commitments, ${topDriver ? `${pct(topDriver.flag === "suppressed" ? null : topDriver.topBoxPercentage)} rate "${topDriver.label}" as a strong influence` : "structural constraints are commonly cited"}, ` +
    `and the most widely held belief is "${dominantBelief.detailLabel}" (${pct(dominantBelief.percentage)} agree). ` +
    `The result is a system in which breakfast can be available without reliably being used.`

  // --- System tensions — three fixed conceptual framings (not derived
  // from a single survey question), each grounded in one real finding.
  const alreadyPaidBelief = mentalModels.agreementOverview.statements.find(
    (s) => s.key === "alreadyPaidUseWheneverAgreement"
  )
  const tensions: SystemTension[] = [
    {
      key: "predictability-vs-flexibility",
      title: "Predictability vs. flexibility",
      left: "Mess preparation runs on advance registration and a fixed cancellation cutoff.",
      right: "Student morning plans keep changing after that cutoff closes.",
      supportingFinding: structureFindings.find((f) => f.key === "structure-cancellation-cutoff"),
    },
    {
      key: "access-vs-schedule",
      title: "Breakfast access vs. academic schedule",
      left: "Breakfast is only served during a fixed morning window.",
      right: "Early academic commitments compete for that same limited morning time.",
      supportingFinding: patternFindings.find((f) => f.key === "pattern-early-commitment-gap"),
    },
    {
      key: "paid-vs-substitution",
      title: "Paid meal vs. easy substitution",
      left: "The mess breakfast is typically already registered and paid for.",
      right: "Students can still eat later, buy elsewhere, or redirect the meal without much friction.",
      supportingFinding: alreadyPaidBelief
        ? {
            key: "belief-already-paid",
            label: `"${alreadyPaidBelief.label}"`,
            detail: alreadyPaidBelief.shortLabel,
            headline:
              alreadyPaidBelief.agreeShare === null
                ? `Not enough responses to safely report how many students agree: "${alreadyPaidBelief.label}"`
                : `${alreadyPaidBelief.agreeShare}% of students agree: "${alreadyPaidBelief.label}"`,
            percentage: alreadyPaidBelief.agreeShare,
            n: alreadyPaidBelief.n,
            flag: alreadyPaidBelief.flag,
            evidenceType: "Attitudinal (self-report)",
            href: "/admin/mental-models",
          }
        : undefined,
    },
  ]

  // --- Leverage points — Structures' own leverage-point ranking (a
  // direct survey question: "what would make breakfast easier"),
  // top 5, tagged by which layer each links back to for follow-up.
  const leveragePoints: LeveragePoint[] = [...structures.leveragePoints.distribution]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)
    .map((bucket, index) => ({
      key: bucket.value,
      label: bucket.label,
      // RankedPrevalence's own bucket.percentage isn't suppression-aware
      // (same gap as KeyEventMetric/InfluenceRankRow above) — nulled here.
      percentage: bucket.flag === "suppressed" ? null : bucket.percentage,
      n: structures.leveragePoints.eligibility.answered,
      flag: bucket.flag,
      impact: (index < 2 ? "high" : "medium") as "high" | "medium",
      linkedLevel: "Structures",
      href: "/admin/structures",
    }))

  // --- Evidence trail — every number used above, in one traceable table.
  const evidenceTrail: EvidenceTrailRow[] = [
    ...eventFindings.map((f) => toTrailRow(f, "Events")),
    ...patternFindings.map((f) => toTrailRow(f, "Patterns")),
    ...structureFindings.map((f) => toTrailRow(f, "Structures")),
    ...beliefFindings.map((f) => toTrailRow(f, "Mental models")),
  ]

  return {
    n: rows.length,
    levels,
    systemInsight,
    tensions,
    leveragePoints,
    evidenceTrail,
  }
}

function toTrailRow(finding: IcebergFinding, level: string): EvidenceTrailRow {
  return {
    finding: finding.label,
    level,
    evidence: finding.percentage === null ? `n = ${finding.n} (suppressed)` : `${finding.percentage}% (n = ${finding.n})`,
    strength: finding.evidenceType,
    href: finding.href,
    hrefLabel: `View ${level} →`,
  }
}

export type IcebergMetrics = ReturnType<typeof computeIcebergMetrics>
