import { getPopulationNudgeMessage } from "@/lib/population-nudge"

interface PopulationNudgeProps {
  /** 0-100, already computed elsewhere — never an internal archetype score. */
  populationShare?: number | null
  totalCompleted?: number | null
}

/**
 * Shows how common the respondent's archetype is, once real population
 * data exists. Until then (or below the minimum sample size), shows a
 * neutral "still learning" line instead of fabricating a number.
 */
export function PopulationNudge({
  populationShare,
  totalCompleted,
}: PopulationNudgeProps) {
  return (
    <p className="text-sm text-muted-foreground">
      {getPopulationNudgeMessage(populationShare, totalCompleted)}
    </p>
  )
}
