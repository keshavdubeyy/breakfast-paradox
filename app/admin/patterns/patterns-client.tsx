"use client"

import { useMemo, useState, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"

import { BranchDeepDiveView } from "@/components/admin/branch-deep-dive-view"
import { CenteredDotPlot, type DotPlotRowData } from "@/components/admin/charts/centered-dot-plot"
import { DataDetailsDrawer } from "@/components/admin/charts/data-details-drawer"
import { DivergingCompositionBar } from "@/components/admin/charts/diverging-composition-bar"
import { HeatmapMatrix, type HeatmapColumnDef, type HeatmapRowData } from "@/components/admin/charts/heatmap-matrix"
import { BRANCH_SEGMENTS, categoricalColorVar } from "@/components/admin/charts/palette"
import { StackedPercentageBar, type StackedBarRowData } from "@/components/admin/charts/stacked-percentage-bar"
import { countActiveFilters, FiltersForm } from "@/components/admin/filters-form"
import { LikertMatrixTable } from "@/components/admin/likert-matrix-table"
import { QualitativeEvidenceDrawer } from "@/components/admin/qualitative-evidence-drawer"
import { RowPercentageTableView } from "@/components/admin/row-percentage-table"
import {
  SampleFlagBadge,
  shouldShowValue,
  suppressedNote,
} from "@/components/admin/sample-flag-badge"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { applyFilters } from "@/lib/analytics/filters"
import { computeBranchDeepDive } from "@/lib/analytics/patterns/branch-deep-dive"
import {
  likertMatrixToDotRows,
  likertMatrixToHeatmapRows,
  rowPercentageTableToBars,
} from "@/lib/analytics/patterns/display"
import {
  analyzeRelationship,
  analyzeRelationshipBySegment,
  EXPLORER_FIELDS,
  getExplorerField,
  type ExplorerFieldMeta,
  type ExplorerResult,
  type ExplorerSegmentResult,
} from "@/lib/analytics/patterns/explorer"
import { computePatternsMetrics } from "@/lib/analytics/patterns/metrics"
import { BRANCH_LABELS, BRANCHES, COMPARISON_ROW_ITEMS } from "@/lib/analytics/patterns/normalization"
import { sampleFlag, type SampleFlag, type SpearmanResult } from "@/lib/analytics/patterns/types"
import {
  DEFAULT_FILTERS,
  type AnalyticsFilters,
  type AnalyticsRow,
} from "@/lib/analytics/types"

const NO_SEGMENT = "__none__"

const BRANCH_COLUMNS: HeatmapColumnDef[] = BRANCHES.map((branch) => ({
  key: branch,
  label: BRANCH_LABELS[branch],
}))

/** Reusable strip for "does this universal field vary by branch" —
 * dispatches through the same validated Explorer logic as a manual
 * Explorer query, just pre-wired to specific fields instead of requiring
 * an admin to pick them from the X/Y selects. */
function FieldByBranchList({ rows, fieldKeys }: { rows: AnalyticsRow[]; fieldKeys: string[] }) {
  return (
    <div className="flex flex-col gap-5">
      {fieldKeys.map((key) => {
        const field = getExplorerField(key)
        const result = analyzeRelationship(rows, key, "branch")
        return (
          <div key={key} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">{field?.label ?? key}</p>
            <ExplorerResultView result={result} />
          </div>
        )
      })}
    </div>
  )
}

function formatPercentage(value: number | null): string {
  return value === null ? "—" : `${value}%`
}

function formatSignedPercentagePoints(value: number | null): string {
  if (value === null) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)} pts`
}

function SpearmanNote({ association, n }: { association: SpearmanResult | null; n: number }) {
  if (!association) {
    return (
      <p className="text-xs text-muted-foreground">
        Not enough eligible responses (n = {n}) to compute an association.
      </p>
    )
  }
  return (
    <p className="text-xs text-muted-foreground">
      Spearman ρ = {association.rho.toFixed(2)} ({association.strength}, n ={" "}
      {association.n})
      <SampleFlagBadge flag={sampleFlag(association.n)} /> — excludes
      &quot;no consistent time&quot; from this calculation (it still appears
      as its own row above).
    </p>
  )
}

interface PatternsClientProps {
  rows: AnalyticsRow[]
  isSampleData: boolean
}

export function PatternsClient({ rows, isSampleData }: PatternsClientProps) {
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
  const metrics = useMemo(() => computePatternsMetrics(filteredRows), [filteredRows])
  const activeFilterCount = countActiveFilters(filters)
  const branchDeepDives = useMemo(
    () => BRANCHES.map((branch) => computeBranchDeepDive(filteredRows, branch)),
    [filteredRows]
  )
  const [qualitativeDrawerOpen, setQualitativeDrawerOpen] = useState(false)

  const [explorerX, setExplorerX] = useState(EXPLORER_FIELDS[0].key)
  const [explorerY, setExplorerY] = useState(EXPLORER_FIELDS[1].key)
  const [explorerSegment, setExplorerSegment] = useState(NO_SEGMENT)
  const [explorerResult, setExplorerResult] = useState<{
    overall: ExplorerResult
    bySegment: ExplorerSegmentResult[] | null
  } | null>(null)

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

  function runExplorer() {
    const overall = analyzeRelationship(filteredRows, explorerX, explorerY)
    const bySegment =
      explorerSegment === NO_SEGMENT
        ? null
        : analyzeRelationshipBySegment(filteredRows, explorerX, explorerY, explorerSegment)
    setExplorerResult({ overall, bySegment })
  }

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No completed responses yet</EmptyTitle>
          <EmptyDescription>
            Patterns need respondents to compare — once completed surveys
            exist, this page will show what repeatedly changes together.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const { summaryCards } = metrics

  const earlyCommitmentBars = rowPercentageTableToBars(metrics.earlyCommitmentsByBranch)
  const sleepBars = rowPercentageTableToBars(metrics.sleepByBranch)
  const wakeBars = rowPercentageTableToBars(metrics.wakeByBranch)
  const influenceHeatmapRows = likertMatrixToHeatmapRows(metrics.influenceMatrix)
  const agreementHeatmapRows = likertMatrixToHeatmapRows(metrics.agreementMatrix)
  const outcomeDotRows = likertMatrixToDotRows(metrics.outcomeMatrix)

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
            Patterns
          </h1>
          <p className="text-sm text-muted-foreground">
            Events tells us what is happening. Patterns tells us what
            repeatedly changes together, across students, situations, and
            time.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setQualitativeDrawerOpen(true)}
          >
            Written responses
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
                  onClick={() =>
                    setDraftFilters({ ...DEFAULT_FILTERS, surveyVersion: latestSurveyVersion })
                  }
                >
                  Reset
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <p className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        These views show associations in self-reported survey data. They do
        not establish causation — a local note only repeats this where a
        result is unusually sparse or easy to misread.
      </p>

      <QualitativeEvidenceDrawer
        open={qualitativeDrawerOpen}
        onOpenChange={setQualitativeDrawerOpen}
        rows={filteredRows}
      />

      {/* --- Key pattern cards --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCardView
          title="Early-commitment gap"
          methodology="Within-person comparison"
          card={summaryCards.earlyCommitmentGap}
          formatter={formatPercentage}
        />
        <SummaryCardView
          title="Late-sleep breakfast gap"
          methodology="Between-group comparison"
          card={summaryCards.lateSleepGap}
          formatter={formatSignedPercentagePoints}
        />
        <SummaryCardView
          title="Weekend shift"
          methodology="Whole-sample composition"
          card={summaryCards.weekendShift}
          formatter={formatPercentage}
        />
        <SummaryCardView
          title="Semester change"
          methodology="Whole-sample composition"
          card={summaryCards.semesterChange}
          formatter={formatPercentage}
        />
      </div>

      <SectionHeading>Core patterns</SectionHeading>

      {/* --- Core Patterns 1 & 3, side by side --- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Early commitments × breakfast behaviour</CardTitle>
            <CardDescription>
              As early-commitment days per week rise, how does the breakfast
              group composition shift? Each row totals ~100%.
            </CardDescription>
            <CardAction>
              <DataDetailsDrawer title="Early commitments × breakfast behaviour">
                <RowPercentageTableView
                  table={metrics.earlyCommitmentsByBranch}
                  rowHeaderLabel="Early-commitment days"
                />
              </DataDetailsDrawer>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <StackedPercentageBar
              rows={earlyCommitmentBars}
              segments={BRANCH_SEGMENTS}
              rowHeaderLabel="Early-commitment days"
              footnote={`n = ${metrics.earlyCommitmentsByBranch.eligibility.eligible} eligible · ${metrics.earlyCommitmentsByBranch.eligibility.answered} answered · ${metrics.earlyCommitmentsByBranch.eligibility.missing} missing`}
            />
          </CardContent>
        </Card>

        {/* --- Core Pattern 3 --- */}
        <Card>
          <CardHeader>
            <CardTitle>Weekday sleep time × breakfast behaviour</CardTitle>
            <CardAction>
              <DataDetailsDrawer title="Weekday sleep time × breakfast behaviour">
                <RowPercentageTableView table={metrics.sleepByBranch} rowHeaderLabel="Weekday sleep time" />
              </DataDetailsDrawer>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <StackedPercentageBar
              rows={sleepBars}
              segments={BRANCH_SEGMENTS}
              rowHeaderLabel="Weekday sleep time"
            />
            <SpearmanNote
              association={metrics.sleepAssociation}
              n={metrics.sleepByBranch.eligibility.answered}
            />
          </CardContent>
        </Card>
      </div>

      {/* --- Core Pattern 2 --- */}
      <Card>
        <CardHeader>
          <CardTitle>Within-person: early vs. non-early days</CardTitle>
          <CardDescription>
            The same respondent, compared against themselves — how often
            they eat breakfast on early-commitment days vs. other days.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <DivergingCompositionBar
            lowerLabel="Less often on early days"
            lowerPercentage={metrics.pairedEarlyVsNonEarly.lowerOnFirstPercentage}
            sameLabel="No difference"
            samePercentage={metrics.pairedEarlyVsNonEarly.samePercentage}
            higherLabel="More often on early days"
            higherPercentage={metrics.pairedEarlyVsNonEarly.higherOnFirstPercentage}
            n={metrics.pairedEarlyVsNonEarly.eligibility.answered}
            flag={sampleFlag(metrics.pairedEarlyVsNonEarly.eligibility.answered)}
            medianCaption={`Median gap: ${metrics.pairedEarlyVsNonEarly.medianGap ?? "—"} frequency levels lower on early days`}
            footnote={`n = ${metrics.pairedEarlyVsNonEarly.eligibility.answered} of ${metrics.pairedEarlyVsNonEarly.eligibility.totalFiltered} respondents gave a comparable answer on both questions (excludes "not applicable" and unanswered).`}
          />
        </CardContent>
      </Card>

      {/* --- Core Pattern 4 --- */}
      <Card>
        <CardHeader>
          <CardTitle>Weekday wake time × breakfast behaviour</CardTitle>
          <CardAction>
            <DataDetailsDrawer title="Weekday wake time × breakfast behaviour">
              <RowPercentageTableView table={metrics.wakeByBranch} rowHeaderLabel="Weekday wake time" />
            </DataDetailsDrawer>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <StackedPercentageBar
            rows={wakeBars}
            segments={BRANCH_SEGMENTS}
            rowHeaderLabel="Weekday wake time"
          />
          <SpearmanNote
            association={metrics.wakeAssociation}
            n={metrics.wakeByBranch.eligibility.answered}
          />
        </CardContent>
      </Card>

      <SectionHeading>Deeper patterns</SectionHeading>

      {/* --- Phase 2: deeper modules, one at a time via tabs rather than a long accordion --- */}
      <Tabs defaultValue="influence-matrix" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="influence-matrix">Structural influence</TabsTrigger>
            <TabsTrigger value="agreement-matrix">Mental model</TabsTrigger>
            <TabsTrigger value="outcome-matrix">Outcomes</TabsTrigger>
            <TabsTrigger value="archetype-relationships">Archetype</TabsTrigger>
            <TabsTrigger value="branch-deep-dives">Branch deep dives</TabsTrigger>
            <TabsTrigger value="before-sleep-morning-routine">Before-sleep &amp; routine</TabsTrigger>
            <TabsTrigger value="weekend-previous-night">Weekend &amp; spillover</TabsTrigger>
            <TabsTrigger value="plan-stability">Plan stability</TabsTrigger>
            <TabsTrigger value="alt-food-spending">Alt. food &amp; spending</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="influence-matrix" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Structural influence × breakfast behaviour</CardTitle>
              <CardDescription>
                For each structural factor (sleep, class schedule, mess allocation,
                distance, and more), what share of each branch says it influences
                their breakfast decisions &quot;a lot&quot; or &quot;very
                strongly&quot;? Sorted by the largest cross-branch gap first.
              </CardDescription>
              <CardAction>
                <DataDetailsDrawer title="Structural influence × breakfast behaviour">
                  <LikertMatrixTable matrix={metrics.influenceMatrix} itemHeaderLabel="Structural factor" />
                </DataDetailsDrawer>
              </CardAction>
            </CardHeader>
            <CardContent>
              <HeatmapMatrix
                rows={influenceHeatmapRows as unknown as HeatmapRowData[]}
                columns={BRANCH_COLUMNS}
                rowHeaderLabel="Structural factor"
                sortable
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreement-matrix" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Mental model × breakfast behaviour</CardTitle>
              <CardDescription>
                For each belief statement, what share of each branch agrees or
                strongly agrees? Compares what people believe about breakfast
                against what they actually do.
              </CardDescription>
              <CardAction>
                <DataDetailsDrawer title="Mental model × breakfast behaviour">
                  <LikertMatrixTable matrix={metrics.agreementMatrix} itemHeaderLabel="Belief statement" />
                </DataDetailsDrawer>
              </CardAction>
            </CardHeader>
            <CardContent>
              <HeatmapMatrix
                rows={agreementHeatmapRows as unknown as HeatmapRowData[]}
                columns={BRANCH_COLUMNS}
                rowHeaderLabel="Belief statement"
                sortable
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcome-matrix" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Reported energy, concentration &amp; hunger outcomes</CardTitle>
              <CardDescription>
                Self-reported effects before lunch, compared across branches, on
                a -2 (much lower than usual) to +2 (much higher) scale.
              </CardDescription>
              <CardAction>
                <DataDetailsDrawer title="Reported energy, concentration & hunger outcomes">
                  <LikertMatrixTable
                    matrix={metrics.outcomeMatrix}
                    itemHeaderLabel="Outcome"
                    scaleDescription="Scale: -2 (much lower than usual) to +2 (much higher)."
                  />
                </DataDetailsDrawer>
              </CardAction>
            </CardHeader>
            <CardContent>
              <CenteredDotPlot
                rows={outcomeDotRows.map((row): DotPlotRowData => ({
                  ...row,
                  caption: COMPARISON_ROW_ITEMS.find((item) => item.key === row.key)?.helperText,
                }))}
                series={BRANCH_SEGMENTS}
                domain={[-2, 2]}
                centerValue={0}
                domainLabels={["Much lower than usual", "Much higher than usual"]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archetype-relationships" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Archetype × breakfast behaviour</CardTitle>
              <CardDescription>
                Does the quiz-derived archetype track with actual breakfast
                branch? A strong association here is expected — the archetype
                is built from related survey answers — but it&apos;s a useful
                sanity check on whether the archetype model lines up with
                observed behaviour.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldByBranchList rows={filteredRows} fieldKeys={["primaryArchetype"]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branch-deep-dives" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Branch deep dives</CardTitle>
              <CardDescription>
                Each branch has its own follow-up questions, only ever asked of
                that branch&apos;s respondents — these are plain within-branch
                breakdowns, not cross-branch comparisons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion>
                {branchDeepDives.map((deepDive) => (
                  <AccordionItem key={deepDive.branch} value={`branch-${deepDive.branch}`}>
                    <AccordionTrigger>{BRANCH_LABELS[deepDive.branch]}</AccordionTrigger>
                    <AccordionContent>
                      <BranchDeepDiveView fields={deepDive.fields} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="before-sleep-morning-routine" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Before-sleep &amp; morning routine</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldByBranchList
                rows={filteredRows}
                fieldKeys={["beforeSleepMostTime", "beforeSleepActivities", "morningActivities"]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekend-previous-night" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Weekend &amp; previous-night spillover</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldByBranchList
                rows={filteredRows}
                fieldKeys={[
                  "previousNightAffectsBreakfast",
                  "previousNightFactors",
                  "weekendDifferentiators",
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan-stability" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Plan stability</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldByBranchList
                rows={filteredRows}
                fieldKeys={["breakfastPlanChangeFrequency", "breakfastPlanChangeActions"]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alt-food-spending" className="pt-3">
          <Card>
            <CardHeader>
              <CardTitle>Alternative food &amp; spending</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldByBranchList
                rows={filteredRows}
                fieldKeys={[
                  "nonBreakfastMealSource",
                  "nextFoodTime",
                  "nonBreakfastSpendingFrequency",
                  "nonBreakfastSpendingAmount",
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Pattern Explorer --- */}
      <Card>
        <CardHeader>
          <CardTitle>Explore a relationship</CardTitle>
          <CardDescription>
            Every closed-ended field is queryable here, even the ones that
            don&apos;t have a permanent chart above — nothing in the survey
            is lost.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">X variable</Label>
              <GroupedFieldSelect
                value={explorerX}
                onChange={setExplorerX}
                fields={EXPLORER_FIELDS.filter((f) => f.allowedAsX)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Y variable</Label>
              <GroupedFieldSelect
                value={explorerY}
                onChange={setExplorerY}
                fields={EXPLORER_FIELDS.filter((f) => f.allowedAsY)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Segment by (optional)</Label>
              <Select
                value={explorerSegment}
                onValueChange={(value) => value && setExplorerSegment(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {() =>
                      explorerSegment === NO_SEGMENT
                        ? "None"
                        : (EXPLORER_FIELDS.find((f) => f.key === explorerSegment)?.label ?? "")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SEGMENT}>None</SelectItem>
                  {EXPLORER_FIELDS.filter((f) => f.allowedAsX).map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="button" onClick={runExplorer} className="w-fit">
            Analyze
          </Button>

          {explorerResult ? (
            <div className="flex flex-col gap-4 border-t border-border/60 pt-4">
              <ExplorerResultView result={explorerResult.overall} />
              {explorerResult.bySegment ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-foreground">By segment</p>
                  {explorerResult.bySegment.map((segment) => (
                    <div key={segment.segmentValue} className="rounded-lg border border-border/60 p-3">
                      <p className="mb-2 text-sm font-medium text-foreground">
                        {segment.segmentLabel} (n = {segment.n})
                      </p>
                      <ExplorerResultView result={segment.result} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

/** Groups the Explorer's 82 fields under their existing `section` tag
 * (already carried by every ExplorerFieldMeta) instead of one flat list
 * — no fields removed or renamed, purely a picker-UI change. */
function GroupedFieldSelect({
  value,
  onChange,
  fields,
}: {
  value: string
  onChange: (value: string) => void
  fields: ExplorerFieldMeta[]
}) {
  const sections: string[] = []
  for (const field of fields) {
    if (!sections.includes(field.section)) sections.push(field.section)
  }

  return (
    <Select value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger className="w-full">
        <SelectValue>{() => fields.find((f) => f.key === value)?.label ?? ""}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sections.map((section) => (
          <SelectGroup key={section}>
            <SelectLabel>{section}</SelectLabel>
            {fields
              .filter((field) => field.section === section)
              .map((field) => (
                <SelectItem key={field.key} value={field.key}>
                  {field.label}
                </SelectItem>
              ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

function SummaryCardView({
  title,
  methodology,
  card,
  formatter,
}: {
  title: string
  methodology: string
  card: { label: string; percentage: number | null; n: number; flag: SampleFlag }
  formatter: (value: number | null) => string
}) {
  // A genuinely suppressed card (n < MIN_CELL_N) never shows the computed
  // number itself — with that few respondents, the "headline" figure can
  // amount to an individual-response drilldown. "small sample" (n < 20)
  // still shows the real number, just flagged as less reliable.
  const showValue = shouldShowValue(card.flag)

  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="flex flex-col gap-0.5">
          <span>{title}</span>
          <span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
            {methodology}
          </span>
        </CardDescription>
        <CardTitle className="text-2xl">
          {showValue ? formatter(card.percentage) : "—"}
          <SampleFlagBadge flag={card.flag} />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {showValue
            ? `${card.label} (n = ${card.n})`
            : `Not enough responses to display safely (n = ${card.n})`}
        </p>
      </CardHeader>
    </Card>
  )
}

/** Crosstab result -> StackedPercentageBar rows, one per x category. Row
 * n/flag are derived here (summed from the already-returned cell counts)
 * purely for display — computeCrosstab's own contract/return type is
 * untouched. */
function crosstabToBarRows(result: {
  xCategories: string[]
  yCategories: string[]
  xCategoryLabels: Record<string, string>
  cells: { xValue: string; yValue: string; count: number; rowPercentage: number }[]
}): StackedBarRowData[] {
  return result.xCategories.map((x) => {
    const cellsForX = result.cells.filter((c) => c.xValue === x)
    const n = cellsForX.reduce((sum, c) => sum + c.count, 0)
    const percentageBySegment: Record<string, number> = {}
    const countBySegment: Record<string, number> = {}
    for (const cell of cellsForX) {
      percentageBySegment[cell.yValue] = cell.rowPercentage
      countBySegment[cell.yValue] = cell.count
    }
    return {
      key: x,
      label: result.xCategoryLabels[x] ?? x,
      n,
      flag: sampleFlag(n),
      percentageBySegment,
      countBySegment,
    }
  })
}

function ExplorerResultView({ result }: { result: ExplorerResult }) {
  if (result.status === "unsupported") {
    return <p className="text-sm text-muted-foreground">{result.reason}</p>
  }
  if (result.status === "suppressed") {
    return <p className="text-sm text-muted-foreground">{suppressedNote(result.n)}</p>
  }

  if (result.method === "crosstab") {
    const ySegments = result.yCategories.map((y, index) => ({
      key: y,
      label: result.yCategoryLabels[y] ?? y,
      colorVar: categoricalColorVar(index),
    }))
    const useHeatmap = result.yCategories.length > 4

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <DataDetailsDrawer title={`${result.xLabel} × ${result.yLabel}`}>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{result.xLabel}</TableHead>
                    {result.yCategories.map((y) => (
                      <TableHead key={y} className="text-right">
                        {result.yCategoryLabels[y] ?? y}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.xCategories.map((x) => (
                    <TableRow key={x}>
                      <TableCell className="font-medium text-foreground">
                        {result.xCategoryLabels[x] ?? x}
                      </TableCell>
                      {result.yCategories.map((y) => {
                        const cell = result.cells.find((c) => c.xValue === x && c.yValue === y)
                        return (
                          <TableCell key={y} className="text-right tabular-nums">
                            {cell ? `${cell.rowPercentage}%` : "—"}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DataDetailsDrawer>
        </div>
        {useHeatmap ? (
          <HeatmapMatrix
            rows={result.xCategories.map((x) => {
              const cells: HeatmapRowData["cells"] = {}
              for (const y of result.yCategories) {
                const cell = result.cells.find((c) => c.xValue === x && c.yValue === y)
                cells[y] = {
                  value: cell?.rowPercentage ?? null,
                  n: cell?.count ?? 0,
                  flag: "ok",
                }
              }
              return { key: x, label: result.xCategoryLabels[x] ?? x, cells }
            })}
            columns={result.yCategories.map((y) => ({ key: y, label: result.yCategoryLabels[y] ?? y }))}
            rowHeaderLabel={result.xLabel}
          />
        ) : (
          <StackedPercentageBar rows={crosstabToBarRows(result)} segments={ySegments} />
        )}
        <p className="text-xs text-muted-foreground">
          {result.association
            ? `Cramér's V = ${result.association.v.toFixed(2)} (${result.association.strength}, n = ${result.association.n})`
            : "Not enough variation to compute Cramér's V."}
          <SampleFlagBadge flag={sampleFlag(result.n)} /> — row percentages (of{" "}
          {result.xLabel}).
        </p>
        {result.sparse ? (
          <p className="text-xs text-muted-foreground">
            Sparse data — this table has many categories relative to n;
            association may be unstable.
          </p>
        ) : null}
      </div>
    )
  }

  if (result.method === "spearman") {
    return (
      <p className="text-sm text-foreground">
        {result.xLabel} vs. {result.yLabel}:{" "}
        {result.association ? (
          <>
            Spearman ρ = {result.association.rho.toFixed(2)} ({result.association.strength}
            , n = {result.association.n})
            <SampleFlagBadge flag={sampleFlag(result.n)} />
          </>
        ) : (
          "not enough data"
        )}
        .
      </p>
    )
  }

  if (result.method === "ordinal-by-group") {
    const domainValues = result.rows.map((row) => row.median).filter((v): v is number => v !== null)
    const domain: [number, number] =
      domainValues.length > 0
        ? [Math.min(0, ...domainValues), Math.max(...domainValues, 1)]
        : [0, 1]
    const groupSeries = result.rows.map((row, index) => ({
      key: row.group,
      label: result.groupLabels[row.group] ?? row.group,
      colorVar: categoricalColorVar(index),
    }))

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <DataDetailsDrawer title={`${result.groupLabel} × ${result.valueLabel}`}>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{result.groupLabel}</TableHead>
                    <TableHead className="text-right">Median {result.valueLabel}</TableHead>
                    <TableHead className="text-right">Mean</TableHead>
                    <TableHead className="text-right">n</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row) => (
                    <TableRow key={row.group}>
                      <TableCell className="font-medium text-foreground">
                        {result.groupLabels[row.group] ?? row.group}
                      </TableCell>
                      {shouldShowValue(row.flag) ? (
                        <>
                          <TableCell className="text-right tabular-nums font-medium">
                            {row.median ?? "—"}
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                            {row.mean !== null ? row.mean.toFixed(2) : "—"}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell colSpan={2} className="text-center text-xs text-muted-foreground">
                          Not enough responses
                        </TableCell>
                      )}
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {row.n}
                        <SampleFlagBadge flag={row.flag} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DataDetailsDrawer>
        </div>
        <CenteredDotPlot
          rows={[
            {
              key: result.valueLabel,
              label: `Median ${result.valueLabel}`,
              points: result.rows.map((row) => ({
                seriesKey: row.group,
                value: row.median,
                n: row.n,
                flag: row.flag,
                detail: row.mean !== null ? `mean ${row.mean.toFixed(2)}` : undefined,
              })),
            },
          ]}
          series={groupSeries}
          domain={domain}
        />
        <p className="text-xs text-muted-foreground">
          Median is the primary figure for this ordinal scale — mean is
          shown on hover only, since equal category intervals aren&apos;t
          guaranteed to be equal psychologically.
        </p>
      </div>
    )
  }

  if (result.method === "prevalence-by-group") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <DataDetailsDrawer title={`${result.groupLabel} × ${result.optionLabel}`}>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{result.groupLabel}</TableHead>
                    {result.options.map((option) => (
                      <TableHead key={option.value} className="text-right">
                        {option.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">n</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row) => (
                    <TableRow key={row.group}>
                      <TableCell className="font-medium text-foreground">
                        {result.groupLabels[row.group] ?? row.group}
                      </TableCell>
                      {shouldShowValue(row.flag) ? (
                        result.options.map((option) => (
                          <TableCell key={option.value} className="text-right tabular-nums">
                            {row.percentageByOption[option.value]}%
                          </TableCell>
                        ))
                      ) : (
                        <TableCell
                          colSpan={result.options.length}
                          className="text-center text-xs text-muted-foreground"
                        >
                          Not enough responses
                        </TableCell>
                      )}
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {row.n}
                        <SampleFlagBadge flag={row.flag} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DataDetailsDrawer>
        </div>
        <HeatmapMatrix
          rows={result.rows.map((row) => {
            const cells: HeatmapRowData["cells"] = {}
            for (const option of result.options) {
              cells[option.value] = {
                value: shouldShowValue(row.flag) ? row.percentageByOption[option.value] : null,
                n: row.n,
                flag: row.flag,
              }
            }
            return { key: row.group, label: result.groupLabels[row.group] ?? row.group, cells }
          })}
          columns={result.options.map((option) => ({ key: option.value, label: option.label }))}
          rowHeaderLabel={result.groupLabel}
          caption="Multiple selections were allowed — percentages don't need to sum to 100%."
        />
      </div>
    )
  }

  // paired-difference
  return (
    <DivergingCompositionBar
      lowerLabel={`Lower on ${result.xLabel}`}
      lowerPercentage={result.lowerPercentage}
      sameLabel="No difference"
      samePercentage={result.samePercentage}
      higherLabel={`Higher on ${result.xLabel}`}
      higherPercentage={result.higherPercentage}
      n={result.n}
      flag={sampleFlag(result.n)}
      medianCaption={`Median gap: ${result.medianGap ?? "—"}`}
    />
  )
}
