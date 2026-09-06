// Verified operating rules of the mess breakfast system, as distinct
// from anything a respondent reported. Every value here must be a fact
// about how the system is actually run — never derived from a survey
// percentage. The "How the system works" flow and the "System structure
// map" both read from this config for their SYSTEM RULE labels, and
// nothing else in Structures should hardcode one of these facts inline.
export const SYSTEM_CONTEXT = {
  /** Students register/select a breakfast mess in advance rather than on
   * the day of. */
  registrationIsAdvance: true,
  /** Roughly how far ahead registration happens. Kept as prose, not a
   * number of hours, since the exact lead time varies and isn't the
   * verified fact — "in advance, not same-day" is. */
  registrationLeadTime: "Around two days ahead of the breakfast itself",
  /** A student who does not register/select can still be assigned a mess
   * automatically. */
  automaticAllocation: true,
  /** Cancelling or changing a meal on the day it's served is not
   * available the way advance cancellation is. */
  sameDayCancellationAvailable: false,
} as const

export type SystemContext = typeof SYSTEM_CONTEXT
