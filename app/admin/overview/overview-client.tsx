"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"

import { DistributionBarChart } from "@/components/admin/distribution-bar-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { countActiveFilters, FiltersForm } from "@/components/admin/filters-form"
import { applyFilters } from "@/lib/analytics/filters"
import { computeOverviewMetrics } from "@/lib/analytics/metrics"
import { DEFAULT_FILTERS, type AnalyticsFilters, type AnalyticsRow, type Branch } from "@/lib/analytics/types"

const BRANCH_LABELS: Record<Branch, string> = {
  A: "Regular eaters",
  B: "Conditional eaters",
  C: "Rare / non-eaters",
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) {
    return "—"
  }
  const totalSeconds = Math.round(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${minutes}m ${secs.toString().padStart(2, "0")}s`
}

function formatPercentage(value: number | null): string {
  return value === null ? "—" : `${value}%`
}

interface OverviewClientProps {
  rows: AnalyticsRow[]
  isSampleData: boolean
}

export function OverviewClient({ rows, isSampleData }: OverviewClientProps) {
  const surveyVersions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.surveyVersion))).sort(
        (a, b) => b - a
      ),
    [rows]
  )
  // Defaults to "all" survey versions — a version bump is often a minor,
  // backward-compatible field change (see lib/analytics/parse.ts), not a
  // survey redesign, so hiding every older response by default would
  // silently drop most of the data the moment a single new-version
  // response comes in.
  const [filters, setFilters] = useState<AnalyticsFilters>(() => ({
    ...DEFAULT_FILTERS,
  }))

  // The sheet edits a draft copy — nothing in `filters` (and so nothing
  // on screen) changes until "Apply filters" commits it. Opening the
  // sheet always re-seeds the draft from the currently-applied filters,
  // so a previous edit that was never applied doesn't reappear.
  const [draftFilters, setDraftFilters] = useState<AnalyticsFilters>(filters)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters])
  const metrics = useMemo(() => computeOverviewMetrics(filteredRows), [filteredRows])
  const activeFilterCount = countActiveFilters(filters)

  function updateDraftFilter<K extends keyof AnalyticsFilters>(
    key: K,
    value: AnalyticsFilters[K]
  ) {
    setDraftFilters((prev) => ({ ...prev, [key]: value }))
  }

  function applyDraftFilters() {
    setFilters(draftFilters)
    setFilterSheetOpen(false)
  }

  function toggleBranch(branch: Branch) {
    setFilters((prev) => ({
      ...prev,
      branch: prev.branch === branch ? "all" : branch,
    }))
  }

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No completed responses yet</EmptyTitle>
          <EmptyDescription>
            Once respondents submit the survey, this page will summarise
            the sample here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {isSampleData ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Showing bundled sample data — set{" "}
          <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          to see real production data.
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Understand the survey sample and overall breakfast behaviour.
          </p>
        </div>

        <Sheet
          open={filterSheetOpen}
          onOpenChange={(open) => {
            if (open) {
              setDraftFilters(filters)
            }
            setFilterSheetOpen(open)
          }}
        >
          <SheetTrigger
            render={
              <Button variant="outline" className="shrink-0 gap-1.5">
                <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-4" />
                Filters
                {activeFilterCount > 0 ? (
                  <Badge variant="secondary" className="ml-0.5">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            }
          />
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Choose the sample you want to analyse, then apply.
              </SheetDescription>
            </SheetHeader>
            <FiltersForm
              surveyVersions={surveyVersions}
              filters={draftFilters}
              onChange={updateDraftFilter}
            />
            <SheetFooter>
              <Button type="button" onClick={applyDraftFilters}>
                Apply filters
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraftFilters(DEFAULT_FILTERS)}
              >
                Reset
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {filteredRows.length === 0 ? (
        <Empty className="rounded-lg border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No responses match these filters</EmptyTitle>
            <EmptyDescription>
              Try clearing a filter to widen the sample.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <TopMetrics metrics={metrics} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["A", "B", "C"] as Branch[]).map((branch) => (
              <BehaviorGroupCard
                key={branch}
                branch={branch}
                count={metrics.branchCounts[branch]}
                total={metrics.completedResponses}
                active={filters.branch === branch}
                onClick={() => toggleBranch(branch)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Breakfast frequency</CardTitle>
                <CardDescription>
                  In a typical week, how often they eat breakfast at the mess.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionBarChart
                  data={metrics.breakfastFrequencyDistribution}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Early commitments</CardTitle>
                <CardDescription>
                  Days per week with a mandatory activity before 9:00 AM.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionBarChart
                  data={metrics.earlyCommitmentDistribution}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hostel distribution</CardTitle>
                <CardDescription>Sample composition, not a finding.</CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionBarChart data={metrics.hostelDistribution} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Year distribution</CardTitle>
                <CardDescription>Sample composition, not a finding.</CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionBarChart data={metrics.yearDistribution} />
              </CardContent>
            </Card>
          </div>

          <ArchetypeSection metrics={metrics} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ConfidenceCard metrics={metrics} />
            <DurationHistogramCard metrics={metrics} />
          </div>

          <DataQualityCard metrics={metrics} />

          <SnapshotCard metrics={metrics} />
        </>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description?: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
    </Card>
  )
}

function TopMetrics({
  metrics,
}: {
  metrics: ReturnType<typeof computeOverviewMetrics>
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Completed responses"
        value={metrics.completedResponses.toLocaleString()}
      />
      <MetricCard
        label="Median completion time"
        value={formatDuration(metrics.medianDurationSeconds)}
      />
      <MetricCard
        label="Average completion time"
        value={formatDuration(metrics.averageDurationSeconds)}
      />
      <MetricCard
        label="Archetype coverage"
        value={`${metrics.archetypeCoverage.withResult} / ${metrics.archetypeCoverage.total}`}
        description={
          metrics.archetypeCoverage.percentage === null
            ? undefined
            : `${metrics.archetypeCoverage.percentage}%`
        }
      />
    </div>
  )
}

function BehaviorGroupCard({
  branch,
  count,
  total,
  active,
  onClick,
}: {
  branch: Branch
  count: number
  total: number
  active: boolean
  onClick: () => void
}) {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 1000) / 10
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
      className={
        active
          ? "cursor-pointer ring-2 ring-primary"
          : "cursor-pointer hover:ring-1 hover:ring-border"
      }
    >
      <CardHeader>
        <CardDescription>{BRANCH_LABELS[branch]}</CardDescription>
        <CardTitle className="text-2xl">{count.toLocaleString()}</CardTitle>
        <p className="text-xs text-muted-foreground">{percentage}%</p>
      </CardHeader>
    </Card>
  )
}

function ArchetypeSection({
  metrics,
}: {
  metrics: ReturnType<typeof computeOverviewMetrics>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Archetype distribution</CardTitle>
        <CardDescription>
          Which breakfast-behaviour archetype respondents were classified as.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="primary">
          <TabsList>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="secondary">Secondary</TabsTrigger>
          </TabsList>
          <TabsContent value="primary">
            <DistributionBarChart
              data={metrics.primaryArchetypeDistribution}
              height={280}
            />
          </TabsContent>
          <TabsContent value="secondary">
            <DistributionBarChart
              data={metrics.secondaryArchetypeDistribution}
              height={280}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ConfidenceCard({
  metrics,
}: {
  metrics: ReturnType<typeof computeOverviewMetrics>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Archetype confidence</CardTitle>
        <CardDescription>
          Whether the classification was clean (strong) or ambiguous
          (mixed) — validates the archetype system itself.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {metrics.confidenceDistribution.map((bucket) => (
          <Progress key={bucket.value} value={bucket.percentage}>
            <div className="flex w-full justify-between">
              <ProgressLabel>{bucket.label}</ProgressLabel>
              <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                {bucket.count} ({bucket.percentage}%)
              </span>
            </div>
          </Progress>
        ))}
      </CardContent>
    </Card>
  )
}

function DurationHistogramCard({
  metrics,
}: {
  metrics: ReturnType<typeof computeOverviewMetrics>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion time distribution</CardTitle>
        <CardDescription>
          Fatigue is a live research concern — median alone can hide a long
          tail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DistributionBarChart data={metrics.durationHistogram} />
      </CardContent>
    </Card>
  )
}

function DataQualityCard({
  metrics,
}: {
  metrics: ReturnType<typeof computeOverviewMetrics>
}) {
  const { dataQuality } = metrics
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data quality</CardTitle>
        <CardDescription>
          Research/survey health — not a judgment on any respondent.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Attention check passed
          </span>
          <span className="text-xl font-semibold text-foreground">
            {formatPercentage(dataQuality.attentionCheckPassRate)}
          </span>
          <span className="text-xs text-muted-foreground">
            of {dataQuality.attentionCheckKnownCount} answered
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Missing archetype result
          </span>
          <span className="text-xl font-semibold text-foreground">
            {dataQuality.missingArchetypeCount}
          </span>
          {dataQuality.missingArchetypeCount > 0 ? (
            <Badge variant="destructive" className="w-fit">
              Check submission pipeline
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              Survey submitted but result not stored
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Unusually quick completions
          </span>
          <span className="text-xl font-semibold text-foreground">
            {dataQuality.shortCompletionCount}
          </span>
          <span className="text-xs text-muted-foreground">
            under 3 minutes — flagged, not excluded
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function SnapshotCard({
  metrics,
}: {
  metrics: ReturnType<typeof computeOverviewMetrics>
}) {
  const facts: string[] = []
  const { snapshot } = metrics

  if (snapshot.regularEaterPercentage !== null) {
    facts.push(
      `${snapshot.regularEaterPercentage}% are regular breakfast users.`
    )
  }
  if (snapshot.threeOrMoreEarlyCommitmentsPercentage !== null) {
    facts.push(
      `${snapshot.threeOrMoreEarlyCommitmentsPercentage}% report three or more early commitments per week.`
    )
  }
  if (snapshot.mostCommonPrimaryArchetype) {
    facts.push(
      `${snapshot.mostCommonPrimaryArchetype.name} is currently the most common archetype (${snapshot.mostCommonPrimaryArchetype.count} responses).`
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initial descriptive observations</CardTitle>
        <CardDescription>
          Facts about the current sample, not explanations — patterns and
          structural drivers belong on the Patterns/Structures pages, once
          the evidence there is actually calculated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2 text-sm text-foreground">
          {facts.map((fact) => (
            <li key={fact} className="flex items-start gap-2">
              <span aria-hidden="true" className="text-muted-foreground">
                •
              </span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
