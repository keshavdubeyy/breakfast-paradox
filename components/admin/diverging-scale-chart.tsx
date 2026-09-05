"use client"

import type { ScaleRowSummary } from "@/lib/analytics/events-metrics"

interface DivergingScaleChartProps {
  rows: ScaleRowSummary[]
  /** Label for the low end of the scale (position -2). */
  lowLabel: string
  /** Label for the high end of the scale (position +2). */
  highLabel: string
  onRowClick?: (row: ScaleRowSummary) => void
}

/** One horizontal diverging track per row, centered on "about the same" —
 * reports where the average answer landed without implying a judgment
 * (a bar isn't colored "good"/"bad", since which direction is better
 * varies per row — see each row's optional helperText). */
export function DivergingScaleChart({
  rows,
  lowLabel,
  highLabel,
  onRowClick,
}: DivergingScaleChartProps) {
  return (
    <div className="flex flex-col gap-5">
      {rows.map((row) => {
        const position = row.averagePosition
        const positionPercent = position === null ? 50 : ((position + 2) / 4) * 100
        const barLeft = Math.min(50, positionPercent)
        const barWidth = Math.abs(positionPercent - 50)

        return (
          <div key={row.key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {row.label}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {position === null
                  ? "No comparable answers"
                  : position.toFixed(2)}{" "}
                · {row.respondedCount} responded
              </span>
            </div>
            {row.helperText ? (
              <p className="text-xs text-muted-foreground">{row.helperText}</p>
            ) : null}
            <button
              type="button"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              disabled={!onRowClick}
              className="group relative h-3 w-full rounded-full bg-muted text-left disabled:cursor-default"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border"
              />
              {position !== null ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 rounded-full bg-primary group-enabled:group-hover:opacity-80"
                  style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                />
              ) : null}
            </button>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{lowLabel}</span>
              <span>About the same</span>
              <span>{highLabel}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
