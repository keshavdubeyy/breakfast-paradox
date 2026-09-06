"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"

import { DataDetailsDrawer } from "@/components/admin/charts/data-details-drawer"
import { RankedBarChart } from "@/components/admin/charts/ranked-bar-chart"
import { StackedPercentageBar } from "@/components/admin/charts/stacked-percentage-bar"
import { countActiveFilters, FiltersForm } from "@/components/admin/filters-form"
import { DistributionTable } from "@/components/admin/distribution-table"
import { InfluenceRankingTable } from "@/components/admin/influence-ranking-table"
import { SampleFlagBadge, shouldShowValue, suppressedNote } from "@/components/admin/sample-flag-badge"
import { SystemMechanicsFlow } from "@/components/admin/structures/system-mechanics-flow"
import { SystemStructureMap } from "@/components/admin/structures/system-structure-map"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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

import { applyFilters } from "@/lib/analytics/filters"
import { BRANCH_LABELS, BRANCHES as BRANCH_ORDER } from "@/lib/analytics/patterns/normalization"
import {
  biggestInfluenceToRankedBuckets,
  branchFieldToRankedBuckets,
  branchFieldToSingleRowBar,
  influenceRankingToRankedBuckets,
  messFoodQualityByBranchToBars,
  planChangeActionsToRankedBuckets,
  rankedPrevalenceToBuckets,
  wholeSampleDistributionToSingleRowBar,
} from "@/lib/analytics/structures/display"
import { computeStructuresMetrics } from "@/lib/analytics/structures/metrics"
import {
  DEFAULT_FILTERS,
  type AnalyticsFilters,
  type AnalyticsRow,
} from "@/lib/analytics/types"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

function formatPercentage(value: number | null): string {
  return value === null ? "—" : `${value}%`
}

interface KpiCardProps {
  title: string
  detailLabel?: string
  percentage: number | null
  n: number
  flag: "suppressed" | "small" | "ok"
  methodology: string
}

function KpiCard({ title, detailLabel, percentage, n, flag, methodology }: KpiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {detailLabel ? (
          <p className="text-sm font-medium text-foreground">{detailLabel}</p>
        ) : null}
        {shouldShowValue(flag) ? (
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {formatPercentage(percentage)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{suppressedNote(n)}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {methodology}
          <SampleFlagBadge flag={flag} /> (n = {n})
        </p>
      </CardContent>
    </Card>
  )
}

interface WrittenSuggestion {
  id: string
  branchLabel: string
  hostel: string | null
  breakfastFrequency: string | null
  text: string
}

function WrittenSuggestionsDrawer({
  open,
  onOpenChange,
  rows,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: AnalyticsRow[]
}) {
  const suggestions: WrittenSuggestion[] = rows
    .map((row) => ({
      id: row.id,
      branchLabel: row.branch ? BRANCH_LABELS[row.branch] : "Branch unknown",
      hostel: row.hostel,
      breakfastFrequency: row.breakfastFrequency,
      text: row.breakfastSystemChangeSuggestion,
    }))
    .filter((entry): entry is WrittenSuggestion => Boolean(entry.text && entry.text.trim().length > 0))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Written suggestions</SheetTitle>
          <SheetDescription>
            &quot;If you could change one thing about the current breakfast system, what would it
            be?&quot; — shown as written, not counted or summarized. No names or emails collected;
            treat any incidentally identifying detail in the text itself with care.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto px-6 pb-6">
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No written suggestions yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <li key={s.id} className="rounded-lg border border-border/60 p-3 text-sm text-foreground">
                  <p>{s.text}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {s.branchLabel}
                    {s.hostel ? ` · ${s.hostel}` : ""}
                    {s.breakfastFrequency ? ` · ${s.breakfastFrequency}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface StructuresClientProps {
  rows: AnalyticsRow[]
  isSampleData: boolean
}

export function StructuresClient({ rows, isSampleData }: StructuresClientProps) {
  const surveyVersions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.surveyVersion))).sort((a, b) => b - a),
    [rows]
  )
  // Defaults to "all" survey versions — see overview-client.tsx for why.
  const [filters, setFilters] = useState<AnalyticsFilters>(() => ({
    ...DEFAULT_FILTERS,
  }))
  const [draftFilters, setDraftFilters] = useState<AnalyticsFilters>(filters)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [suggestionsDrawerOpen, setSuggestionsDrawerOpen] = useState(false)

  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters])
  const metrics = useMemo(() => computeStructuresMetrics(filteredRows), [filteredRows])
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
            Structures needs respondents to describe — once completed surveys exist, this page
            will show the rules, constraints, and workarounds shaping breakfast behaviour.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const messDecisionBar = wholeSampleDistributionToSingleRowBar(metrics.messDecision, "All respondents")
  const messConsistencyBar = branchFieldToSingleRowBar(metrics.messConsistency, "Regular eaters (Branch A)")
  const planChangeFrequencyBar = wholeSampleDistributionToSingleRowBar(
    metrics.planChangeFrequency,
    "All respondents"
  )
  const messFoodQualityBar = wholeSampleDistributionToSingleRowBar(metrics.messFoodQuality, "All respondents")
  const messFoodQualityByBranchBar = messFoodQualityByBranchToBars(metrics.messFoodQualityByBranch)

  const messChangeDeterminantsBuckets = branchFieldToRankedBuckets(metrics.messChangeDeterminants)
  const unwantedMessActionsBuckets = branchFieldToRankedBuckets(metrics.unwantedMessActions)
  const unusedAllottedMealActionsBuckets = branchFieldToRankedBuckets(metrics.unusedAllottedMealActions)
  const planChangeActionsBuckets = planChangeActionsToRankedBuckets(metrics.planChangeActions)
  const serviceEnvironmentBuckets = influenceRankingToRankedBuckets(metrics.serviceEnvironment)
  const alternativeEcosystemBuckets = influenceRankingToRankedBuckets(metrics.alternativeEcosystem)
  const structuralDriversBuckets = influenceRankingToRankedBuckets(metrics.structuralDrivers, {
    withCategory: true,
  })
  const biggestInfluenceBuckets = biggestInfluenceToRankedBuckets(metrics.biggestInfluence)
  const leveragePointsBuckets = rankedPrevalenceToBuckets(metrics.leveragePoints)

  const leaveUnusedBucket = metrics.unusedAllottedMealActions.distribution.find(
    (bucket) => bucket.value === "leave-unused"
  )

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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Structures</h1>
          <p className="text-sm text-muted-foreground">
            System conditions shaping breakfast behaviour. Patterns compares relationships;
            Structures exposes the rules, constraints, and workarounds producing the environment
            those patterns occur in.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setSuggestionsDrawerOpen(true)}>
            Written suggestions
          </Button>

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
                  onClick={() => setDraftFilters(DEFAULT_FILTERS)}
                >
                  Reset
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <p className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Badge variant="outline" className="mr-2 text-[10px] tracking-wide uppercase">
          System rule
        </Badge>
        facts describe how the system is actually run and are never computed from survey rows.
        <Badge variant="outline" className="mr-2 ml-3 text-[10px] tracking-wide uppercase">
          Survey evidence
        </Badge>
        figures are self-reported and show association, not causation.
      </p>

      <WrittenSuggestionsDrawer
        open={suggestionsDrawerOpen}
        onOpenChange={setSuggestionsDrawerOpen}
        rows={filteredRows}
      />

      <SectionHeading>Structural snapshot</SectionHeading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Plan changes after cancellation closes"
          percentage={metrics.snapshot.cancellationCutoff.percentage}
          n={metrics.snapshot.cancellationCutoff.n}
          flag={metrics.snapshot.cancellationCutoff.flag}
          methodology="Report their plan changing at least sometimes after the cutoff"
        />
        <KpiCard
          title="Auto/mixed allocation exposure"
          percentage={metrics.snapshot.autoAllocation.percentage}
          n={metrics.snapshot.autoAllocation.n}
          flag={metrics.snapshot.autoAllocation.flag}
          methodology="Rely at least partly on automatic mess allocation"
        />
        <KpiCard
          title="Top structural constraint"
          detailLabel={metrics.snapshot.topStructuralConstraint.detailLabel}
          percentage={metrics.snapshot.topStructuralConstraint.percentage}
          n={metrics.snapshot.topStructuralConstraint.n}
          flag={metrics.snapshot.topStructuralConstraint.flag}
          methodology="Rate it as affecting breakfast a lot / very strongly"
        />
        <KpiCard
          title="Top perceived change"
          detailLabel={metrics.snapshot.topLeveragePoint.detailLabel}
          percentage={metrics.snapshot.topLeveragePoint.percentage}
          n={metrics.snapshot.topLeveragePoint.n}
          flag={metrics.snapshot.topLeveragePoint.flag}
          methodology="Respondents could select up to three"
        />
      </div>

      <SectionHeading>How the system works</SectionHeading>
      <Card>
        <CardHeader>
          <CardTitle>Current system mechanics</CardTitle>
          <CardDescription>
            Verified operating rules of the mess breakfast system — not derived from survey
            percentages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemMechanicsFlow />
        </CardContent>
      </Card>

      <SectionHeading>Mess allocation &amp; selection</SectionHeading>

      <Card>
        <CardHeader>
          <CardTitle>How breakfast mess is decided</CardTitle>
          <CardAction>
            <DataDetailsDrawer title="How breakfast mess is decided">
              <DistributionTable
                data={metrics.messDecision.distribution}
                labelHeader="Decision"
                footnote={`n = ${metrics.messDecision.eligibility.eligible} eligible · ${metrics.messDecision.eligibility.answered} answered · ${metrics.messDecision.eligibility.missing} missing`}
              />
            </DataDetailsDrawer>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <StackedPercentageBar
            rows={messDecisionBar.rows}
            segments={messDecisionBar.segments}
            footnote={`n = ${metrics.messDecision.eligibility.eligible} eligible · ${metrics.messDecision.eligibility.answered} answered · ${metrics.messDecision.eligibility.missing} missing`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allocation consistency</CardTitle>
          <CardDescription>Regular eaters (Branch A) only.</CardDescription>
          <CardAction>
            <DataDetailsDrawer title="Allocation consistency">
              <DistributionTable
                data={metrics.messConsistency.distribution}
                labelHeader="Consistency"
                footnote={`Branch A only · n = ${metrics.messConsistency.eligibility.eligible} eligible · ${metrics.messConsistency.eligibility.answered} answered · ${metrics.messConsistency.eligibility.missing} missing`}
              />
            </DataDetailsDrawer>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <StackedPercentageBar
            rows={messConsistencyBar.rows}
            segments={messConsistencyBar.segments}
            footnote={`Branch A only · n = ${metrics.messConsistency.eligibility.eligible} eligible · ${metrics.messConsistency.eligibility.answered} answered · ${metrics.messConsistency.eligibility.missing} missing`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What determines where regular eaters go</CardTitle>
          <CardDescription>
            Regular eaters (Branch A) whose allocation changes at least sometimes. Multi-select —
            percentages may exceed 100% in total.
          </CardDescription>
          <CardAction>
            <DataDetailsDrawer title="What determines where regular eaters go">
              <DistributionTable
                data={messChangeDeterminantsBuckets}
                labelHeader="Determinant"
                footnote={`Branch A, changes-sometimes/frequently only · n = ${metrics.messChangeDeterminants.eligibility.eligible} eligible · ${metrics.messChangeDeterminants.eligibility.answered} answered · ${metrics.messChangeDeterminants.eligibility.missing} missing`}
              />
            </DataDetailsDrawer>
          </CardAction>
        </CardHeader>
        <CardContent>
          {metrics.messChangeDeterminants.eligibility.eligible === 0 ? (
            <p className="text-sm text-muted-foreground">
              No respondents in the current filter were eligible for this question.
            </p>
          ) : (
            <RankedBarChart data={messChangeDeterminantsBuckets} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What students do when their allocation doesn&apos;t work</CardTitle>
          <CardDescription>
            Regular eaters (Branch A). Multi-select — percentages may exceed 100% in total. These
            are workarounds around the formal allocation mechanism, not the mechanism itself.
          </CardDescription>
          <CardAction>
            <DataDetailsDrawer title="What students do when their allocation doesn't work">
              <DistributionTable
                data={unwantedMessActionsBuckets}
                labelHeader="Action"
                footnote={`Branch A only · n = ${metrics.unwantedMessActions.eligibility.eligible} eligible · ${metrics.unwantedMessActions.eligibility.answered} answered · ${metrics.unwantedMessActions.eligibility.missing} missing`}
              />
            </DataDetailsDrawer>
          </CardAction>
        </CardHeader>
        <CardContent>
          <RankedBarChart data={unwantedMessActionsBuckets} />
        </CardContent>
      </Card>

      <SectionHeading>Cancellation &amp; plan flexibility</SectionHeading>

      <Card>
        <CardHeader>
          <CardTitle>How often plans change after the cutoff</CardTitle>
          <CardAction>
            <DataDetailsDrawer title="How often plans change after the cutoff">
              <DistributionTable
                data={metrics.planChangeFrequency.distribution}
                labelHeader="Frequency"
                footnote={`n = ${metrics.planChangeFrequency.eligibility.eligible} eligible · ${metrics.planChangeFrequency.eligibility.answered} answered · ${metrics.planChangeFrequency.eligibility.missing} missing`}
              />
            </DataDetailsDrawer>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <StackedPercentageBar
            rows={planChangeFrequencyBar.rows}
            segments={planChangeFrequencyBar.segments}
            footnote={`n = ${metrics.planChangeFrequency.eligibility.eligible} eligible · ${metrics.planChangeFrequency.eligibility.answered} answered · ${metrics.planChangeFrequency.eligibility.missing} missing`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reported actions when plans change</CardTitle>
          <CardDescription>
            Respondents whose plan changes at least sometimes. Multi-select — respondents can
            report more than one action, so this is not a single-path journey.
          </CardDescription>
          <CardAction>
            <DataDetailsDrawer title="Reported actions when plans change">
              <DistributionTable
                data={planChangeActionsBuckets}
                labelHeader="Action"
                footnote={`n = ${metrics.planChangeActions.eligibility.eligible} eligible · ${metrics.planChangeActions.eligibility.answered} answered · ${metrics.planChangeActions.eligibility.missing} missing`}
              />
            </DataDetailsDrawer>
          </CardAction>
        </CardHeader>
        <CardContent>
          <RankedBarChart data={planChangeActionsBuckets} />
        </CardContent>
      </Card>

      <SectionHeading>Deeper structure</SectionHeading>
      <Accordion defaultValue={["structural-drivers"]}>
        <AccordionItem value="transfer-unused-meal">
          <AccordionTrigger>Transfer &amp; unused-meal system</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="rounded-lg border border-dashed border-border/60 p-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="mb-2 text-[10px] tracking-wide uppercase">
                Data gap
              </Badge>
              <p>
                The survey does not ask whether a transfer/resale attempt succeeded — only whether
                a respondent reports the action. There is no
                &quot;breakfastResaleSuccessRate&quot; question in the current survey, so this
                section shows attempt prevalence, not success rate. Related attempt prevalence
                also appears above (&quot;What students do when their allocation doesn&apos;t
                work&quot;) and in Service environment below (ability to sell/exchange/give away).
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    What happens to unused meals among rare/non-eaters
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rare/non-eaters (Branch C). Multi-select — percentages may exceed 100% in
                    total. This reports leaving a registered/allotted meal unused, not
                    institutional food waste — students cannot observe the full institutional
                    waste process.
                  </p>
                </div>
                <DataDetailsDrawer title="What happens to unused meals among rare/non-eaters">
                  <DistributionTable
                    data={unusedAllottedMealActionsBuckets}
                    labelHeader="Action"
                    footnote={`Branch C only · n = ${metrics.unusedAllottedMealActions.eligibility.eligible} eligible · ${metrics.unusedAllottedMealActions.eligibility.answered} answered · ${metrics.unusedAllottedMealActions.eligibility.missing} missing`}
                  />
                </DataDetailsDrawer>
              </div>
              <RankedBarChart data={unusedAllottedMealActionsBuckets} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="service-environment">
          <AccordionTrigger>Service environment</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Food quality</p>
                <DataDetailsDrawer title="Food quality">
                  <DistributionTable
                    data={metrics.messFoodQuality.distribution}
                    labelHeader="Rating"
                    footnote={`n = ${metrics.messFoodQuality.eligibility.eligible} eligible · ${metrics.messFoodQuality.eligibility.answered} answered · ${metrics.messFoodQuality.eligibility.missing} missing`}
                  />
                </DataDetailsDrawer>
              </div>
              <StackedPercentageBar rows={messFoodQualityBar.rows} segments={messFoodQualityBar.segments} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">Food quality by breakfast group</p>
                  <p className="text-xs text-muted-foreground">
                    Regular eaters, conditional eaters, and rare/non-eaters, each split across the
                    same quality scale — a thin group is flagged rather than hidden.
                  </p>
                </div>
                <DataDetailsDrawer title="Food quality by breakfast group">
                  <div className="flex flex-col gap-5">
                    {BRANCH_ORDER.map((branch) => (
                      <div key={branch} className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-foreground">{BRANCH_LABELS[branch]}</p>
                        <DistributionTable
                          data={metrics.messFoodQualityByBranch[branch].distribution}
                          labelHeader="Rating"
                          footnote={`n = ${metrics.messFoodQualityByBranch[branch].eligibility.eligible} eligible · ${metrics.messFoodQualityByBranch[branch].eligibility.answered} answered · ${metrics.messFoodQualityByBranch[branch].eligibility.missing} missing`}
                        />
                      </div>
                    ))}
                  </div>
                </DataDetailsDrawer>
              </div>
              <StackedPercentageBar
                rows={messFoodQualityByBranchBar.rows}
                segments={messFoodQualityByBranchBar.segments}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">Service / access constraints</p>
                  <p className="text-xs text-muted-foreground">
                    Share rating each factor &quot;a lot&quot; or &quot;very strongly&quot;.
                  </p>
                </div>
                <DataDetailsDrawer title="Service / access constraints">
                  <InfluenceRankingTable ranking={metrics.serviceEnvironment} itemHeaderLabel="Factor" />
                </DataDetailsDrawer>
              </div>
              <RankedBarChart data={serviceEnvironmentBuckets} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">Alternative ecosystem</p>
                  <p className="text-xs text-muted-foreground">
                    Competing/substitute infrastructure around mess breakfast.
                  </p>
                </div>
                <DataDetailsDrawer title="Alternative ecosystem">
                  <InfluenceRankingTable ranking={metrics.alternativeEcosystem} itemHeaderLabel="Factor" />
                </DataDetailsDrawer>
              </div>
              <RankedBarChart data={alternativeEcosystemBuckets} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="structural-drivers">
          <AccordionTrigger>Structural drivers</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">Ranked by top-box %</p>
                  <p className="text-xs text-muted-foreground">
                    Every structural/contextual factor, ranked by the share rating it &quot;a
                    lot&quot; or &quot;very strongly&quot;. Category tags are analyst-defined for
                    synthesis, not something respondents selected.
                  </p>
                </div>
                <DataDetailsDrawer title="Structural drivers">
                  <InfluenceRankingTable
                    ranking={metrics.structuralDrivers}
                    itemHeaderLabel="Factor"
                    showCategory
                  />
                </DataDetailsDrawer>
              </div>
              <RankedBarChart data={structuralDriversBuckets} height={340} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">Biggest single influence</p>
                  <p className="text-xs text-muted-foreground">
                    Which single factor respondents say influences their breakfast decisions most.
                    Factor categories (system / personal / alternative) are analyst-defined for
                    synthesis.
                  </p>
                </div>
                <DataDetailsDrawer title="Biggest single influence">
                  <DistributionTable
                    data={biggestInfluenceBuckets}
                    labelHeader="Factor"
                    footnote={`n = ${metrics.biggestInfluence.eligibility.eligible} eligible · ${metrics.biggestInfluence.eligibility.answered} answered · ${metrics.biggestInfluence.eligibility.missing} missing`}
                  />
                </DataDetailsDrawer>
              </div>
              <RankedBarChart data={biggestInfluenceBuckets} height={360} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SectionHeading>Perceived leverage points</SectionHeading>
      <Card>
        <CardHeader>
          <CardTitle>Changes students believe could make mess breakfast easier to use</CardTitle>
          <CardDescription>
            Respondents could select up to three — percentages do not total 100%. These are
            perceptions, not validated interventions.
          </CardDescription>
          <CardAction>
            <DataDetailsDrawer title="Perceived leverage points">
              <DistributionTable
                data={leveragePointsBuckets}
                labelHeader="Option"
                footnote={`n = ${metrics.leveragePoints.eligibility.eligible} eligible · ${metrics.leveragePoints.eligibility.answered} answered · ${metrics.leveragePoints.eligibility.missing} missing`}
              />
            </DataDetailsDrawer>
          </CardAction>
        </CardHeader>
        <CardContent>
          <RankedBarChart data={leveragePointsBuckets} height={360} />
        </CardContent>
      </Card>

      <SectionHeading>System structure map</SectionHeading>
      <Card>
        <CardHeader>
          <CardTitle>Structural synthesis</CardTitle>
          <CardDescription>
            Known system mechanics overlaid with respondent-reported conditions that correspond to
            a specific node.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemStructureMap
            planChange={{
              label: "Plans change after cutoff",
              percentage: metrics.snapshot.cancellationCutoff.percentage,
              n: metrics.snapshot.cancellationCutoff.n,
              flag: metrics.snapshot.cancellationCutoff.flag,
            }}
            topStructuralDriver={{
              label: `${metrics.snapshot.topStructuralConstraint.detailLabel}: high influence`,
              percentage: metrics.snapshot.topStructuralConstraint.percentage,
              n: metrics.snapshot.topStructuralConstraint.n,
              flag: metrics.snapshot.topStructuralConstraint.flag,
            }}
            transferAttempt={{
              label: "Branch C: attempted transfer of unused meal",
              percentage: metrics.unusedMealTransferAttempt.percentage,
              n: metrics.unusedMealTransferAttempt.n,
              flag: metrics.unusedMealTransferAttempt.flag,
            }}
            leaveUnused={{
              label: "Branch C: report leaving meal unused",
              percentage: leaveUnusedBucket?.percentage ?? null,
              n: metrics.unusedAllottedMealActions.eligibility.answered,
              flag: leaveUnusedBucket?.flag ?? "suppressed",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
