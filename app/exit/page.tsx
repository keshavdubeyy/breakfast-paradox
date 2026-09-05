"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { SurveyLayout } from "@/components/survey/survey-layout"
import { ResultPage } from "@/components/survey/result-page"

import { getArchetypePopulationStats } from "@/lib/population-data"
import type { PopulationStats } from "@/lib/population-data"
import {
  getArchetypeResultServerSnapshot,
  getArchetypeResultSnapshot,
  subscribeArchetypeResult,
} from "@/lib/survey-state"

// This page only ever READS the archetype result that was saved once, at
// successful submission (see the Continue handler on the After Your
// Morning Routine page). It must never call calculateArchetypeResult
// itself — that would let a refresh (or a later change to the formulas)
// silently change a respondent's already-submitted result.
//
// It also never reads gender: the result illustration is one fixed image
// per archetype, so there is nothing here for gender to select between.
export default function ExitPage() {
  const savedResult = useSyncExternalStore(
    subscribeArchetypeResult,
    getArchetypeResultSnapshot,
    getArchetypeResultServerSnapshot
  )

  const [populationStats, setPopulationStats] =
    useState<PopulationStats | null>(null)

  useEffect(() => {
    if (!savedResult) {
      return
    }

    let cancelled = false
    getArchetypePopulationStats(
      savedResult.primaryArchetype,
      savedResult.surveyVersion
    ).then((stats) => {
      // Below the minimum sample size (or on any failure), stats is
      // null — PopulationNudge already renders its "still learning"
      // copy for null/undefined, so no separate loading/error state.
      if (!cancelled) {
        setPopulationStats(stats)
      }
    })

    return () => {
      cancelled = true
    }
  }, [savedResult])

  if (!savedResult) {
    return (
      <SurveyLayout>
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Thank you for your time.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            We don&apos;t have a result to show yet — please complete the
            survey first.
          </p>
        </div>
      </SurveyLayout>
    )
  }

  return (
    <ResultPage
      archetypeId={savedResult.primaryArchetype}
      secondaryArchetypeId={savedResult.secondaryArchetype}
      confidence={savedResult.confidence}
      populationShare={populationStats?.populationShare}
      totalCompleted={populationStats?.totalCompleted}
    />
  )
}
