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
  /** Raw registered/availed counts — when both are present, the chart
   * renders one stacked bar (availed + unused) instead of the plain 0-100
   * rate bar, so registered volume and avail rate show up together in a
   * single bar rather than as two separate bars. */
  registered?: number
  availed?: number
}

const CHART_CONFIG = {
  rate: {
    label: "Avail rate",
    color: "var(--primary)",
  },
  availed: {
    label: "Availed",
    color: "var(--primary)",
  },
  unused: {
    label: "Registered, unused",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

interface RateBarChartProps {
  data: RateBarDatum[]
  height?: number
}

/** Horizontal bar per category. Plain mode (no registered/availed counts)
 * draws a single 0-100% rate bar. When both counts are present, each
 * category instead gets one stacked bar — a dark "availed" segment plus a
 * low-opacity "unused" segment — so the bar's total length is that
 * category's registered volume and the dark share within it is the avail
 * rate, all in one bar rather than two. */
export function RateBarChart({ data, height = 200 }: RateBarChartProps) {
  const longestLabel = Math.max(...data.map((d) => d.label.length), 0)
  const axisWidth = Math.min(140, Math.max(70, longestLabel * 7))
  const isStacked = data.some((d) => d.registered !== undefined && d.availed !== undefined)

  const chartData = isStacked
    ? data.map((d) => ({ ...d, unused: (d.registered ?? 0) - (d.availed ?? 0) }))
    : data

  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 32 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" domain={isStacked ? [0, "dataMax"] : [0, 100]} hide />
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
              formatter={(value, name, item) => {
                if (isStacked && name !== "availed") return null
                const datum = item.payload as RateBarDatum
                return (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">{datum.label}</span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {datum.rate}% ({datum.detail})
                    </span>
                  </div>
                )
              }}
            />
          }
        />
        {isStacked ? (
          <>
            <Bar
              dataKey="availed"
              stackId="attendance"
              fill="var(--color-availed)"
              radius={[4, 0, 0, 4]}
              maxBarSize={24}
            />
            <Bar
              dataKey="unused"
              stackId="attendance"
              fill="var(--color-unused)"
              fillOpacity={0.3}
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            />
          </>
        ) : (
          <Bar dataKey="rate" fill="var(--color-rate)" radius={4} maxBarSize={24} />
        )}
      </BarChart>
    </ChartContainer>
  )
}
