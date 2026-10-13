import { CATEGORY_COLOR, VARIABLES, type Polarity } from "@/lib/causal-loops/content"

interface LoopDiagramProps {
  /** Variable ids in cycle order — the diagram draws path[0]→path[1]→…→path[last]→path[0]. */
  path: string[]
  /** Polarity for each edge, same order/length as path (edge i is path[i]→path[i+1 mod n]). */
  polarities: Polarity[]
  loopId: string
  loopType: "R" | "B"
  size?: number
}

const RADIUS_FACTOR = 0.36

function labelFor(id: string): string {
  return VARIABLES.find((v) => v.id === id)?.label ?? id
}

function categoryFor(id: string): keyof typeof CATEGORY_COLOR {
  return VARIABLES.find((v) => v.id === id)?.category ?? "student"
}

/** A small circular causal-loop diagram: nodes evenly spaced on a circle,
 * arrows drawn consecutively around the ring back to the start, each
 * labeled with its polarity. Used for the loops that are genuine closed
 * cycles (R1, B1, B2) — not a general graph layout, just enough for a
 * handful of nodes arranged in one visible ring. */
export function LoopDiagram({ path, polarities, loopId, loopType, size = 420 }: LoopDiagramProps) {
  const n = path.length
  const center = size / 2
  const radius = size * RADIUS_FACTOR
  const nodeRadius = 46

  const points = path.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  })

  const badgeColor = loopType === "R" ? "fill-rose-500" : "fill-sky-500"

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md" role="img" aria-label={`${loopId} causal loop diagram`}>
      <defs>
        <marker id={`arrow-${loopId}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
        </marker>
      </defs>

      {points.map((point, i) => {
        const next = points[(i + 1) % n]
        // Pull the line endpoints in toward the node edge, not the center,
        // and curve it slightly outward so consecutive arrows don't overlap.
        const dx = next.x - point.x
        const dy = next.y - point.y
        const dist = Math.hypot(dx, dy)
        const ux = dx / dist
        const uy = dy / dist
        const startX = point.x + ux * nodeRadius
        const startY = point.y + uy * nodeRadius
        const endX = next.x - ux * nodeRadius
        const endY = next.y - uy * nodeRadius
        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2
        // Perpendicular offset, bowing away from the circle's center.
        const cx = center + (midX - center) * 1.25
        const cy = center + (midY - center) * 1.25
        const labelX = center + (midX - center) * 1.42
        const labelY = center + (midY - center) * 1.42

        return (
          <g key={`edge-${i}`}>
            <path
              d={`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`}
              fill="none"
              className="stroke-muted-foreground/70"
              strokeWidth={1.75}
              markerEnd={`url(#arrow-${loopId})`}
            />
            <circle cx={labelX} cy={labelY} r={11} className="fill-background stroke-border" strokeWidth={1} />
            <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central" className="fill-foreground text-[13px] font-semibold">
              {polarities[i]}
            </text>
          </g>
        )
      })}

      {points.map((point, i) => {
        const color = CATEGORY_COLOR[categoryFor(path[i])]
        const label = labelFor(path[i])
        return (
          <g key={`node-${i}`}>
            <circle cx={point.x} cy={point.y} r={nodeRadius} className={`${color.svgFill} ${color.svgStroke}`} strokeWidth={1.5} />
            <foreignObject x={point.x - nodeRadius + 6} y={point.y - nodeRadius + 6} width={(nodeRadius - 6) * 2} height={(nodeRadius - 6) * 2}>
              <div className="flex h-full w-full items-center justify-center text-center text-[10px] leading-tight font-medium text-foreground">
                {label}
              </div>
            </foreignObject>
          </g>
        )
      })}

      <circle cx={center} cy={center} r={28} className={`${badgeColor} opacity-90`} />
      <text x={center} y={center} textAnchor="middle" dominantBaseline="central" className="fill-white text-sm font-bold">
        {loopId}
      </text>
    </svg>
  )
}
