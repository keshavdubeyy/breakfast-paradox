import type {
  AfterMorningRoutineAnswers,
  UsualRoutineAnswers,
} from "./survey-state"
import { type ArchetypeId, ARCHETYPE_IDS, ARCHETYPES } from "./archetype-content"
import {
  normalizeAgreement,
  normalizeAlternativeBehaviour,
  normalizeBreakfastFrequency,
  normalizeConditionalFrequency,
  normalizeDecisionVariability,
  normalizeFrequency,
  normalizeIncludes,
  normalizeInfluence,
  normalizePreviousNightEffect,
  normalizeSleepTimeLateness,
  normalizeTransferBehaviour,
  normalizeValueOrientation,
} from "./archetype-normalization"

// --- Archetype scoring engine ---------------------------------------------
//
// Deterministic and pure: every function here is a plain function of its
// input data. No randomness, no network/API calls, no LLM in the loop —
// the same survey answers always produce the same six scores.
//
// Deliberately excluded from every formula below (and structurally
// impossible to include, since this module never receives AboutYouAnswers
// as input): gender, hostel, program, academic year. Also excluded by
// simply never being read: the attention-check row planted in the
// influence grid, the open-ended improvement suggestion, and the
// "what would you change" free-text question — those are for
// segmentation, data-quality, or system analysis, not identity
// classification.

export interface ArchetypeInputData {
  usualRoutine: UsualRoutineAnswers
  afterMorningRoutine: AfterMorningRoutineAnswers
}

export interface ScoreComponentBreakdown {
  key: string
  label: string
  weight: number
  /** The raw survey value(s) this component read, before normalization. */
  rawInput: string | string[] | null
  /** 0-1, or null if this component was not asked / not applicable. */
  normalizedValue: number | null
  /** weight × normalizedValue, or null when normalizedValue is null. */
  weightedContribution: number | null
  available: boolean
}

export interface ArchetypeScoreBreakdown {
  id: ArchetypeId
  label: string
  components: ScoreComponentBreakdown[]
  /** Sum of weights of only the available (non-null) components. */
  availableWeightTotal: number
  /** 0-1 */
  score: number
  /** 0-100, rounded — what's shown to respondents. */
  scaledScore: number
}

interface ComponentInput {
  key: string
  label: string
  weight: number
  rawInput: string | string[] | null
  normalizedValue: number | null
}

function buildBreakdown(
  id: ArchetypeId,
  components: ComponentInput[]
): ArchetypeScoreBreakdown {
  const resolved: ScoreComponentBreakdown[] = components.map((component) => {
    const available = component.normalizedValue !== null
    return {
      ...component,
      available,
      weightedContribution: available
        ? component.weight * (component.normalizedValue as number)
        : null,
    }
  })

  const availableWeightTotal = resolved
    .filter((c) => c.available)
    .reduce((sum, c) => sum + c.weight, 0)

  const weightedSum = resolved.reduce(
    (sum, c) => sum + (c.weightedContribution ?? 0),
    0
  )

  const score = availableWeightTotal > 0 ? weightedSum / availableWeightTotal : 0

  return {
    id,
    label: ARCHETYPES[id].name,
    components: resolved,
    availableWeightTotal,
    score,
    scaledScore: Math.round(score * 100),
  }
}

// --- Branch detection ------------------------------------------------------
//
// Pure, read-only checks mirroring the question-visibility gating on the
// Breakfast Routine and After Your Morning Routine pages. Duplicated here
// (rather than imported from those page components) so this module has
// zero dependency on UI code, and so editing page JSX can never change
// scoring behavior.

function isConditionalBreakfastEater(values: UsualRoutineAnswers) {
  return values.breakfastFrequency === "some-days"
}

function isRareOrNonBreakfastEater(values: UsualRoutineAnswers) {
  return (
    values.breakfastFrequency === "rarely" ||
    values.breakfastFrequency === "never"
  )
}

/**
 * breakfastMotivationFactors is asked after every branch EXCEPT Branch C
 * respondents who never eat mess breakfast at all (breakfastFrequency is
 * rarely/never AND they report no occasional eating either). Used to
 * gate both HabitBonus (Routine Keeper) and PaidMotivation (Meal
 * Maximizer) — a stale value left over from a since-changed branch
 * answer is never trusted; only the CURRENT branch state decides
 * availability.
 */
function sawMotivationQuestion(values: UsualRoutineAnswers) {
  if (!isRareOrNonBreakfastEater(values)) {
    return true
  }
  return (
    values.occasionalBreakfastFrequency !== "" &&
    values.occasionalBreakfastFrequency !== "never"
  )
}

// --- 1. Routine Keeper ------------------------------------------------
//
// RoutineScore =
//   0.30 × BF
// + 0.25 × PlannedBreakfast
// + 0.20 × (1 - PlanChange)
// + 0.15 × (1 - MorningDependent)
// + 0.10 × HabitBonus

export function calculateRoutineKeeper(
  data: ArchetypeInputData
): ArchetypeScoreBreakdown {
  const { usualRoutine: u, afterMorningRoutine: a } = data

  const planChange = normalizeFrequency(u.breakfastPlanChangeFrequency)
  const morningDependent = normalizeAgreement(
    a.agreementRatings.dependsOnMorningAgreement
  )
  const motivationAvailable = sawMotivationQuestion(u)

  return buildBreakdown("routine-keeper", [
    {
      key: "breakfastFrequency",
      label: "Breakfast frequency (BF)",
      weight: 0.3,
      rawInput: u.breakfastFrequency || null,
      normalizedValue: normalizeBreakfastFrequency(u.breakfastFrequency),
    },
    {
      key: "plannedBreakfast",
      label: '"Breakfast is something I plan for in advance"',
      weight: 0.25,
      rawInput: a.agreementRatings.breakfastPlannedInAdvanceAgreement ?? null,
      normalizedValue: normalizeAgreement(
        a.agreementRatings.breakfastPlannedInAdvanceAgreement
      ),
    },
    {
      key: "planChangeInverse",
      label: "1 − plan-change frequency",
      weight: 0.2,
      rawInput: u.breakfastPlanChangeFrequency || null,
      normalizedValue: planChange !== null ? 1 - planChange : null,
    },
    {
      key: "morningDependentInverse",
      label: '1 − "depends on how my morning is going"',
      weight: 0.15,
      rawInput: a.agreementRatings.dependsOnMorningAgreement ?? null,
      normalizedValue: morningDependent !== null ? 1 - morningDependent : null,
    },
    {
      key: "habitBonus",
      label: 'Habit bonus ("part of my routine/habit" selected)',
      weight: 0.1,
      rawInput: motivationAvailable ? u.breakfastMotivationFactors : null,
      normalizedValue: motivationAvailable
        ? normalizeIncludes(u.breakfastMotivationFactors, "part-of-routine")
        : null,
    },
  ])
}

// --- 2. Sleep Saver -----------------------------------------------------
//
// SleepScore =
//   0.35 × SleepInfluence
// + 0.30 × SleepOverBreakfast
// + 0.15 × LateSleepScore
// + 0.10 × PreviousNightEffect
// + 0.10 × (1 - BF)

export function calculateSleepSaver(
  data: ArchetypeInputData
): ArchetypeScoreBreakdown {
  const { usualRoutine: u, afterMorningRoutine: a } = data
  const bf = normalizeBreakfastFrequency(u.breakfastFrequency)

  return buildBreakdown("sleep-saver", [
    {
      key: "sleepInfluence",
      label: "How much sleep I got (influence)",
      weight: 0.35,
      rawInput: a.influenceRatings.sleepAmountInfluence ?? null,
      normalizedValue: normalizeInfluence(
        a.influenceRatings.sleepAmountInfluence
      ),
    },
    {
      key: "sleepOverBreakfast",
      label:
        '"Getting a little more sleep feels more important than breakfast"',
      weight: 0.3,
      rawInput: a.agreementRatings.sleepOverBreakfastAgreement ?? null,
      normalizedValue: normalizeAgreement(
        a.agreementRatings.sleepOverBreakfastAgreement
      ),
    },
    {
      key: "lateSleep",
      label: "Weekday sleep time (lateness)",
      weight: 0.15,
      rawInput: u.sleepTimeWeekday || null,
      normalizedValue: normalizeSleepTimeLateness(u.sleepTimeWeekday),
    },
    {
      key: "previousNightEffect",
      label: "Whether the previous night affects breakfast",
      weight: 0.1,
      rawInput: a.previousNightAffectsBreakfast || null,
      normalizedValue: normalizePreviousNightEffect(
        a.previousNightAffectsBreakfast
      ),
    },
    {
      key: "breakfastFrequencyInverse",
      label: "1 − breakfast frequency (BF)",
      weight: 0.1,
      rawInput: u.breakfastFrequency || null,
      normalizedValue: bf !== null ? 1 - bf : null,
    },
  ])
}

// --- 3. Schedule Juggler -------------------------------------------------
//
// ScheduleScore =
//   0.25 × ClassTimingInfluence
// + 0.25 × MorningTimeInfluence
// + 0.20 × ClassOverBreakfast
// + 0.20 × EarlyDayGap
// + 0.10 × ServingTimeInfluence
//
// EarlyDayGap = max(0, NonEarlyBreakfastFrequency - EarlyBreakfastFrequency)
// Unavailable when the respondent has no early commitments at all
// ("Not applicable" on the early-commitment question).

export function calculateScheduleJuggler(
  data: ArchetypeInputData
): ArchetypeScoreBreakdown {
  const { afterMorningRoutine: a } = data

  let earlyDayGap: number | null = null
  let earlyDayGapRaw: string[] | null = null
  if (
    a.earlyCommitmentBreakfastFrequency &&
    a.earlyCommitmentBreakfastFrequency !== "not-applicable"
  ) {
    const early = normalizeFrequency(a.earlyCommitmentBreakfastFrequency)
    const nonEarly = normalizeFrequency(a.noEarlyCommitmentBreakfastFrequency)
    if (early !== null && nonEarly !== null) {
      earlyDayGap = Math.max(0, nonEarly - early)
      earlyDayGapRaw = [
        a.noEarlyCommitmentBreakfastFrequency,
        a.earlyCommitmentBreakfastFrequency,
      ]
    }
  }

  return buildBreakdown("schedule-juggler", [
    {
      key: "classTimingInfluence",
      label: "Time of my first class/meeting (influence)",
      weight: 0.25,
      rawInput: a.influenceRatings.firstCommitmentTimeInfluence ?? null,
      normalizedValue: normalizeInfluence(
        a.influenceRatings.firstCommitmentTimeInfluence
      ),
    },
    {
      key: "morningTimeInfluence",
      label: "How much time I have in the morning (influence)",
      weight: 0.25,
      rawInput: a.influenceRatings.morningTimeInfluence ?? null,
      normalizedValue: normalizeInfluence(
        a.influenceRatings.morningTimeInfluence
      ),
    },
    {
      key: "classOverBreakfast",
      label: '"Reaching class on time matters more than breakfast"',
      weight: 0.2,
      rawInput: a.agreementRatings.classOnTimeOverBreakfastAgreement ?? null,
      normalizedValue: normalizeAgreement(
        a.agreementRatings.classOnTimeOverBreakfastAgreement
      ),
    },
    {
      key: "earlyDayGap",
      label: "max(0, non-early-day frequency − early-day frequency)",
      weight: 0.2,
      rawInput: earlyDayGapRaw,
      normalizedValue: earlyDayGap,
    },
    {
      key: "servingTimeInfluence",
      label: "Breakfast serving time (influence)",
      weight: 0.1,
      rawInput: a.influenceRatings.breakfastServingTimeInfluence ?? null,
      normalizedValue: normalizeInfluence(
        a.influenceRatings.breakfastServingTimeInfluence
      ),
    },
  ])
}

// --- 4. Flexible Switcher -------------------------------------------------
//
// FlexibleScore =
//   0.30 × PlanChange
// + 0.25 × MorningDependent
// + 0.15 × ConditionalFrequency
// + 0.15 × DecisionVariability
// + 0.15 × UnexpectedChange
//
// DecisionVariability and UnexpectedChange are Branch B-only signals.

export function calculateFlexibleSwitcher(
  data: ArchetypeInputData
): ArchetypeScoreBreakdown {
  const { usualRoutine: u, afterMorningRoutine: a } = data
  const isBranchB = isConditionalBreakfastEater(u)

  return buildBreakdown("flexible-switcher", [
    {
      key: "planChange",
      label: "Plan-change frequency",
      weight: 0.3,
      rawInput: u.breakfastPlanChangeFrequency || null,
      normalizedValue: normalizeFrequency(u.breakfastPlanChangeFrequency),
    },
    {
      key: "morningDependent",
      label: '"Depends on how my morning is going"',
      weight: 0.25,
      rawInput: a.agreementRatings.dependsOnMorningAgreement ?? null,
      normalizedValue: normalizeAgreement(
        a.agreementRatings.dependsOnMorningAgreement
      ),
    },
    {
      key: "conditionalFrequency",
      label: "Conditional-eating frequency (derived from BF)",
      weight: 0.15,
      rawInput: u.breakfastFrequency || null,
      normalizedValue: normalizeConditionalFrequency(u.breakfastFrequency),
    },
    {
      key: "decisionVariability",
      label: "Decision-point variability (Branch B only)",
      weight: 0.15,
      rawInput: isBranchB ? u.breakfastDecisionPoint || null : null,
      normalizedValue:
        isBranchB && u.breakfastDecisionPoint
          ? normalizeDecisionVariability(u.breakfastDecisionPoint)
          : null,
    },
    {
      key: "unexpectedChange",
      label:
        '"Something unexpected comes up" selected (Branch B only, when shown)',
      weight: 0.15,
      rawInput:
        isBranchB && u.breakfastPlanChangeReasons.length > 0
          ? u.breakfastPlanChangeReasons
          : null,
      normalizedValue:
        isBranchB && u.breakfastPlanChangeReasons.length > 0
          ? normalizeIncludes(u.breakfastPlanChangeReasons, "unexpected-event")
          : null,
    },
  ])
}

// --- 5. Alternative Forager ------------------------------------------------
//
// AlternativeScore =
//   0.25 × CanteenInfluence
// + 0.20 × OnlineOrderingInfluence
// + 0.20 × AlternativeBehaviour
// + 0.15 × EatLaterBelief
// + 0.10 × SpendingFrequency
// + 0.10 × (1 - BF)

export function calculateAlternativeForager(
  data: ArchetypeInputData
): ArchetypeScoreBreakdown {
  const { usualRoutine: u, afterMorningRoutine: a } = data
  const bf = normalizeBreakfastFrequency(u.breakfastFrequency)

  return buildBreakdown("alternative-forager", [
    {
      key: "canteenInfluence",
      label: "Availability of food at David’s/VC/other canteens (influence)",
      weight: 0.25,
      rawInput: a.influenceRatings.canteenAvailabilityInfluence ?? null,
      normalizedValue: normalizeInfluence(
        a.influenceRatings.canteenAvailabilityInfluence
      ),
    },
    {
      key: "onlineOrderingInfluence",
      label: "Ability to order food online (influence)",
      weight: 0.2,
      rawInput: a.influenceRatings.onlineOrderingInfluence ?? null,
      normalizedValue: normalizeInfluence(
        a.influenceRatings.onlineOrderingInfluence
      ),
    },
    {
      key: "alternativeBehaviour",
      label: "What you usually do before lunch on non-breakfast days",
      weight: 0.2,
      rawInput: a.nonBreakfastMealSource,
      normalizedValue: normalizeAlternativeBehaviour(
        a.nonBreakfastMealSource
      ),
    },
    {
      key: "eatLaterBelief",
      label: '"If I miss breakfast, I can just eat something later"',
      weight: 0.15,
      rawInput: a.agreementRatings.eatLaterInsteadAgreement ?? null,
      normalizedValue: normalizeAgreement(
        a.agreementRatings.eatLaterInsteadAgreement
      ),
    },
    {
      key: "spendingFrequency",
      label: "How often you spend on food/drinks before lunch",
      weight: 0.1,
      rawInput: a.nonBreakfastSpendingFrequency || null,
      normalizedValue: normalizeFrequency(a.nonBreakfastSpendingFrequency),
    },
    {
      key: "breakfastFrequencyInverse",
      label: "1 − breakfast frequency (BF)",
      weight: 0.1,
      rawInput: u.breakfastFrequency || null,
      normalizedValue: bf !== null ? 1 - bf : null,
    },
  ])
}

// --- 6. Meal Maximizer ---------------------------------------------------
//
// MaximizerScore =
//   0.30 × PaidMealBelief
// + 0.20 × ResaleInfluence
// + 0.20 × TransferBehaviour
// + 0.15 × ValueOrientation
// + 0.15 × PaidMotivation
//
// TransferBehaviour uses MAX over selected actions, never the sum.

export function calculateMealMaximizer(
  data: ArchetypeInputData
): ArchetypeScoreBreakdown {
  const { usualRoutine: u, afterMorningRoutine: a } = data
  const motivationAvailable = sawMotivationQuestion(u)

  return buildBreakdown("meal-maximizer", [
    {
      key: "paidMealBelief",
      label:
        '"Since I have already paid, I prefer to use the meal whenever possible"',
      weight: 0.3,
      rawInput: a.agreementRatings.alreadyPaidUseWheneverAgreement ?? null,
      normalizedValue: normalizeAgreement(
        a.agreementRatings.alreadyPaidUseWheneverAgreement
      ),
    },
    {
      key: "resaleInfluence",
      label: "Ability to sell/exchange/give away registered breakfast (influence)",
      weight: 0.2,
      rawInput: a.influenceRatings.resaleAbilityInfluence ?? null,
      normalizedValue: normalizeInfluence(
        a.influenceRatings.resaleAbilityInfluence
      ),
    },
    {
      key: "transferBehaviour",
      label: "What you do when your breakfast plan changes (MAX, not sum)",
      weight: 0.2,
      rawInput:
        u.breakfastPlanChangeActions.length > 0
          ? u.breakfastPlanChangeActions
          : null,
      normalizedValue: normalizeTransferBehaviour(u.breakfastPlanChangeActions),
    },
    {
      key: "valueOrientation",
      label: "Perceived value of the allotted meal",
      weight: 0.15,
      rawInput: a.mealValuePerception || null,
      normalizedValue: normalizeValueOrientation(a.mealValuePerception),
    },
    {
      key: "paidMotivation",
      label: '"I already paid for it, so I want to use it" selected',
      weight: 0.15,
      rawInput: motivationAvailable ? u.breakfastMotivationFactors : null,
      normalizedValue: motivationAvailable
        ? normalizeIncludes(u.breakfastMotivationFactors, "already-paid")
        : null,
    },
  ])
}

const CALCULATORS: Record<
  ArchetypeId,
  (data: ArchetypeInputData) => ArchetypeScoreBreakdown
> = {
  "routine-keeper": calculateRoutineKeeper,
  "sleep-saver": calculateSleepSaver,
  "schedule-juggler": calculateScheduleJuggler,
  "flexible-switcher": calculateFlexibleSwitcher,
  "alternative-forager": calculateAlternativeForager,
  "meal-maximizer": calculateMealMaximizer,
}

// Which archetype the Q8 "biggest influence" pick corresponds to, for tie
// breaking only. The planted attention-check row is intentionally absent
// — it isn't a real factor and can never win a tie-break.
const BIGGEST_INFLUENCE_ARCHETYPE_MAP: Partial<Record<string, ArchetypeId>> = {
  sleepAmountInfluence: "sleep-saver",
  ateLatePreviousNightInfluence: "sleep-saver",
  firstCommitmentTimeInfluence: "schedule-juggler",
  morningTimeInfluence: "schedule-juggler",
  breakfastServingTimeInfluence: "schedule-juggler",
  distanceInfluence: "alternative-forager",
  queueWaitInfluence: "alternative-forager",
  canteenAvailabilityInfluence: "alternative-forager",
  onlineOrderingInfluence: "alternative-forager",
  resaleAbilityInfluence: "meal-maximizer",
  breakfastMenuInfluence: "flexible-switcher",
  messAllocationInfluence: "flexible-switcher",
  friendsGoingInfluence: "flexible-switcher",
  hungerOnWakingInfluence: "flexible-switcher",
}

export const TIE_GAP_THRESHOLD = 5
export const LOW_CONFIDENCE_THRESHOLD = 55

export type Confidence = "strong" | "mixed"

export interface ArchetypeResult {
  breakdowns: Record<ArchetypeId, ArchetypeScoreBreakdown>
  /** Convenience map of scaledScore (0-100) per archetype. */
  scores: Record<ArchetypeId, number>
  winner: ArchetypeId
  runnerUp: ArchetypeId
  /** scores[winner] - scores[runnerUp], after any tie-break swap. */
  difference: number
  /** True whenever the top two were within TIE_GAP_THRESHOLD points. */
  tieBreakerUsed: boolean
  /** The biggestInfluenceFactor key that decided the tie, if it did. */
  tieBreakerFactor: string | null
  confidence: Confidence
}

/**
 * Pure and deterministic: the same ArchetypeInputData always produces the
 * same ArchetypeResult. No randomness, no network or LLM call — every
 * respondent's archetype is fully computed from their own survey answers.
 */
export function calculateArchetypeResult(
  data: ArchetypeInputData
): ArchetypeResult {
  const breakdowns = Object.fromEntries(
    ARCHETYPE_IDS.map((id) => [id, CALCULATORS[id](data)])
  ) as Record<ArchetypeId, ArchetypeScoreBreakdown>

  const scores = Object.fromEntries(
    ARCHETYPE_IDS.map((id) => [id, breakdowns[id].scaledScore])
  ) as Record<ArchetypeId, number>

  const ranked = [...ARCHETYPE_IDS].sort((a, b) => scores[b] - scores[a])
  const topId = ranked[0]
  const secondId = ranked[1]
  const gap = scores[topId] - scores[secondId]
  const tieBreakerUsed = gap < TIE_GAP_THRESHOLD

  let winner = topId
  let runnerUp = secondId
  let tieBreakerFactor: string | null = null

  if (tieBreakerUsed) {
    const biggestInfluenceFactor = data.afterMorningRoutine.biggestInfluenceFactor
    const mappedArchetype = biggestInfluenceFactor
      ? BIGGEST_INFLUENCE_ARCHETYPE_MAP[biggestInfluenceFactor]
      : undefined

    if (mappedArchetype === topId || mappedArchetype === secondId) {
      tieBreakerFactor = biggestInfluenceFactor
      if (mappedArchetype === secondId) {
        winner = secondId
        runnerUp = topId
      }
    }
    // If the biggest-influence pick doesn't correspond to either
    // candidate, the higher raw score (topId) keeps its place as winner.
  }

  const difference = scores[winner] - scores[runnerUp]
  const confidence: Confidence =
    scores[winner] < LOW_CONFIDENCE_THRESHOLD || tieBreakerUsed
      ? "mixed"
      : "strong"

  return {
    breakdowns,
    scores,
    winner,
    runnerUp,
    difference,
    tieBreakerUsed,
    tieBreakerFactor,
    confidence,
  }
}

// --- Persistence shape -----------------------------------------------------
//
// The archetype is calculated exactly once, at successful survey
// submission (see the "Continue" handler on the After Your Morning
// Routine page) — never re-derived on the result page. That's what
// ARCHETYPE_ENGINE_VERSION is for: it's stamped onto every persisted
// result so that, if the formulas above are ever revised, old saved
// results stay attributed to the version that actually produced them
// instead of silently changing on a later render.
//
// Bump this whenever a formula, weight, or normalization mapping changes.
//
// v2: nonBreakfastMealSource became multi-select (checkboxes instead of
// a single radio) — normalizeAlternativeBehaviour now takes MAX over the
// selected values instead of looking up one. This is also the same
// number stamped as `survey_version` on the raw response row (see
// lib/survey-submission.ts), which is how lib/analytics/parse.ts knows
// nonBreakfastMealSource is stored as an array from here on, while v1
// rows keep their original single-value shape.
export const ARCHETYPE_ENGINE_VERSION = 2

export interface PersistedArchetypeResult {
  primaryArchetype: ArchetypeId
  secondaryArchetype: ArchetypeId
  confidence: Confidence
  scores: Record<ArchetypeId, number>
  surveyVersion: number
  computedAt: string
}

/** Reduces a full ArchetypeResult down to what's worth persisting. */
export function toPersistedArchetypeResult(
  result: ArchetypeResult
): PersistedArchetypeResult {
  return {
    primaryArchetype: result.winner,
    secondaryArchetype: result.runnerUp,
    confidence: result.confidence,
    scores: result.scores,
    surveyVersion: ARCHETYPE_ENGINE_VERSION,
    computedAt: new Date().toISOString(),
  }
}
