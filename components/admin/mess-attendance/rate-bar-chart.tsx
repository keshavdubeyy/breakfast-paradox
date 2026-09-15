"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface RateBarDatum {
  label: string
  /** 0-100 */
  rate: number
  /** Shown in the tooltip alongside the rate, e.g. "412 of 1,071". */
  detail: string
}

const CHART_CONFIG = {
  rate: {
    label: "Avail rate",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface RateBarChartProps {
  data: RateBarDatum[]
  height?: number
}

/** Horizontal 0-100% bar per category — used for avail-rate comparisons
 * (by mess, by weekday) where the metric is a rate, not a raw count. */
export function RateBarChart({ data, height = 200 }: RateBarChartProps) {
  const longestLabel = Math.max(...data.map((d) => d.label.length), 0)
  const axisWidth = Math.min(140, Math.max(70, longestLabel * 7))

  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 32 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" domain={[0, 100]} hide />
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
                const datum = item.payload as RateBarDatum
                return (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">{datum.label}</span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {value}% ({datum.detail})
                    </span>
                  </div>
                )
              }}
            />
          }
        />
        <Bar dataKey="rate" fill="var(--color-rate)" radius={4} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  )
}
