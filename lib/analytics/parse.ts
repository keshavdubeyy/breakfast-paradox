import { ARCHETYPE_IDS, type ArchetypeId } from "@/lib/archetype-content"
import type { Confidence } from "@/lib/archetype-scoring"
import {
  ATTENTION_CHECK_EXPECTED_VALUE,
  ATTENTION_CHECK_INFLUENCE_KEY,
} from "@/lib/survey-options"
import type { AnalyticsRow, Branch } from "./types"

export interface RawSurveyResponseRow {
  id: string
  survey_version: number
  created_at: string
  started_at: string
  duration_seconds: number
  duration_minutes: number
  about_you: Record<string, unknown>
  usual_routine: Record<string, unknown>
  after_morning_routine: Record<string, unknown>
}

export interface RawArchetypeResultRow {
  response_id: string
  primary_archetype: string
  secondary_archetype: string
  confidence: string
}

function readString(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key]
  return typeof value === "string" && value.length > 0 ? value : null
}

function deriveBranch(breakfastFrequency: string | null): Branch | null {
  switch (breakfastFrequency) {
    case "almost-every-day":
    case "most-days":
      return "A"
    case "some-days":
      return "B"
    case "rarely":
    case "never":
      return "C"
    default:
      return null
  }
}

function asArchetypeId(value: string | null): ArchetypeId | null {
  return value && (ARCHETYPE_IDS as string[]).includes(value)
    ? (value as ArchetypeId)
    : null
}

function asConfidence(value: string | null): Confidence | null {
  return value === "strong" || value === "mixed" ? value : null
}

// --- Version-aware field access --------------------------------------------
//
// The three JSONB blobs have no fixed schema — their shape just mirrors
// whatever the app's survey-state TypeScript types looked like at the
// time of submission. When a later survey version renames or merges a
// question, its key changes too (e.g. a hypothetical v2 might replace
// `breakfastPlannedButSkippedFrequency` with `breakfastPlanStability`).
// Reading fields through this per-version registry — rather than a
// single hardcoded key name — means adding v2 later is "add a new entry
// below", not "silently misread new rows using v1's key names".
interface FieldAccessors {
  year: (aboutYou: Record<string, unknown>) => string | null
  hostel: (aboutYou: Record<string, unknown>) => string | null
  earlyCommitmentDays: (aboutYou: Record<string, unknown>) => string | null
  breakfastFrequency: (usualRoutine: Record<string, unknown>) => string | null
  attentionCheckPassed: (
    afterMorningRoutine: Record<string, unknown>
  ) => boolean | null
}

const V1_ACCESSORS: FieldAccessors = {
  year: (aboutYou) => readString(aboutYou, "year"),
  hostel: (aboutYou) => readString(aboutYou, "hostel"),
  earlyCommitmentDays: (aboutYou) => readString(aboutYou, "earlyCommitmentDays"),
  breakfastFrequency: (usualRoutine) =>
    readString(usualRoutine, "breakfastFrequency"),
  attentionCheckPassed: (afterMorningRoutine) => {
    const influenceRatings = afterMorningRoutine.influenceRatings
    if (
      typeof influenceRatings !== "object" ||
      influenceRatings === null ||
      Array.isArray(influenceRatings)
    ) {
      return null
    }
    const value = (influenceRatings as Record<string, unknown>)[
      ATTENTION_CHECK_INFLUENCE_KEY
    ]
    if (typeof value !== "string" || value.length === 0) {
      return null
    }
    return value === ATTENTION_CHECK_EXPECTED_VALUE
  },
}

const FIELD_ACCESSORS_BY_VERSION: Record<number, FieldAccessors> = {
  1: V1_ACCESSORS,
}

function accessorsFor(surveyVersion: number): FieldAccessors {
  const accessors = FIELD_ACCESSORS_BY_VERSION[surveyVersion]
  if (accessors) {
    return accessors
  }
  // Unknown version (e.g. a v2 not yet added above) — fall back to the
  // latest known accessors rather than crashing the whole dashboard, but
  // make it visible in server logs so the registry actually gets updated.
  console.warn(
    `[analytics] no field accessors registered for survey_version=${surveyVersion}; falling back to v1`
  )
  return V1_ACCESSORS
}

export function parseAnalyticsRow(
  raw: RawSurveyResponseRow,
  archetype: RawArchetypeResultRow | null
): AnalyticsRow {
  const accessors = accessorsFor(raw.survey_version)
  const breakfastFrequency = accessors.breakfastFrequency(raw.usual_routine)

  return {
    id: raw.id,
    surveyVersion: raw.survey_version,
    createdAt: raw.created_at,
    startedAt: raw.started_at,
    durationSeconds: raw.duration_seconds,
    durationMinutes: raw.duration_minutes,

    year: accessors.year(raw.about_you),
    hostel: accessors.hostel(raw.about_you),
    earlyCommitmentDays: accessors.earlyCommitmentDays(raw.about_you),

    breakfastFrequency,
    branch: deriveBranch(breakfastFrequency),

    attentionCheckPassed: accessors.attentionCheckPassed(
      raw.after_morning_routine
    ),

    hasArchetypeResult: archetype !== null,
    primaryArchetype: asArchetypeId(archetype?.primary_archetype ?? null),
    secondaryArchetype: asArchetypeId(archetype?.secondary_archetype ?? null),
    archetypeConfidence: asConfidence(archetype?.confidence ?? null),
  }
}
