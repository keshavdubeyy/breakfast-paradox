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
  respondentId: string
  startedAt: string
  aboutYou: AboutYouAnswers
  usualRoutine: UsualRoutineAnswers
  afterMorningRoutine: AfterMorningRoutineAnswers
  archetypeResult: PersistedArchetypeResult
}

export async function submitSurveyResponse({
  surveyVersion,
  respondentId,
  startedAt,
  aboutYou,
  usualRoutine,
  afterMorningRoutine,
  archetypeResult,
}: SubmitSurveyResponseInput): Promise<boolean> {
  try {
    const supabase = createClient()

    // `respondentId` comes from `ensureSurveySession` (assigned the moment
    // the respondent accepted consent, well before this insert), not
    // generated fresh here — that's what lets it double as this row's
    // unique respondent id AND lets `started_at` below reflect when they
    // actually began, not when they submitted.
    //
    // Reading it back via `.select()` would be blocked anyway: the anon
    // RLS policy is insert-only (see the migration), and Postgres filters
    // an INSERT's RETURNING through the table's SELECT policies. Since we
    // already have the id client-side, there's nothing to read back.
    const responseId = respondentId || crypto.randomUUID()

    const { error: responseError } = await supabase
      .from("survey_responses")
      .insert({
        id: responseId,
        survey_version: surveyVersion,
        ...(startedAt ? { started_at: startedAt } : null),
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
