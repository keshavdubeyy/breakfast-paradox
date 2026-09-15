"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { RushHourBucket } from "@/lib/analytics/mess-attendance/types"

const CHART_CONFIG = {
  count: {
    label: "Scans",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface RushHourChartProps {
  data: RushHourBucket[]
  height?: number
}

/** Scans-per-10-minute-bucket across the availed window — shows where
 * the queue actually crunches, not just which hour is busiest. */
export function RushHourChart({ data, height = 260 }: RushHourChartProps) {
  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="bucket"
          tickLine={false}
          axisLine={false}
          interval={2}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          allowDecimals={false}
          domain={[0, (max: number) => Math.ceil((max || 1) / 100) * 100]}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _name, item) => {
                const bucket = item.payload as RushHourBucket
                return (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">{bucket.bucket}</span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {value} scans
                    </span>
                  </div>
                )
              }}
            />
          }
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={3} maxBarSize={18} />
      </BarChart>
    </ChartContainer>
  )
}
