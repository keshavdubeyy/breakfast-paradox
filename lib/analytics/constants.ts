// Rows with these survey_version values are schema/connectivity checks
// (e.g. the -1 sentinel used to verify the response-timing migration was
// applied), never real respondents — the analytics layer must always
// drop them before they can corrupt a count or an average.
export const ANALYTICS_EXCLUDED_SURVEY_VERSIONS: number[] = [-1]

/** Below this, a completion is flagged (not discarded) as "unusually
 * fast" in the data-quality section — chosen because even the shortest
 * real path through the survey takes several minutes to read and answer. */
export const SHORT_COMPLETION_THRESHOLD_SECONDS = 180

/** Histogram buckets for the completion-time distribution, in minutes.
 * `max: null` means "and above". */
export const DURATION_HISTOGRAM_BUCKETS: {
  label: string
  min: number
  max: number | null
}[] = [
  { label: "<5 min", min: 0, max: 5 },
  { label: "5–8 min", min: 5, max: 8 },
  { label: "8–12 min", min: 8, max: 12 },
  { label: "12–15 min", min: 12, max: 15 },
  { label: "15–20 min", min: 15, max: 20 },
  { label: "20+ min", min: 20, max: null },
]
