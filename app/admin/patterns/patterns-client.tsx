"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"

import { BranchDeepDiveView } from "@/components/admin/branch-deep-dive-view"
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
  SelectItem,
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

import { applyFilters } from "@/lib/analytics/filters"
import { computeBranchDeepDive } from "@/lib/analytics/patterns/branch-deep-dive"
import {
  analyzeRelationship,
  analyzeRelationshipBySegment,
  EXPLORER_FIELDS,
  getExplorerField,
  type ExplorerResult,
  type ExplorerSegmentResult,
} from "@/lib/analytics/patterns/explorer"
import { computePatternsMetrics } from "@/lib/analytics/patterns/metrics"
import { BRANCH_LABELS, BRANCHES } from "@/lib/analytics/patterns/normalization"
import { sampleFlag, type SampleFlag, type SpearmanResult } from "@/lib/analytics/patterns/types"
import {
  DEFAULT_FILTERS,
  type AnalyticsFilters,
  type AnalyticsRow,
} from "@/lib/analytics/types"

const NO_SEGMENT = "__none__"

/** Reusable strip for "does this universal field vary by branch" —
 * dispatches through the same validated Explorer logic as a manual
 * Explorer query, just pre-wired to specific fields instead of requiring
 * an admin to pick them from the X/Y selects. */
function FieldByBranchList({ rows, fieldKeys }: { rows: AnalyticsRow[]; fieldKeys: string[] }) {
  return (
    <div className="flex flex-col gap-4">
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
      <SampleFlagBadge flag={sampleFlag(association.n)} /> — association, not
      causation. Excludes “no consistent time” from the ordinal calculation
      (it still appears as its own row above).
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
            time — associations, never causation.
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

      <QualitativeEvidenceDrawer
        open={qualitativeDrawerOpen}
        onOpenChange={setQualitativeDrawerOpen}
        rows={filteredRows}
      />

      {/* --- Key pattern cards --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCardView
          title="Early-commitment gap"
          card={summaryCards.earlyCommitmentGap}
          formatter={formatPercentage}
        />
        <SummaryCardView
          title="Late-sleep breakfast gap"
          card={summaryCards.lateSleepGap}
          formatter={formatSignedPercentagePoints}
        />
        <SummaryCardView
          title="Weekend shift"
          card={summaryCards.weekendShift}
          formatter={formatPercentage}
        />
        <SummaryCardView
          title="Semester change"
          card={summaryCards.semesterChange}
          formatter={formatPercentage}
        />
      </div>

      {/* --- Core Pattern 1 --- */}
      <Card>
        <CardHeader>
          <CardTitle>Early commitments × breakfast behaviour</CardTitle>
          <CardDescription>
            As early-commitment days per week rise, how does the breakfast
            group distribution change? Each row totals ~100%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RowPercentageTableView
            table={metrics.earlyCommitmentsByBranch}
            rowHeaderLabel="Early-commitment days"
          />
        </CardContent>
      </Card>

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
          {(() => {
            const flag = sampleFlag(metrics.pairedEarlyVsNonEarly.eligibility.answered)
            if (!shouldShowValue(flag)) {
              return (
                <p className="text-sm text-muted-foreground">
                  {suppressedNote(metrics.pairedEarlyVsNonEarly.eligibility.answered)}
                </p>
              )
            }
            return (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <PairedStat
                    label="Breakfast less often on early days"
                    value={metrics.pairedEarlyVsNonEarly.lowerOnFirstPercentage}
                  />
                  <PairedStat
                    label="No difference"
                    value={metrics.pairedEarlyVsNonEarly.samePercentage}
                  />
                  <PairedStat
                    label="Breakfast more often on early days"
                    value={metrics.pairedEarlyVsNonEarly.higherOnFirstPercentage}
                  />
                </div>
                <p className="text-sm text-foreground">
                  Median gap:{" "}
                  <span className="font-medium">
                    {metrics.pairedEarlyVsNonEarly.medianGap ?? "—"}
                  </span>{" "}
                  frequency levels
                  <SampleFlagBadge flag={flag} />
                </p>
              </>
            )
          })()}
          <p className="text-xs text-muted-foreground">
            n = {metrics.pairedEarlyVsNonEarly.eligibility.answered} of{" "}
            {metrics.pairedEarlyVsNonEarly.eligibility.totalFiltered} respondents
            gave a comparable answer on both questions (excludes “not
            applicable” and unanswered).
          </p>
        </CardContent>
      </Card>

      {/* --- Core Pattern 3 --- */}
      <Card>
        <CardHeader>
          <CardTitle>Weekday sleep time × breakfast behaviour</CardTitle>
          <CardDescription>Association, not causation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <RowPercentageTableView
            table={metrics.sleepByBranch}
            rowHeaderLabel="Weekday sleep time"
          />
          <SpearmanNote
            association={metrics.sleepAssociation}
            n={metrics.sleepByBranch.eligibility.answered}
          />
        </CardContent>
      </Card>

      {/* --- Core Pattern 4 --- */}
      <Card>
        <CardHeader>
          <CardTitle>Weekday wake time × breakfast behaviour</CardTitle>
          <CardDescription>Association, not causation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <RowPercentageTableView
            table={metrics.wakeByBranch}
            rowHeaderLabel="Weekday wake time"
          />
          <SpearmanNote
            association={metrics.wakeAssociation}
            n={metrics.wakeByBranch.eligibility.answered}
          />
        </CardContent>
      </Card>

      {/* --- Phase 2: deeper modules, kept collapsible rather than a wall of charts --- */}
      <Accordion defaultValue={["influence-matrix"]}>
        <AccordionItem value="influence-matrix">
          <AccordionTrigger>Structural influence × breakfast behaviour</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3 text-sm text-muted-foreground">
              For each structural factor (sleep, class schedule, mess allocation,
              distance, and more), how strongly do regular / conditional /
              rare eaters say it influences their breakfast decisions? A large
              gap flags a factor that plausibly relates to branch membership —
              still an association, not proof of cause.
            </p>
            <LikertMatrixTable
              matrix={metrics.influenceMatrix}
              itemHeaderLabel="Structural factor"
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="agreement-matrix">
          <AccordionTrigger>Mental model × breakfast behaviour</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3 text-sm text-muted-foreground">
              For each belief statement, how strongly do respondents in each
              branch agree? Compares what people believe about breakfast
              against what they actually do.
            </p>
            <LikertMatrixTable
              matrix={metrics.agreementMatrix}
              itemHeaderLabel="Belief statement"
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="outcome-matrix">
          <AccordionTrigger>Reported energy, concentration &amp; hunger outcomes</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Self-reported effects before lunch, compared across branches, on
              a -2 (much lower than usual) to +2 (much higher) scale. Higher
              isn&apos;t automatically &quot;better&quot; here — see each row for
              context (e.g. more hunger isn&apos;t necessarily worse, just
              different).
            </p>
            <LikertMatrixTable
              matrix={metrics.outcomeMatrix}
              itemHeaderLabel="Outcome"
              scaleDescription="Scale: -2 (much lower than usual) to +2 (much higher)."
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="archetype-relationships">
          <AccordionTrigger>Archetype × breakfast behaviour</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Does the quiz-derived archetype track with actual breakfast
              branch? A strong association here is expected — the archetype
              is built from related survey answers — but it&apos;s a useful
              sanity check on whether the archetype model lines up with
              observed behaviour.
            </p>
            <FieldByBranchList rows={filteredRows} fieldKeys={["primaryArchetype"]} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="branch-deep-dives">
          <AccordionTrigger>Branch deep dives</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Each branch has its own follow-up questions, only ever asked of
              that branch&apos;s respondents — these are plain within-branch
              breakdowns, not cross-branch comparisons.
            </p>
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="before-sleep-morning-routine">
          <AccordionTrigger>Before-sleep &amp; morning routine</AccordionTrigger>
          <AccordionContent>
            <FieldByBranchList
              rows={filteredRows}
              fieldKeys={["beforeSleepMostTime", "beforeSleepActivities", "morningActivities"]}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="weekend-previous-night">
          <AccordionTrigger>Weekend &amp; previous-night spillover</AccordionTrigger>
          <AccordionContent>
            <FieldByBranchList
              rows={filteredRows}
              fieldKeys={[
                "previousNightAffectsBreakfast",
                "previousNightFactors",
                "weekendDifferentiators",
              ]}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="plan-stability">
          <AccordionTrigger>Plan stability</AccordionTrigger>
          <AccordionContent>
            <FieldByBranchList
              rows={filteredRows}
              fieldKeys={["breakfastPlanChangeFrequency", "breakfastPlanChangeActions"]}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="alt-food-spending">
          <AccordionTrigger>Alternative food &amp; spending</AccordionTrigger>
          <AccordionContent>
            <FieldByBranchList
              rows={filteredRows}
              fieldKeys={[
                "nonBreakfastMealSource",
                "nextFoodTime",
                "nonBreakfastSpendingFrequency",
                "nonBreakfastSpendingAmount",
              ]}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
              <Select
                value={explorerX}
                onValueChange={(value) => value && setExplorerX(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {() => EXPLORER_FIELDS.find((f) => f.key === explorerX)?.label ?? ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EXPLORER_FIELDS.filter((f) => f.allowedAsX).map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Y variable</Label>
              <Select
                value={explorerY}
                onValueChange={(value) => value && setExplorerY(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {() => EXPLORER_FIELDS.find((f) => f.key === explorerY)?.label ?? ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EXPLORER_FIELDS.filter((f) => f.allowedAsY).map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

function SummaryCardView({
  title,
  card,
  formatter,
}: {
  title: string
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
        <CardDescription>{title}</CardDescription>
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

function PairedStat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <p className="text-2xl font-semibold text-foreground">{formatPercentage(value)}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function ExplorerResultView({ result }: { result: ExplorerResult }) {
  if (result.status === "unsupported") {
    return <p className="text-sm text-muted-foreground">{result.reason}</p>
  }
  if (result.status === "suppressed") {
    return <p className="text-sm text-muted-foreground">{suppressedNote(result.n)}</p>
  }

  if (result.method === "crosstab") {
    return (
      <div className="flex flex-col gap-2">
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{result.xLabel}</TableHead>
                {result.yCategories.map((y) => (
                  <TableHead key={y} className="text-right">
                    {y}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.xCategories.map((x) => (
                <TableRow key={x}>
                  <TableCell className="font-medium text-foreground">{x}</TableCell>
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
        <p className="text-xs text-muted-foreground">
          {result.association
            ? `Cramér's V = ${result.association.v.toFixed(2)} (${result.association.strength}, n = ${result.association.n})`
            : "Not enough variation to compute Cramér's V."}
          <SampleFlagBadge flag={sampleFlag(result.n)} /> — association, not
          causation. Row percentages (of {result.xLabel}).
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
        . Association, not causation.
      </p>
    )
  }

  if (result.method === "ordinal-by-group") {
    return (
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
                <TableCell className="font-medium text-foreground">{row.group}</TableCell>
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
        <p className="p-2 text-xs text-muted-foreground">
          Median is the primary figure for this ordinal scale — mean is
          shown for reference only, since equal category intervals aren&apos;t
          guaranteed to be equal psychologically.
        </p>
      </div>
    )
  }

  if (result.method === "prevalence-by-group") {
    return (
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
                <TableCell className="font-medium text-foreground">{row.group}</TableCell>
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
        <p className="p-2 text-xs text-muted-foreground">
          Multi-select — percentages don&apos;t need to sum to 100%.
        </p>
      </div>
    )
  }

  // paired-difference
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <PairedStat label={`Lower on ${result.xLabel}`} value={result.lowerPercentage} />
      <PairedStat label="No difference" value={result.samePercentage} />
      <PairedStat label={`Higher on ${result.xLabel}`} value={result.higherPercentage} />
      <p className="col-span-full text-xs text-muted-foreground">
        Median gap: {result.medianGap ?? "—"} · n = {result.n}
        <SampleFlagBadge flag={sampleFlag(result.n)} />
      </p>
    </div>
  )
}
