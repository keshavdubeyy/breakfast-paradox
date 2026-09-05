"use client"

import { SampleFlagBadge, shouldShowValue, suppressedNote } from "@/components/admin/sample-flag-badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

export interface StackedBarSegmentDef {
  key: string
  label: string
  colorVar: string
}

export interface StackedBarRowData {
  key: string
  label: string
  n: number
  flag: SampleFlag
  /** 0-100 per segment key — a row built from validated data should sum
   * to ~100 across all segments; missing keys render as 0 width. */
  percentageBySegment: Record<string, number>
  countBySegment?: Record<string, number>
}

interface StackedPercentageBarProps {
  rows: StackedBarRowData[]
  segments: StackedBarSegmentDef[]
  rowHeaderLabel?: string
  /** Shown once, e.g. "n = 214 eligible · 198 answered · 16 missing". */
  footnote?: string
}

function Legend({ segments }: { segments: StackedBarSegmentDef[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {segments.map((segment) => (
        <span key={segment.key} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block size-2.5 rounded-[2px]"
            style={{ backgroundColor: segment.colorVar }}
          />
          {segment.label}
        </span>
      ))}
    </div>
  )
}

/** One 100%-stacked horizontal bar per row — the visual for "how does a
 * composition shift across an ordered or categorical group" (early
 * commitments, sleep, wake, weekend behaviour, archetypes, ...). A row
 * below MIN_CELL_N never draws a bar (a confident-looking 100% built
 * from one or two respondents is exactly what suppression exists to
 * avoid) — it renders the same "not enough responses" text every other
 * Patterns visual uses instead. */
export function StackedPercentageBar({
  rows,
  segments,
  rowHeaderLabel,
  footnote,
}: StackedPercentageBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <Legend segments={segments} />
      <div className="flex flex-col gap-2.5">
        {rowHeaderLabel ? (
          <span className="sr-only">{rowHeaderLabel}</span>
        ) : null}
        {rows.map((row) => (
          <div key={row.key} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm font-medium text-foreground sm:w-44 sm:shrink-0">
              {row.label}
            </span>
            {shouldShowValue(row.flag) ? (
              <div className="flex h-6 flex-1 gap-0.5 overflow-hidden rounded-[4px] bg-muted/40">
                {segments.map((segment) => {
                  const pct = row.percentageBySegment[segment.key] ?? 0
                  if (pct <= 0) return null
                  const count = row.countBySegment?.[segment.key]
                  return (
                    <Tooltip key={segment.key}>
                      <TooltipTrigger
                        render={
                          <div
                            className="h-full first:rounded-l-[4px] last:rounded-r-[4px]"
                            style={{ width: `${pct}%`, backgroundColor: segment.colorVar }}
                          />
                        }
                      />
                      <TooltipContent>
                        {segment.label}: {pct}%{count !== undefined ? ` (n=${count})` : ""}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ) : (
              <p className="flex-1 text-xs text-muted-foreground">{suppressedNote(row.n)}</p>
            )}
            <span className="text-xs tabular-nums text-muted-foreground sm:w-20 sm:text-right">
              n = {row.n}
              <SampleFlagBadge flag={row.flag} />
            </span>
          </div>
        ))}
      </div>
      {footnote ? <p className="text-xs text-muted-foreground">{footnote}</p> : null}
    </div>
  )
}
