import { Badge } from "@/components/ui/badge"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

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
