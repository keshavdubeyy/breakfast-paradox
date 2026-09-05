import type { ArchetypeId } from "./archetype-content"

// --- Archetype illustration assets ----------------------------------------
//
// Each archetype has exactly ONE illustration, shown to every respondent
// regardless of gender. Gender is not read anywhere in this module (or by
// the result page) for visual purposes — it has no bearing on which image
// is shown, same as it has no bearing on archetype scoring.
//
// Uploaded assets currently live directly under /public (not
// /public/archetypes — that folder doesn't exist yet) with whatever
// filenames they arrived with. Per "don't rename existing files unless
// necessary," they're referenced here exactly as uploaded rather than
// moved or renamed to match a folder/naming convention.
//
// All six archetypes now have final art. ArchetypeIllustration still
// falls back to a neutral placeholder on a failed image load, so a
// missing/renamed file in the future degrades gracefully rather than
// breaking the result page.
export const ARCHETYPE_VISUALS: Record<ArchetypeId, string> = {
  "routine-keeper": "/routine-keeper.png",
  "sleep-saver": "/Sleep Saver.png",
  "schedule-juggler": "/Schedule Juggler.png",
  "flexible-switcher": "/Flexible Switcher.png",
  "alternative-forager": "/Alternative Forager.png",
  "meal-maximizer": "/meal-maximizer.png",
}

/** The single lookup every consumer should use — always keyed by the
 * PRIMARY archetype id only. Takes no gender/variant parameter: there is
 * exactly one illustration per archetype. There is no equivalent lookup
 * for a secondary archetype either; the result UI never shows a second
 * illustration. */
export function getArchetypeVisualSrc(archetypeId: ArchetypeId): string {
  return ARCHETYPE_VISUALS[archetypeId]
}
