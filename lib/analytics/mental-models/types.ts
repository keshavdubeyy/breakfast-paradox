// Mental-Models-specific result shapes. Sample-size safeguards and the
// eligible/answered/missing bookkeeping are NOT redefined here — same
// convention as Structures (see that folder's types.ts): imported
// directly from lib/analytics/patterns/types rather than forking a
// second copy.
export {
  computeEligibility,
  MIN_CELL_N,
  sampleFlag,
  SMALL_SAMPLE_N,
  type Eligibility,
  type SampleFlag,
  type SummaryCard,
} from "../patterns/types"

import type { Eligibility, SampleFlag } from "../patterns/types"

/** A whole-sample categorical breakdown, one bucket per option — the same
 * shape as Structures' WholeSampleDistribution (mealValuePerception,
 * routine mindset composite), kept as its own type per domain rather than
 * a cross-folder import so Mental Models doesn't depend on Structures'
 * internals. */
export interface WholeSampleDistributionBucket {
  value: string
  label: string
  count: number
  percentage: number
  flag: SampleFlag
}

export interface WholeSampleDistribution {
  distribution: WholeSampleDistributionBucket[]
  eligibility: Eligibility
}

/** One agreement statement's full 5-point distribution (whole sample) —
 * Mental Models' "Beliefs & Attitudes" primary evidence. `agreeShare` is
 * agree + strongly-agree, used to rank statements (dominant belief,
 * strongest trade-off) and to sort the diverging chart. */
export interface AgreementStatementResult {
  key: string
  label: string
  shortLabel: string
  distribution: WholeSampleDistributionBucket[]
  agreeShare: number | null
  n: number
  flag: SampleFlag
}

export interface AgreementOverview {
  statements: AgreementStatementResult[]
  eligibility: Eligibility
}

/** The Routine Mindset composite (see normalization.ts for the mapping
 * rationale) — Branch B is excluded, not silently folded in, so
 * `eligibility.eligible` here is Branch A + Branch C only. */
export interface RoutineMindsetResult {
  distribution: WholeSampleDistributionBucket[]
  eligibility: Eligibility
}
