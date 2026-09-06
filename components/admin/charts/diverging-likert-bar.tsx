"use client"

import { SampleFlagBadge, shouldShowValue, suppressedNote } from "@/components/admin/sample-flag-badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

export interface LikertSegmentDef {
  key: string
  label: string
  colorVar: string
}

export interface LikertRowData {
  key: string
  label: string
  n: number
  flag: SampleFlag
  /** 0-100 per segment key — a row built from validated data should sum
   * to ~100 across all segments. */
  percentageBySegment: Record<string, number>
}

interface DivergingLikertBarProps {
  rows: LikertRowData[]
  /** Ordered scale, e.g. [stronglyDisagree, disagree, neutral, agree,
   * stronglyAgree] — must have an odd length; the middle entry is the
   * neutral anchor everything else diverges from. */
  segments: LikertSegmentDef[]
  footnote?: string
}

/** A full Likert distribution (every point on the scale, not just
 * top-box), anchored on its neutral midpoint so agreement and
 * disagreement visibly pull in opposite directions — the richer
 * counterpart to the branch-comparison heatmap on Patterns, used here
 * because Mental Models asks "what do students believe", not "which
 * group differs". Generalizes DivergingCompositionBar's 3-part centering
 * to any odd-length ordered scale. */
export function DivergingLikertBar({ rows, segments, footnote }: DivergingLikertBarProps) {
  const centerIndex = Math.floor(segments.length / 2)
  const centerSegment = segments[centerIndex]
  const leftSegments = segments.slice(0, centerIndex)
  const rightSegments = segments.slice(centerIndex + 1)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <span key={segment.key} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-2.5 rounded-[2px]" style={{ backgroundColor: segment.colorVar }} />
            {segment.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          if (!shouldShowValue(row.flag)) {
            return (
              <div key={row.key} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">{row.label}</span>
                <p className="text-xs text-muted-foreground">{suppressedNote(row.n)}</p>
              </div>
            )
          }

          const centerPct = row.percentageBySegment[centerSegment.key] ?? 0
          const sameStart = 50 - centerPct / 2
          const sameEnd = 50 + centerPct / 2

          let cursor = sameStart
          const leftBlocks = [...leftSegments].reverse().map((segment) => {
            const pct = row.percentageBySegment[segment.key] ?? 0
            const end = cursor
            cursor -= pct
            return { segment, start: cursor, end, pct }
          })

          cursor = sameEnd
          const rightBlocks = rightSegments.map((segment) => {
            const pct = row.percentageBySegment[segment.key] ?? 0
            const start = cursor
            cursor += pct
            return { segment, start, end: cursor, pct }
          })

          return (
            <div key={row.key} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-foreground">{row.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  n = {row.n}
                  <SampleFlagBadge flag={row.flag} />
                </span>
              </div>
              <div className="relative h-6 w-full rounded-[4px] bg-muted/40">
                {leftBlocks.map(({ segment, start, end, pct }) =>
                  pct > 0 ? (
                    <Tooltip key={segment.key}>
                      <TooltipTrigger
                        render={
                          <div
                            className="absolute inset-y-0 first:rounded-l-[4px]"
                            style={{
                              left: `${Math.max(0, start)}%`,
                              width: `${Math.max(0, end - start)}%`,
                              backgroundColor: segment.colorVar,
                            }}
                          />
                        }
                      />
                      <TooltipContent>
                        {segment.label}: {pct}%
                      </TooltipContent>
                    </Tooltip>
                  ) : null
                )}
                <div
                  className="absolute inset-y-0"
                  style={{
                    left: `${sameStart}%`,
                    width: `${Math.max(0, sameEnd - sameStart)}%`,
                    backgroundColor: centerSegment.colorVar,
                  }}
                />
                {rightBlocks.map(({ segment, start, end, pct }) =>
                  pct > 0 ? (
                    <Tooltip key={segment.key}>
                      <TooltipTrigger
                        render={
                          <div
                            className="absolute inset-y-0 last:rounded-r-[4px]"
                            style={{
                              left: `${start}%`,
                              width: `${Math.min(100, end) - start}%`,
                              backgroundColor: segment.colorVar,
                            }}
                          />
                        }
                      />
                      <TooltipContent>
                        {segment.label}: {pct}%
                      </TooltipContent>
                    </Tooltip>
                  ) : null
                )}
                <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
              </div>
            </div>
          )
        })}
      </div>
      {footnote ? <p className="text-xs text-muted-foreground">{footnote}</p> : null}
    </div>
  )
}
