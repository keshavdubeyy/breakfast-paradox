import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LoopDiagram } from "@/components/admin/causal-loops/loop-diagram"
import { SystemMap } from "@/components/admin/causal-loops/system-map"
import {
  ACTORS,
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  CAUSAL_LINKS,
  DELAYS,
  EXOGENOUS_FACTORS,
  LOOPS,
  VARIABLES,
  type ActorCategory,
} from "@/lib/causal-loops/content"

function SectionHeading({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
        {n}
      </span>
      {children}
    </h2>
  )
}

function CategoryDot({ category }: { category: ActorCategory }) {
  return <span className={`inline-block size-2 rounded-full ${CATEGORY_COLOR[category].dot}`} />
}

function StrengthBadge({ strength }: { strength: string }) {
  const label =
    strength === "interview-only"
      ? "Interview only"
      : strength === "inferred"
        ? "Inferred"
        : strength.charAt(0).toUpperCase() + strength.slice(1)
  const variant = strength === "strong" ? "default" : strength === "weak" ? "destructive" : "secondary"
  return (
    <Badge variant={variant} className="text-[10px]">
      {label}
    </Badge>
  )
}

export default function CausalLoopsPage() {
  const variablesByCategory = (Object.keys(CATEGORY_LABEL) as ActorCategory[]).map((category) => ({
    category,
    variables: VARIABLES.filter((v) => v.category === category),
  }))

  const brokenLoops = LOOPS.filter((l) => l.path.length === 0)
  const reinforcing = LOOPS.filter((l) => l.type === "R")
  const balancing = LOOPS.filter((l) => l.type === "B")

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 pb-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Causal Loop Diagram — The Breakfast System
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          A systems-level synthesis of every source this project has collected — the anonymous
          student survey, the April 2026 mess attendance and menu export, a mess-team interview,
          and the Spring 2026 class timetable — built to explain why the system behaves the way
          it does, not just to describe its steps. Nothing here is computed fresh from survey or
          attendance rows; it is a hand-built synthesis that cites the real figures behind every
          claim, flags what is thin or contradictory, and never invents a link this project has
          no evidence for.
        </p>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground italic">
          Cross-cutting caveat: the student survey is a single cross-sectional snapshot (n=41),
          not a longitudinal panel — it can show that a belief and a behaviour co-occur, never
          that one measurably strengthens the other over repeated cycles for the same
          respondent. Every loop below that relies on survey data is qualified accordingly, not
          just this one.
        </p>
      </div>

      {/* 1. System purpose and boundary */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={1}>System purpose &amp; boundary</SectionHeading>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 text-sm text-foreground">
            <p>
              <strong>Purpose:</strong> explain why registered breakfast slots go largely unused
              (37.1% avail rate across 32,162 April slots), why the mess&apos;s own preparation
              estimates keep drifting from actual turnout, and how student routine, mess
              operations, and institutional scheduling jointly produce that outcome — rather than
              treating any one of the three as the sole cause.
            </p>
            <p>
              <strong>Boundary — in scope:</strong> the individual student&apos;s eat/skip
              decision and its immediate drivers (sleep, wake time, class timing, menu, queue);
              the mess team&apos;s forecasting, preparation, and waste-handling process; the
              registration/QR data system connecting the two; the Spring 2026 class timetable as
              a fixed structural input.
            </p>
            <p>
              <strong>Boundary — explicitly out of scope / not evidenced:</strong> why CDS and
              student coordinators choose particular menu items (only who is involved is known,
              not their deliberation); the institute&apos;s own reasoning for the timetable&apos;s
              slot structure; anything downstream of a skip beyond the same day (no data connects
              a specific day&apos;s decision to the following night&apos;s routine); weather,
              festivals, or one-off campus events (plausible, but no current data source
              measures them).
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 2. Main actors */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={2}>Main actors</SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACTORS.map((actor) => (
            <Card key={actor.id} className={`${CATEGORY_COLOR[actor.category].border} border`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CategoryDot category={actor.category} />
                  {actor.label}
                </CardTitle>
                <CardDescription>{actor.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Variables */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={3}>Complete list of important variables</SectionHeading>
        <p className="text-sm text-muted-foreground">
          {VARIABLES.length} variables, grouped by category — every one used in at least one
          relationship in §4.
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {variablesByCategory.map(({ category, variables }) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CategoryDot category={category} />
                  {CATEGORY_LABEL[category]}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({variables.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {variables.map((v) => (
                  <div key={v.id} className="flex flex-col gap-0.5 border-b border-border/40 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-foreground">{v.label}</span>
                    <span className="text-xs text-muted-foreground">{v.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Causal relationship table */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={4}>Causal relationship table</SectionHeading>
        <p className="text-sm text-muted-foreground">
          {CAUSAL_LINKS.length} relationships. Polarity reflects direction of change only, never
          whether the effect is desirable. Flags call out where evidence is thin, indirect, or
          not directly cross-tabbed.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Source → Target</TableHead>
                <TableHead className="w-14 text-center">±</TableHead>
                <TableHead>Explanation</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead className="w-28">Strength</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CAUSAL_LINKS.map((link) => {
                const from = VARIABLES.find((v) => v.id === link.from)
                const to = VARIABLES.find((v) => v.id === link.to)
                return (
                  <TableRow key={link.id}>
                    <TableCell className="text-xs text-muted-foreground">{link.id}</TableCell>
                    <TableCell className="w-56 min-w-56 text-xs whitespace-normal">
                      <div className="flex items-center gap-1">
                        <CategoryDot category={from?.category ?? "student"} />
                        <span className="font-medium text-foreground">{from?.label}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <CategoryDot category={to?.category ?? "student"} />
                        <span className="text-muted-foreground">→ {to?.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-base font-bold">
                      {link.polarity}
                    </TableCell>
                    <TableCell className="w-64 min-w-64 text-xs whitespace-normal text-foreground">
                      {link.explanation}
                      {link.delay ? (
                        <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                          ⏱ {link.delay}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="w-80 min-w-80 text-xs whitespace-normal text-muted-foreground">
                      {link.evidence}
                      {link.flag ? (
                        <div className="mt-1 rounded-md bg-muted px-2 py-1 text-[11px] whitespace-normal text-foreground">
                          ⚑ {link.flag}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <StrengthBadge strength={link.strength} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 5 & 6. Reinforcing and Balancing loops */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={5}>Reinforcing loops</SectionHeading>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {reinforcing.map((loop) => (
            <LoopCard key={loop.id} loop={loop} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading n={6}>Balancing loops</SectionHeading>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {balancing
            .filter((l) => l.path.length > 0)
            .map((loop) => (
              <LoopCard key={loop.id} loop={loop} />
            ))}
        </div>
        {brokenLoops.map((loop) => (
          <Card key={loop.id} className="border-dashed border-rose-400/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="border-rose-400 text-rose-600 dark:text-rose-400">
                  {loop.id} — not closed
                </Badge>
                {loop.name}
              </CardTitle>
              <CardDescription>{loop.explanation}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
              <p><strong className="text-foreground">Evidence:</strong> {loop.evidence}</p>
              <p><strong className="text-foreground">System interpretation:</strong> {loop.interpretation}</p>
              {loop.flag ? <p className="rounded-md bg-muted px-2 py-1 text-foreground">⚑ {loop.flag}</p> : null}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* 7. Interactions between loops */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={7}>Interactions between loops</SectionHeading>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 text-sm text-foreground">
            <p>
              <strong>R1 feeds B1&apos;s input, one step removed.</strong> R1&apos;s output
              (likelihoodOfSkipping) determines actualTurnout, which is exactly the figure B1
              compares preparationQuantity against to generate surplus/wastage. A stronger R1 (more
              habitual skipping) widens the gap B1 has to correct — the two loops share a variable
              even though they sit in different subsystems.
            </p>
            <p>
              <strong>The menu-attractiveness chain is an input to B1, not its own loop.</strong>{" "}
              menuAttractiveness → motivationToEatBreakfast → likelihoodOfSkipping → actualTurnout
              → historicalAttendanceData → projectedDemand does reach back toward the mess
              forecasting chain, but nothing in our data shows the mess selecting future menus
              based on past attendance (menu drafting is a separate process, run by coordinators/
              CDS/vendors). So this chain feeds B1&apos;s inputs without closing into its own
              cycle — deliberately not labeled as a loop.
            </p>
            <p>
              <strong>B2 and B1 respond to the same shortfall on different timescales.</strong>{" "}
              A single unexpectedly-high-turnout day triggers B2 same-day (for batch-cookable
              items); the same day&apos;s outcome also feeds B1&apos;s weekly correction. For
              fully-advance-prepared items, B2 doesn&apos;t exist at all — B1&apos;s slower,
              once-a-week correction is the <em>only</em> mechanism those items get, which is why
              the system responds better to surprise demand than to a surprise shortfall (see §8).
            </p>
            <p>
              <strong>B3&apos;s absence widens what B1 has to correct.</strong> Because there is
              no working cancellation loop, registrationVsConsumptionGap runs persistently high
              (62.9% unused in April) rather than self-adjusting earlier in the cycle — all of
              that volume shows up as surplusFood for B1 to absorb after the fact, instead of
              being avoided before preparation ever happens.
            </p>
            <p>
              <strong>The timetable is currently a one-way input, not a responsive part of the
              system.</strong> earlySlotPrevalence and breakfastServiceWindow feed into
              earlyMorningClass and breakfastArrivalConcentration, but nothing evidenced flows
              back from student breakfast behaviour into the timetable — the Administration
              dashboard page states this directly (survey/mess data and class_schedule cannot be
              joined). This is itself a system finding: administration currently behaves as an
              exogenous driver of the breakfast system, not a subsystem embedded within it.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 8. Delays */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={8}>Important delays</SectionHeading>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">ID</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-48">Approx. length</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DELAYS.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs text-muted-foreground">{d.id}</TableCell>
                  <TableCell className="w-48 min-w-48 text-sm font-medium whitespace-normal text-foreground">{d.label}</TableCell>
                  <TableCell className="w-96 min-w-96 text-xs whitespace-normal text-muted-foreground">{d.description}</TableCell>
                  <TableCell className="w-48 text-xs font-medium whitespace-normal text-foreground">{d.approxLength}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 9. Exogenous factors */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={9}>External factors / exogenous variables</SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EXOGENOUS_FACTORS.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  {f.label}
                  <Badge variant={f.evidenced ? "secondary" : "outline"} className="text-[10px]">
                    {f.evidenced ? "Evidenced" : "Plausible, not measured"}
                  </Badge>
                </CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* 10. Final integrated diagram */}
      <section className="flex flex-col gap-3">
        <SectionHeading n={10}>Final integrated causal loop diagram</SectionHeading>
        <p className="text-sm text-muted-foreground">
          All {VARIABLES.length} variables and {CAUSAL_LINKS.length} relationships, laid out
          upstream (left) to downstream (right). Node color = category (
          <span className="inline-flex items-center gap-1"><CategoryDot category="student" />student</span>,{" "}
          <span className="inline-flex items-center gap-1"><CategoryDot category="mess" />mess</span>,{" "}
          <span className="inline-flex items-center gap-1"><CategoryDot category="admin" />admin/timetable</span>,{" "}
          <span className="inline-flex items-center gap-1"><CategoryDot category="data" />data system</span>
          ). Heavier arrows trace the edges that belong to a named loop (R1, B1, B2) — everything
          else is a one-way contributing relationship, not part of a closed cycle.
        </p>
        <SystemMap />
        <p className="text-xs text-muted-foreground">
          This map intentionally omits a drawn cycle for B3 (Cancellation Loop — Currently
          Absent) and the flagged, unconfirmed &ldquo;registered-but-unused entrenchment&rdquo; question
          discussed in §7 — neither is a closed mechanism this data can show operating today.
        </p>
      </section>
    </div>
  )
}

function LoopCard({ loop }: { loop: (typeof LOOPS)[number] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Badge variant={loop.type === "R" ? "destructive" : "secondary"}>{loop.id}</Badge>
          {loop.name}
        </CardTitle>
        <CardDescription>{loop.explanation}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <LoopDiagram path={loop.path} polarities={loop.polarities} loopId={loop.id} loopType={loop.type} />
        <Accordion defaultValue={[]} className="w-full">
          <AccordionItem value="evidence">
            <AccordionTrigger>Evidence &amp; system interpretation</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 text-xs text-muted-foreground">
              <p><strong className="text-foreground">Evidence from our data:</strong> {loop.evidence}</p>
              <p><strong className="text-foreground">System interpretation:</strong> {loop.interpretation}</p>
              {loop.flag ? (
                <p className="rounded-md bg-muted px-2 py-1 text-foreground">⚑ {loop.flag}</p>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
