"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const revenueData = [
  { month: "Apr", revenue: 8200 },
  { month: "May", revenue: 9100 },
  { month: "Jun", revenue: 8700 },
  { month: "Jul", revenue: 10400 },
  { month: "Aug", revenue: 11800 },
  { month: "Sep", revenue: 12650 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export default function ChartDemo() {
  return (
    <div className="flex flex-col gap-6">
      <ChartContainer config={chartConfig} className="max-h-72 w-full">
        <BarChart data={revenueData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel={false} />}
          />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
