"use client"

import { SampleFlagBadge, shouldShowValue, suppressedNote } from "@/components/admin/sample-flag-badge"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

interface DivergingCompositionBarProps {
  lowerLabel: string
  lowerPercentage: number | null
  sameLabel: string
  samePercentage: number | null
  higherLabel: string
  higherPercentage: number | null
  n: number
  flag: SampleFlag
  /** e.g. "Median gap: 1 frequency level lower on early days". */
  medianCaption?: string
  footnote?: string
}

/** A paired/directional comparison (this respondent, or this group,
 * compared against a neutral midpoint) reads as direction, not just
 * composition — "lower" and "higher" are drawn as arms extending away
 * from a centered "no difference" segment, rather than three bars in a
 * row left-to-right, so which way the balance tips is visible at a
 * glance. */
export function DivergingCompositionBar({
  lowerLabel,
  lowerPercentage,
  sameLabel,
  samePercentage,
  higherLabel,
  higherPercentage,
  n,
  flag,
  medianCaption,
  footnote,
}: DivergingCompositionBarProps) {
  if (!shouldShowValue(flag) || lowerPercentage === null || samePercentage === null || higherPercentage === null) {
    return <p className="text-sm text-muted-foreground">{suppressedNote(n)}</p>
  }

  const sameStart = 50 - samePercentage / 2
  const sameEnd = 50 + samePercentage / 2
  const lowerStart = Math.max(0, sameStart - lowerPercentage)
  const higherEnd = Math.min(100, sameEnd + higherPercentage)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <span className="text-left font-medium" style={{ color: "var(--diverging-negative)" }}>
          {lowerLabel} · {lowerPercentage}%
        </span>
        <span className="text-center">
          {sameLabel} · {samePercentage}%
        </span>
        <span className="text-right font-medium" style={{ color: "var(--diverging-positive)" }}>
          {higherLabel} · {higherPercentage}%
        </span>
      </div>
      <div className="relative h-7 w-full rounded-[4px] bg-muted/40">
        <div
          className="absolute inset-y-0 rounded-l-[4px]"
          style={{
            left: `${lowerStart}%`,
            width: `${Math.max(0, sameStart - lowerStart)}%`,
            backgroundColor: "var(--diverging-negative)",
          }}
        />
        <div
          className="absolute inset-y-0"
          style={{
            left: `${sameStart}%`,
            width: `${Math.max(0, sameEnd - sameStart)}%`,
            backgroundColor: "var(--diverging-neutral)",
          }}
        />
        <div
          className="absolute inset-y-0 rounded-r-[4px]"
          style={{
            left: `${sameEnd}%`,
            width: `${Math.max(0, higherEnd - sameEnd)}%`,
            backgroundColor: "var(--diverging-positive)",
          }}
        />
        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
      </div>
      {medianCaption ? (
        <p className="text-sm text-foreground">
          {medianCaption}
          <SampleFlagBadge flag={flag} />
        </p>
      ) : null}
      {footnote ? <p className="text-xs text-muted-foreground">{footnote}</p> : null}
    </div>
  )
}
