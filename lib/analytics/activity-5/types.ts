// Activity 5 — "Analyse System Behaviour Over Time". This domain computes
// nothing new — like lib/analytics/iceberg, it only assembles findings
// already validated by Events/Patterns/Structures/Mental Models, just
// organized along a different axis: where in a single day's sequence
// (previous night → ... → following night) the evidence sits, rather
// than iceberg depth. Every number here traces back to
// computeEventsMetrics / computePatternsMetrics / computeStructuresMetrics
// / computeMentalModelsMetrics.
export {
  computeEligibility,
  MIN_CELL_N,
  sampleFlag,
  SMALL_SAMPLE_N,
  type Eligibility,
  type SampleFlag,
} from "../patterns/types"

import type { SampleFlag } from "../patterns/types"

/** One piece of reused evidence — same shape/spirit as
 * lib/analytics/iceberg's IcebergFinding, minus the iceberg-specific
 * label/detail split (Activity 5 only ever shows the full-sentence
 * headline, never a compact chain-diagram label). */
export interface Activity5Evidence {
  key: string
  headline: string
  percentage: number | null
  n: number
  flag: SampleFlag
  evidenceType: string
  href: string
}

/** One stage of the single-day system timeline. `evidence` is empty and
 * `noEvidenceNote` is set when student data genuinely doesn't speak to
 * that stage yet — never filled with an assumption. */
export interface TimelineStage {
  key: string
  title: string
  description: string
  evidence: Activity5Evidence[]
  noEvidenceNote?: string
}

/** One observed tension/loop-shaped pattern, honestly split into what's
 * actually evidenced vs. what's still an open question vs. what's
 * blocked pending mess/administration data — never presented as a
 * confirmed causal loop. */
export interface FeedbackObservation {
  key: string
  title: string
  available: string
  investigating: string
  blocked: string
  supportingEvidence: Activity5Evidence[]
}

export interface Activity5Metrics {
  n: number
  timeline: TimelineStage[]
  recurringPatterns: Activity5Evidence[]
  significantChange: Activity5Evidence
  feedbackObservations: FeedbackObservation[]
}
