import { CATEGORY_COLOR, CAUSAL_LINKS, VARIABLES } from "@/lib/causal-loops/content"

// Manually assigned columns (left → right = roughly upstream → downstream)
// and within-column order — not an auto-layout algorithm, so edges stay
// mostly short and legible instead of crossing the whole canvas. Grouped
// to match the four dashboard categories requested: admin/timetable and
// data-system on the left as largely exogenous inputs, student variables
// in the middle-upper band, mess variables in the middle-lower/right band.
const COLUMNS: string[][] = [
  // Col 0 — admin/timetable + upstream data
  ["classTimetableStructure", "earlySlotPrevalence", "breakfastServiceWindow", "holidayCampusAbsence", "menuDraftingProcess", "registrationSystemInput", "qrCheckinData"],
  // Col 1 — student inputs
  ["lateNightWorkload", "lateBedtime", "wakeUpTime", "menuAttractiveness", "historicalAttendanceData"],
  // Col 2 — student mid-chain
  ["availableMorningTime", "earlyMorningClass", "perceivedValueOfSleep", "postSkipCoping", "queueServicePressure", "projectedDemand", "wastageRecordingQuality"],
  // Col 3 — student decision + mess decision
  ["motivationToEatBreakfast", "breakfastArrivalConcentration", "preparationQuantity", "advancePreparedFood", "batchCookableCapacity", "forecastAccuracy"],
  // Col 4 — outcome bridge
  ["likelihoodOfSkipping", "actualTurnout", "registrationVsConsumptionGap", "foodShortage"],
  // Col 5 — downstream outcomes
  ["postSkipEnergyConcentration", "surplusFood", "additionalBatchesCooked"],
  // Col 6 — terminal
  ["foodWastage"],
]

const COL_WIDTH = 210
const ROW_HEIGHT = 92
const NODE_W = 176
const NODE_H = 60
const PAD = 28

function computePositions() {
  const pos = new Map<string, { x: number; y: number }>()
  let maxRows = 0
  COLUMNS.forEach((col, colIndex) => {
    maxRows = Math.max(maxRows, col.length)
    col.forEach((id, rowIndex) => {
      pos.set(id, {
        x: PAD + colIndex * COL_WIDTH,
        y: PAD + rowIndex * ROW_HEIGHT,
      })
    })
  })
  return { pos, width: PAD * 2 + (COLUMNS.length - 1) * COL_WIDTH + NODE_W, height: PAD * 2 + (maxRows - 1) * ROW_HEIGHT + NODE_H }
}

const LOOP_LINK_IDS = new Set(["E22", "E30", "E33", "E26", "E29", "E40", "E10", "E11"])

/** The full integrated variable map — every variable this page defines,
 * laid out in fixed columns (roughly upstream → downstream, not a force
 * layout) with every causal link drawn as a curved arrow labeled with its
 * polarity. Edges that are part of a named loop (R1/B1/B2) are drawn
 * heavier so the loops are visible within the larger graph without a
 * separate highlight pass. */
export function SystemMap() {
  const { pos, width, height } = computePositions()

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60 bg-card/50 p-2">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label="Integrated causal loop diagram">
        <defs>
          <marker id="sysmap-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
          </marker>
          <marker id="sysmap-arrow-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-foreground" />
          </marker>
        </defs>

        {CAUSAL_LINKS.map((link) => {
          const from = pos.get(link.from)
          const to = pos.get(link.to)
          if (!from || !to) return null
          const isLoopEdge = LOOP_LINK_IDS.has(link.id)

          const x1 = from.x + NODE_W
          const y1 = from.y + NODE_H / 2
          const x2 = to.x
          const y2 = to.y + NODE_H / 2
          const sameCol = from.x === to.x
          const backward = x2 < x1

          let path: string
          let labelX: number
          let labelY: number

          if (sameCol) {
            // Vertical edge within a column — bow out to the right.
            const midY = (y1 + y2) / 2
            const bow = 38
            path = `M ${x1 - NODE_W / 2 + 4} ${from.y} Q ${x1 + bow} ${midY} ${x2 - NODE_W / 2 + 4} ${to.y + NODE_H}`
            labelX = x1 + bow + 6
            labelY = midY
          } else if (backward) {
            // Right-to-left edge — arc below both nodes.
            const midX = (x1 + x2) / 2
            const dip = 30
            path = `M ${x1} ${y1} Q ${midX} ${Math.max(y1, y2) + dip} ${x2} ${y2}`
            labelX = midX
            labelY = Math.max(y1, y2) + dip - 4
          } else {
            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2
            path = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`
            labelX = midX
            labelY = midY
          }

          return (
            <g key={link.id}>
              <path
                d={path}
                fill="none"
                className={isLoopEdge ? "stroke-foreground/70" : "stroke-muted-foreground/40"}
                strokeWidth={isLoopEdge ? 1.75 : 1}
                markerEnd={isLoopEdge ? "url(#sysmap-arrow-loop)" : "url(#sysmap-arrow)"}
              />
              <text x={labelX} y={labelY} textAnchor="middle" className={isLoopEdge ? "fill-foreground text-[10px] font-bold" : "fill-muted-foreground text-[9px]"}>
                {link.polarity}
              </text>
            </g>
          )
        })}

        {VARIABLES.map((variable) => {
          const p = pos.get(variable.id)
          if (!p) return null
          const color = CATEGORY_COLOR[variable.category]
          return (
            <g key={variable.id}>
              <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={8} className={`${color.svgFill} ${color.svgStroke}`} strokeWidth={1.25} />
              <foreignObject x={p.x + 4} y={p.y + 4} width={NODE_W - 8} height={NODE_H - 8}>
                <div className="flex h-full w-full items-center justify-center text-center text-[10px] leading-tight font-medium text-foreground">
                  {variable.label}
                </div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
