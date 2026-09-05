// Branch deep-dives — Branch A/B/C each carry their own follow-up
// questions (only ever shown to that branch's respondents, per the
// survey's own conditional rendering), so unlike the Core Patterns and
// the influence/agreement/outcome matrices, there is no cross-branch
// comparison to make here: the correct treatment is a plain
// within-branch distribution, exactly what buildOrderedDistribution and
// buildMultiSelectDistribution already compute for Events. This module
// only supplies the branch-filtering and secondary-gating logic on top.

import {
  BREAKFAST_ABSENCE_DECISION_POINT_OPTIONS,
  BREAKFAST_ABSENCE_REASON_OPTIONS,
  BREAKFAST_DAY_DIFFERENTIATOR_OPTIONS,
  BREAKFAST_DECISION_POINT_OPTIONS,
  BREAKFAST_MOMENT_OPTIONS,
  BREAKFAST_PLAN_CHANGE_REASON_OPTIONS,
  BREAKFAST_ROUTINE_DESCRIPTION_OPTIONS,
  BREAKFAST_ROUTINE_DURATION_OPTIONS,
  BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS,
  EARLY_CLASS_ROUTINE_CHANGE_OPTIONS,
  MESS_BREAKFAST_TIME_OPTIONS,
  MESS_CHANGE_DETERMINANT_OPTIONS,
  MESS_CONSISTENCY_OPTIONS,
  MISSED_BREAKFAST_FREQUENCY_OPTIONS,
  MISSED_BREAKFAST_REASON_OPTIONS,
  OCCASIONAL_BREAKFAST_DIFFERENTIATOR_OPTIONS,
  OCCASIONAL_BREAKFAST_FREQUENCY_OPTIONS,
  UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS,
  UNWANTED_MESS_ACTION_OPTIONS,
  YES_NO_NOT_SURE_OPTIONS,
  YES_NO_SOMETIMES_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"
import {
  buildMultiSelectDistribution,
  buildOrderedDistribution,
  type DistributionBucket,
} from "../distributions"
import type { AnalyticsRow, Branch } from "../types"
import { computeEligibility, sampleFlag, type Eligibility, type SampleFlag } from "./types"

export interface RankedDistributionBucket extends DistributionBucket {
  /** Per-bucket sample-size flag (the same MIN_CELL_N/SMALL_SAMPLE_N
   * rule as every other Patterns visual) — a bucket built from a
   * single-digit count of respondents is flagged here instead of
   * rendering as a confident-looking bar. */
  flag: SampleFlag
}

export interface BranchFieldSummary {
  key: string
  label: string
  /** Which within-branch subgroup this question belongs to (e.g.
   * "Routine", "Adaptation", "Disruption") — purely a display grouping
   * for the accordion-of-accordions UI, not a new eligibility rule. */
  group: string
  distribution: RankedDistributionBucket[]
  eligibility: Eligibility
}

export interface BranchDeepDive {
  branch: Branch
  fields: BranchFieldSummary[]
}

interface FieldSpec {
  key: keyof AnalyticsRow
  label: string
  group: string
  options: SurveyOption[]
  multi?: boolean
  /** Secondary gate beyond the branch itself — e.g. "only respondents who
   * said their routine changes on early-class days were then asked how".
   * Applied on top of the branch filter, over branch members only. */
  gate?: (row: AnalyticsRow) => boolean
}

function withFlags(distribution: DistributionBucket[]): RankedDistributionBucket[] {
  return distribution.map((bucket) => ({ ...bucket, flag: sampleFlag(bucket.count) }))
}

function buildFieldSummary(branchRows: AnalyticsRow[], spec: FieldSpec): BranchFieldSummary {
  const eligibleRows = spec.gate ? branchRows.filter(spec.gate) : branchRows

  if (spec.multi) {
    const getValues = (row: AnalyticsRow) => row[spec.key] as string[]
    const answered = eligibleRows.filter((row) => getValues(row).length > 0)
    return {
      key: spec.key as string,
      label: spec.label,
      group: spec.group,
      distribution: withFlags(buildMultiSelectDistribution(eligibleRows, getValues, spec.options)),
      eligibility: computeEligibility(branchRows.length, eligibleRows.length, answered.length),
    }
  }

  const getValue = (row: AnalyticsRow) => row[spec.key] as string | null
  const answered = eligibleRows.filter((row) => getValue(row) !== null)
  return {
    key: spec.key as string,
    label: spec.label,
    group: spec.group,
    distribution: withFlags(buildOrderedDistribution(eligibleRows, getValue, spec.options)),
    eligibility: computeEligibility(branchRows.length, eligibleRows.length, answered.length),
  }
}

const NOT_NEVER = (value: string | null) => value !== null && value !== "never"

const BRANCH_A_SPECS: FieldSpec[] = [
  { key: "messBreakfastTime", label: "Usual mess breakfast time", group: "Routine", options: MESS_BREAKFAST_TIME_OPTIONS },
  { key: "breakfastMoment", label: "Point in morning breakfast happens", group: "Routine", options: BREAKFAST_MOMENT_OPTIONS },
  { key: "breakfastRoutineDuration", label: "Breakfast routine duration", group: "Routine", options: BREAKFAST_ROUTINE_DURATION_OPTIONS },
  { key: "breakfastRoutineDescription", label: "How breakfast fits the routine", group: "Routine", options: BREAKFAST_ROUTINE_DESCRIPTION_OPTIONS },
  { key: "earlyClassRoutineChange", label: "Adapts routine on early-class days", group: "Adaptation", options: YES_NO_SOMETIMES_OPTIONS },
  {
    key: "earlyClassRoutineChangeActions",
    label: "How the routine is adapted",
    group: "Adaptation",
    options: EARLY_CLASS_ROUTINE_CHANGE_OPTIONS,
    multi: true,
    gate: (row) => row.earlyClassRoutineChange === "yes" || row.earlyClassRoutineChange === "sometimes",
  },
  { key: "unwantedMessActions", label: "What happens when allotted mess isn't wanted", group: "Mess behaviour", options: UNWANTED_MESS_ACTION_OPTIONS, multi: true },
  { key: "messConsistency", label: "Consistency of allotted mess", group: "Mess behaviour", options: MESS_CONSISTENCY_OPTIONS },
  {
    key: "messChangeDeterminants",
    label: "What determines mess choice when it changes",
    group: "Mess behaviour",
    options: MESS_CHANGE_DETERMINANT_OPTIONS,
    multi: true,
    gate: (row) => row.messConsistency === "changes-sometimes" || row.messConsistency === "changes-frequently",
  },
  { key: "missedBreakfastFrequency", label: "How often a planned mess breakfast is missed", group: "Disruption", options: MISSED_BREAKFAST_FREQUENCY_OPTIONS },
  {
    key: "missedBreakfastReasons",
    label: "Why a planned mess breakfast is missed",
    group: "Disruption",
    options: MISSED_BREAKFAST_REASON_OPTIONS,
    multi: true,
    gate: (row) => NOT_NEVER(row.missedBreakfastFrequency),
  },
]

const BRANCH_B_SPECS: FieldSpec[] = [
  { key: "conditionalMessBreakfastTime", label: "Usual mess breakfast time (conditional)", group: "Routine", options: MESS_BREAKFAST_TIME_OPTIONS },
  { key: "breakfastDecisionPoint", label: "When the breakfast decision is made", group: "Routine", options: BREAKFAST_DECISION_POINT_OPTIONS },
  { key: "breakfastDayDifferentiators", label: "What differs on eat vs. non-eat days", group: "Routine", options: BREAKFAST_DAY_DIFFERENTIATOR_OPTIONS, multi: true },
  { key: "breakfastPlannedButSkippedFrequency", label: "Plans to eat but ends up skipping", group: "Plan changes", options: MISSED_BREAKFAST_FREQUENCY_OPTIONS },
  { key: "breakfastUnplannedButWentFrequency", label: "Plans to skip but ends up eating", group: "Plan changes", options: MISSED_BREAKFAST_FREQUENCY_OPTIONS },
  {
    key: "breakfastPlanChangeReasons",
    label: "Why the plan changes",
    group: "Plan changes",
    options: BREAKFAST_PLAN_CHANGE_REASON_OPTIONS,
    multi: true,
    gate: (row) =>
      NOT_NEVER(row.breakfastPlannedButSkippedFrequency) || NOT_NEVER(row.breakfastUnplannedButWentFrequency),
  },
]

const BRANCH_C_SPECS: FieldSpec[] = [
  { key: "breakfastAbsenceReason", label: "Whether skipping is a conscious decision", group: "Absence", options: BREAKFAST_ABSENCE_REASON_OPTIONS },
  { key: "breakfastAbsenceDecisionPoint", label: "When the absence is decided", group: "Absence", options: BREAKFAST_ABSENCE_DECISION_POINT_OPTIONS },
  { key: "breakfastServedTimeActivity", label: "What they're doing when breakfast is served", group: "Absence", options: BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS },
  { key: "unusedAllottedMealActions", label: "What happens to the unused allotted meal", group: "Absence", options: UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS, multi: true },
  { key: "occasionalBreakfastFrequency", label: "How often they still go occasionally", group: "Occasional breakfast", options: OCCASIONAL_BREAKFAST_FREQUENCY_OPTIONS },
  {
    key: "occasionalBreakfastDifferentiators",
    label: "What's different on occasional-breakfast days",
    group: "Occasional breakfast",
    options: OCCASIONAL_BREAKFAST_DIFFERENTIATOR_OPTIONS,
    multi: true,
    gate: (row) => NOT_NEVER(row.occasionalBreakfastFrequency),
  },
  { key: "breakfastFrequencyChanged", label: "Used to eat breakfast more often", group: "Occasional breakfast", options: YES_NO_NOT_SURE_OPTIONS },
]

const SPECS_BY_BRANCH: Record<Branch, FieldSpec[]> = {
  A: BRANCH_A_SPECS,
  B: BRANCH_B_SPECS,
  C: BRANCH_C_SPECS,
}

export function computeBranchDeepDive(rows: AnalyticsRow[], branch: Branch): BranchDeepDive {
  const branchRows = rows.filter((row) => row.branch === branch)
  return {
    branch,
    fields: SPECS_BY_BRANCH[branch].map((spec) => buildFieldSummary(branchRows, spec)),
  }
}
