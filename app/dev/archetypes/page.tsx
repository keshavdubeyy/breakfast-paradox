"use client"

import { useState } from "react"

import { ArchetypeDebugPanel } from "@/components/dev/archetype-debug-panel"
import { Button } from "@/components/ui/button"
import { ARCHETYPE_FIXTURES } from "@/lib/archetype-fixtures"
import {
  calculateArchetypeResult,
  type ArchetypeResult,
} from "@/lib/archetype-scoring"

/**
 * Development-only tool for inspecting the archetype scoring engine.
 * Intentionally not linked from anywhere in the respondent-facing survey
 * (not in SURVEY_SECTIONS, no nav entry) — reach it by typing the URL.
 */
export default function DevArchetypesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [result, setResult] = useState<ArchetypeResult | null>(null)

  if (process.env.NODE_ENV === "production") {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">
          /dev/archetypes is a development-only tool and isn&apos;t available
          in production.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">
          Archetype scoring debug
        </h1>
        <p className="text-sm text-muted-foreground">
          Development-only tool — pick a fixture to see the full calculation
          breakdown for all six archetypes: raw input, normalized value,
          weight, weighted contribution, and availability for every
          component, plus the winner/runner-up/tie-breaker/confidence
          decision.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ARCHETYPE_FIXTURES.map((fixture) => (
          <Button
            key={fixture.id}
            type="button"
            variant={selectedId === fixture.id ? "default" : "outline"}
            onClick={() => {
              setSelectedId(fixture.id)
              setResult(calculateArchetypeResult(fixture.data))
            }}
          >
            {fixture.label}
          </Button>
        ))}
      </div>

      {result ? (
        <ArchetypeDebugPanel result={result} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Pick a fixture above to see its calculation breakdown.
        </p>
      )}
    </main>
  )
}
