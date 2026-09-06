import { Badge } from "@/components/ui/badge"
import { MIN_CELL_N, SMALL_SAMPLE_N, type SampleFlag } from "@/lib/analytics/patterns/types"

/** Hover text for the two flags — the only place their meaning is
 * explained, since a first-time viewer has no other way to tell these
 * two similar-looking badges apart. Uses `title` (a native tooltip)
 * rather than a custom component so every badge everywhere gets the
 * explanation for free, with no per-page wiring. */
const FLAG_EXPLANATION: Record<Exclude<SampleFlag, "ok">, string> = {
  suppressed: `Suppressed: fewer than ${MIN_CELL_N} responses. The value is hidden, not just uncertain — with this few people, showing a number could reveal an individual's answer.`,
  small: `Small sample: fewer than ${SMALL_SAMPLE_N} responses. The value is real and shown, but treat it as less reliable than a fully-sampled result.`,
}

/** The one place that decides how a sample-size flag is shown — every
 * Patterns chart/card/table renders suppression through this, rather
 * than each one re-deciding badge text/color on its own. */
export function SampleFlagBadge({ flag }: { flag: SampleFlag }) {
  if (flag === "ok") {
    return null
  }
  return (
    <Badge
      variant={flag === "suppressed" ? "destructive" : "outline"}
      className="ml-1.5 align-middle"
      title={FLAG_EXPLANATION[flag]}
    >
      {flag === "suppressed" ? "suppressed" : "small sample"}
    </Badge>
  )
}

/** A "suppressed" (n < MIN_CELL_N) result must never show its computed
 * value at all — with that few respondents the number itself can amount
 * to an individual-response drilldown. "small" (n < SMALL_SAMPLE_N)
 * still shows the real value, just flagged as less reliable. */
export function shouldShowValue(flag: SampleFlag): boolean {
  return flag !== "suppressed"
}

export function suppressedNote(n: number): string {
  return `Not enough responses to display safely (n = ${n}).`
}
