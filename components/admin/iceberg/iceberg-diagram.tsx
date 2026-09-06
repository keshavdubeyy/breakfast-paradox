"use client"

import { useState } from "react"

import type { IcebergLevel } from "@/lib/analytics/iceberg/types"

/** Fixed visual accent per level — used only for the small dot/icon next
 * to each finding card beside the diagram, unrelated to the iceberg
 * illustration's own palette (see ICEBERG_SHAPES below). */
export const LEVEL_ACCENT: Record<IcebergLevel["level"], string> = {
  events: "#2a78d6",
  patterns: "#1baf7a",
  structures: "#eda100",
  "mental-models": "#8b7ae8",
}

// A verbatim trace of a reference iceberg icon — 512x512, top-left
// origin. Every shape's fill is a themed CSS custom property (defined in
// app/globals.css, light + dark values) rather than a literal hex, so
// the illustration re-themes automatically instead of needing a
// separate dark-mode asset; the *shape* of every polygon is exact and
// identical in both themes, only the 7 fill roles change color. Draw
// order matters (later shapes paint over earlier ones) and matches the
// source trace: base silhouettes first, facets on top, waterline last.
// The canvas itself is wider than it is tall to begin with (512x512 in
// the raw trace), but the rendered peak/mass are stretched well beyond
// that below — CANVAS_HEIGHT accounts for the stretched extent, not the
// raw trace's own bounds.
const CANVAS_WIDTH = 512
const CANVAS_HEIGHT = 650

interface IcebergShape {
  id: string
  fillVar: string
  points: [number, number][]
}

const ICEBERG_SHAPES: IcebergShape[] = [
  {
    id: "TOP_BASE",
    fillVar: "var(--iceberg-ice-base)",
    points: [
      [154, 205], [373, 205], [350, 172], [337, 181], [297, 134], [282, 148],
      [254, 97], [227, 147], [215, 139], [197, 174], [174, 159],
    ],
  },
  {
    id: "T1",
    fillVar: "var(--iceberg-ice-mid)",
    points: [[173, 162], [155, 205], [186, 205], [188, 201], [178, 194], [178, 180]],
  },
  {
    id: "T2",
    fillVar: "var(--iceberg-ice-pale)",
    points: [
      [175, 161], [180, 193], [191, 200], [188, 205], [194, 205], [198, 198], [188, 190], [195, 174],
    ],
  },
  {
    id: "T3",
    fillVar: "var(--iceberg-ice-mid)",
    points: [
      [216, 140], [190, 191], [200, 197], [196, 205], [227, 205], [233, 175], [222, 171], [225, 148],
    ],
  },
  {
    id: "T4",
    fillVar: "var(--iceberg-ice-base)",
    points: [
      [240, 124], [226, 152], [224, 170], [235, 175], [229, 205], [286, 205],
      [300, 166], [287, 145], [272, 168], [258, 159], [247, 188],
    ],
  },
  {
    id: "T5",
    fillVar: "var(--iceberg-ice-pale)",
    points: [[254, 98], [242, 120], [248, 183], [257, 156], [271, 165], [281, 149]],
  },
  {
    id: "T6",
    fillVar: "var(--iceberg-ice-pale)",
    points: [[297, 135], [289, 144], [303, 171], [288, 205], [357, 205]],
  },
  {
    id: "T7",
    fillVar: "var(--iceberg-ice-base)",
    points: [[350, 173], [339, 181], [359, 205], [372, 205]],
  },
  {
    id: "U0",
    fillVar: "var(--iceberg-water-base)",
    points: [
      [141, 219], [135, 230], [138, 276], [178, 308], [179, 354], [199, 365],
      [230, 462], [265, 470], [297, 381], [323, 384], [330, 321], [353, 321],
      [363, 274], [379, 254], [371, 240], [369, 219],
    ],
  },
  {
    id: "U1",
    fillVar: "var(--iceberg-water-mid)",
    points: [[167, 220], [167, 267], [204, 256], [242, 303], [264, 220]],
  },
  {
    id: "U2",
    fillVar: "var(--iceberg-water-deep)",
    points: [
      [167, 269], [203, 258], [241, 305], [256, 391], [237, 428], [213, 411], [236, 362], [204, 329], [199, 297],
    ],
  },
  {
    id: "U3",
    fillVar: "var(--iceberg-water-shadow)",
    points: [
      [141, 220], [135, 232], [138, 275], [179, 308], [180, 354], [199, 364],
      [212, 408], [234, 363], [203, 331], [197, 298], [165, 270], [165, 220],
    ],
  },
  {
    id: "U4",
    fillVar: "var(--iceberg-water-shadow)",
    points: [[300, 220], [266, 220], [243, 304], [257, 387], [271, 362], [265, 305], [312, 305], [325, 283]],
  },
  {
    id: "U5",
    fillVar: "var(--iceberg-water-shadow)",
    points: [[214, 415], [230, 460], [263, 469], [238, 433]],
  },
  {
    id: "W",
    fillVar: "var(--iceberg-water-deep)",
    points: [[41, 206], [473, 206], [473, 220], [41, 220]],
  },
]

// The two "base silhouette" shapes (the above-water tip and the
// underwater mass) union together into the true outer outline — used
// only to clip the four interactive zone regions below, never rendered
// on their own with a visible edge.
const CLIP_SHAPE_IDS = ["TOP_BASE", "U0"]

// The trace's own waterline band (206-220, midpoint 213) is the fixed
// pivot — every other point stretches away from it, both vertically
// (taller peak above, deeper mass below) and horizontally (wider peak
// and wider mass, pivoting on the horizontal center) — without moving
// the waterline itself, which is redrawn as its own thin, fixed-width
// band. Y_OFFSET then shifts the whole stretched result down so the
// taller peak still has clear "sky" above it for the Events label,
// inside the taller CANVAS_HEIGHT above.
const PIVOT_X = CANVAS_WIDTH / 2
const PIVOT_Y = 213
const TOP_SCALE = 1.625 // 1.25 x 1.3 — "30% bigger" on top of the previous stretch
const BOTTOM_SCALE = 1.43 // 1.1 x 1.3
const TOP_X_SCALE = 1.3 // widen the above-water peak
const BOTTOM_X_SCALE = 1.25 // widen the submerged mass
const WATERLINE_HALF_THICKNESS = 3
const Y_OFFSET = 40

function stretchX(x: number, y: number): number {
  const scale = y < PIVOT_Y ? TOP_X_SCALE : BOTTOM_X_SCALE
  return PIVOT_X + (x - PIVOT_X) * scale
}

function stretchY(y: number): number {
  const stretched = y < PIVOT_Y ? PIVOT_Y - (PIVOT_Y - y) * TOP_SCALE : PIVOT_Y + (y - PIVOT_Y) * BOTTOM_SCALE
  return stretched + Y_OFFSET
}

const WATERLINE_TOP = PIVOT_Y - WATERLINE_HALF_THICKNESS + Y_OFFSET
const WATERLINE_BOTTOM = PIVOT_Y + WATERLINE_HALF_THICKNESS + Y_OFFSET

const WATERLINE_POINTS: [number, number][] = [
  [41, WATERLINE_TOP],
  [473, WATERLINE_TOP],
  [473, WATERLINE_BOTTOM],
  [41, WATERLINE_BOTTOM],
]

function renderedPoints(shape: IcebergShape): [number, number][] {
  if (shape.id === "W") return WATERLINE_POINTS
  return shape.points.map(([x, y]) => [stretchX(x, y), stretchY(y)])
}

function pointsAttr(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ")
}

// Zone seams for the four clickable regions — Events is everything
// above the (now thinner) waterline; the submerged two-thirds below it
// split into three, weighted toward the wider upper portion since the
// shape tapers to a point and the lowest third would otherwise be too
// narrow to comfortably hold a label.
const SEAM = { waterline: WATERLINE_BOTTOM, patterns: 353, structures: 470, bottom: CANVAS_HEIGHT }

interface IcebergDiagramProps {
  levels: IcebergLevel[]
  selectedLevel: IcebergLevel["level"]
  onSelectLevel: (level: IcebergLevel["level"]) => void
  className?: string
}

/** The production iceberg illustration — a verbatim traced icon (see
 * ICEBERG_SHAPES) rather than a hand-drawn approximation, themed via CSS
 * custom properties so it re-colors for light/dark mode automatically.
 * The four zones are invisible clickable regions clipped to the
 * combined base silhouette, exactly as before. */
export function IcebergDiagram({ levels, selectedLevel, onSelectLevel, className }: IcebergDiagramProps) {
  const [hovered, setHovered] = useState<IcebergLevel["level"] | null>(null)

  const zoneRange: Record<IcebergLevel["level"], { y: number; height: number }> = {
    events: { y: 0, height: SEAM.waterline },
    patterns: { y: SEAM.waterline, height: SEAM.patterns - SEAM.waterline },
    structures: { y: SEAM.patterns, height: SEAM.structures - SEAM.patterns },
    "mental-models": { y: SEAM.structures, height: SEAM.bottom - SEAM.structures },
  }

  return (
    <svg
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      className={className ?? "mx-auto w-full max-w-md"}
      role="group"
      aria-label="Iceberg diagram — click a layer to view its findings"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <defs>
        <clipPath id="iceberg-clip">
          {ICEBERG_SHAPES.filter((shape) => CLIP_SHAPE_IDS.includes(shape.id)).map((shape) => (
            <polygon key={shape.id} points={pointsAttr(renderedPoints(shape))} />
          ))}
        </clipPath>
      </defs>

      {ICEBERG_SHAPES.map((shape) => (
        <polygon key={shape.id} points={pointsAttr(renderedPoints(shape))} fill={shape.fillVar} stroke="none" />
      ))}

      {/* Clickable / hoverable zones, clipped to the combined silhouette. */}
      {levels.map((level) => {
        const range = zoneRange[level.level]
        const isSelected = selectedLevel === level.level
        const isHovered = hovered === level.level
        return (
          // aria-label rather than a nested <title> — an SVG <title> child
          // gets swept up by React's document-metadata hoisting (meant for
          // <title>/<meta>/<link>), which strips its text out during SSR
          // and caused a real hydration mismatch here. aria-label conveys
          // the same thing to assistive tech without hitting that.
          <rect
            key={level.level}
            x={0}
            y={range.y}
            width={CANVAS_WIDTH}
            height={range.height}
            clipPath="url(#iceberg-clip)"
            fill="#ffffff"
            opacity={isSelected ? 0.22 : isHovered ? 0.1 : 0}
            className="cursor-pointer transition-opacity"
            aria-label={`${level.title} — ${level.question}`}
            onMouseEnter={() => setHovered(level.level)}
            onMouseLeave={() => setHovered((current) => (current === level.level ? null : current))}
            onClick={() => onSelectLevel(level.level)}
          />
        )
      })}

      {/* Labels. Events sits in the empty "sky" above the peaks, so it
       * uses the page's own theme-aware ink. The three submerged labels
       * always land on a water facet (never an ice one — see SEAM
       * above), and those facets are a dark, fairly narrow range in both
       * themes, so a dedicated light "label ink" pair (tuned once,
       * independent of whatever the fill palette is doing) stays legible
       * without needing a backdrop chip behind the text. */}
      <g className="pointer-events-none select-none">
        <text x={CANVAS_WIDTH / 2} y={34} textAnchor="middle" fill="var(--foreground)" className="text-[22px] font-semibold">
          Events
        </text>
        <text x={CANVAS_WIDTH / 2} y={56} textAnchor="middle" fill="var(--muted-foreground)" className="text-[13px]">
          What happened?
        </text>

        <text x={CANVAS_WIDTH / 2} y={301} textAnchor="middle" fill="var(--iceberg-label-ink)" className="text-[20px] font-semibold">
          Patterns
        </text>
        <text x={CANVAS_WIDTH / 2} y={324} textAnchor="middle" fill="var(--iceberg-label-ink-muted)" className="text-[13px]">
          What keeps happening?
        </text>

        <text x={CANVAS_WIDTH / 2} y={407} textAnchor="middle" fill="var(--iceberg-label-ink)" className="text-[19px] font-semibold">
          Structures
        </text>
        <text x={CANVAS_WIDTH / 2} y={430} textAnchor="middle" fill="var(--iceberg-label-ink-muted)" className="text-[13px]">
          What produces the pattern?
        </text>

        {/* "Mental models" sits at the tip, where the mass has tapered
         * down to a fraction of the width the other three labels enjoy —
         * wrapped onto two short lines (rather than shrunk) so it still
         * matches their font size but stays narrow enough to not spill
         * past the ice onto the page background. */}
        <text x={CANVAS_WIDTH / 2} y={512} textAnchor="middle" fill="var(--iceberg-label-ink)" className="text-[18px] font-semibold">
          Mental
        </text>
        <text x={CANVAS_WIDTH / 2} y={533} textAnchor="middle" fill="var(--iceberg-label-ink)" className="text-[18px] font-semibold">
          models
        </text>
        <text x={CANVAS_WIDTH / 2} y={551} textAnchor="middle" fill="var(--iceberg-label-ink-muted)" className="text-[13px]">
          What beliefs
        </text>
        <text x={CANVAS_WIDTH / 2} y={566} textAnchor="middle" fill="var(--iceberg-label-ink-muted)" className="text-[13px]">
          sustain it?
        </text>
      </g>

      {/* Depth guide, left margin. */}
      <g className="pointer-events-none select-none">
        <line x1={16} y1={20} x2={16} y2={CANVAS_HEIGHT - 20} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeWidth={1} />
        <text x={26} y={22} fill="var(--muted-foreground)" className="text-[9px] font-medium tracking-wide uppercase">
          More visible
        </text>
        <text x={26} y={CANVAS_HEIGHT - 14} fill="var(--muted-foreground)" className="text-[9px] font-medium tracking-wide uppercase">
          Deeper causes
        </text>
      </g>
    </svg>
  )
}
