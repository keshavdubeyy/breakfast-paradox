"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MenuAttendanceDay } from "@/lib/analytics/mess-menu/metrics"

const CHART_CONFIG = {
  availed: {
    label: "Availed",
    color: "var(--primary)",
  },
  unused: {
    label: "Registered, unused",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

interface MenuTimelineChartProps {
  data: MenuAttendanceDay[]
  height?: number
}

function shortDate(date: string): string {
  const day = date.slice(-2)
  return day.startsWith("0") ? day.slice(1) : day
}

/** One stacked bar per day — dark "availed" segment + low-opacity
 * "unused" segment, so the bar's full height is that day's registered
 * volume and the dark share is the avail rate — with that day's menu in
 * the tooltip, so a short bar (low avail rate) can be read off against
 * what was actually served. */
export function MenuTimelineChart({ data, height = 260 }: MenuTimelineChartProps) {
  const chartData = data.map((day) => ({ ...day, unused: day.registered - day.availed }))

  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={chartData} margin={{ left: 0, right: 12, top: 8 }}>
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
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(_label, payload) => {
                const day = payload?.[0]?.payload as MenuAttendanceDay | undefined
                return day ? `${day.date} · ${day.dayOfWeek}` : ""
              }}
              formatter={(value, name, item) => {
                if (name !== "availed") return null
                const day = item.payload as MenuAttendanceDay
                const mains = [day.dish1, day.dish2].filter(Boolean).join(" + ")
                return (
                  <div className="flex w-full flex-col gap-0.5">
                    <div className="flex w-full justify-between gap-4">
                      <span className="text-muted-foreground">Avail rate</span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {day.availRate}% ({value} of {day.registered})
                      </span>
                    </div>
                    <span className="text-foreground">{mains}</span>
                    {day.nonVeg ? (
                      <span className="text-muted-foreground">{day.nonVeg}</span>
                    ) : null}
                  </div>
                )
              }}
            />
          }
        />
        <Bar
          dataKey="availed"
          stackId="attendance"
          fill="var(--color-availed)"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="unused"
          stackId="attendance"
          fill="var(--color-unused)"
          fillOpacity={0.3}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
