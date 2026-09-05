"use client"

import { Sankey } from "recharts"
import type { NodeProps } from "recharts/types/chart/Sankey"

import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import type { PathwaySankeyData } from "@/lib/analytics/events-metrics"

const CHART_CONFIG = {} satisfies ChartConfig

function SankeyNodeShape({ x, y, width, height, payload }: NodeProps) {
  // `payload` is a PathwaySankeyNode, but Recharts' own Sankey layout
  // mutates this same object to add its own `value`/`depth`/link fields
  // for layout purposes — `respondentCount` is named to avoid colliding
  // with any of those (see the field's doc comment in events-metrics.ts).
  const node = payload as unknown as { name: string; respondentCount: number }
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 1)}
        fill="var(--primary)"
        fillOpacity={0.75}
        rx={2}
      />
      <text
        x={x + width + 6}
        y={y + height / 2}
        dy="0.32em"
        fontSize={11}
        fill="var(--foreground)"
      >
        {node.name} ({node.respondentCount})
      </text>
    </g>
  )
}

interface PathwaySankeyProps {
  data: PathwaySankeyData
  height?: number
}

/** "Reported breakfast pathways" — see buildBreakfastPathwaySankey's
 * doc comment for exactly which edges are per-respondent-exact vs. an
 * aggregate of multi-select answers; this component just draws
 * whatever data it's given. */
export function PathwaySankey({ data, height = 480 }: PathwaySankeyProps) {
  return (
    <ChartContainer
      config={CHART_CONFIG}
      className="aspect-auto w-full [&_.recharts-sankey-link]:stroke-border"
      style={{ height }}
    >
      <Sankey
        data={data}
        node={SankeyNodeShape}
        link={{ stroke: "var(--color-border, #999)", strokeOpacity: 0.4 }}
        nodePadding={14}
        nodeWidth={10}
        margin={{ top: 8, right: 190, bottom: 8, left: 8 }}
      />
    </ChartContainer>
  )
}
