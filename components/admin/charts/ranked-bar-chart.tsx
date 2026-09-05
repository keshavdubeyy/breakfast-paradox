"use client"

import { DistributionBarChart } from "@/components/admin/distribution-bar-chart"
import { SampleFlagBadge, suppressedNote } from "@/components/admin/sample-flag-badge"
import type { DistributionBucket } from "@/lib/analytics/metrics"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

export interface RankedBucket extends DistributionBucket {
  flag: SampleFlag
}

interface RankedBarChartProps {
  data: RankedBucket[]
  height?: number
}

/** A ranked horizontal bar per option — for "one branch, many options"
 * (branch deep dives) rather than a cross-branch comparison, so there's
 * no composition/heatmap to build here. Wraps DistributionBarChart
 * (shared with Overview/Events) and adds the one thing branch deep dives
 * were missing: a bucket built from a single respondent's answer is
 * suppressed exactly like every other Patterns visual, not drawn as a
 * confident-looking bar. */
export function RankedBarChart({ data, height }: RankedBarChartProps) {
  const visible = data.filter((bucket) => bucket.flag !== "suppressed")
  const suppressed = data.filter((bucket) => bucket.flag === "suppressed")
  const small = data.filter((bucket) => bucket.flag === "small")

  return (
    <div className="flex flex-col gap-2">
      {visible.length > 0 ? (
        <DistributionBarChart
          data={visible}
          height={height ?? Math.max(120, visible.length * 36)}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Not enough responses to display safely.</p>
      )}
      {suppressed.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {suppressed.map((bucket) => `${bucket.label}: ${suppressedNote(bucket.count)}`).join(" ")}
        </p>
      ) : null}
      {small.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Small sample:{" "}
          {small.map((bucket, index) => (
            <span key={bucket.value}>
              {index > 0 ? ", " : ""}
              {bucket.label} (n = {bucket.count})
              <SampleFlagBadge flag="small" />
            </span>
          ))}
        </p>
      ) : null}
    </div>
  )
}
