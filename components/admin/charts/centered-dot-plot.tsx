"use client"

import { SampleFlagBadge } from "@/components/admin/sample-flag-badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

export interface DotPlotSeriesDef {
  key: string
  label: string
  colorVar: string
}

export interface DotPlotPoint {
  seriesKey: string
  value: number | null
  n: number
  flag: SampleFlag
  detail?: string
}

export interface DotPlotRowData {
  key: string
  label: string
  points: DotPlotPoint[]
  /** Shown under the row label — e.g. "Higher = more hungry" where the
   * scale's direction isn't self-evident. */
  caption?: string
}

interface CenteredDotPlotProps {
  rows: DotPlotRowData[]
  series: DotPlotSeriesDef[]
  domain: [number, number]
  /** When set, draws a reference line there (e.g. 0 on a -2..+2 scale)
   * and the plot reads as diverging; omitted for a plain ordinal range
   * with no natural neutral point. */
  centerValue?: number
  domainLabels?: [string, string]
  valueFormatter?: (value: number) => string
}

/** One row per item, one dot per group/series, positioned along a fixed
 * numeric scale — the visual for "is there movement above/below a
 * reference point" (outcomes) or "where does each group's median sit on
 * this ordinal scale" (Explorer ordinal-by-group). Position is the
 * primary encoding; color still follows the series so identity isn't
 * lost when two groups sit close together. */
export function CenteredDotPlot({
  rows,
  series,
  domain,
  centerValue,
  domainLabels,
  valueFormatter = (value) => value.toString(),
}: CenteredDotPlotProps) {
  const [min, max] = domain
  const span = max - min || 1
  const toPercent = (value: number) => ((value - min) / span) * 100
  const centerPercent = centerValue !== undefined ? toPercent(centerValue) : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: s.colorVar }}
            />
            {s.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-foreground">{row.label}</span>
              {row.caption ? (
                <span className="text-xs text-muted-foreground">{row.caption}</span>
              ) : null}
            </div>
            <div className="relative h-6 w-full">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
              {centerPercent !== null ? (
                <div
                  className="absolute top-0 bottom-0 w-px bg-muted-foreground/40"
                  style={{ left: `${centerPercent}%` }}
                />
              ) : null}
              {row.points.map((point) => {
                const seriesDef = series.find((s) => s.key === point.seriesKey)
                if (point.value === null || !seriesDef) return null
                const left = Math.max(0, Math.min(100, toPercent(point.value)))
                return (
                  <Tooltip key={point.seriesKey}>
                    <TooltipTrigger
                      render={
                        <div
                          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background"
                          style={{ left: `${left}%`, backgroundColor: seriesDef.colorVar }}
                        />
                      }
                    />
                    <TooltipContent>
                      {seriesDef.label}: {valueFormatter(point.value)} (n = {point.n}
                      {point.flag === "small" ? ", small sample" : ""})
                      {point.detail ? ` — ${point.detail}` : ""}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
            {domainLabels ? (
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{domainLabels[0]}</span>
                <span>{domainLabels[1]}</span>
              </div>
            ) : null}
            {row.points.some((p) => p.flag === "suppressed") ? (
              <p className="text-xs text-muted-foreground">
                {row.points
                  .filter((p) => p.flag === "suppressed")
                  .map((p) => series.find((s) => s.key === p.seriesKey)?.label ?? p.seriesKey)
                  .join(", ")}
                : not enough responses to display safely.
                <SampleFlagBadge flag="suppressed" />
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
