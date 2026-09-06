import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { SampleFlagBadge, shouldShowValue } from "@/components/admin/sample-flag-badge"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

interface EvidenceMetric {
  label: string
  percentage: number | null
  n: number
  flag: SampleFlag
}

interface SystemStructureMapProps {
  planChange: EvidenceMetric
  topStructuralDriver: EvidenceMetric
  transferAttempt: EvidenceMetric
  leaveUnused: EvidenceMetric
}

function MapNode({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/60 bg-card px-4 py-2.5 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

function EvidenceTag({ metric }: { metric: EvidenceMetric }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
        Survey evidence
      </Badge>
      <p className="text-xs text-muted-foreground">
        {metric.label}:{" "}
        {shouldShowValue(metric.flag) && metric.percentage !== null ? (
          <span className="font-medium text-foreground">{metric.percentage}%</span>
        ) : (
          <span>not enough responses</span>
        )}
        <SampleFlagBadge flag={metric.flag} /> (n = {metric.n})
      </p>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex justify-center py-0.5 text-muted-foreground/60">
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
    </div>
  )
}

/** The final structural synthesis — verified mechanics from
 * SystemMechanicsFlow, overlaid only with metrics that genuinely
 * correspond to a node (never a fabricated pathway or an implied
 * statistical/causal claim between arrows). */
export function SystemStructureMap({
  planChange,
  topStructuralDriver,
  transferAttempt,
  leaveUnused,
}: SystemStructureMapProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <MapNode title="Academic schedule" sub="Early commitments" />
      <Arrow />
      <MapNode title="Available morning time" />
      <Arrow />
      <MapNode title="Breakfast service" sub="Timing · menu · distance · queue" />
      <EvidenceTag metric={topStructuralDriver} />
      <Arrow />
      <MapNode title="Registration / auto-allotment" />
      <Arrow />
      <MapNode title="Plan changes after cancellation cutoff" />
      <EvidenceTag metric={planChange} />
      <Arrow />

      <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-5">
        <MapNode title="Use meal" />
        <div className="flex flex-col items-center gap-1.5">
          <MapNode title="Transfer / resell" />
          <EvidenceTag metric={transferAttempt} />
        </div>
        <MapNode title="Alternative food" />
        <div className="flex flex-col items-center gap-1.5">
          <MapNode title="Unused meal" />
          <EvidenceTag metric={leaveUnused} />
        </div>
        <MapNode title="Skip" />
      </div>

      <p className="max-w-2xl pt-2 text-center text-xs text-muted-foreground">
        Structural synthesis combining known system mechanics with respondent-reported
        conditions. Arrows represent system relationships, not causal estimates from the survey.
      </p>
    </div>
  )
}
