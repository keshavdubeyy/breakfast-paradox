"use client"

import { useMemo, useState, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"

import { DataDetailsDrawer } from "@/components/admin/charts/data-details-drawer"
import { DivergingLikertBar } from "@/components/admin/charts/diverging-likert-bar"
import { DonutChart } from "@/components/admin/charts/donut-chart"
import { HeatmapMatrix, type HeatmapColumnDef } from "@/components/admin/charts/heatmap-matrix"
import { RankedBarChart } from "@/components/admin/charts/ranked-bar-chart"
import { countActiveFilters, FiltersForm } from "@/components/admin/filters-form"
import { DistributionTable } from "@/components/admin/distribution-table"
import { LikertMatrixTable } from "@/components/admin/likert-matrix-table"
import { SampleFlagBadge, shouldShowValue } from "@/components/admin/sample-flag-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { applyFilters } from "@/lib/analytics/filters"
import {
  agreementOverviewToLikertRows,
  AGREEMENT_LIKERT_SEGMENTS,
  archetypesToCards,
  mealValuePerceptionToRankedBuckets,
  motivationsToRankedBuckets,
  routineMindsetToDonutSegments,
} from "@/lib/analytics/mental-models/display"
import { computeMentalModelsMetrics, type TopFactorCard } from "@/lib/analytics/mental-models/metrics"
import { likertMatrixToHeatmapRows } from "@/lib/analytics/patterns/display"
import { computeAgreementMatrix } from "@/lib/analytics/patterns/metrics"
import { BRANCH_LABELS, BRANCHES } from "@/lib/analytics/patterns/normalization"
import {
  DEFAULT_FILTERS,
  type AnalyticsFilters,
  type AnalyticsRow,
} from "@/lib/analytics/types"

const BRANCH_COLUMNS: HeatmapColumnDef[] = BRANCHES.map((branch) => ({
  key: branch,
  label: BRANCH_LABELS[branch],
}))

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

function formatPercentage(value: number | null): string {
  return value === null ? "—" : `${value}%`
}

interface SnapshotCardProps {
  title: string
  card: TopFactorCard
  methodology: string
}

function SnapshotCard({ title, card, methodology }: SnapshotCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <p className="text-sm font-medium text-foreground">{card.detailLabel}</p>
        <CardTitle className="text-2xl">
          {shouldShowValue(card.flag) ? formatPercentage(card.percentage) : "—"}
          <SampleFlagBadge flag={card.flag} />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {shouldShowValue(card.flag)
            ? `${methodology} (n = ${card.n})`
            : `Not enough responses to display safely (n = ${card.n})`}
        </p>
      </CardHeader>
    </Card>
  )
}

interface MentalModelsClientProps {
  rows: AnalyticsRow[]
  isSampleData: boolean
}

export function MentalModelsClient({ rows, isSampleData }: MentalModelsClientProps) {
  const surveyVersions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.surveyVersion))).sort((a, b) => b - a),
    [rows]
  )
  const latestSurveyVersion = surveyVersions[0] ?? "all"

  const [filters, setFilters] = useState<AnalyticsFilters>(() => ({
    ...DEFAULT_FILTERS,
    surveyVersion: latestSurveyVersion,
  }))
  const [draftFilters, setDraftFilters] = useState<AnalyticsFilters>(filters)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters])
  const metrics = useMemo(() => computeMentalModelsMetrics(filteredRows), [filteredRows])
  const agreementMatrix = useMemo(() => computeAgreementMatrix(filteredRows), [filteredRows])
  const activeFilterCount = countActiveFilters(filters)

  function updateDraftFilter<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) {
    setDraftFilters((prev) => ({ ...prev, [key]: value }))
  }

  function applyDraftFilters() {
    setFilters(draftFilters)
    setFilterSheetOpen(false)
  }

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No completed responses yet</EmptyTitle>
          <EmptyDescription>
            Mental Models needs respondents to describe their own reasoning — once completed
            surveys exist, this page will show the beliefs, priorities, and assumptions behind
            breakfast decisions.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const likertRows = agreementOverviewToLikertRows(metrics.agreementOverview)
  const routineDonut = routineMindsetToDonutSegments(metrics.routineMindset)
  const valuePerceptionBuckets = mealValuePerceptionToRankedBuckets(metrics.valuePerception)
  const motivationBuckets = motivationsToRankedBuckets(metrics.motivations)
  const archetypeCards = archetypesToCards(metrics.archetypes)
  const agreementHeatmapRows = likertMatrixToHeatmapRows(agreementMatrix)

  const rankedStatements = [...metrics.agreementOverview.statements].sort(
    (a, b) => (b.agreeShare ?? -1) - (a.agreeShare ?? -1)
  )
  const dominantRoutineBucket = [...routineDonut.segments].sort((a, b) => b.percentage - a.percentage)[0]
  const topValueBucket = [...valuePerceptionBuckets].sort((a, b) => b.percentage - a.percentage)[0]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {isSampleData ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Showing bundled sample data — set{" "}
          <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> to see real
          production data.
        </div>
      ) : null}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mental Models</h1>
          <p className="text-sm text-muted-foreground">
            What do students appear to believe, prioritise, or assume when deciding whether to eat
            breakfast? Patterns compares groups; Mental Models asks what students say they believe.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Sheet
            open={filterSheetOpen}
            onOpenChange={(open) => {
              if (open) setDraftFilters(filters)
              setFilterSheetOpen(open)
            }}
          >
            <SheetTrigger
              render={
                <Button variant="outline" className="gap-1.5">
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
                <SheetDescription>Choose the sample you want to analyse, then apply.</SheetDescription>
              </SheetHeader>
              <FiltersForm surveyVersions={surveyVersions} filters={draftFilters} onChange={updateDraftFilter} />
              <SheetFooter>
                <Button type="button" onClick={applyDraftFilters}>
                  Apply filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDraftFilters({ ...DEFAULT_FILTERS, surveyVersion: latestSurveyVersion })}
                >
                  Reset
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <p className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        These are self-reported beliefs and priorities, not observed behaviour — a student can
        report a belief that doesn&apos;t fully predict what they actually do. Association, not
        causation.
      </p>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="beliefs">Beliefs &amp; Attitudes</TabsTrigger>
          <TabsTrigger value="routine">Routine Mindset</TabsTrigger>
          <TabsTrigger value="value">Value Perception</TabsTrigger>
          <TabsTrigger value="motivations">Motivations</TabsTrigger>
          <TabsTrigger value="branch">By Breakfast Branch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6 pt-4">
          <SectionHeading>Mental model snapshot</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SnapshotCard
              title="Dominant belief"
              card={metrics.snapshot.dominantBelief}
              methodology="Agree or strongly agree"
            />
            <SnapshotCard
              title="Strongest trade-off"
              card={metrics.snapshot.strongestTradeOff}
              methodology="Agree or strongly agree"
            />
            <SnapshotCard
              title="Routine orientation"
              card={metrics.snapshot.routineOrientation}
              methodology="Branch A + C only — see Routine Mindset tab"
            />
            <SnapshotCard
              title="Value perception"
              card={metrics.snapshot.valuePerception}
              methodology="Share of all respondents"
            />
            <SnapshotCard
              title="Top motivation"
              card={metrics.snapshot.topMotivation}
              methodology="Multi-select, share of all respondents"
            />
          </div>

          <SectionHeading>Key takeaways</SectionHeading>
          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <ol className="flex flex-col gap-3">
                {rankedStatements[0] ? (
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      1
                    </span>
                    <p className="text-sm text-foreground">
                      Highest-agreement belief: <strong>{rankedStatements[0].shortLabel}</strong>
                      {rankedStatements[0].agreeShare !== null
                        ? ` — ${rankedStatements[0].agreeShare}% agree or strongly agree (n = ${rankedStatements[0].n})`
                        : " — not enough responses to display safely"}
                      .
                    </p>
                  </li>
                ) : null}
                {rankedStatements[1] ? (
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      2
                    </span>
                    <p className="text-sm text-foreground">
                      Second-strongest belief: <strong>{rankedStatements[1].shortLabel}</strong>
                      {rankedStatements[1].agreeShare !== null
                        ? ` — ${rankedStatements[1].agreeShare}% agree or strongly agree (n = ${rankedStatements[1].n})`
                        : " — not enough responses to display safely"}
                      .
                    </p>
                  </li>
                ) : null}
                {dominantRoutineBucket ? (
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      3
                    </span>
                    <p className="text-sm text-foreground">
                      Most common routine mindset (regular and rare/non-eaters only):{" "}
                      <strong>{dominantRoutineBucket.label}</strong> —{" "}
                      {shouldShowValue(dominantRoutineBucket.flag)
                        ? `${dominantRoutineBucket.percentage}%`
                        : "not enough responses to display safely"}
                      .
                    </p>
                  </li>
                ) : null}
                {topValueBucket ? (
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      4
                    </span>
                    <p className="text-sm text-foreground">
                      Perceived value is secondary to time and sleep for most respondents — the
                      most common response is <strong>{topValueBucket.label}</strong> (
                      {shouldShowValue(topValueBucket.flag) ? `${topValueBucket.percentage}%` : "n/a"}
                      ).
                    </p>
                  </li>
                ) : null}
              </ol>
            </CardContent>
          </Card>

          <SectionHeading>Mental model archetypes</SectionHeading>
          <p className="text-sm text-muted-foreground">
            A higher-level view of common belief combinations — supporting synthesis, not primary
            evidence (the agreement statements above are the primary evidence for what students
            believe).
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archetypeCards.map((card) => (
              <Card key={card.id} size="sm">
                <CardHeader>
                  <CardTitle className="text-base">{card.name}</CardTitle>
                  <CardDescription>{card.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-foreground">
                    {shouldShowValue(card.flag) ? formatPercentage(card.percentage) : "—"}
                    <SampleFlagBadge flag={card.flag} />
                  </p>
                  <p className="text-xs text-muted-foreground">of respondents (n = {card.n})</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="beliefs" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Beliefs &amp; attitudes</CardTitle>
              <CardDescription>
                How much do students agree or disagree with each statement? Sorted by
                agree + strongly-agree share, highest first.
              </CardDescription>
              <CardAction>
                <DataDetailsDrawer title="Beliefs & attitudes">
                  <div className="flex flex-col gap-5">
                    {rankedStatements.map((statement) => (
                      <div key={statement.key} className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-foreground">{statement.label}</p>
                        <DistributionTable
                          data={statement.distribution}
                          labelHeader="Response"
                          footnote={`n = ${statement.n}`}
                        />
                      </div>
                    ))}
                  </div>
                </DataDetailsDrawer>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DivergingLikertBar rows={likertRows} segments={AGREEMENT_LIKERT_SEGMENTS} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routine" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Routine mindset</CardTitle>
              <CardDescription>
                How do students describe their breakfast routine? Composite of regular eaters&apos;
                own routine description and rare/non-eaters&apos; own absence reasoning, mapped onto
                one shared 4-part mindset scale (see methodology note below).
              </CardDescription>
              <CardAction>
                <DataDetailsDrawer title="Routine mindset">
                  <DistributionTable
                    data={routineDonut.segments}
                    labelHeader="Mindset"
                    footnote={`n = ${routineDonut.n} (Branch A + C only)`}
                  />
                </DataDetailsDrawer>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DonutChart
                segments={routineDonut.segments}
                centerValue={String(routineDonut.n)}
                centerLabel="Branch A + C respondents"
                flag={routineDonut.flag}
                n={routineDonut.n}
              />
              <div className="rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="mb-2 text-[10px] tracking-wide uppercase">
                  Methodology
                </Badge>
                <p>
                  Regular eaters answer &quot;how would you describe your breakfast routine&quot;;
                  rare/non-eaters answer a parallel question about why they don&apos;t go. Both are
                  mapped onto the same actively-decided / habit / depends-on-day / in-the-moment
                  scale — an analyst judgment, not a computed value. Conditional eaters (Branch B)
                  have no directly comparable question in the current survey and are excluded from
                  this composite entirely (not folded into any bucket).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal value perception</CardTitle>
              <CardDescription>How do students feel about the value of the mess meal plan?</CardDescription>
              <CardAction>
                <DataDetailsDrawer title="Meal value perception">
                  <DistributionTable
                    data={metrics.valuePerception.distribution}
                    labelHeader="Perception"
                    footnote={`n = ${metrics.valuePerception.eligibility.eligible} eligible · ${metrics.valuePerception.eligibility.answered} answered · ${metrics.valuePerception.eligibility.missing} missing`}
                  />
                </DataDetailsDrawer>
              </CardAction>
            </CardHeader>
            <CardContent>
              <RankedBarChart data={valuePerceptionBuckets} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motivations" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Motivations to eat breakfast</CardTitle>
              <CardDescription>
                Which factors most influence the decision to eat breakfast? Multi-select —
                percentages do not need to sum to 100%.
              </CardDescription>
              <CardAction>
                <DataDetailsDrawer title="Motivations to eat breakfast">
                  <DistributionTable
                    data={metrics.motivations.distribution}
                    labelHeader="Motivation"
                    footnote={`n = ${metrics.motivations.eligibility.eligible} eligible · ${metrics.motivations.eligibility.answered} answered · ${metrics.motivations.eligibility.missing} missing`}
                  />
                </DataDetailsDrawer>
              </CardAction>
            </CardHeader>
            <CardContent>
              <RankedBarChart data={motivationBuckets} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branch" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Belief statements by breakfast branch</CardTitle>
              <CardDescription>
                Share of each branch agreeing or strongly agreeing with each statement — the same
                validated agreement matrix used on Patterns, viewed here as part of the mental
                model narrative.
              </CardDescription>
              <CardAction>
                <DataDetailsDrawer title="Belief statements by breakfast branch">
                  <LikertMatrixTable matrix={agreementMatrix} itemHeaderLabel="Belief statement" />
                </DataDetailsDrawer>
              </CardAction>
            </CardHeader>
            <CardContent>
              <HeatmapMatrix
                rows={agreementHeatmapRows.map((row) => ({
                  key: row.key,
                  label: row.label,
                  cells: row.cells,
                  sortMetric: row.sortMetric,
                }))}
                columns={BRANCH_COLUMNS}
                rowHeaderLabel="Belief statement"
                sortable
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
