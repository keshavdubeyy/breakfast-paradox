import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DishSummary } from "@/lib/analytics/mess-menu/metrics"

interface MessOperationsNotesProps {
  dishLeaderboard: DishSummary[]
}

function findDish(dishLeaderboard: DishSummary[], name: string): DishSummary | null {
  return dishLeaderboard.find((d) => d.dish === name) ?? null
}

/** Static content, transcribed from a single round of questions with the
 * mess team (not survey data, nothing here is computed from rows) — see
 * docs/activity-5-system-behaviour-over-time.md §3a for the full
 * interview. Only the dish cross-check numbers are pulled live from the
 * leaderboard so they can't drift out of sync with the actual data. */
export function MessOperationsNotes({ dishLeaderboard }: MessOperationsNotesProps) {
  const bonda = findDish(dishLeaderboard, "Mysoore Bonda")
  const wada = findDish(dishLeaderboard, "Wada")
  const wadaRank = wada ? dishLeaderboard.indexOf(wada) + 1 : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mess operations notes</CardTitle>
        <CardDescription>
          From a single round of questions with the mess team — one team&apos;s account, not
          confirmed institutional policy, and not yet checked against a second staff perspective.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-sm">
        <div>
          <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Preparation &amp; planning
          </h3>
          <ul className="list-disc space-y-1 pl-4 text-foreground">
            <li>
              Prep begins at 6:00 AM; service hours (7:30–9:30 AM) haven&apos;t changed.
            </li>
            <li>
              Quantity is set from historical mess-portal data and projections, topped up with
              staff experience — not a real-time demand signal.
            </li>
            <li>
              The menu itself is drafted jointly by student coordinators, CDS, and mess vendors;
              the mess team alone sets preparation quantity, using the prior week&apos;s
              same-weekday figures as the baseline.
            </li>
            <li>
              Holidays break this baseline — students leave campus, so the previous week&apos;s
              same-weekday quantity stops being reliable.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Demand &amp; menu
          </h3>
          <p className="text-foreground">
            The team&apos;s account: attendance tracks which dish is served more than which
            weekday it is — they named bonda, vada, and muesli as items that draw students.
          </p>
          <p className="mt-1.5 text-muted-foreground">
            Checked against this month&apos;s dish leaderboard above:{" "}
            {bonda ? (
              <>
                <span className="text-foreground">Mysoore Bonda</span> holds up — it&apos;s the
                best-attended dish in April at {bonda.avgAvailRate}%.{" "}
              </>
            ) : null}
            {wada ? (
              <>
                <span className="text-foreground">Wada</span> doesn&apos;t clearly stand out
                the same way — {wada.avgAvailRate}% avail rate, {wadaRank} of{" "}
                {dishLeaderboard.length} dishes ({wada.daysServed} days served). Muesli only
                appears as a cereal side item in the menu export, never as a main dish, so it
                can&apos;t be checked the same way.
              </>
            ) : null}{" "}
            Read this as a partial confirmation, not a full one — the team&apos;s sense of
            what&apos;s popular and what the swipe data shows don&apos;t fully line up.
          </p>
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Waste handling
          </h3>
          <ul className="list-disc space-y-1 pl-4 text-foreground">
            <li>Leftover food is generally thrown away or sent to pig farms.</li>
            <li>
              Donating to orphanages was tried once or twice, then stopped after spoilage during
              transport raised food-poisoning concerns — a safety decision, not a cost or
              preference one.
            </li>
            <li>
              Leftover quantity is recorded informally — noted down or estimated from memory, not
              measured systematically.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Operational flexibility
          </h3>
          <p className="text-foreground">
            Some items can be batch-cooked mid-service and scaled up if turnout runs higher than
            expected. Others must be fully prepared in advance, so once service starts there&apos;s
            no way to adjust them. This makes the response to demand surprises asymmetric: a
            higher-than-expected turnout can sometimes be met with another batch; a
            lower-than-expected one just becomes waste, with the only correction being to prepare
            less the following week.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
