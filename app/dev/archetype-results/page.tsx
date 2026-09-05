"use client"

import { useState, type ReactNode } from "react"

import { ResultPage } from "@/components/survey/result-page"
import { Button } from "@/components/ui/button"

import {
  ARCHETYPE_IDS,
  ARCHETYPES,
  type ArchetypeId,
} from "@/lib/archetype-content"
import type { Confidence } from "@/lib/archetype-scoring"

// The five archetypes with final copy + art. The scoring engine can still
// return a sixth ("meal-maximizer") — see the note below — so it's kept
// selectable here too, clearly labeled, rather than hidden.
const FINISHED_ARCHETYPE_IDS: ArchetypeId[] = [
  "routine-keeper",
  "sleep-saver",
  "schedule-juggler",
  "flexible-switcher",
  "alternative-forager",
]
const UNFINISHED_ARCHETYPE_IDS = ARCHETYPE_IDS.filter(
  (id) => !FINISHED_ARCHETYPE_IDS.includes(id)
)

function ControlGroup({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

/**
 * Development-only preview of the real ResultPage component — not a
 * separate/fake UI. Lets you click through all five finished archetypes
 * (plus the still-unfinished "meal-maximizer", clearly labeled), strong
 * vs. mixed confidence, and population data available vs. unavailable.
 * There's no visual-variant control — each archetype always renders its
 * one fixed illustration, regardless of gender. Intentionally not linked
 * from anywhere in the respondent-facing survey.
 */
export default function DevArchetypeResultsPage() {
  const [archetypeId, setArchetypeId] = useState<ArchetypeId>(
    FINISHED_ARCHETYPE_IDS[0]
  )
  const [confidence, setConfidence] = useState<Confidence>("strong")
  const [populationAvailable, setPopulationAvailable] = useState(false)

  if (process.env.NODE_ENV === "production") {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">
          /dev/archetype-results is a development-only tool and isn&apos;t
          available in production.
        </p>
      </main>
    )
  }

  const finishedIndex = FINISHED_ARCHETYPE_IDS.indexOf(archetypeId)
  const secondaryArchetypeId =
    finishedIndex === -1
      ? FINISHED_ARCHETYPE_IDS[0]
      : FINISHED_ARCHETYPE_IDS[
          (finishedIndex + 1) % FINISHED_ARCHETYPE_IDS.length
        ]

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background">
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4 px-6 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">
            Result page preview
          </h1>
          <p className="text-sm text-muted-foreground">
            Development-only — renders the real{" "}
            <code className="font-mono text-xs">ResultPage</code> component
            with the real archetype content. Not linked from the survey.
          </p>
        </div>

        <ControlGroup label="Primary archetype">
          {FINISHED_ARCHETYPE_IDS.map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={archetypeId === id ? "default" : "outline"}
              onClick={() => setArchetypeId(id)}
            >
              {ARCHETYPES[id].name}
            </Button>
          ))}
          {UNFINISHED_ARCHETYPE_IDS.map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={archetypeId === id ? "default" : "outline"}
              onClick={() => setArchetypeId(id)}
            >
              {ARCHETYPES[id].name} (no final art yet)
            </Button>
          ))}
        </ControlGroup>

        <ControlGroup label="Confidence (mixed shows a secondary archetype)">
          <Button
            type="button"
            size="sm"
            variant={confidence === "strong" ? "default" : "outline"}
            onClick={() => setConfidence("strong")}
          >
            Strong result
          </Button>
          <Button
            type="button"
            size="sm"
            variant={confidence === "mixed" ? "default" : "outline"}
            onClick={() => setConfidence("mixed")}
          >
            Mixed result
          </Button>
        </ControlGroup>

        <ControlGroup label="Population data">
          <Button
            type="button"
            size="sm"
            variant={!populationAvailable ? "default" : "outline"}
            onClick={() => setPopulationAvailable(false)}
          >
            Unavailable (N &lt; 30)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={populationAvailable ? "default" : "outline"}
            onClick={() => setPopulationAvailable(true)}
          >
            Available (N ≥ 30)
          </Button>
        </ControlGroup>
      </div>

      <div className="border-t border-border/60 pt-2">
        <ResultPage
          archetypeId={archetypeId}
          secondaryArchetypeId={secondaryArchetypeId}
          confidence={confidence}
          populationShare={populationAvailable ? 42 : null}
          totalCompleted={populationAvailable ? 84 : null}
          doneHref="/dev/archetype-results"
        />
      </div>
    </div>
  )
}
