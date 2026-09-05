// Pattern Explorer — the "no data loss" safety valve. Every closed-ended
// field gets an entry here even if it never earns a permanent chart
// elsewhere on the page; the dispatcher below picks the correct
// analytical treatment from the two chosen fields' *types* rather than
// leaving that judgment call to whoever wires up the UI, and refuses
// (rather than guesses) when a combination isn't analytically sound.

import {
  BEFORE_SLEEP_ACTIVITY_OPTIONS,
  BREAKFAST_ABSENCE_DECISION_POINT_OPTIONS,
  BREAKFAST_ABSENCE_REASON_OPTIONS,
  BREAKFAST_DAY_DIFFERENTIATOR_OPTIONS,
  BREAKFAST_DECISION_POINT_OPTIONS,
  BREAKFAST_FREQUENCY_OPTIONS,
  BREAKFAST_IMPROVEMENT_OPTIONS,
  BREAKFAST_MOMENT_OPTIONS,
  BREAKFAST_MOTIVATION_OPTIONS,
  BREAKFAST_PLAN_CHANGE_REASON_OPTIONS,
  BREAKFAST_ROUTINE_DESCRIPTION_OPTIONS,
  BREAKFAST_ROUTINE_DURATION_OPTIONS,
  BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS,
  BREAKFAST_CHANGE_ACTION_OPTIONS,
  EARLY_CLASS_ROUTINE_CHANGE_OPTIONS,
  EARLY_COMMITMENT_BREAKFAST_FREQUENCY_OPTIONS,
  EARLY_COMMITMENT_OPTIONS,
  FREQUENCY_OPTIONS,
  GENDER_OPTIONS,
  HOSTEL_OPTIONS,
  MEAL_VALUE_PERCEPTION_OPTIONS,
  MESS_BREAKFAST_TIME_OPTIONS,
  MESS_CHANGE_DETERMINANT_OPTIONS,
  MESS_CONSISTENCY_OPTIONS,
  MESS_DECISION_OPTIONS,
  MESS_FOOD_QUALITY_OPTIONS,
  MISSED_BREAKFAST_FREQUENCY_OPTIONS,
  MISSED_BREAKFAST_REASON_OPTIONS,
  MORNING_ACTIVITY_OPTIONS,
  NEXT_FOOD_TIME_OPTIONS,
  NON_BREAKFAST_MEAL_SOURCE_OPTIONS,
  NON_BREAKFAST_SPENDING_AMOUNT_OPTIONS,
  NON_BREAKFAST_SPENDING_FREQUENCY_OPTIONS,
  OCCASIONAL_BREAKFAST_DIFFERENTIATOR_OPTIONS,
  OCCASIONAL_BREAKFAST_FREQUENCY_OPTIONS,
  PREVIOUS_NIGHT_AFFECTS_OPTIONS,
  PREVIOUS_NIGHT_FACTOR_OPTIONS,
  SEMESTER_BREAKFAST_CHANGE_OPTIONS,
  SLEEP_TIME_OPTIONS,
  UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS,
  UNWANTED_MESS_ACTION_OPTIONS,
  WAKE_TIME_OPTIONS,
  WEEKEND_BREAKFAST_COMPARISON_OPTIONS,
  WEEKEND_DIFFERENTIATOR_OPTIONS,
  YEAR_OPTIONS,
  YES_NO_NOT_SURE_OPTIONS,
  YES_NO_SOMETIMES_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"
import { ARCHETYPE_IDS, ARCHETYPES } from "@/lib/archetype-content"
import { median } from "../metrics"
import { percentageOf } from "../distributions"
import type { AnalyticsRow, Branch } from "../types"
import { cramersV, spearman } from "./associations"
import {
  AGREEMENT_STATEMENT_ITEMS,
  agreementRowScore,
  breakfastFrequencyScore,
  COMPARISON_ROW_ITEMS,
  comparisonRowScore,
  earlyCommitmentFrequencyScore,
  influenceRowScore,
  noEarlyCommitmentFrequencyScore,
  sleepScore,
  SUBSTANTIVE_INFLUENCE_ITEMS,
  wakeScore,
} from "./normalization"
import { MIN_CELL_N, sampleFlag, type SampleFlag } from "./types"

export type ExplorerFieldType =
  | "categorical"
  | "ordinal"
  | "likert"
  | "multi-select"

export interface ExplorerFieldMeta {
  key: string
  label: string
  type: ExplorerFieldType
  section: string
  /** undefined = every branch (or branch doesn't apply to this field). */
  branchEligibility?: Branch[]
  surveyVersions: number[] | "all"
  allowedAsX: boolean
  allowedAsY: boolean
  /** Raw categorical value — every field has one, even ordinal/likert
   * fields (a crosstab can still group by them). */
  getCategorical: (row: AnalyticsRow) => string | null
  /** Present only for ordinal/likert fields. Returns null for a value
   * with no ordinal position (e.g. "no-consistent-time",
   * "not-applicable") — never a substitute zero. */
  getOrdinal?: (row: AnalyticsRow) => number | null
  getMultiSelect?: (row: AnalyticsRow) => string[]
  /** Category labels, in display order — used for crosstab columns and
   * multi-select option prevalence. */
  options?: SurveyOption[]
  /** The other half of a "paired" relationship (e.g.
   * earlyCommitmentBreakfastFrequency ↔ noEarlyCommitmentBreakfastFrequency)
   * — selecting this pair as X/Y always uses the paired-difference
   * method, regardless of type. */
  pairedFieldKey?: string
}

function earlyCommitmentDaysScore(row: AnalyticsRow): number | null {
  if (row.earlyCommitmentDays === null) return null
  if (row.earlyCommitmentDays === "5+") return 5
  const parsed = Number(row.earlyCommitmentDays)
  return Number.isFinite(parsed) ? parsed : null
}

// --- Registry factories ------------------------------------------------
//
// Phase 2 adds a large number of single-value and multi-select fields
// that all follow the same two shapes below — these exist purely to keep
// ~35 near-identical entries from turning into ~35 near-identical typos.
// Every field they produce still goes through the exact same dispatcher
// as the hand-written Phase 1 entries above.
function categoricalField(
  key: keyof AnalyticsRow,
  label: string,
  section: string,
  options?: SurveyOption[],
  branchEligibility?: Branch[]
): ExplorerFieldMeta {
  return {
    key,
    label,
    type: "categorical",
    section,
    branchEligibility,
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row[key] as string | null,
    options,
  }
}

function multiSelectField(
  key: keyof AnalyticsRow,
  label: string,
  section: string,
  options: SurveyOption[],
  branchEligibility?: Branch[]
): ExplorerFieldMeta {
  return {
    key,
    label,
    type: "multi-select",
    section,
    branchEligibility,
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: () => null,
    getMultiSelect: (row) => row[key] as string[],
    options,
  }
}

function comparisonField(itemKey: string, label: string): ExplorerFieldMeta {
  return {
    key: `comparisonRatings.${itemKey}`,
    label: `Outcome: ${label}`,
    type: "likert",
    section: "Outcomes",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.comparisonRatings[itemKey] ?? null,
    getOrdinal: (row) => comparisonRowScore(row, itemKey),
  }
}

function influenceField(itemKey: string, label: string): ExplorerFieldMeta {
  return {
    key: `influenceRatings.${itemKey}`,
    label: `Influence: ${label}`,
    type: "likert",
    section: "Structural influence",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.influenceRatings[itemKey] ?? null,
    getOrdinal: (row) => influenceRowScore(row, itemKey),
  }
}

function agreementField(itemKey: string, label: string): ExplorerFieldMeta {
  return {
    key: `agreementRatings.${itemKey}`,
    label: `Belief: ${label}`,
    type: "likert",
    section: "Mental model",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.agreementRatings[itemKey] ?? null,
    getOrdinal: (row) => agreementRowScore(row, itemKey),
  }
}

export const EXPLORER_FIELDS: ExplorerFieldMeta[] = [
  {
    key: "earlyCommitmentDays",
    label: "Early commitments (days/week)",
    type: "ordinal",
    section: "Schedule",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.earlyCommitmentDays,
    getOrdinal: earlyCommitmentDaysScore,
    options: EARLY_COMMITMENT_OPTIONS,
  },
  {
    key: "breakfastFrequency",
    label: "Breakfast frequency",
    type: "ordinal",
    section: "Outcome",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.breakfastFrequency,
    getOrdinal: breakfastFrequencyScore,
    options: BREAKFAST_FREQUENCY_OPTIONS,
  },
  {
    key: "branch",
    label: "Breakfast branch (Regular / Conditional / Rare)",
    type: "categorical",
    section: "Outcome",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.branch,
    options: [
      { value: "A", label: "Regular eaters" },
      { value: "B", label: "Conditional eaters" },
      { value: "C", label: "Rare / non-eaters" },
    ],
  },
  {
    key: "sleepTimeWeekday",
    label: "Weekday sleep time",
    type: "ordinal",
    section: "Sleep & routine",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.sleepTimeWeekday,
    getOrdinal: sleepScore,
    options: SLEEP_TIME_OPTIONS,
  },
  {
    key: "wakeTimeWeekday",
    label: "Weekday wake time",
    type: "ordinal",
    section: "Sleep & routine",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.wakeTimeWeekday,
    getOrdinal: wakeScore,
    options: WAKE_TIME_OPTIONS,
  },
  {
    key: "earlyCommitmentBreakfastFrequency",
    label: "Breakfast frequency on early-commitment days",
    type: "ordinal",
    section: "Schedule",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.earlyCommitmentBreakfastFrequency,
    getOrdinal: earlyCommitmentFrequencyScore,
    options: EARLY_COMMITMENT_BREAKFAST_FREQUENCY_OPTIONS,
    pairedFieldKey: "noEarlyCommitmentBreakfastFrequency",
  },
  {
    key: "noEarlyCommitmentBreakfastFrequency",
    label: "Breakfast frequency on non-early-commitment days",
    type: "ordinal",
    section: "Schedule",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.noEarlyCommitmentBreakfastFrequency,
    getOrdinal: noEarlyCommitmentFrequencyScore,
    options: FREQUENCY_OPTIONS,
    pairedFieldKey: "earlyCommitmentBreakfastFrequency",
  },
  {
    key: "weekendBreakfastComparison",
    label: "Weekend vs. weekday breakfast",
    type: "categorical",
    section: "Temporal",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.weekendBreakfastComparison,
    options: WEEKEND_BREAKFAST_COMPARISON_OPTIONS,
  },
  {
    key: "semesterBreakfastChange",
    label: "Change since start of semester",
    type: "categorical",
    section: "Temporal",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: (row) => row.semesterBreakfastChange,
    options: SEMESTER_BREAKFAST_CHANGE_OPTIONS,
  },
  {
    key: "hostel",
    label: "Hostel",
    type: "categorical",
    section: "Segmentation",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: false,
    getCategorical: (row) => row.hostel,
    options: HOSTEL_OPTIONS,
  },
  {
    key: "year",
    label: "Year",
    type: "categorical",
    section: "Segmentation",
    surveyVersions: "all",
    allowedAsX: true,
    allowedAsY: false,
    getCategorical: (row) => row.year,
    options: YEAR_OPTIONS,
  },
  categoricalField("program", "Program", "Segmentation"),
  categoricalField("gender", "Gender", "Segmentation", GENDER_OPTIONS),

  // --- Sleep & routine (Phase 2) -----------------------------------
  categoricalField(
    "messDecision",
    "How the mess is decided",
    "Structures",
    MESS_DECISION_OPTIONS
  ),
  categoricalField(
    "messFoodQuality",
    "Mess food quality",
    "Structures",
    MESS_FOOD_QUALITY_OPTIONS
  ),
  multiSelectField(
    "beforeSleepActivities",
    "Before-sleep activities",
    "Sleep & routine",
    BEFORE_SLEEP_ACTIVITY_OPTIONS
  ),
  categoricalField(
    "beforeSleepMostTime",
    "Activity taking most time before sleep",
    "Sleep & routine",
    BEFORE_SLEEP_ACTIVITY_OPTIONS
  ),
  multiSelectField(
    "morningActivities",
    "Morning activities",
    "Sleep & routine",
    MORNING_ACTIVITY_OPTIONS
  ),

  // --- Branch A (regular eaters) -----------------------------------
  // branchEligibility: ["A"] on every field below — these questions are
  // only ever shown to regular eaters, so a B/C respondent's null here
  // means "not eligible", never "asked but didn't answer".
  categoricalField(
    "messBreakfastTime",
    "Usual mess breakfast time",
    "Branch A",
    MESS_BREAKFAST_TIME_OPTIONS,
    ["A"]
  ),
  categoricalField(
    "breakfastMoment",
    "Point in morning breakfast happens",
    "Branch A",
    BREAKFAST_MOMENT_OPTIONS,
    ["A"]
  ),
  categoricalField(
    "breakfastRoutineDuration",
    "Breakfast routine duration",
    "Branch A",
    BREAKFAST_ROUTINE_DURATION_OPTIONS,
    ["A"]
  ),
  categoricalField(
    "earlyClassRoutineChange",
    "Adapts routine on early-class days",
    "Branch A",
    YES_NO_SOMETIMES_OPTIONS,
    ["A"]
  ),
  multiSelectField(
    "earlyClassRoutineChangeActions",
    "How the routine is adapted",
    "Branch A",
    EARLY_CLASS_ROUTINE_CHANGE_OPTIONS,
    ["A"]
  ),
  multiSelectField(
    "unwantedMessActions",
    "What happens when allotted mess isn't wanted",
    "Branch A",
    UNWANTED_MESS_ACTION_OPTIONS,
    ["A"]
  ),
  categoricalField(
    "messConsistency",
    "Consistency of allotted mess",
    "Branch A",
    MESS_CONSISTENCY_OPTIONS,
    ["A"]
  ),
  multiSelectField(
    "messChangeDeterminants",
    "What determines mess choice when it changes",
    "Branch A",
    MESS_CHANGE_DETERMINANT_OPTIONS,
    ["A"]
  ),
  categoricalField(
    "breakfastRoutineDescription",
    "How breakfast fits the routine",
    "Branch A",
    BREAKFAST_ROUTINE_DESCRIPTION_OPTIONS,
    ["A"]
  ),
  categoricalField(
    "missedBreakfastFrequency",
    "How often a planned mess breakfast is missed",
    "Branch A",
    MISSED_BREAKFAST_FREQUENCY_OPTIONS,
    ["A"]
  ),
  multiSelectField(
    "missedBreakfastReasons",
    "Why a planned mess breakfast is missed",
    "Branch A",
    MISSED_BREAKFAST_REASON_OPTIONS,
    ["A"]
  ),
  // Genuinely cross-branch (A always, B always, C once they clear their
  // own gate) — no branchEligibility restriction here on purpose.
  multiSelectField(
    "breakfastMotivationFactors",
    "What motivates going to breakfast",
    "Outcome",
    BREAKFAST_MOTIVATION_OPTIONS
  ),

  // --- Branch B (conditional eaters) -------------------------------
  categoricalField(
    "conditionalMessBreakfastTime",
    "Usual mess breakfast time (conditional)",
    "Branch B",
    MESS_BREAKFAST_TIME_OPTIONS,
    ["B"]
  ),
  categoricalField(
    "breakfastDecisionPoint",
    "When the breakfast decision is made",
    "Branch B",
    BREAKFAST_DECISION_POINT_OPTIONS,
    ["B"]
  ),
  multiSelectField(
    "breakfastDayDifferentiators",
    "What differs on eat vs. non-eat days",
    "Branch B",
    BREAKFAST_DAY_DIFFERENTIATOR_OPTIONS,
    ["B"]
  ),
  categoricalField(
    "breakfastPlannedButSkippedFrequency",
    "Plans to eat but ends up skipping",
    "Branch B",
    MISSED_BREAKFAST_FREQUENCY_OPTIONS,
    ["B"]
  ),
  categoricalField(
    "breakfastUnplannedButWentFrequency",
    "Plans to skip but ends up eating",
    "Branch B",
    MISSED_BREAKFAST_FREQUENCY_OPTIONS,
    ["B"]
  ),
  multiSelectField(
    "breakfastPlanChangeReasons",
    "Why the plan changes",
    "Branch B",
    BREAKFAST_PLAN_CHANGE_REASON_OPTIONS,
    ["B"]
  ),

  // --- Branch C (rare / non-eaters) --------------------------------
  categoricalField(
    "breakfastAbsenceReason",
    "Whether skipping is a conscious decision",
    "Branch C",
    BREAKFAST_ABSENCE_REASON_OPTIONS,
    ["C"]
  ),
  categoricalField(
    "breakfastAbsenceDecisionPoint",
    "When the absence is decided",
    "Branch C",
    BREAKFAST_ABSENCE_DECISION_POINT_OPTIONS,
    ["C"]
  ),
  categoricalField(
    "occasionalBreakfastFrequency",
    "How often they still go occasionally",
    "Branch C",
    OCCASIONAL_BREAKFAST_FREQUENCY_OPTIONS,
    ["C"]
  ),
  multiSelectField(
    "occasionalBreakfastDifferentiators",
    "What's different on occasional-breakfast days",
    "Branch C",
    OCCASIONAL_BREAKFAST_DIFFERENTIATOR_OPTIONS,
    ["C"]
  ),
  categoricalField(
    "breakfastFrequencyChanged",
    "Used to eat breakfast more often",
    "Branch C",
    YES_NO_NOT_SURE_OPTIONS,
    ["C"]
  ),
  categoricalField(
    "breakfastServedTimeActivity",
    "What they're doing when breakfast is served",
    "Branch C",
    BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS,
    ["C"]
  ),
  multiSelectField(
    "unusedAllottedMealActions",
    "What happens to the unused allotted meal",
    "Branch C",
    UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS,
    ["C"]
  ),

  // --- Temporal / spillover -----------------------------------------
  multiSelectField(
    "weekendDifferentiators",
    "What's different about weekends",
    "Temporal",
    WEEKEND_DIFFERENTIATOR_OPTIONS
  ),
  categoricalField(
    "previousNightAffectsBreakfast",
    "Previous night affects breakfast",
    "Temporal",
    PREVIOUS_NIGHT_AFFECTS_OPTIONS
  ),
  multiSelectField(
    "previousNightFactors",
    "Which previous-night factors",
    "Temporal",
    PREVIOUS_NIGHT_FACTOR_OPTIONS
  ),

  // --- Value / improvement --------------------------------------------
  categoricalField(
    "mealValuePerception",
    "Perceived value of the mess fee",
    "Structures",
    MEAL_VALUE_PERCEPTION_OPTIONS
  ),
  multiSelectField(
    "breakfastImprovementOptions",
    "What would make breakfast easier",
    "Structures",
    BREAKFAST_IMPROVEMENT_OPTIONS
  ),
  categoricalField(
    "biggestInfluenceFactor",
    "Single biggest influence factor",
    "Structural influence",
    SUBSTANTIVE_INFLUENCE_ITEMS.map((item) => ({ value: item.key, label: item.label }))
  ),

  // --- Plan stability (everyone) ---------------------------------------
  categoricalField(
    "breakfastPlanChangeFrequency",
    "How often the breakfast plan changes after the cancellation deadline",
    "Plan stability",
    FREQUENCY_OPTIONS
  ),
  multiSelectField(
    "breakfastPlanChangeActions",
    "What happens when the plan changes",
    "Plan stability",
    BREAKFAST_CHANGE_ACTION_OPTIONS
  ),

  // --- Alternative food & spending (everyone) --------------------------
  categoricalField(
    "nonBreakfastMealSource",
    "Where food comes from instead",
    "Alternative food & spending",
    NON_BREAKFAST_MEAL_SOURCE_OPTIONS
  ),
  categoricalField(
    "nextFoodTime",
    "When they next eat",
    "Alternative food & spending",
    NEXT_FOOD_TIME_OPTIONS
  ),
  categoricalField(
    "nonBreakfastSpendingFrequency",
    "How often they spend on non-mess food instead",
    "Alternative food & spending",
    NON_BREAKFAST_SPENDING_FREQUENCY_OPTIONS
  ),
  categoricalField(
    "nonBreakfastSpendingAmount",
    "How much they spend on non-mess food instead",
    "Alternative food & spending",
    NON_BREAKFAST_SPENDING_AMOUNT_OPTIONS
  ),

  // --- Archetype relationships ------------------------------------------
  categoricalField(
    "primaryArchetype",
    "Primary archetype",
    "Archetype",
    ARCHETYPE_IDS.map((id) => ({ value: id, label: ARCHETYPES[id].name }))
  ),

  // --- Structural influence × behaviour matrix (one field per row) ---
  ...SUBSTANTIVE_INFLUENCE_ITEMS.map((item) => influenceField(item.key, item.label)),

  // --- Mental model × behaviour matrix (one field per row) -----------
  ...AGREEMENT_STATEMENT_ITEMS.map((item) => agreementField(item.key, item.label)),

  // --- Reported energy/concentration/hunger outcomes (one field per row) ---
  ...COMPARISON_ROW_ITEMS.map((item) => comparisonField(item.key, item.label)),
]

const FIELD_BY_KEY = new Map(EXPLORER_FIELDS.map((field) => [field.key, field]))

export function getExplorerField(key: string): ExplorerFieldMeta | undefined {
  return FIELD_BY_KEY.get(key)
}

/** Which rows a field's own eligibility rules (survey version, branch)
 * allow into any calculation involving it. */
export function eligibleRowsFor(rows: AnalyticsRow[], field: ExplorerFieldMeta): AnalyticsRow[] {
  return rows.filter((row) => {
    if (field.surveyVersions !== "all" && !field.surveyVersions.includes(row.surveyVersion)) {
      return false
    }
    if (field.branchEligibility && (row.branch === null || !field.branchEligibility.includes(row.branch))) {
      return false
    }
    return true
  })
}

// --- Result shapes -----------------------------------------------------

export interface CrosstabCell {
  xValue: string
  yValue: string
  count: number
  /** Row percentage — of respondents with this xValue, what % also have
   * this yValue. */
  rowPercentage: number
}

export interface ExplorerCrosstabResult {
  status: "ok"
  method: "crosstab"
  xLabel: string
  yLabel: string
  cells: CrosstabCell[]
  xCategories: string[]
  yCategories: string[]
  association: ReturnType<typeof cramersV>
  n: number
  /** True when the average expected count per contingency-table cell is
   * low (< 5) — Cramér's V can look artificially large on a sparse
   * table even when it clears MIN_CELL_N overall, so the UI shows a
   * caution note rather than a bare number. */
  sparse: boolean
}

export interface ExplorerSpearmanResult {
  status: "ok"
  method: "spearman"
  xLabel: string
  yLabel: string
  association: ReturnType<typeof spearman>
  n: number
}

export interface ExplorerOrdinalByGroupRow {
  group: string
  n: number
  mean: number | null
  median: number | null
  flag: SampleFlag
}

export interface ExplorerOrdinalByGroupResult {
  status: "ok"
  method: "ordinal-by-group"
  groupLabel: string
  valueLabel: string
  rows: ExplorerOrdinalByGroupRow[]
  n: number
}

export interface ExplorerPrevalenceByGroupResult {
  status: "ok"
  method: "prevalence-by-group"
  groupLabel: string
  optionLabel: string
  /** rows[group][optionValue] = percentage within that group. */
  rows: {
    group: string
    n: number
    percentageByOption: Record<string, number>
    flag: SampleFlag
  }[]
  options: SurveyOption[]
}

export interface ExplorerPairedResult {
  status: "ok"
  method: "paired-difference"
  xLabel: string
  yLabel: string
  lowerPercentage: number | null
  samePercentage: number | null
  higherPercentage: number | null
  medianGap: number | null
  n: number
}

export interface ExplorerUnsupportedResult {
  status: "unsupported"
  reason: string
}

export interface ExplorerSuppressedResult {
  status: "suppressed"
  n: number
}

export type ExplorerResult =
  | ExplorerCrosstabResult
  | ExplorerSpearmanResult
  | ExplorerOrdinalByGroupResult
  | ExplorerPrevalenceByGroupResult
  | ExplorerPairedResult
  | ExplorerUnsupportedResult
  | ExplorerSuppressedResult

/** True when x/y can be swapped without changing the analysis — lets the
 * UI validate a Y choice against whichever field the user picked as X
 * first, in either order. */
export function analyzeRelationship(
  rows: AnalyticsRow[],
  xKey: string,
  yKey: string,
  segmentKey?: string
): ExplorerResult {
  const xField = getExplorerField(xKey)
  const yField = getExplorerField(yKey)
  if (!xField || !yField) {
    return { status: "unsupported", reason: "Unknown field." }
  }
  if (!xField.allowedAsX) {
    return { status: "unsupported", reason: `${xField.label} can't be used as X.` }
  }
  if (!yField.allowedAsY) {
    return { status: "unsupported", reason: `${yField.label} can't be used as Y.` }
  }

  const eligibleRows = eligibleRowsFor(eligibleRowsFor(rows, xField), yField)
  const segmentField = segmentKey ? getExplorerField(segmentKey) : undefined

  // Paired difference takes priority: it's a specific, deliberately-asked
  // pair (e.g. early- vs. non-early-commitment breakfast frequency), not
  // a generic correlation.
  if (xField.pairedFieldKey === yField.key && xField.getOrdinal && yField.getOrdinal) {
    return computePairedDifference(eligibleRows, xField, yField)
  }

  if (xField.type === "multi-select" || yField.type === "multi-select") {
    const multiField = xField.type === "multi-select" ? xField : yField
    const groupField = multiField === xField ? yField : xField
    if (!multiField.getMultiSelect || groupField.type === "multi-select") {
      return {
        status: "unsupported",
        reason: "A multi-select field must be paired with a single-value field.",
      }
    }
    return computePrevalenceByGroup(eligibleRows, groupField, multiField, segmentField)
  }

  if (xField.getOrdinal && yField.getOrdinal) {
    return computeSpearmanResult(eligibleRows, xField, yField, segmentField)
  }

  if (xField.getOrdinal || yField.getOrdinal) {
    const ordinalField = xField.getOrdinal ? xField : yField
    const groupField = ordinalField === xField ? yField : xField
    return computeOrdinalByGroup(eligibleRows, groupField, ordinalField, segmentField)
  }

  return computeCrosstab(eligibleRows, xField, yField, segmentField)
}

export function computeCrosstab(
  rows: AnalyticsRow[],
  xField: ExplorerFieldMeta,
  yField: ExplorerFieldMeta,
  segmentField: ExplorerFieldMeta | undefined
): ExplorerResult {
  void segmentField // Phase 1: crosstabs don't split by segment yet.

  const pairs = rows
    .map((row) => [xField.getCategorical(row), yField.getCategorical(row)] as const)
    .filter((pair): pair is [string, string] => pair[0] !== null && pair[1] !== null)

  const n = pairs.length
  if (n < MIN_CELL_N) {
    return { status: "suppressed", n }
  }

  const xCategories = xField.options?.map((o) => o.value) ?? Array.from(new Set(pairs.map((p) => p[0])))
  const yCategories = yField.options?.map((o) => o.value) ?? Array.from(new Set(pairs.map((p) => p[1])))

  const rowTotals = new Map<string, number>()
  const cellCounts = new Map<string, number>()
  for (const [x, y] of pairs) {
    rowTotals.set(x, (rowTotals.get(x) ?? 0) + 1)
    const cellKey = `${x} ${y}`
    cellCounts.set(cellKey, (cellCounts.get(cellKey) ?? 0) + 1)
  }

  const cells: CrosstabCell[] = []
  for (const x of xCategories) {
    for (const y of yCategories) {
      const count = cellCounts.get(`${x} ${y}`) ?? 0
      const rowTotal = rowTotals.get(x) ?? 0
      cells.push({
        xValue: x,
        yValue: y,
        count,
        rowPercentage: percentageOf(count, rowTotal),
      })
    }
  }

  const cellCount = xCategories.length * yCategories.length
  const sparse = cellCount > 0 && n / cellCount < 5

  return {
    status: "ok",
    method: "crosstab",
    xLabel: xField.label,
    yLabel: yField.label,
    cells,
    xCategories,
    yCategories,
    association: cramersV(
      pairs.map((p) => p[0]),
      pairs.map((p) => p[1])
    ),
    n,
    sparse,
  }
}

export function computeSpearmanResult(
  rows: AnalyticsRow[],
  xField: ExplorerFieldMeta,
  yField: ExplorerFieldMeta,
  segmentField: ExplorerFieldMeta | undefined
): ExplorerResult {
  void segmentField // Phase 1: single overall result; segmentation is Phase 2.

  const pairs: [number, number][] = []
  for (const row of rows) {
    const x = xField.getOrdinal!(row)
    const y = yField.getOrdinal!(row)
    if (x !== null && y !== null) {
      pairs.push([x, y])
    }
  }
  if (pairs.length < MIN_CELL_N) {
    return { status: "suppressed", n: pairs.length }
  }
  return {
    status: "ok",
    method: "spearman",
    xLabel: xField.label,
    yLabel: yField.label,
    association: spearman(pairs),
    n: pairs.length,
  }
}

export function computeOrdinalByGroup(
  rows: AnalyticsRow[],
  groupField: ExplorerFieldMeta,
  ordinalField: ExplorerFieldMeta,
  segmentField: ExplorerFieldMeta | undefined
): ExplorerResult {
  void segmentField

  const groups = groupField.options?.map((o) => o.value) ?? Array.from(
    new Set(rows.map((row) => groupField.getCategorical(row)).filter((v): v is string => v !== null))
  )

  const resultRows: ExplorerOrdinalByGroupRow[] = groups.map((groupValue) => {
    const members = rows.filter((row) => groupField.getCategorical(row) === groupValue)
    const scores = members
      .map((row) => ordinalField.getOrdinal!(row))
      .filter((score): score is number => score !== null)
    const n = scores.length
    return {
      group: groupValue,
      n,
      mean: n === 0 ? null : scores.reduce((sum, v) => sum + v, 0) / n,
      median: median(scores),
      flag: sampleFlag(n),
    }
  })

  const totalN = resultRows.reduce((sum, row) => sum + row.n, 0)
  return {
    status: "ok",
    method: "ordinal-by-group",
    groupLabel: groupField.label,
    valueLabel: ordinalField.label,
    rows: resultRows,
    n: totalN,
  }
}

export function computePrevalenceByGroup(
  rows: AnalyticsRow[],
  groupField: ExplorerFieldMeta,
  multiField: ExplorerFieldMeta,
  segmentField: ExplorerFieldMeta | undefined
): ExplorerResult {
  void segmentField

  const options = multiField.options ?? []
  const groups = groupField.options?.map((o) => o.value) ?? Array.from(
    new Set(rows.map((row) => groupField.getCategorical(row)).filter((v): v is string => v !== null))
  )

  const resultRows = groups.map((groupValue) => {
    const members = rows.filter((row) => groupField.getCategorical(row) === groupValue)
    const n = members.length
    const percentageByOption: Record<string, number> = {}
    for (const option of options) {
      const count = members.filter((row) =>
        multiField.getMultiSelect!(row).includes(option.value)
      ).length
      percentageByOption[option.value] = percentageOf(count, n)
    }
    return { group: groupValue, n, percentageByOption, flag: sampleFlag(n) }
  })

  return {
    status: "ok",
    method: "prevalence-by-group",
    groupLabel: groupField.label,
    optionLabel: multiField.label,
    rows: resultRows,
    options,
  }
}

export function computePairedDifference(
  rows: AnalyticsRow[],
  xField: ExplorerFieldMeta,
  yField: ExplorerFieldMeta
): ExplorerResult {
  const gaps: number[] = []
  for (const row of rows) {
    const x = xField.getOrdinal!(row)
    const y = yField.getOrdinal!(row)
    if (x !== null && y !== null) {
      gaps.push(y - x)
    }
  }
  const n = gaps.length
  if (n < MIN_CELL_N) {
    return { status: "suppressed", n }
  }

  const lower = gaps.filter((g) => g > 0).length
  const same = gaps.filter((g) => g === 0).length
  const higher = gaps.filter((g) => g < 0).length

  return {
    status: "ok",
    method: "paired-difference",
    xLabel: xField.label,
    yLabel: yField.label,
    lowerPercentage: percentageOf(lower, n),
    samePercentage: percentageOf(same, n),
    higherPercentage: percentageOf(higher, n),
    medianGap: median(gaps),
    n,
  }
}

// --- Segmentation --------------------------------------------------------
//
// Additive on top of analyzeRelationship rather than folded into it: the
// overall X/Y result keeps exactly the contract already tested above,
// and a chosen segment just runs that same analysis again per segment
// category, on the matching subset of rows.
export interface ExplorerSegmentResult {
  segmentValue: string
  segmentLabel: string
  n: number
  result: ExplorerResult
}

export function analyzeRelationshipBySegment(
  rows: AnalyticsRow[],
  xKey: string,
  yKey: string,
  segmentKey: string
): ExplorerSegmentResult[] | null {
  const segmentField = getExplorerField(segmentKey)
  if (!segmentField) {
    return null
  }

  const segmentRows = eligibleRowsFor(rows, segmentField)
  const categories =
    segmentField.options?.map((option) => option.value) ??
    Array.from(
      new Set(
        segmentRows
          .map((row) => segmentField.getCategorical(row))
          .filter((value): value is string => value !== null)
      )
    )
  const labelByValue = new Map(
    (segmentField.options ?? []).map((option) => [option.value, option.label])
  )

  return categories.map((value) => {
    const subset = segmentRows.filter((row) => segmentField.getCategorical(row) === value)
    return {
      segmentValue: value,
      segmentLabel: labelByValue.get(value) ?? value,
      n: subset.length,
      result: analyzeRelationship(subset, xKey, yKey),
    }
  })
}
