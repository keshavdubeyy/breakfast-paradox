import type { ArchetypeId } from "@/lib/archetype-content"
import type { Confidence } from "@/lib/archetype-scoring"

export type Branch = "A" | "B" | "C"

/** One respondent, flattened out of the raw `survey_responses` +
 * `archetype_results` JSONB rows into typed fields the dashboard can
 * filter/aggregate directly — see `lib/analytics/parse.ts`. */
export interface AnalyticsRow {
  id: string
  surveyVersion: number
  createdAt: string
  startedAt: string
  durationSeconds: number
  durationMinutes: number

  year: string | null
  hostel: string | null
  earlyCommitmentDays: string | null

  breakfastFrequency: string | null
  branch: Branch | null

  attentionCheckPassed: boolean | null

  hasArchetypeResult: boolean
  primaryArchetype: ArchetypeId | null
  secondaryArchetype: ArchetypeId | null
  archetypeConfidence: Confidence | null
}

export interface AnalyticsFilters {
  surveyVersion: number | "all"
  hostel: string | "all"
  year: string | "all"
  earlyCommitmentDays: string | "all"
  breakfastFrequency: string | "all"
  branch: Branch | "all"
  primaryArchetype: ArchetypeId | "all"
  /** Inclusive, ISO date strings (yyyy-mm-dd) or null for "unbounded". */
  dateFrom: string | null
  dateTo: string | null
}

export const DEFAULT_FILTERS: AnalyticsFilters = {
  surveyVersion: "all",
  hostel: "all",
  year: "all",
  earlyCommitmentDays: "all",
  breakfastFrequency: "all",
  branch: "all",
  primaryArchetype: "all",
  dateFrom: null,
  dateTo: null,
}
