"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"

import { countActiveFilters, FiltersForm } from "@/components/admin/filters-form"
import { DistributionBarChart } from "@/components/admin/distribution-bar-chart"
import { DivergingScaleChart } from "@/components/admin/diverging-scale-chart"
import { PathwaySankey } from "@/components/admin/pathway-sankey"
import {
  ResponseDrawer,
  type ResponseDrawerColumn,
} from "@/components/admin/response-drawer"
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
import {
  UNKNOWN_VALUE,
  labelFor,
  type DistributionBucket,
} from "@/lib/analytics/distributions"
import {
  computeEventsMetrics,
  filterRowsByArrayField,
  filterRowsByField,
  rowsAskedMissedBreakfastReasons,
  rowsAskedPlanChangeActions,
  rowsAskedPlanChangeReasonsB,
  rowsAskedSpendingAmount,
  type ScaleRowSummary,
} from "@/lib/analytics/events-metrics"
import {
  DEFAULT_FILTERS,
  type AnalyticsFilters,
  type AnalyticsRow,
  type Branch,
} from "@/lib/analytics/types"
import {
  BREAKFAST_CHANGE_ACTION_OPTIONS,
  BREAKFAST_PLAN_CHANGE_REASON_OPTIONS,
  MISSED_BREAKFAST_REASON_OPTIONS,
  UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"

function joinArrayLabels(values: string[], options: SurveyOption[]): string {
  return values.length === 0
    ? "—"
    : values.map((value) => labelFor(options, value)).join(", ")
}

/** Bucket value → the underlying scalar field value it represents (the
 * distribution builder's "Not set" bucket always means the field was
 * null on the row it came from). */
function fieldValueFromBucket(bucket: DistributionBucket): string | null {
  return bucket.value === UNKNOWN_VALUE ? null : bucket.value
}

interface DrawerState {
  title: string
  rows: AnalyticsRow[]
  extraColumns?: ResponseDrawerColumn[]
}

interface EventsClientProps {
  rows: AnalyticsRow[]
  isSampleData: boolean
}

export function EventsClient({ rows, isSampleData }: EventsClientProps) {
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
  const [drawer, setDrawer] = useState<DrawerState | null>(null)

  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters])
  const metrics = useMemo(() => computeEventsMetrics(filteredRows), [filteredRows])
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

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No completed responses yet</EmptyTitle>
          <EmptyDescription>
            Once respondents submit the survey, this page will show what’s
            actually happening in the breakfast system.
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
            Events
          </h1>
          <p className="text-sm text-muted-foreground">
            What students actually do with breakfast, what happens when plans
            break, and what happens afterward — observable behaviour only, no
            interpretation. That comes later, on Patterns and Structures.
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
            <EmptyDescription>Try clearing a filter to widen the sample.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <KeyEventCards metrics={metrics} />

          <Card>
            <CardHeader>
              <CardTitle>Breakfast usage</CardTitle>
              <CardDescription>
                How often students actually eat breakfast at the mess.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionBarChart
                data={metrics.breakfastUsageDistribution}
                onBucketClick={(bucket) =>
                  setDrawer({
                    title: `Breakfast frequency: ${bucket.label}`,
                    rows: filterRowsByField(
                      filteredRows,
                      "breakfastFrequency",
                      fieldValueFromBucket(bucket)
                    ),
                  })
                }
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Plan changes after the cutoff</CardTitle>
                <CardDescription>
                  How often the breakfast plan changes after it’s too late to
                  cancel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionBarChart
                  data={metrics.planChangeFrequencyDistribution}
                  onBucketClick={(bucket) =>
                    setDrawer({
                      title: `Plan changes after cutoff: ${bucket.label}`,
                      rows: filterRowsByField(
                        filteredRows,
                        "breakfastPlanChangeFrequency",
                        fieldValueFromBucket(bucket)
                      ),
                    })
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What happens when the plan changes</CardTitle>
                <CardDescription>
                  Of {metrics.planChangeActionsDenominatorCount} respondents whose
                  plan changes at least sometimes — multi-select, so this won’t
                  sum to 100%.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionBarChart
                  data={metrics.planChangeActionsDistribution}
                  height={300}
                  onBucketClick={(bucket) =>
                    setDrawer({
                      title: `Plan-change action: ${bucket.label}`,
                      rows: filterRowsByArrayField(
                        rowsAskedPlanChangeActions(filteredRows),
                        "breakfastPlanChangeActions",
                        bucket.value
                      ),
                      extraColumns: [
                        {
                          label: "Actions taken",
                          getValue: (row) =>
                            joinArrayLabels(
                              row.breakfastPlanChangeActions,
                              BREAKFAST_CHANGE_ACTION_OPTIONS
                            ),
                        },
                      ],
                    })
                  }
                />
              </CardContent>
            </Card>
          </div>

          <BranchSpecificEvents
            metrics={metrics}
            filteredRows={filteredRows}
            onDrawer={setDrawer}
          />

          <Card>
            <CardHeader>
              <CardTitle>What do students do before lunch?</CardTitle>
              <CardDescription>
                On days without mess breakfast — what students turn to instead.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionBarChart
                data={metrics.nonBreakfastMealSourceDistribution}
                onBucketClick={(bucket) =>
                  setDrawer({
                    title: `Before-lunch food source: ${bucket.label}`,
                    rows: filterRowsByArrayField(
                      filteredRows,
                      "nonBreakfastMealSource",
                      bucket.value
                    ),
                  })
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>When do they next eat?</CardTitle>
              <CardDescription>
                Two students who both “skip breakfast” may be doing very
                different things — this separates them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionBarChart
                data={metrics.nextFoodTimeDistribution}
                onBucketClick={(bucket) =>
                  setDrawer({
                    title: `Next food/drink: ${bucket.label}`,
                    rows: filterRowsByField(
                      filteredRows,
                      "nextFoodTime",
                      fieldValueFromBucket(bucket)
                    ),
                  })
                }
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Before-lunch spending — frequency</CardTitle>
                <CardDescription>
                  On days without mess breakfast, how often money is spent on
                  food or drinks before lunch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionBarChart
                  data={metrics.nonBreakfastSpendingFrequencyDistribution}
                  onBucketClick={(bucket) =>
                    setDrawer({
                      title: `Before-lunch spending frequency: ${bucket.label}`,
                      rows: filterRowsByField(
                        filteredRows,
                        "nonBreakfastSpendingFrequency",
                        fieldValueFromBucket(bucket)
                      ),
                    })
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Before-lunch spending — amount</CardTitle>
                <CardDescription>
                  Among the {metrics.nonBreakfastSpendingAmountDenominatorCount}{" "}
                  respondents who spend at least sometimes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionBarChart
                  data={metrics.nonBreakfastSpendingAmountDistribution}
                  onBucketClick={(bucket) =>
                    setDrawer({
                      title: `Before-lunch spending amount: ${bucket.label}`,
                      rows: filterRowsByField(
                        rowsAskedSpendingAmount(filteredRows),
                        "nonBreakfastSpendingAmount",
                        fieldValueFromBucket(bucket)
                      ),
                    })
                  }
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Self-reported effects before lunch</CardTitle>
              <CardDescription>
                Compared with breakfast days, how students report feeling before
                lunch on days they don’t eat breakfast at the mess — a reported
                consequence, not yet a causal claim.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DivergingScaleChart
                rows={metrics.comparisonRatingSummaries}
                lowLabel="Lower"
                highLabel="Higher"
                onRowClick={(row: ScaleRowSummary) =>
                  setDrawer({
                    title: `${row.label} — respondents who answered this`,
                    rows: filteredRows.filter(
                      (analyticsRow) =>
                        analyticsRow.comparisonRatings[row.key] !== undefined
                    ),
                    extraColumns: [
                      {
                        label: row.label,
                        getValue: (analyticsRow) =>
                          analyticsRow.comparisonRatings[row.key] ?? "—",
                      },
                    ],
                  })
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reported breakfast pathways</CardTitle>
              <CardDescription>
                How a changing plan cascades into an action, by branch. Not every
                edge here comes from the same respondent field — see the note
                below the chart — so this isn’t a literal person-by-person
                journey, and drill-down isn’t available on it yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <PathwaySankey data={metrics.pathwaySankey} />
              <p className="text-xs text-muted-foreground">
                “All respondents” splits by branch, and by branch is exact —
                every respondent counted once. Branch → plan-change status is
                also exact (each respondent’s own cutoff-change answer). The
                final layer (specific actions) is a multi-select, so those
                widths are selection counts, not additional respondents — a
                student who selected two actions appears in both. What
                students do after skipping breakfast (shown separately above)
                is a different question asked of everyone regardless of
                branch, so it’s deliberately not chained onto this diagram.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <ResponseDrawer
        open={drawer !== null}
        onOpenChange={(open) => {
          if (!open) setDrawer(null)
        }}
        title={drawer?.title ?? ""}
        rows={drawer?.rows ?? []}
        extraColumns={drawer?.extraColumns}
      />
    </div>
  )
}

function KeyMetricCard({
  label,
  description,
  percentage,
  count,
  denominator,
}: {
  label: string
  description: string
  percentage: number | null
  count: number
  denominator: number
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">
          {percentage === null ? "—" : `${percentage}%`}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {denominator === 0 ? "No data yet" : `${count} of ${denominator}`}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
    </Card>
  )
}

function KeyEventCards({
  metrics,
}: {
  metrics: ReturnType<typeof computeEventsMetrics>
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.keyEventMetrics.map((metric) => (
        <KeyMetricCard key={metric.label} {...metric} />
      ))}
    </div>
  )
}

const BRANCH_LABELS: Record<Branch, string> = {
  A: "Regular eaters",
  B: "Conditional eaters",
  C: "Rare / non-eaters",
}

function BranchSpecificEvents({
  metrics,
  filteredRows,
  onDrawer,
}: {
  metrics: ReturnType<typeof computeEventsMetrics>
  filteredRows: AnalyticsRow[]
  onDrawer: (drawer: DrawerState) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branch-specific events</CardTitle>
        <CardDescription>
          Different students experience different events — regular, conditional,
          and rare/non-eaters each see a different set of follow-up questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-foreground">
            {BRANCH_LABELS.A} ({metrics.branchA.count})
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                How often they intend to have breakfast but end up missing it
              </p>
              <DistributionBarChart
                data={metrics.branchA.missedFrequencyDistribution}
                height={180}
                onBucketClick={(bucket) =>
                  onDrawer({
                    title: `Branch A — missed breakfast frequency: ${bucket.label}`,
                    rows: filterRowsByField(
                      filteredRows.filter((row) => row.branch === "A"),
                      "missedBreakfastFrequency",
                      fieldValueFromBucket(bucket)
                    ),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                What happened on those days (of {metrics.branchA.missedReasonsDenominatorCount}{" "}
                who miss it at least rarely)
              </p>
              <DistributionBarChart
                data={metrics.branchA.missedReasonsDistribution}
                height={260}
                onBucketClick={(bucket) =>
                  onDrawer({
                    title: `Branch A — reason missed: ${bucket.label}`,
                    rows: filterRowsByArrayField(
                      rowsAskedMissedBreakfastReasons(filteredRows),
                      "missedBreakfastReasons",
                      bucket.value
                    ),
                    extraColumns: [
                      {
                        label: "Reasons",
                        getValue: (row) =>
                          joinArrayLabels(
                            row.missedBreakfastReasons,
                            MISSED_BREAKFAST_REASON_OPTIONS
                          ),
                      },
                    ],
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-foreground">
            {BRANCH_LABELS.B} ({metrics.branchB.count})
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Planned breakfast → didn’t go
              </p>
              <DistributionBarChart
                data={metrics.branchB.plannedButSkippedDistribution}
                height={180}
                onBucketClick={(bucket) =>
                  onDrawer({
                    title: `Branch B — planned but skipped: ${bucket.label}`,
                    rows: filterRowsByField(
                      filteredRows.filter((row) => row.branch === "B"),
                      "breakfastPlannedButSkippedFrequency",
                      fieldValueFromBucket(bucket)
                    ),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Didn’t plan breakfast → ended up going
              </p>
              <DistributionBarChart
                data={metrics.branchB.unplannedButWentDistribution}
                height={180}
                onBucketClick={(bucket) =>
                  onDrawer({
                    title: `Branch B — unplanned but went: ${bucket.label}`,
                    rows: filterRowsByField(
                      filteredRows.filter((row) => row.branch === "B"),
                      "breakfastUnplannedButWentFrequency",
                      fieldValueFromBucket(bucket)
                    ),
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              What usually changed the plan (of{" "}
              {metrics.branchB.planChangeReasonsDenominatorCount} whose plan
              isn’t fully consistent)
            </p>
            <DistributionBarChart
              data={metrics.branchB.planChangeReasonsDistribution}
              height={260}
              onBucketClick={(bucket) =>
                onDrawer({
                  title: `Branch B — plan-change reason: ${bucket.label}`,
                  rows: filterRowsByArrayField(
                    rowsAskedPlanChangeReasonsB(filteredRows),
                    "breakfastPlanChangeReasons",
                    bucket.value
                  ),
                  extraColumns: [
                    {
                      label: "Reasons",
                      getValue: (row) =>
                        joinArrayLabels(
                          row.breakfastPlanChangeReasons,
                          BREAKFAST_PLAN_CHANGE_REASON_OPTIONS
                        ),
                    },
                  ],
                })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-foreground">
            {BRANCH_LABELS.C} ({metrics.branchC.count})
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                What they’re usually doing during breakfast service time
              </p>
              <DistributionBarChart
                data={metrics.branchC.servedTimeActivityDistribution}
                height={220}
                onBucketClick={(bucket) =>
                  onDrawer({
                    title: `Branch C — activity during breakfast hours: ${bucket.label}`,
                    rows: filterRowsByField(
                      filteredRows.filter((row) => row.branch === "C"),
                      "breakfastServedTimeActivity",
                      fieldValueFromBucket(bucket)
                    ),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                What happens to their allotted breakfast (multi-select)
              </p>
              <DistributionBarChart
                data={metrics.branchC.unusedAllottedMealActionsDistribution}
                height={220}
                onBucketClick={(bucket) =>
                  onDrawer({
                    title: `Branch C — unused meal action: ${bucket.label}`,
                    rows: filterRowsByArrayField(
                      filteredRows.filter((row) => row.branch === "C"),
                      "unusedAllottedMealActions",
                      bucket.value
                    ),
                    extraColumns: [
                      {
                        label: "Actions",
                        getValue: (row) =>
                          joinArrayLabels(
                            row.unusedAllottedMealActions,
                            UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS
                          ),
                      },
                    ],
                  })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
