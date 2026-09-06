// Activity 5 synthesis — reuses the same four domain computations every
// other page is built on (see the module doc in ./types.ts). Nothing here
// recomputes a statistic from raw rows; every headline sentence is built
// from a percentage/n/flag that Events/Patterns/Structures/Mental Models
// already validated.

import { computeEventsMetrics } from "../events-metrics"
import { computeMentalModelsMetrics } from "../mental-models/metrics"
import { computePatternsMetrics } from "../patterns/metrics"
import { computeStructuresMetrics } from "../structures/metrics"
import type { AnalyticsRow } from "../types"
import {
  sampleFlag,
  type Activity5Evidence,
  type Activity5Metrics,
  type FeedbackObservation,
  type SampleFlag,
  type TimelineStage,
} from "./types"

function evidence(
  key: string,
  headline: string,
  percentage: number | null,
  n: number,
  flag: SampleFlag,
  evidenceType: string,
  href: string
): Activity5Evidence {
  return { key, headline, percentage, n, flag, evidenceType, href }
}

export function computeActivity5Metrics(rows: AnalyticsRow[]): Activity5Metrics {
  const events = computeEventsMetrics(rows)
  const patterns = computePatternsMetrics(rows)
  const structures = computeStructuresMetrics(rows)
  const mentalModels = computeMentalModelsMetrics(rows)

  // --- Individual reused findings, one per snapshot card already
  // validated elsewhere — never a new calculation. -------------------

  const lateSleepGap = patterns.summaryCards.lateSleepGap
  const lateSleepGapEvidence = evidence(
    "previous-night-sleep-vs-breakfast",
    lateSleepGap.percentage === null
      ? "Not enough responses to safely compare breakfast regularity between early and late sleepers."
      : `Early sleepers have a regular-breakfast rate ${Math.abs(lateSleepGap.percentage)} percentage points ${lateSleepGap.percentage >= 0 ? "higher" : "lower"} than late sleepers.`,
    lateSleepGap.percentage,
    lateSleepGap.n,
    lateSleepGap.flag,
    "Between-group association",
    "/admin/patterns"
  )

  const routineOrientation = mentalModels.snapshot.routineOrientation
  const routineOrientationEvidence = evidence(
    "morning-routine-orientation",
    routineOrientation.percentage === null
      ? "Not enough responses to safely report the most common breakfast routine mindset."
      : `The most common breakfast routine mindset is "${routineOrientation.detailLabel}" (${routineOrientation.percentage}%, regular and rare/non-eaters only).`,
    routineOrientation.percentage,
    routineOrientation.n,
    routineOrientation.flag,
    "Self-report (Branch A + C only)",
    "/admin/mental-models"
  )

  const dontEatEveryDay = events.keyEventMetrics[0]
  const dontEatEveryDayFlag = sampleFlag(dontEatEveryDay.denominator)
  const dontEatEveryDayPct = dontEatEveryDayFlag === "suppressed" ? null : dontEatEveryDay.percentage
  const dontEatEveryDayEvidence = evidence(
    "breakfast-window-frequency",
    dontEatEveryDayPct === null
      ? "Not enough responses to safely report how many students skip mess breakfast on some days."
      : `${dontEatEveryDayPct}% of students don't eat breakfast at the mess every day.`,
    dontEatEveryDayPct,
    dontEatEveryDay.denominator,
    dontEatEveryDayFlag,
    "Direct self-report",
    "/admin/events"
  )

  const mealsUnused = events.keyEventMetrics[3]
  const mealsUnusedFlag = sampleFlag(mealsUnused.denominator)
  const mealsUnusedPct = mealsUnusedFlag === "suppressed" ? null : mealsUnused.percentage
  const mealsUnusedEvidence = evidence(
    "breakfast-window-unused-meals",
    mealsUnusedPct === null
      ? "Not enough responses to safely report how many students' meals go unused or get redirected."
      : `${mealsUnusedPct}% of students report their allotted breakfast going unused or redirected to someone else.`,
    mealsUnusedPct,
    mealsUnused.denominator,
    mealsUnusedFlag,
    "Direct self-report",
    "/admin/events"
  )

  const cancellationCutoff = structures.snapshot.cancellationCutoff
  const cancellationCutoffEvidence = evidence(
    "breakfast-window-cancellation-cutoff",
    cancellationCutoff.percentage === null
      ? "Not enough responses to safely report how often plans change after the cancellation cutoff."
      : `${cancellationCutoff.percentage}% of students say their breakfast plan changes at least occasionally after it's too late to cancel.`,
    cancellationCutoff.percentage,
    cancellationCutoff.n,
    cancellationCutoff.flag,
    "Direct self-report",
    "/admin/structures"
  )

  const autoAllocation = structures.snapshot.autoAllocation
  const autoAllocationEvidence = evidence(
    "breakfast-window-auto-allocation",
    autoAllocation.percentage === null
      ? "Not enough responses to safely report how many students' mess allocation is automatic."
      : `${autoAllocation.percentage}% of students rely at least partly on automatic mess allocation rather than choosing it themselves.`,
    autoAllocation.percentage,
    autoAllocation.n,
    autoAllocation.flag,
    "Direct self-report",
    "/admin/structures"
  )

  const valuePerception = mentalModels.snapshot.valuePerception
  const valuePerceptionEvidence = evidence(
    "breakfast-window-value-perception",
    valuePerception.percentage === null
      ? "Not enough responses to safely report the most common view of the mess fee's value."
      : `The most common view of the mess fee's breakfast value is "${valuePerception.detailLabel}" (${valuePerception.percentage}%).`,
    valuePerception.percentage,
    valuePerception.n,
    valuePerception.flag,
    "Attitudinal (self-report)",
    "/admin/mental-models"
  )

  const earlyCommitmentGap = patterns.summaryCards.earlyCommitmentGap
  const earlyCommitmentGapEvidence = evidence(
    "early-classes-commitment-gap",
    earlyCommitmentGap.percentage === null
      ? "Not enough paired responses to safely report the early-commitment breakfast gap."
      : `${earlyCommitmentGap.percentage}% of students eat breakfast less often on days with an early commitment than on their own non-early days.`,
    earlyCommitmentGap.percentage,
    earlyCommitmentGap.n,
    earlyCommitmentGap.flag,
    "Within-person association",
    "/admin/patterns"
  )

  const topStructuralConstraint = structures.snapshot.topStructuralConstraint
  const topStructuralConstraintEvidence = evidence(
    "early-classes-top-constraint",
    topStructuralConstraint.percentage === null
      ? "Not enough responses to safely report the top-rated structural constraint."
      : `${topStructuralConstraint.percentage}% of students rate "${topStructuralConstraint.detailLabel}" as a strong influence on their breakfast decisions — the highest-rated structural factor.`,
    topStructuralConstraint.percentage,
    topStructuralConstraint.n,
    topStructuralConstraint.flag,
    "Direct self-report",
    "/admin/structures"
  )

  const buysElseBeforeLunch = events.keyEventMetrics[2]
  const buysElseFlag = sampleFlag(buysElseBeforeLunch.denominator)
  const buysElsePct = buysElseFlag === "suppressed" ? null : buysElseBeforeLunch.percentage
  const buysElseEvidence = evidence(
    "later-morning-alternative-food",
    buysElsePct === null
      ? "Not enough responses to safely report how many students buy or eat something else before lunch."
      : `${buysElsePct}% of students buy or eat something else before lunch on days they skip the mess breakfast.`,
    buysElsePct,
    buysElseBeforeLunch.denominator,
    buysElseFlag,
    "Direct self-report",
    "/admin/events"
  )

  const restOfDayEvidence: Activity5Evidence[] = events.comparisonRatingSummaries.map((summary) => {
    const flag = sampleFlag(summary.respondedCount)
    const value = flag === "suppressed" ? null : summary.averagePosition
    const direction = value === null ? null : value > 0 ? "higher" : value < 0 ? "lower" : "about the same"
    return evidence(
      `rest-of-day-${summary.key}`,
      value === null
        ? `Not enough responses to safely report reported ${summary.label.toLowerCase()} before lunch on skipped-breakfast days.`
        : `On days they skip mess breakfast, students report their ${summary.label.toLowerCase()} before lunch as ${direction} than usual (average position ${value.toFixed(2)} on a -2 to +2 scale).`,
      null, // this is an average position, not a percentage — never mis-render as one
      summary.respondedCount,
      flag,
      "Reported comparison",
      "/admin/events"
    )
  })

  const weekendShift = patterns.summaryCards.weekendShift
  const weekendShiftEvidence = evidence(
    "recurring-weekend-shift",
    weekendShift.percentage === null
      ? "Not enough responses to safely report the weekend-vs-weekday breakfast shift."
      : `${weekendShift.percentage}% of students eat breakfast more often on weekends than on weekdays.`,
    weekendShift.percentage,
    weekendShift.n,
    weekendShift.flag,
    "Reported comparison",
    "/admin/patterns"
  )

  const dominantBelief = mentalModels.snapshot.dominantBelief
  const dominantBeliefEvidence = evidence(
    "recurring-dominant-belief",
    dominantBelief.percentage === null
      ? "Not enough responses to safely report the most widely held belief about breakfast."
      : `The most widely held belief is "${dominantBelief.detailLabel}" (${dominantBelief.percentage}% agree or strongly agree).`,
    dominantBelief.percentage,
    dominantBelief.n,
    dominantBelief.flag,
    "Attitudinal (self-report)",
    "/admin/mental-models"
  )

  const topLeveragePoint = structures.snapshot.topLeveragePoint
  const topLeveragePointEvidence = evidence(
    "recurring-top-leverage-point",
    topLeveragePoint.percentage === null
      ? "Not enough responses to safely report the most commonly requested change."
      : `The most commonly requested change is "${topLeveragePoint.detailLabel}" (${topLeveragePoint.percentage}% of respondents).`,
    topLeveragePoint.percentage,
    topLeveragePoint.n,
    topLeveragePoint.flag,
    "Direct self-report",
    "/admin/structures"
  )

  const semesterChange = patterns.summaryCards.semesterChange
  const semesterChangeEvidence = evidence(
    "significant-change-semester-shift",
    semesterChange.percentage === null
      ? "Not enough responses to safely report how many students' breakfast behaviour changed this semester."
      : `${semesterChange.percentage}% of students report their breakfast behaviour changed at some point this semester (self-reported, retrospective).`,
    semesterChange.percentage,
    semesterChange.n,
    semesterChange.flag,
    "Retrospective self-report",
    "/admin/patterns"
  )

  // --- System timeline — a single day's sequence. A stage with no
  // reused finding gets an honest note instead of a guess. --------------

  const timeline: TimelineStage[] = [
    {
      key: "previous-night",
      title: "Previous night",
      description: "Sleep timing the night before, and whether it carries into the next morning.",
      evidence: [lateSleepGapEvidence],
    },
    {
      key: "morning-routine",
      title: "Morning routine",
      description: "How deliberate or automatic the decision to eat (or not) usually is.",
      evidence: [routineOrientationEvidence],
    },
    {
      key: "breakfast-window",
      title: "Breakfast window",
      description: "What actually happens at the mess, and how the registration system runs.",
      evidence: [
        dontEatEveryDayEvidence,
        cancellationCutoffEvidence,
        autoAllocationEvidence,
        mealsUnusedEvidence,
        valuePerceptionEvidence,
      ],
    },
    {
      key: "early-classes",
      title: "Early classes",
      description: "How early academic commitments compete with the breakfast window.",
      evidence: [earlyCommitmentGapEvidence, topStructuralConstraintEvidence],
    },
    {
      key: "later-morning",
      title: "Later morning",
      description: "What students do for food after a skipped mess breakfast.",
      evidence: [buysElseEvidence],
    },
    {
      key: "rest-of-day",
      title: "Rest of day",
      description: "Self-reported downstream effects on days breakfast was skipped.",
      evidence: restOfDayEvidence,
    },
    {
      key: "following-night",
      title: "Following night",
      description: "Whether a day's breakfast behaviour carries into the next cycle.",
      evidence: [],
      noEvidenceNote:
        "The current student survey has no question that connects a specific day's breakfast decision to that same night's routine — this stage is left empty rather than inferred.",
    },
  ]

  // --- Recurring patterns synthesis — the strongest cross-cutting
  // findings that don't belong to one time-of-day stage, not a repeat of
  // every chart on Patterns/Structures/Mental Models. --------------------

  const recurringPatterns: Activity5Evidence[] = [
    weekendShiftEvidence,
    dominantBeliefEvidence,
    topLeveragePointEvidence,
    earlyCommitmentGapEvidence,
    cancellationCutoffEvidence,
  ]

  // --- Feedback / unintended-consequence observations — honestly split
  // into available / still investigating / blocked, never a confirmed
  // loop. -----------------------------------------------------------------

  const feedbackObservations: FeedbackObservation[] = [
    {
      key: "registered-but-not-reliably-used",
      title: "Registered but not reliably used",
      available:
        "Plans stay changeable well past the cancellation cutoff, and a large share of registered breakfasts go unused or get redirected to someone else.",
      investigating:
        "Whether this pattern reflects students routinely over-registering, or the cutoff simply being earlier than plans are usually settled.",
      blocked:
        "Whether unused/redirected meals translate into food waste, cost, or capacity strain on the mess side — that needs mess operational data (registered vs. availed counts), not yet available.",
      supportingEvidence: [cancellationCutoffEvidence, mealsUnusedEvidence],
    },
    {
      key: "automatic-allocation",
      title: "Automatic allocation, limited active choice",
      available:
        "A meaningful share of students rely at least partly on automatic mess allocation rather than choosing it themselves.",
      investigating:
        "Whether automatically-allocated students show different attendance patterns than students who actively chose their mess.",
      blocked:
        "Confirming any link to actual attendance requires mess-side registration and QR-scan data, not yet available.",
      supportingEvidence: [autoAllocationEvidence],
    },
    {
      key: "early-commitments-compete",
      title: "Early commitments compete with the breakfast window",
      available:
        "Students eat breakfast less often on days with an early class or commitment, and \"time of first class/meeting\" is the single highest-rated structural influence on breakfast decisions.",
      investigating:
        "Whether shifting or spacing early commitments would measurably change breakfast attendance, versus other factors (sleep, routine) dominating instead.",
      blocked:
        "Understanding why early classes are scheduled the way they are, and what constrains changing them, requires administration research, not yet available.",
      supportingEvidence: [earlyCommitmentGapEvidence, topStructuralConstraintEvidence],
    },
  ]

  return {
    n: rows.length,
    timeline,
    recurringPatterns,
    significantChange: semesterChangeEvidence,
    feedbackObservations,
  }
}
