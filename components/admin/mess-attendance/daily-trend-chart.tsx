"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DailyAttendance } from "@/lib/analytics/mess-attendance/types"

const CHART_CONFIG = {
  registered: {
    label: "Registered",
    color: "var(--muted-foreground)",
  },
  availed: {
    label: "Availed",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface DailyTrendChartProps {
  data: DailyAttendance[]
  height?: number
}

function shortDate(date: string): string {
  const day = date.slice(-2)
  return day.startsWith("0") ? day.slice(1) : day
}

/** Registered vs. availed across every day of the month — the gap
 * between the two lines is the day-by-day no-show volume. */
export function DailyTrendChart({ data, height = 280 }: DailyTrendChartProps) {
  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-auto w-full" style={{ height }}>
      <LineChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={1}
        />
        <YAxis tickLine={false} axisLine={false} width={44} allowDecimals={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_label, payload) => {
                const day = payload?.[0]?.payload as DailyAttendance | undefined
                return day ? `${day.date} · ${day.dayOfWeek}` : ""
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="registered"
          type="monotone"
          stroke="var(--color-registered)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="availed"
          type="monotone"
          stroke="var(--color-availed)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
