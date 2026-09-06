// Iceberg-specific result shapes. This domain computes nothing new — it
// only assembles findings already validated by the four other domains
// (Events, Patterns, Structures, Mental Models) into one cross-layer
// synthesis. Sample-size safeguards are the same ones every other domain
// already uses.
export {
  computeEligibility,
  MIN_CELL_N,
  sampleFlag,
  SMALL_SAMPLE_N,
  type Eligibility,
  type SampleFlag,
} from "../patterns/types"

import type { SampleFlag } from "../patterns/types"

/** One assembled finding — a number already computed by another domain,
 * carried here with enough context to render a card and link back to
 * where it came from. Never a new calculation. */
export interface IcebergFinding {
  key: string
  label: string
  detail: string
  /** A complete, self-contained sentence for the finding card's headline
   * — the percentage/count spelled out in plain English (e.g. "72% of
   * students don't eat breakfast at the mess every day"), built from the
   * same (already suppression-aware) `percentage`/`flag` on this same
   * finding, never a new figure. `label`/`detail` stay short-form for the
   * evidence trail, chain diagram, and tension/leverage-point rows,
   * which need compact text, not a full sentence. */
  headline: string
  percentage: number | null
  n: number
  flag: SampleFlag
  /** e.g. "Direct self-report", "Association", "Attitudinal (self-report)" */
  evidenceType: string
  href: string
}

export interface IcebergLevel {
  level: "events" | "patterns" | "structures" | "mental-models"
  title: string
  question: string
  findings: IcebergFinding[]
}

export interface SystemTension {
  key: string
  title: string
  left: string
  right: string
  supportingFinding?: IcebergFinding
}

export interface EvidenceTrailRow {
  finding: string
  level: string
  evidence: string
  strength: string
  href: string
  hrefLabel: string
}

export interface LeveragePoint {
  key: string
  label: string
  percentage: number | null
  n: number
  flag: SampleFlag
  impact: "high" | "medium"
  linkedLevel: string
  href: string
}
