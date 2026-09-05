export interface SurveySection {
  id: string
  label: string
}

/**
 * Ordered list of survey sections, used to drive the progress bar. This
 * will grow as more sections are built — nothing else depends on the
 * exact count, so it's safe to extend.
 */
export const SURVEY_SECTIONS: SurveySection[] = [
  { id: "about-you", label: "About You" },
  { id: "usual-routine", label: "Usual Routine" },
  { id: "breakfast-routine", label: "Breakfast Routine" },
  { id: "after-morning-routine", label: "After Your Morning Routine" },
]

/** 0-100 progress through the known sections, for the top progress bar. */
export function getSurveySectionProgress(sectionId: string): number {
  const index = SURVEY_SECTIONS.findIndex((section) => section.id === sectionId)
  if (index === -1 || SURVEY_SECTIONS.length === 0) {
    return 0
  }
  return ((index + 1) / SURVEY_SECTIONS.length) * 100
}
