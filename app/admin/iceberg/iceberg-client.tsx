"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  ArrowDown01Icon,
  Brain01Icon,
  FilterIcon,
  Layers01Icon,
  TrendingUpIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { countActiveFilters, FiltersForm } from "@/components/admin/filters-form"
import { IcebergDiagram, LEVEL_ACCENT } from "@/components/admin/iceberg/iceberg-diagram"
import { SampleFlagBadge, shouldShowValue, suppressedNote } from "@/components/admin/sample-flag-badge"
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
import { computeIcebergMetrics } from "@/lib/analytics/iceberg/metrics"
import type { IcebergFinding, IcebergLevel, LeveragePoint, SystemTension } from "@/lib/analytics/iceberg/types"
import {
  DEFAULT_FILTERS,
  type AnalyticsFilters,
  type AnalyticsRow,
} from "@/lib/analytics/types"

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

function EvidenceButton({ href }: { href: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1 text-xs"
      nativeButton={false}
      render={<Link href={href} />}
    >
      View evidence →
    </Button>
  )
}

function FindingCard({ finding }: { finding: IcebergFinding }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card p-3">
      <p className="text-sm leading-relaxed text-foreground">{finding.headline}</p>
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-foreground">
          {shouldShowValue(finding.flag) && finding.percentage !== null ? `${finding.percentage}%` : "—"}
        </span>
        <SampleFlagBadge flag={finding.flag} />
        <span className="text-xs text-muted-foreground">n = {finding.n}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
          {finding.evidenceType}
        </Badge>
        <EvidenceButton href={finding.href} />
      </div>
    </div>
  )
}

function BeliefQuoteCard({ finding }: { finding: IcebergFinding }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-card p-4 text-center">
      <p className="text-sm leading-relaxed text-foreground">{finding.headline}</p>
      <div className="flex items-center gap-2">
        <SampleFlagBadge flag={finding.flag} />
        <span className="text-xs text-muted-foreground">n = {finding.n}</span>
      </div>
      <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
        {finding.evidenceType}
      </Badge>
      <EvidenceButton href={finding.href} />
    </div>
  )
}

const LEVEL_ICON: Record<IcebergLevel["level"], typeof Activity01Icon> = {
  events: Activity01Icon,
  patterns: TrendingUpIcon,
  structures: Layers01Icon,
  "mental-models": Brain01Icon,
}

/** Full section for one level, shown in the right-hand column next to
 * the enlarged diagram — every finding for that level, in detail, each
 * with its own evidence button (not a 2-3 item preview). The header is
 * clickable and syncs with the matching zone on the diagram: clicking
 * either one selects the same level, shown here as an accent-colored
 * left border and background tint. */
function LevelDetailSection({
  level,
  isSelected,
  onSelect,
}: {
  level: IcebergLevel
  isSelected: boolean
  onSelect: () => void
}) {
  const accent = LEVEL_ACCENT[level.level]
  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onSelect()
        }}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-md border-l-4 py-1.5 pl-3 transition-colors",
          isSelected ? "bg-muted/40" : "hover:bg-muted/20"
        )}
        style={{ borderColor: accent }}
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
        >
          <HugeiconsIcon icon={LEVEL_ICON[level.level]} strokeWidth={2} className="size-4" />
        </span>
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-foreground">{level.title}</p>
          <p className="text-xs text-muted-foreground">{level.question}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {level.findings.map((finding) =>
          level.level === "mental-models" ? (
            <BeliefQuoteCard key={finding.key} finding={finding} />
          ) : (
            <FindingCard key={finding.key} finding={finding} />
          )
        )}
      </div>
    </div>
  )
}

function LayerSection({ level }: { level: IcebergLevel }) {
  return (
    <div
      className="flex flex-col gap-3 border-l-4 py-1 pl-4"
      style={{ borderColor: LEVEL_ACCENT[level.level] }}
    >
      <div className="flex items-baseline gap-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {level.title}
        </p>
        <p className="text-sm text-muted-foreground">{level.question}</p>
      </div>
      <div
        className={
          level.level === "mental-models"
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {level.findings.map((finding) =>
          level.level === "mental-models" ? (
            <BeliefQuoteCard key={finding.key} finding={finding} />
          ) : (
            <FindingCard key={finding.key} finding={finding} />
          )
        )}
      </div>
    </div>
  )
}

function ChainArrow() {
  return (
    <div className="flex justify-center py-0.5 text-muted-foreground/60">
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
    </div>
  )
}

function ChainNode({ layerLabel, finding }: { layerLabel: string; finding: IcebergFinding }) {
  return (
    <Link
      href={finding.href}
      className="flex w-full max-w-md flex-col items-center gap-1 rounded-lg border border-border/60 bg-card px-4 py-3 text-center transition-colors hover:border-foreground/30"
    >
      <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
        {layerLabel}
      </Badge>
      <p className="text-sm font-medium text-foreground">{finding.label}</p>
      <p className="text-xs text-muted-foreground">
        {shouldShowValue(finding.flag) && finding.percentage !== null
          ? `${finding.percentage}%`
          : suppressedNote(finding.n)}
        <SampleFlagBadge flag={finding.flag} />
      </p>
    </Link>
  )
}

function TensionCard({ tension, index }: { tension: SystemTension; index: number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>Tension {String(index + 1).padStart(2, "0")}</CardDescription>
        <CardTitle className="text-base">{tension.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
          <p className="text-sm text-foreground">{tension.left}</p>
          <span className="text-center text-xs font-semibold tracking-widest text-muted-foreground">vs.</span>
          <p className="text-sm text-foreground sm:text-right">{tension.right}</p>
        </div>
        {tension.supportingFinding ? (
          <Link
            href={tension.supportingFinding.href}
            className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/30"
          >
            <span>
              {tension.supportingFinding.label}:{" "}
              {shouldShowValue(tension.supportingFinding.flag) && tension.supportingFinding.percentage !== null
                ? `${tension.supportingFinding.percentage}%`
                : "not enough responses"}
              <SampleFlagBadge flag={tension.supportingFinding.flag} />
            </span>
            <span>View evidence →</span>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}

function LeveragePointRow({ point, rank }: { point: LeveragePoint; rank: number }) {
  return (
    <Link
      href={point.href}
      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
          {rank}
        </span>
        <p className="text-sm text-foreground">{point.label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs tabular-nums text-muted-foreground">
          {shouldShowValue(point.flag) && point.percentage !== null ? `${point.percentage}%` : "—"}
          <SampleFlagBadge flag={point.flag} />
        </span>
        <Badge variant={point.impact === "high" ? "default" : "secondary"} className="text-[10px] uppercase">
          {point.impact === "high" ? "High impact" : "Medium impact"}
        </Badge>
      </div>
    </Link>
  )
}

interface IcebergClientProps {
  rows: AnalyticsRow[]
  isSampleData: boolean
}

export function IcebergClient({ rows, isSampleData }: IcebergClientProps) {
  const surveyVersions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.surveyVersion))).sort((a, b) => b - a),
    [rows]
  )

  // Defaults to "all" survey versions — same reasoning as every other
  // admin page (see overview-client.tsx).
  const [filters, setFilters] = useState<AnalyticsFilters>(() => ({ ...DEFAULT_FILTERS }))
  const [draftFilters, setDraftFilters] = useState<AnalyticsFilters>(filters)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<IcebergLevel["level"]>("events")
  const [activeView, setActiveView] = useState<"list" | "diagram">("diagram")

  // The right-hand detail column is height-matched to the *entire* left
  // column — the List/Diagram tab strip plus whichever tab is active, not
  // just the diagram itself — so it starts flush with the tabs and ends
  // flush with the diagram's own bottom, then scrolls internally rather
  // than growing the page. Selecting a level, from either the diagram's
  // zones or a section's own header, scrolls that section to the top of
  // this internal viewport.
  const [diagramHeight, setDiagramHeight] = useState<number | null>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Partial<Record<IcebergLevel["level"], HTMLDivElement | null>>>({})
  // Cleans up the previous element's observer/listener before attaching to
  // a new one (or on unmount). A callback ref (rather than a useEffect with
  // [] deps reading a plain ref) because the wrapped height also changes
  // just from switching tabs (list view's content is much taller than the
  // diagram), and ResizeObserver picks that up automatically.
  const diagramTeardownRef = useRef<(() => void) | null>(null)

  function attachDiagramWrapperRef(el: HTMLDivElement | null) {
    diagramTeardownRef.current?.()
    diagramTeardownRef.current = null
    if (!el) return
    // Only height-match + scroll on lg+, where the diagram and the detail
    // column sit side by side — below that they stack, and the detail
    // column should grow naturally with the page instead.
    const query = window.matchMedia("(min-width: 1024px)")
    function measure() {
      setDiagramHeight(query.matches ? el!.getBoundingClientRect().height : null)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    query.addEventListener("change", measure)
    measure()
    diagramTeardownRef.current = () => {
      observer.disconnect()
      query.removeEventListener("change", measure)
    }
  }

  useEffect(() => () => diagramTeardownRef.current?.(), [])

  useEffect(() => {
    const container = rightScrollRef.current
    const target = sectionRefs.current[selectedLevel]
    if (!container || !target) return
    const offset = target.offsetTop - container.offsetTop
    container.scrollTo({ top: Math.max(offset - 8, 0), behavior: "smooth" })
  }, [selectedLevel])

  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters])
  const iceberg = useMemo(() => computeIcebergMetrics(filteredRows), [filteredRows])
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
            The Iceberg Summary synthesizes Events, Patterns, Structures, and Mental Models — once
            completed surveys exist across those pages, this page will connect them into one
            system view.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const findingsFor = (level: IcebergLevel["level"]) =>
    iceberg.levels.find((l) => l.level === level)?.findings ?? []

  const chain = [
    { label: "Structure", finding: findingsFor("structures")[0] },
    { label: "Pattern", finding: findingsFor("patterns")[0] },
    { label: "Event", finding: findingsFor("events")[0] },
    { label: "Mental model", finding: findingsFor("mental-models")[0] },
  ].filter((step): step is { label: string; finding: IcebergFinding } => Boolean(step.finding))

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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Iceberg Summary</h1>
          <p className="text-sm text-muted-foreground">Why does the breakfast paradox keep happening?</p>
          <p className="text-xs text-muted-foreground">
            A synthesis of observed events, recurring patterns, system conditions, and underlying
            mental models — every statement here is assembled from the four dashboards linked
            throughout, not computed fresh. N = {iceberg.n}.
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
                <Button type="button" variant="outline" onClick={() => setDraftFilters(DEFAULT_FILTERS)}>
                  Reset
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <p className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Evidence becomes increasingly interpretive as we move deeper below the waterline — an
        event is directly reported, while a mental model is an interpretation of attitudes and
        beliefs. Association, not causation, throughout.
      </p>

      <SectionHeading>System insight</SectionHeading>
      <Card>
        <CardContent>
          <p className="text-base leading-relaxed text-foreground">{iceberg.systemInsight}</p>
        </CardContent>
      </Card>

      <SectionHeading>The breakfast iceberg</SectionHeading>
      <Card>
        <CardContent>
          <div
            className={cn(
              "grid grid-cols-1 gap-8",
              activeView === "diagram" && "lg:grid-cols-[minmax(320px,560px)_1fr] lg:items-start"
            )}
          >
            <div ref={attachDiagramWrapperRef}>
              <Tabs
                defaultValue="diagram"
                onValueChange={(value) => setActiveView(value as "list" | "diagram")}
                className="flex flex-col gap-4"
              >
                <TabsList className="w-fit">
                  <TabsTrigger value="diagram">Diagram view</TabsTrigger>
                  <TabsTrigger value="list">List view</TabsTrigger>
                </TabsList>

                <TabsContent value="diagram" className="flex flex-col gap-4">
                  <IcebergDiagram
                    levels={iceberg.levels}
                    selectedLevel={selectedLevel}
                    onSelectLevel={setSelectedLevel}
                    className="mx-auto w-full max-w-none"
                  />
                </TabsContent>

                <TabsContent value="list" className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">↑ More visible / reactive</p>
                  <LayerSection level={iceberg.levels[0]} />

                  <div className="my-2 flex items-center gap-3">
                    <div className="h-px flex-1 border-t border-dashed border-border" />
                    <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Waterline
                    </span>
                    <div className="h-px flex-1 border-t border-dashed border-border" />
                  </div>

                  {iceberg.levels.slice(1).map((level) => (
                    <LayerSection key={level.level} level={level} />
                  ))}
                  <p className="pt-1 text-xs text-muted-foreground">↓ Deeper causes / proactive</p>
                </TabsContent>
              </Tabs>
            </div>

            {activeView === "diagram" ? (
              <div
                ref={rightScrollRef}
                className="flex flex-col gap-6 overflow-y-auto scroll-smooth"
                style={diagramHeight ? { height: diagramHeight } : undefined}
              >
                <div ref={(el) => { sectionRefs.current.events = el }}>
                  <LevelDetailSection
                    level={iceberg.levels[0]}
                    isSelected={selectedLevel === "events"}
                    onSelect={() => setSelectedLevel("events")}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 border-t border-dashed border-border" />
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Waterline
                  </span>
                  <div className="h-px flex-1 border-t border-dashed border-border" />
                </div>

                {iceberg.levels.slice(1).map((level) => (
                  <div key={level.level} ref={(el) => { sectionRefs.current[level.level] = el }}>
                    <LevelDetailSection
                      level={level}
                      isSelected={selectedLevel === level.level}
                      onSelect={() => setSelectedLevel(level.level)}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {chain.length > 0 ? (
        <>
          <SectionHeading>How the layers connect</SectionHeading>
          <Card>
            <CardHeader>
              <CardDescription>
                Evidence-backed system interpretation, not a proven causal pathway — the survey
                cannot establish that one layer causes the next.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-0">
              {chain.map((step, index) => (
                <div key={step.label} className="flex w-full flex-col items-center">
                  <ChainNode layerLabel={step.label} finding={step.finding} />
                  {index < chain.length - 1 ? <ChainArrow /> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}

      <SectionHeading>System tensions</SectionHeading>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {iceberg.tensions.map((tension, index) => (
          <TensionCard key={tension.key} tension={tension} index={index} />
        ))}
      </div>

      <SectionHeading>Potential leverage points</SectionHeading>
      <Card>
        <CardHeader>
          <CardDescription>
            Where the system might be opened up — not solutions, and not validated interventions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {iceberg.leveragePoints.map((point, index) => (
            <LeveragePointRow key={point.key} point={point} rank={index + 1} />
          ))}
        </CardContent>
      </Card>

      <SectionHeading>Evidence trail</SectionHeading>
      <Card>
        <CardHeader>
          <CardDescription>
            Every synthesis statement above, traced back to the dashboard it came from.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Finding</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead className="text-right">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {iceberg.evidenceTrail.map((row) => (
                  <TableRow key={`${row.level}-${row.finding}`}>
                    <TableCell className="max-w-xs min-w-48 font-medium whitespace-normal text-foreground">
                      {row.finding}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.level}</TableCell>
                    <TableCell className="text-xs tabular-nums text-muted-foreground">{row.evidence}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.strength}</TableCell>
                    <TableCell className="text-right text-xs">
                      <Link href={row.href} className="text-foreground hover:underline">
                        {row.hrefLabel}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
