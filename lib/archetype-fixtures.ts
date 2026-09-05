import {
  defaultAfterMorningRoutineAnswers,
  defaultUsualRoutineAnswers,
  type AfterMorningRoutineAnswers,
  type UsualRoutineAnswers,
} from "./survey-state"
import type { ArchetypeId } from "./archetype-content"
import type { ArchetypeInputData } from "./archetype-scoring"

// --- Deterministic archetype fixtures -------------------------------------
//
// Used by both the automated test suite (lib/__tests__/archetype-scoring.test.ts)
// and the /dev/archetypes debug page, so "the fixture the developer clicks"
// and "the fixture the tests assert against" can never drift apart.
//
// Every scale-based answer that ISN'T relevant to a given archetype is set
// to a neutral midpoint (agreement: neutral, influence: moderately,
// frequency: sometimes) so it can't accidentally tip the result toward a
// different archetype — only the fields called out in each formula are
// pushed toward an extreme.

function mergeUsualRoutine(
  overrides: Partial<UsualRoutineAnswers>
): UsualRoutineAnswers {
  return { ...defaultUsualRoutineAnswers, ...BASE_USUAL_ROUTINE, ...overrides }
}

function mergeAfterMorningRoutine(
  overrides: Partial<AfterMorningRoutineAnswers>
): AfterMorningRoutineAnswers {
  return {
    ...defaultAfterMorningRoutineAnswers,
    ...BASE_AFTER_MORNING_ROUTINE,
    ...overrides,
    agreementRatings: {
      ...BASE_AFTER_MORNING_ROUTINE.agreementRatings,
      ...overrides.agreementRatings,
    },
    influenceRatings: {
      ...BASE_AFTER_MORNING_ROUTINE.influenceRatings,
      ...overrides.influenceRatings,
    },
    comparisonRatings: {
      ...BASE_AFTER_MORNING_ROUTINE.comparisonRatings,
      ...overrides.comparisonRatings,
    },
  }
}

// Neutral midpoint for every agreement statement used by any formula.
const NEUTRAL_AGREEMENT_RATINGS = {
  sleepOverBreakfastAgreement: "neutral",
  eatLaterInsteadAgreement: "neutral",
  classOnTimeOverBreakfastAgreement: "neutral",
  alreadyPaidUseWheneverAgreement: "neutral",
  resaleReducesConcernAgreement: "neutral",
  breakfastPlannedInAdvanceAgreement: "neutral",
  dependsOnMorningAgreement: "neutral",
  noHungerNoReasonAgreement: "neutral",
  inconvenientEatLaterAgreement: "neutral",
}

// Neutral midpoint for every influence row used by any formula (the
// planted attention-check row is included so the grid "looks answered"
// but is never read by any formula).
const NEUTRAL_INFLUENCE_RATINGS = {
  sleepAmountInfluence: "moderately",
  firstCommitmentTimeInfluence: "moderately",
  morningTimeInfluence: "moderately",
  breakfastServingTimeInfluence: "moderately",
  breakfastMenuInfluence: "moderately",
  messAllocationInfluence: "moderately",
  distanceInfluence: "moderately",
  attentionCheckInfluence: "a-lot",
  queueWaitInfluence: "moderately",
  friendsGoingInfluence: "moderately",
  hungerOnWakingInfluence: "moderately",
  ateLatePreviousNightInfluence: "moderately",
  canteenAvailabilityInfluence: "moderately",
  onlineOrderingInfluence: "moderately",
  resaleAbilityInfluence: "moderately",
}

const BASE_USUAL_ROUTINE: Partial<UsualRoutineAnswers> = {
  sleepTimeWeekday: "no-consistent-time",
  sleepTimeWeekend: "no-consistent-time",
  breakfastPlanChangeFrequency: "sometimes",
  breakfastPlanChangeActions: [],
  breakfastFrequency: "most-days",
  breakfastMotivationFactors: [],
  occasionalBreakfastFrequency: "",
  breakfastDecisionPoint: "",
  breakfastPlanChangeReasons: [],
}

const BASE_AFTER_MORNING_ROUTINE: Partial<AfterMorningRoutineAnswers> & {
  agreementRatings: Record<string, string>
  influenceRatings: Record<string, string>
  comparisonRatings: Record<string, string>
} = {
  earlyCommitmentBreakfastFrequency: "sometimes",
  noEarlyCommitmentBreakfastFrequency: "sometimes",
  nonBreakfastMealSource: ["varies"],
  nonBreakfastSpendingFrequency: "sometimes",
  previousNightAffectsBreakfast: "it-depends",
  mealValuePerception: "not-sure-how-cost-works",
  biggestInfluenceFactor: "",
  agreementRatings: NEUTRAL_AGREEMENT_RATINGS,
  influenceRatings: NEUTRAL_INFLUENCE_RATINGS,
  comparisonRatings: {},
}

export interface ArchetypeFixture {
  id: ArchetypeId
  label: string
  data: ArchetypeInputData
}

// --- A. Strong Routine Keeper ---------------------------------------------
// High BF, strongly plans ahead, rarely changes plans, doesn't let the
// morning's mood decide, and picked "part of my routine" as a motivation.
export const ROUTINE_KEEPER_FIXTURE: ArchetypeFixture = {
  id: "routine-keeper",
  label: "Strong Routine Keeper",
  data: {
    usualRoutine: mergeUsualRoutine({
      breakfastFrequency: "almost-every-day",
      breakfastPlanChangeFrequency: "never",
      breakfastMotivationFactors: ["part-of-routine"],
    }),
    afterMorningRoutine: mergeAfterMorningRoutine({
      agreementRatings: {
        breakfastPlannedInAdvanceAgreement: "strongly-agree",
        dependsOnMorningAgreement: "strongly-disagree",
      },
    }),
  },
}

// --- B. Strong Sleep Saver -------------------------------------------------
// Sleeps very late, sleep influence maxed, strongly agrees sleep beats
// breakfast, previous night strongly affects the decision, low BF.
export const SLEEP_SAVER_FIXTURE: ArchetypeFixture = {
  id: "sleep-saver",
  label: "Strong Sleep Saver",
  data: {
    usualRoutine: mergeUsualRoutine({
      breakfastFrequency: "rarely",
      sleepTimeWeekday: "after-3am",
    }),
    afterMorningRoutine: mergeAfterMorningRoutine({
      previousNightAffectsBreakfast: "yes-often",
      influenceRatings: {
        sleepAmountInfluence: "very-strongly",
      },
      agreementRatings: {
        sleepOverBreakfastAgreement: "strongly-agree",
      },
      biggestInfluenceFactor: "sleepAmountInfluence",
    }),
  },
}

// --- C. Strong Schedule Juggler --------------------------------------------
// Class timing and morning time dominate; strongly agrees class beats
// breakfast; large early-vs-non-early breakfast gap; serving time matters.
export const SCHEDULE_JUGGLER_FIXTURE: ArchetypeFixture = {
  id: "schedule-juggler",
  label: "Strong Schedule Juggler",
  data: {
    usualRoutine: mergeUsualRoutine({}),
    afterMorningRoutine: mergeAfterMorningRoutine({
      earlyCommitmentBreakfastFrequency: "never",
      noEarlyCommitmentBreakfastFrequency: "almost-always",
      influenceRatings: {
        firstCommitmentTimeInfluence: "very-strongly",
        morningTimeInfluence: "very-strongly",
        breakfastServingTimeInfluence: "a-lot",
      },
      agreementRatings: {
        classOnTimeOverBreakfastAgreement: "strongly-agree",
      },
      biggestInfluenceFactor: "firstCommitmentTimeInfluence",
    }),
  },
}

// --- D. Strong Flexible Switcher --------------------------------------------
// Branch B ("some days"), plan changes often, strongly morning-dependent,
// decision point "varies", and an unexpected event drives plan changes.
export const FLEXIBLE_SWITCHER_FIXTURE: ArchetypeFixture = {
  id: "flexible-switcher",
  label: "Strong Flexible Switcher",
  data: {
    usualRoutine: mergeUsualRoutine({
      breakfastFrequency: "some-days",
      breakfastPlanChangeFrequency: "almost-always",
      breakfastDecisionPoint: "varies",
      breakfastPlanChangeReasons: ["unexpected-event"],
    }),
    afterMorningRoutine: mergeAfterMorningRoutine({
      agreementRatings: {
        dependsOnMorningAgreement: "strongly-agree",
      },
    }),
  },
}

// --- E. Strong Alternative Forager ------------------------------------------
// Canteen/online-ordering influence maxed, actively buys from a canteen or
// orders online, strongly believes "I can eat later", spends often, low BF.
export const ALTERNATIVE_FORAGER_FIXTURE: ArchetypeFixture = {
  id: "alternative-forager",
  label: "Strong Alternative Forager",
  data: {
    usualRoutine: mergeUsualRoutine({
      breakfastFrequency: "never",
      occasionalBreakfastFrequency: "never",
    }),
    afterMorningRoutine: mergeAfterMorningRoutine({
      nonBreakfastMealSource: ["order-online"],
      nonBreakfastSpendingFrequency: "almost-always",
      influenceRatings: {
        canteenAvailabilityInfluence: "very-strongly",
        onlineOrderingInfluence: "very-strongly",
      },
      agreementRatings: {
        eatLaterInsteadAgreement: "strongly-agree",
      },
      biggestInfluenceFactor: "canteenAvailabilityInfluence",
    }),
  },
}

// --- F. Strong Meal Maximizer ------------------------------------------------
// Strongly agrees "already paid, use it whenever"; resale ability matters a
// lot; plan-change actions include exchange+sell+give-away (MAX, not sum);
// perceives good value; motivated by "already paid".
export const MEAL_MAXIMIZER_FIXTURE: ArchetypeFixture = {
  id: "meal-maximizer",
  label: "Strong Meal Maximizer",
  data: {
    usualRoutine: mergeUsualRoutine({
      breakfastPlanChangeActions: ["exchange", "sell", "give-away"],
      breakfastMotivationFactors: ["already-paid"],
    }),
    afterMorningRoutine: mergeAfterMorningRoutine({
      mealValuePerception: "good-value",
      influenceRatings: {
        resaleAbilityInfluence: "very-strongly",
      },
      agreementRatings: {
        alreadyPaidUseWheneverAgreement: "strongly-agree",
      },
      biggestInfluenceFactor: "resaleAbilityInfluence",
    }),
  },
}

export const ARCHETYPE_FIXTURES: ArchetypeFixture[] = [
  ROUTINE_KEEPER_FIXTURE,
  SLEEP_SAVER_FIXTURE,
  SCHEDULE_JUGGLER_FIXTURE,
  FLEXIBLE_SWITCHER_FIXTURE,
  ALTERNATIVE_FORAGER_FIXTURE,
  MEAL_MAXIMIZER_FIXTURE,
]

// --- Edge-case fixtures, used by the automated test suite -----------------

/** Branch C, never eats breakfast at all — every branch-specific input
 * across all six formulas should be unavailable (null), never zero. */
export const MISSING_BRANCH_DATA_FIXTURE: ArchetypeInputData = {
  usualRoutine: mergeUsualRoutine({
    breakfastFrequency: "never",
    occasionalBreakfastFrequency: "never",
    breakfastMotivationFactors: [],
    breakfastPlanChangeActions: [],
    breakfastDecisionPoint: "",
    breakfastPlanChangeReasons: [],
  }),
  afterMorningRoutine: mergeAfterMorningRoutine({
    mealValuePerception: "not-applicable",
    earlyCommitmentBreakfastFrequency: "not-applicable",
  }),
}

/**
 * Schedule Juggler and Sleep Saver land within 5 points of each other
 * (Schedule Juggler 68, Sleep Saver 64 as of the current formulas), with
 * "sleepAmountInfluence" as the biggest-influence pick — which should flip
 * the winner from the higher raw score (Schedule Juggler) to Sleep Saver.
 */
export const TIE_WITHIN_FIVE_POINTS_FIXTURE: ArchetypeInputData = {
  usualRoutine: mergeUsualRoutine({
    breakfastFrequency: "most-days",
  }),
  afterMorningRoutine: mergeAfterMorningRoutine({
    noEarlyCommitmentBreakfastFrequency: "almost-always",
    influenceRatings: {
      sleepAmountInfluence: "a-lot",
      firstCommitmentTimeInfluence: "a-lot",
      morningTimeInfluence: "a-lot",
    },
    agreementRatings: {
      sleepOverBreakfastAgreement: "agree",
      classOnTimeOverBreakfastAgreement: "agree",
    },
    biggestInfluenceFactor: "sleepAmountInfluence",
  }),
}

/** Every scale answer at the exact midpoint — every archetype should land
 * near 50, well under the low-confidence threshold. */
export const LOW_CONFIDENCE_FIXTURE: ArchetypeInputData = {
  usualRoutine: mergeUsualRoutine({}),
  afterMorningRoutine: mergeAfterMorningRoutine({}),
}
