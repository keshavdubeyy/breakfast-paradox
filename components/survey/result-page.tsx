import Link from "next/link"

import { SurveyLayout } from "@/components/survey/survey-layout"
import { ArchetypeIllustration } from "@/components/survey/archetype-illustration"
import { PopulationNudge } from "@/components/survey/population-nudge"
import { Button } from "@/components/ui/button"
import { Confetti } from "@/components/ui/confetti"

import { ARCHETYPES, type ArchetypeId } from "@/lib/archetype-content"
import type { Confidence } from "@/lib/archetype-scoring"

export interface ResultPageProps {
  archetypeId: ArchetypeId
  secondaryArchetypeId: ArchetypeId | null
  confidence: Confidence
  /** 0-100, already computed elsewhere — see PopulationNudge. */
  populationShare?: number | null
  totalCompleted?: number | null
  /** Where the closing "Done" button goes. Defaults to the thank-you
   * screen, not the survey start — a respondent who just finished
   * shouldn't be dropped back at the consent page. */
  doneHref?: string
}

/**
 * The single, reusable post-survey result screen. Entirely data-driven
 * from ARCHETYPES (lib/archetype-content.ts) — there is no per-archetype
 * copy or layout in this file, and no archetype score is ever rendered
 * here. Used by both the real /exit page and the /dev/archetype-results
 * preview, so there is exactly one implementation of this UI.
 *
 * A "strong" result and a "mixed" result show the exact same title for
 * the primary archetype — confidence only changes whether the secondary
 * section appears below, never how the primary name/illustration reads.
 */
export function ResultPage({
  archetypeId,
  secondaryArchetypeId,
  confidence,
  populationShare,
  totalCompleted,
  doneHref = "/thank-you",
}: ResultPageProps) {
  const archetype = ARCHETYPES[archetypeId]
  const showsSecondary = confidence === "mixed" && secondaryArchetypeId !== null
  const secondaryArchetype = secondaryArchetypeId
    ? ARCHETYPES[secondaryArchetypeId]
    : null

  return (
    <>
      <Confetti className="pointer-events-none fixed inset-0 z-50 size-full" />
      <SurveyLayout
        footer={
          <Button
            type="button"
            nativeButton={false}
            className="min-h-11 w-full text-base"
            render={<Link href={doneHref} />}
          >
            Done
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Survey complete
          </p>

          <ArchetypeIllustration
            archetypeId={archetypeId}
            archetypeName={archetype.name}
          />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              You are
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {archetype.name}
            </h1>
            <p className="text-sm font-medium text-foreground">
              {archetype.tagline}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {archetype.description}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm font-semibold text-foreground">
              You&apos;ve got company
            </h2>
            <PopulationNudge
              populationShare={populationShare}
              totalCompleted={totalCompleted}
            />
          </div>

          <div className="flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-5 text-left">
            <h2 className="text-sm font-semibold text-foreground">
              What seems to shape your mornings
            </h2>
            <ul className="flex flex-col gap-2">
              {archetype.traits.map((trait) => (
                <li
                  key={trait}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span aria-hidden="true" className="text-muted-foreground">
                    •
                  </span>
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
          </div>

          {showsSecondary && secondaryArchetype ? (
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p>A little bit of...</p>
              <p className="font-medium text-foreground">
                {secondaryArchetype.name}
              </p>
              <p>
                Your responses also show some patterns that match this breakfast
                style.
              </p>
            </div>
          ) : null}

          <p className="text-sm text-muted-foreground">
            {archetype.closingNote}
          </p>

          <p className="text-xs text-muted-foreground">
            This is a light summary based on your responses, not a psychological
            assessment.
          </p>
        </div>
      </SurveyLayout>
    </>
  )
}
