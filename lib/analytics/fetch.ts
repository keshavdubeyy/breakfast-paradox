import "server-only"

import { createAdminClient } from "@/lib/supabase/admin-client"
import { ANALYTICS_EXCLUDED_SURVEY_VERSIONS } from "./constants"
import { DUMMY_ANALYTICS_ROWS } from "./dummy-data"
import {
  parseAnalyticsRow,
  type RawArchetypeResultRow,
  type RawSurveyResponseRow,
} from "./parse"
import type { AnalyticsRow } from "./types"

export interface AnalyticsFetchResult {
  rows: AnalyticsRow[]
  /** true when this is the bundled sample dataset, not a real Supabase
   * query — the Overview page shows a banner whenever this is true. */
  isSampleData: boolean
}

/** Fetches every completed response + its archetype result (if any),
 * flattened into AnalyticsRow via the version-aware parser. Falls back to
 * a small bundled sample dataset only when SUPABASE_SERVICE_ROLE_KEY isn't
 * configured at all — once it *is* set, a real query failure surfaces as
 * a thrown error instead of silently swapping in sample data, so a
 * misconfigured key or a real outage is never mistaken for "just no data
 * yet". */
export async function fetchAnalyticsRows(): Promise<AnalyticsFetchResult> {
  const supabase = createAdminClient()

  if (!supabase) {
    return { rows: DUMMY_ANALYTICS_ROWS, isSampleData: true }
  }

  const { data: responses, error: responsesError } = await supabase
    .from("survey_responses")
    .select(
      "id, survey_version, created_at, started_at, duration_seconds, duration_minutes, about_you, usual_routine, after_morning_routine"
    )
    .returns<RawSurveyResponseRow[]>()

  if (responsesError) {
    throw new Error(
      `Failed to fetch survey_responses: ${responsesError.message}`
    )
  }

  const { data: archetypes, error: archetypesError } = await supabase
    .from("archetype_results")
    .select("response_id, primary_archetype, secondary_archetype, confidence")
    .returns<RawArchetypeResultRow[]>()

  if (archetypesError) {
    throw new Error(
      `Failed to fetch archetype_results: ${archetypesError.message}`
    )
  }

  const archetypeByResponseId = new Map(
    archetypes.map((archetype) => [archetype.response_id, archetype])
  )

  const rows = responses
    .filter(
      (response) =>
        !ANALYTICS_EXCLUDED_SURVEY_VERSIONS.includes(response.survey_version)
    )
    .map((response) =>
      parseAnalyticsRow(
        response,
        archetypeByResponseId.get(response.id) ?? null
      )
    )

  return { rows, isSampleData: false }
}
