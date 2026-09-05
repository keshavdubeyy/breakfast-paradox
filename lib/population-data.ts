import { createClient } from "@/lib/supabase/client"
import type { ArchetypeId } from "@/lib/archetype-content"

// --- Population data -------------------------------------------------------
//
// Reads from the `archetype_population_stats` view (see
// supabase/migrations/) — aggregate counts only, grouped by survey
// version and primary archetype. The anon key can SELECT from this view
// and nothing else; it can't read an individual survey_responses or
// archetype_results row. The threshold/rounding/fallback-copy decisions
// still live in lib/population-nudge.ts — this module only fetches the
// two raw numbers that feed it.

export interface PopulationStats {
  populationShare: number
  totalCompleted: number
}

/**
 * Returns null on any failure (network error, view not migrated yet,
 * missing env vars) or when there's simply no data yet for this
 * archetype/version — the caller (PopulationNudge, via
 * getPopulationNudgeMessage) already treats null the same as "not
 * enough data," so this never needs to distinguish the reasons.
 */
export async function getArchetypePopulationStats(
  primaryArchetype: ArchetypeId,
  surveyVersion: number
): Promise<PopulationStats | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("archetype_population_stats")
      .select("archetype_count, total_completed")
      .eq("survey_version", surveyVersion)
      .eq("primary_archetype", primaryArchetype)
      .maybeSingle()

    if (error || !data || !data.total_completed) {
      return null
    }

    return {
      populationShare: (data.archetype_count / data.total_completed) * 100,
      totalCompleted: data.total_completed,
    }
  } catch (error) {
    console.error("[population-data] failed to fetch population stats:", error)
    return null
  }
}
