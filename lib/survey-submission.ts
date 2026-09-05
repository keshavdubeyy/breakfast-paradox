import { createClient } from "@/lib/supabase/client"
import type { PersistedArchetypeResult } from "@/lib/archetypes"
import type {
  AboutYouAnswers,
  AfterMorningRoutineAnswers,
  UsualRoutineAnswers,
} from "@/lib/survey-state"

// --- Supabase submission --------------------------------------------------
//
// Fires once, at successful survey completion (see the Continue handler
// on the After Your Morning Routine page) — right alongside the local
// saveArchetypeResult call, never instead of it. This is best-effort: a
// network failure here must never block the respondent from reaching
// the result screen, since the local, already-computed result is what
// the result page actually renders.
//
// The anon key used by the browser client can only INSERT (see the RLS
// policies in supabase/migrations/) — it cannot read back this row or
// any other, so there is no risk of one respondent seeing another's data
// through this same client.

interface SubmitSurveyResponseInput {
  surveyVersion: number
  aboutYou: AboutYouAnswers
  usualRoutine: UsualRoutineAnswers
  afterMorningRoutine: AfterMorningRoutineAnswers
  archetypeResult: PersistedArchetypeResult
}

export async function submitSurveyResponse({
  surveyVersion,
  aboutYou,
  usualRoutine,
  afterMorningRoutine,
  archetypeResult,
}: SubmitSurveyResponseInput): Promise<boolean> {
  try {
    const supabase = createClient()

    // Generated client-side rather than read back via `.select()`: the
    // anon RLS policy is deliberately insert-only (see the migration),
    // and Postgres filters an INSERT's RETURNING through the table's
    // SELECT policies — so reading the id back would itself get blocked
    // by RLS, even though the insert's own WITH CHECK passes. Since we
    // generate the id ourselves, there's nothing to read back at all.
    const responseId = crypto.randomUUID()

    const { error: responseError } = await supabase
      .from("survey_responses")
      .insert({
        id: responseId,
        survey_version: surveyVersion,
        about_you: aboutYou,
        usual_routine: usualRoutine,
        after_morning_routine: afterMorningRoutine,
      })

    if (responseError) {
      console.error(
        "[survey-submission] failed to insert survey_responses:",
        responseError
      )
      return false
    }

    const { error: resultError } = await supabase
      .from("archetype_results")
      .insert({
        response_id: responseId,
        survey_version: surveyVersion,
        primary_archetype: archetypeResult.primaryArchetype,
        secondary_archetype: archetypeResult.secondaryArchetype,
        confidence: archetypeResult.confidence,
        scores: archetypeResult.scores,
        computed_at: archetypeResult.computedAt,
      })

    if (resultError) {
      console.error(
        "[survey-submission] failed to insert archetype_results:",
        resultError
      )
      return false
    }

    return true
  } catch (error) {
    // Network failure, missing env vars in a preview deploy, etc. — the
    // respondent's local result still renders regardless.
    console.error("[survey-submission] unexpected error:", error)
    return false
  }
}
