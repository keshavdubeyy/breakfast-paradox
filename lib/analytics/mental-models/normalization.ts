// Mental-Models-specific constants: analyst-defined short labels for the
// 9 agreement statements (a UI convenience only — respondents rate the
// full sentence, never pick a label), plus the "Routine Mindset"
// composite mapping. None of this changes how a statement is scored —
// see lib/analytics/patterns/normalization.ts for agreementRowScore/
// AGREEMENT_SCALE, reused as-is.

import { AGREEMENT_STATEMENT_ITEMS, type SurveyOption } from "@/lib/survey-options"

/** Short, analyst-written paraphrase of each belief statement — used only
 * for compact display (snapshot cards, chart row labels stay the full
 * sentence). Every key in AGREEMENT_STATEMENT_ITEMS must appear here
 * (enforced by a test), the same convention as Structures'
 * STRUCTURAL_DRIVER_CATEGORY. */
export const AGREEMENT_SHORT_LABEL: Record<string, string> = {
  sleepOverBreakfastAgreement: "Rest is a priority",
  eatLaterInsteadAgreement: "Can eat later",
  classOnTimeOverBreakfastAgreement: "Academic priority",
  alreadyPaidUseWheneverAgreement: "Already-paid / sunk cost",
  resaleReducesConcernAgreement: "Transfer reduces concern",
  breakfastPlannedInAdvanceAgreement: "Plans in advance",
  dependsOnMorningAgreement: "Reactive to the morning",
  noHungerNoReasonAgreement: "Hunger-led eating",
  inconvenientEatLaterAgreement: "Avoids inconvenience",
}

for (const item of AGREEMENT_STATEMENT_ITEMS) {
  if (!(item.key in AGREEMENT_SHORT_LABEL)) {
    throw new Error(
      `lib/analytics/mental-models/normalization: missing AGREEMENT_SHORT_LABEL for "${item.key}"`
    )
  }
}

// --- Routine Mindset composite ------------------------------------------
//
// The survey asks "how would you describe your breakfast routine" in two
// branch-specific forms — breakfastRoutineDescription (Branch A) and
// breakfastAbsenceReason (Branch C) — rather than one universal question.
// Branch B (conditional eaters) has no directly comparable question at
// all in the current survey; it is deliberately excluded from this
// composite rather than force-mapped, and that gap is surfaced in the UI
// (see mental-models-client.tsx), not hidden.
//
// The mapping below is an analyst judgment call, not a computed value:
// both fields ask about the *mode* of the breakfast decision (actively
// decided vs. habitual vs. day-dependent vs. never really decided), just
// from opposite sides of "do I eat or not" — so a Branch A "I actively
// plan for it" and a Branch C "I usually decide not to go" are treated as
// the same *mindset* (an active, deliberate decision), not the same
// *behaviour*. "depends-on-day" is a literal shared option value on both
// fields. Anything outside these four buckets (e.g. "Other") is excluded
// from the composite rather than guessed into a bucket.
export type RoutineMindsetBucket =
  | "actively-decided"
  | "habit-automatic"
  | "depends-on-day"
  | "in-the-moment"

export const ROUTINE_MINDSET_OPTIONS: SurveyOption[] = [
  { value: "actively-decided", label: "Actively plans or decides" },
  { value: "habit-automatic", label: "It's a habit / automatic" },
  { value: "depends-on-day", label: "Depends on the day" },
  { value: "in-the-moment", label: "In the moment / no routine" },
]

export const ROUTINE_MINDSET_FROM_ROUTINE_DESCRIPTION: Record<string, RoutineMindsetBucket> = {
  "actively-plan": "actively-decided",
  "automatic-part": "habit-automatic",
  "depends-on-day": "depends-on-day",
  "decide-in-moment": "in-the-moment",
}

export const ROUTINE_MINDSET_FROM_ABSENCE_REASON: Record<string, RoutineMindsetBucket> = {
  "decide-not-to-go": "actively-decided",
  "not-part-of-routine": "habit-automatic",
  "depends-on-day": "depends-on-day",
  "havent-thought-about-it": "in-the-moment",
}
