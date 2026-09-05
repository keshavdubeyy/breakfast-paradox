// --- Archetype normalization -----------------------------------------
//
// Every raw survey value used anywhere in archetype scoring gets converted
// to a 0-1 number here, and ONLY here. If a scoring formula needs a new
// conversion, add it to this file — never inline a numeric mapping inside
// a component or a scoring function.
//
// Each `normalize*` function returns `null` (not 0) for an empty string,
// an unrecognized value, or otherwise-unavailable input, so callers can
// distinguish "scored lowest" from "wasn't asked" — see the renormalizing
// `weightedAverage` in archetype-scoring.ts for why that distinction
// matters.

function lookup(map: Record<string, number>, raw: string | null | undefined): number | null {
  if (!raw) {
    return null
  }
  const value = map[raw]
  return value === undefined ? null : value
}

// --- Breakfast frequency (Q7, usualRoutine.breakfastFrequency) -----------
// Almost every day = 1.00, Most days = 0.75, Some days = 0.50,
// Rarely = 0.25, Never = 0.00

export const BREAKFAST_FREQUENCY_SCALE: Record<string, number> = {
  "almost-every-day": 1,
  "most-days": 0.75,
  "some-days": 0.5,
  rarely: 0.25,
  never: 0,
}

export function normalizeBreakfastFrequency(raw: string | null | undefined) {
  return lookup(BREAKFAST_FREQUENCY_SCALE, raw)
}

// --- Generic 5-point frequency scale --------------------------------------
// Used for: usualRoutine.breakfastPlanChangeFrequency,
// afterMorningRoutine.earlyCommitmentBreakfastFrequency (excluding its
// extra "not-applicable" option, handled by the caller),
// afterMorningRoutine.noEarlyCommitmentBreakfastFrequency,
// afterMorningRoutine.nonBreakfastSpendingFrequency.
// Never = 0.00, Rarely = 0.25, Sometimes = 0.50, Often = 0.75,
// Almost always = 1.00

export const FREQUENCY_SCALE: Record<string, number> = {
  "almost-always": 1,
  often: 0.75,
  sometimes: 0.5,
  rarely: 0.25,
  never: 0,
}

export function normalizeFrequency(raw: string | null | undefined) {
  return lookup(FREQUENCY_SCALE, raw)
}

// --- Influence scale (Q7 grid, afterMorningRoutine.influenceRatings) -----
// Not at all = 0.00, Slightly = 0.25, Moderately = 0.50, A lot = 0.75,
// Very strongly = 1.00

export const INFLUENCE_SCALE: Record<string, number> = {
  "not-at-all": 0,
  slightly: 0.25,
  moderately: 0.5,
  "a-lot": 0.75,
  "very-strongly": 1,
}

export function normalizeInfluence(raw: string | null | undefined) {
  return lookup(INFLUENCE_SCALE, raw)
}

// --- Agreement scale (Q9 grid, afterMorningRoutine.agreementRatings) -----
// Strongly disagree = 0.00, Disagree = 0.25, Neutral = 0.50, Agree = 0.75,
// Strongly agree = 1.00

export const AGREEMENT_SCALE: Record<string, number> = {
  "strongly-disagree": 0,
  disagree: 0.25,
  neutral: 0.5,
  agree: 0.75,
  "strongly-agree": 1,
}

export function normalizeAgreement(raw: string | null | undefined) {
  return lookup(AGREEMENT_SCALE, raw)
}

// --- Weekday sleep time lateness (usualRoutine.sleepTimeWeekday) ----------
// Before 11 PM = 0.00, 11-12 = 0.15, 12-1 = 0.35, 1-2 = 0.60, 2-3 = 0.80,
// After 3 = 1.00, No consistent time = 0.50

export const SLEEP_TIME_LATENESS_SCALE: Record<string, number> = {
  "before-11pm": 0,
  "11pm-12am": 0.15,
  "12am-1am": 0.35,
  "1am-2am": 0.6,
  "2am-3am": 0.8,
  "after-3am": 1,
  "no-consistent-time": 0.5,
}

export function normalizeSleepTimeLateness(raw: string | null | undefined) {
  return lookup(SLEEP_TIME_LATENESS_SCALE, raw)
}

// --- Previous-night effect (afterMorningRoutine.previousNightAffectsBreakfast) -
// Not specified numerically in the source brief; interpolated on the same
// 0/.33/.66/1 spacing as the other 4-point frequency scales, with
// "It depends" placed at the midpoint since it isn't directional.
// Yes, often = 1.00, Sometimes = 0.66, Rarely = 0.33, Never = 0.00,
// It depends = 0.50

export const PREVIOUS_NIGHT_EFFECT_SCALE: Record<string, number> = {
  "yes-often": 1,
  sometimes: 0.66,
  rarely: 0.33,
  never: 0,
  "it-depends": 0.5,
}

export function normalizePreviousNightEffect(raw: string | null | undefined) {
  return lookup(PREVIOUS_NIGHT_EFFECT_SCALE, raw)
}

// --- Decision-point variability (Branch B only, usualRoutine.breakfastDecisionPoint) -
// "It varies" = 1, "I don't consciously decide" = .8, a same-morning
// checkpoint (when I wake up / while getting ready / after checking the
// time, menu, or allocation / just before leaving) = .6, "Previous night"
// = .2. The source brief named only "when I wake up" / "while getting
// ready" / "just before leaving" for the .6 tier; the three
// "after-checking-*" options are the same same-morning-checkpoint
// behavior and are grouped into that tier too.

export const DECISION_VARIABILITY_SCALE: Record<string, number> = {
  varies: 1,
  "no-conscious-decision": 0.8,
  "on-waking": 0.6,
  "while-getting-ready": 0.6,
  "after-checking-time": 0.6,
  "after-checking-menu": 0.6,
  "after-checking-allocation": 0.6,
  "just-before-leaving": 0.6,
  "previous-night": 0.2,
}

export function normalizeDecisionVariability(raw: string | null | undefined) {
  return lookup(DECISION_VARIABILITY_SCALE, raw)
}

// --- Alternative-food behaviour (afterMorningRoutine.nonBreakfastMealSource) -
// VC / other canteen = 1.00, Order food online = 1.00,
// Eat elsewhere on campus = 0.90, Eat something in room = 0.70,
// Varies = 0.50, Wait until lunch = 0.00. "Other" isn't in the source
// brief's table — treated as the neutral default (0.50) rather than
// excluded, since this field is always answered (it's a required common
// question, not a branch-conditional one).

export const ALTERNATIVE_BEHAVIOUR_SCALE: Record<string, number> = {
  "buy-vc-canteen": 1,
  "order-online": 1,
  "eat-elsewhere-campus": 0.9,
  "eat-in-room": 0.7,
  varies: 0.5,
  "wait-until-lunch": 0,
}
export const ALTERNATIVE_BEHAVIOUR_DEFAULT = 0.5

export function normalizeAlternativeBehaviour(raw: string | null | undefined) {
  if (!raw) {
    return null
  }
  return ALTERNATIVE_BEHAVIOUR_SCALE[raw] ?? ALTERNATIVE_BEHAVIOUR_DEFAULT
}

// --- Meal transfer behaviour (usualRoutine.breakfastPlanChangeActions) ---
// Exchange = 1, Sell = 1, Give away = .8, Buy someone else's meal = .8,
// Still use the allotted meal = .6, Leave unused = 0, Skip breakfast = 0.
// Multi-select: "if multiple are selected, use the highest relevant
// value, not the sum" — selecting Exchange + Sell + Give away must score
// 1, not 2.8. "Eat elsewhere" / "Order online" / "Other" aren't in the
// source brief's table — treated as a low-but-nonzero default (0.3),
// since choosing to get food elsewhere is neither a transfer action nor
// fully wasteful.

export const TRANSFER_BEHAVIOUR_SCALE: Record<string, number> = {
  exchange: 1,
  sell: 1,
  "give-away": 0.8,
  "buy-others-meal": 0.8,
  "use-allotted": 0.6,
  "leave-unused": 0,
  "skip-breakfast": 0,
}
export const TRANSFER_BEHAVIOUR_DEFAULT = 0.3

/** MAX over the selected values, never the sum — see module doc above. */
export function normalizeTransferBehaviour(selected: string[]): number | null {
  if (selected.length === 0) {
    return null
  }
  let max = -Infinity
  for (const value of selected) {
    const scored = TRANSFER_BEHAVIOUR_SCALE[value] ?? TRANSFER_BEHAVIOUR_DEFAULT
    if (scored > max) {
      max = scored
    }
  }
  return max
}

// --- Meal value orientation (afterMorningRoutine.mealValuePerception) ----
// Good value = 1.00, Okay even though not used every time = 0.65,
// Somewhat wasteful = 0.35, Very wasteful = 0.00,
// Not sure how cost/allocation works = 0.50 (neutral — no signal either
// way). "Not applicable — I don't pay for a mess plan" is excluded
// entirely by the caller (returns null), since the question is moot for
// that respondent.

export const VALUE_ORIENTATION_SCALE: Record<string, number> = {
  "good-value": 1,
  "okay-not-every-time": 0.65,
  "somewhat-wasteful": 0.35,
  "very-wasteful": 0,
  "not-sure-how-cost-works": 0.5,
}

export function normalizeValueOrientation(raw: string | null | undefined) {
  if (!raw || raw === "not-applicable") {
    return null
  }
  return lookup(VALUE_ORIENTATION_SCALE, raw)
}

// --- Conditional-eating frequency (derived from usualRoutine.breakfastFrequency) -
// Used only by the Flexible Switcher formula's "ConditionalFrequency"
// component — a different re-bucketing of the same breakfastFrequency
// value than BREAKFAST_FREQUENCY_SCALE above.
// Some days = 1.00, Most days / Rarely = 0.50,
// Almost every day / Never = 0.00

export function normalizeConditionalFrequency(raw: string | null | undefined): number | null {
  if (!raw) {
    return null
  }
  if (raw === "some-days") {
    return 1
  }
  if (raw === "most-days" || raw === "rarely") {
    return 0.5
  }
  if (raw === "almost-every-day" || raw === "never") {
    return 0
  }
  return null
}

// --- Binary presence checks -----------------------------------------------
// A handful of components are "was this specific option selected?" rather
// than a scale lookup — still centralized here for one-file auditability.

export function normalizeIncludes(selected: string[], target: string): number {
  return selected.includes(target) ? 1 : 0
}
