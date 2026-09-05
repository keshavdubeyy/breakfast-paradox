// --- Population nudge -----------------------------------------------------
//
// The population comparison ("X% of respondents share your pattern")
// needs real aggregate data across all completed responses, filtered by
// survey_version — that backend doesn't exist yet. This module only
// decides what MESSAGE to show given whatever numbers a future caller
// supplies; it never computes a percentage from an internal archetype
// score, because it has no access to one — its only inputs are an
// already-computed population share and a completed-response count.

export const POPULATION_MIN_SAMPLE_SIZE = 30

export const POPULATION_UNAVAILABLE_MESSAGE =
  "We're still learning how common this breakfast style is."

/**
 * Pure: given a population share (0-100) and how many completed
 * responses it was computed from, returns the exact sentence to show.
 * Below the minimum sample size, or when either input is missing, always
 * returns the "still learning" message rather than fabricating a number.
 */
export function getPopulationNudgeMessage(
  populationShare: number | null | undefined,
  totalCompleted: number | null | undefined
): string {
  const hasEnoughData =
    typeof totalCompleted === "number" &&
    totalCompleted >= POPULATION_MIN_SAMPLE_SIZE &&
    typeof populationShare === "number"

  if (!hasEnoughData) {
    return POPULATION_UNAVAILABLE_MESSAGE
  }

  return `${Math.round(populationShare)}% of respondents so far share a similar breakfast pattern.`
}
