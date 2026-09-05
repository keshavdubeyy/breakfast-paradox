"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DistributionBucket } from "@/lib/analytics/metrics"

const CHART_CONFIG = {
  count: {
    label: "Responses",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface DistributionBarChartProps {
  data: DistributionBucket[]
  /** Rows with a longer label list read better as a taller chart — pass
   * an explicit height rather than letting every chart share one size. */
  height?: number
  /** When provided, each bar becomes clickable (and shows a pointer
   * cursor) — used for the "view responses" drill-down on Events. */
  onBucketClick?: (bucket: DistributionBucket) => void
}

/** A horizontal bar per category, count + percentage in the tooltip —
 * the shared shape behind every "distribution" chart on Overview
 * (breakfast frequency, early commitments, hostel, year, archetypes). */
export function DistributionBarChart({
  data,
  height = 220,
  onBucketClick,
}: DistributionBarChartProps) {
  const longestLabel = Math.max(...data.map((bucket) => bucket.label.length), 0)
  const axisWidth = Math.min(160, Math.max(80, longestLabel * 7))

  return (
    <ChartContainer
      config={CHART_CONFIG}
      className="aspect-auto w-full"
      style={{ height }}
    >
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          width={axisWidth}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _name, item) => {
                const bucket = item.payload as DistributionBucket
                return (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">
                      {bucket.label}
                    </span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {value} ({bucket.percentage}%)
                    </span>
                  </div>
                )
              }}
            />
          }
        />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          radius={4}
          cursor={onBucketClick ? "pointer" : undefined}
          onClick={
            onBucketClick
              ? (barData) => {
                  const bucket = (barData as { payload?: DistributionBucket })
                    .payload
                  if (bucket) {
                    onBucketClick(bucket)
                  }
                }
              : undefined
          }
        />
      </BarChart>
    </ChartContainer>
  )
}
