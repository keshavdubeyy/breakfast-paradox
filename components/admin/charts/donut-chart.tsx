"use client"

import { SampleFlagBadge, shouldShowValue, suppressedNote } from "@/components/admin/sample-flag-badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

export interface DonutSegmentData {
  key: string
  label: string
  percentage: number
  count: number
  flag: SampleFlag
  colorVar: string
}

interface DonutChartProps {
  segments: DonutSegmentData[]
  centerValue: string
  centerLabel: string
  /** Overall suppression — when the whole composite is too thin to show
   * at all, no ring is drawn. */
  flag: SampleFlag
  n: number
}

const SIZE = 160
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** A single categorical composition with a natural single "whole" — the
 * one place on this page where a donut reads better than a stacked bar
 * (Routine Mindset: one respondent lands in exactly one mindset bucket,
 * and the reference point is "how is the whole sample distributed",
 * not "how does branch X compare to branch Y"). Suppressed segments are
 * simply not drawn (rather than drawn at a fabricated width), same rule
 * as every other chart here. */
export function DonutChart({ segments, centerValue, centerLabel, flag, n }: DonutChartProps) {
  if (!shouldShowValue(flag)) {
    return <p className="text-sm text-muted-foreground">{suppressedNote(n)}</p>
  }

  const visibleSegments = segments.filter((segment) => shouldShowValue(segment.flag) && segment.percentage > 0)
  const arcs = visibleSegments.map((segment, index) => {
    const priorPercentage = visibleSegments
      .slice(0, index)
      .reduce((sum, prior) => sum + prior.percentage, 0)
    return {
      segment,
      dash: (segment.percentage / 100) * CIRCUMFERENCE,
      offset: -((priorPercentage / 100) * CIRCUMFERENCE),
    }
  })

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0 -rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth={STROKE} />
        {arcs.map(({ segment, dash, offset }) => (
          <Tooltip key={segment.key}>
            <TooltipTrigger
              render={
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.colorVar}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={offset}
                />
              }
            />
            <TooltipContent>
              {segment.label}: {segment.percentage}% (n = {segment.count})
            </TooltipContent>
          </Tooltip>
        ))}
        <text
          x={SIZE / 2}
          y={SIZE / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="rotate-90 fill-foreground text-[28px] font-semibold"
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
        >
          {centerValue}
        </text>
      </svg>
      <div className="flex flex-1 flex-col gap-1.5">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: segment.colorVar }} />
              {segment.label}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {shouldShowValue(segment.flag) ? `${segment.percentage}%` : "—"}
              <SampleFlagBadge flag={segment.flag} />
            </span>
          </div>
        ))}
        <p className="mt-1 text-xs text-muted-foreground">{centerLabel}</p>
      </div>
    </div>
  )
}
