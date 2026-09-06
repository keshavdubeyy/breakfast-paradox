"use client"

import { useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

/**
 * Development-only tool for iterating on the /admin/iceberg diagram's
 * silhouette by hand — drag control points until the shape actually
 * reads as an iceberg, layer on shading facets to fake light/shadow,
 * then copy the generated path data into
 * components/admin/iceberg/iceberg-diagram.tsx. Intentionally not linked
 * from anywhere (no nav entry) — reach it by typing the URL.
 */

const WIDTH = 460
const HEIGHT = 600

interface Point {
  x: number
  y: number
}

// --- Reference trace ------------------------------------------------------
//
// An exact, non-interactive replica of a specific traced icon (512x512,
// top-left origin), rendered flat with no strokes/gradients — verbatim
// from the supplied point data, not re-derived or rounded. Kept entirely
// separate from the editable maker above; it exists purely as a
// side-by-side visual reference.
const REFERENCE_CANVAS = 512

interface ReferenceShape {
  id: string
  fill: string
  points: [number, number][]
}

const REFERENCE_SHAPES: ReferenceShape[] = [
  {
    id: "TOP_BASE",
    fill: "#7CE8E5",
    points: [
      [154, 205],
      [373, 205],
      [350, 172],
      [337, 181],
      [297, 134],
      [282, 148],
      [254, 97],
      [227, 147],
      [215, 139],
      [197, 174],
      [174, 159],
    ],
  },
  {
    id: "T1",
    fill: "#5ED3CD",
    points: [
      [173, 162],
      [155, 205],
      [186, 205],
      [188, 201],
      [178, 194],
      [178, 180],
    ],
  },
  {
    id: "T2",
    fill: "#D5F8FA",
    points: [
      [175, 161],
      [180, 193],
      [191, 200],
      [188, 205],
      [194, 205],
      [198, 198],
      [188, 190],
      [195, 174],
    ],
  },
  {
    id: "T3",
    fill: "#5ED3CD",
    points: [
      [216, 140],
      [190, 191],
      [200, 197],
      [196, 205],
      [227, 205],
      [233, 175],
      [222, 171],
      [225, 148],
    ],
  },
  {
    id: "T4",
    fill: "#7CE8E5",
    points: [
      [240, 124],
      [226, 152],
      [224, 170],
      [235, 175],
      [229, 205],
      [286, 205],
      [300, 166],
      [287, 145],
      [272, 168],
      [258, 159],
      [247, 188],
    ],
  },
  {
    id: "T5",
    fill: "#D5F8FA",
    points: [
      [254, 98],
      [242, 120],
      [248, 183],
      [257, 156],
      [271, 165],
      [281, 149],
    ],
  },
  {
    id: "T6",
    fill: "#D5F8FA",
    points: [
      [297, 135],
      [289, 144],
      [303, 171],
      [288, 205],
      [357, 205],
    ],
  },
  {
    id: "T7",
    fill: "#7CE8E5",
    points: [
      [350, 173],
      [339, 181],
      [359, 205],
      [372, 205],
    ],
  },
  {
    id: "U0",
    fill: "#68B6E5",
    points: [
      [141, 219],
      [135, 230],
      [138, 276],
      [178, 308],
      [179, 354],
      [199, 365],
      [230, 462],
      [265, 470],
      [297, 381],
      [323, 384],
      [330, 321],
      [353, 321],
      [363, 274],
      [379, 254],
      [371, 240],
      [369, 219],
    ],
  },
  {
    id: "U1",
    fill: "#4EA6D1",
    points: [
      [167, 220],
      [167, 267],
      [204, 256],
      [242, 303],
      [264, 220],
    ],
  },
  {
    id: "U2",
    fill: "#3C96BA",
    points: [
      [167, 269],
      [203, 258],
      [241, 305],
      [256, 391],
      [237, 428],
      [213, 411],
      [236, 362],
      [204, 329],
      [199, 297],
    ],
  },
  {
    id: "U3",
    fill: "#178BAF",
    points: [
      [141, 220],
      [135, 232],
      [138, 275],
      [179, 308],
      [180, 354],
      [199, 364],
      [212, 408],
      [234, 363],
      [203, 331],
      [197, 298],
      [165, 270],
      [165, 220],
    ],
  },
  {
    id: "U4",
    fill: "#178BAF",
    points: [
      [300, 220],
      [266, 220],
      [243, 304],
      [257, 387],
      [271, 362],
      [265, 305],
      [312, 305],
      [325, 283],
    ],
  },
  {
    id: "U5",
    fill: "#178BAF",
    points: [
      [214, 415],
      [230, 460],
      [263, 469],
      [238, 433],
    ],
  },
  {
    id: "W",
    fill: "#3C96BA",
    points: [
      [41, 206],
      [473, 206],
      [473, 220],
      [41, 220],
    ],
  },
]

function referencePointsAttr(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ")
}

// --- Color lab — the actual shape/stretch geometry currently live on
// /admin/iceberg (components/admin/iceberg/iceberg-diagram.tsx), copied
// verbatim, but with each shape's fill wired to local color-lab state
// instead of a CSS custom property — so colors can be tried here and
// copied into app/globals.css once they look right, without touching
// the production component itself.
interface LabColorSet {
  icePale: string
  iceBase: string
  iceMid: string
  waterBase: string
  waterMid: string
  waterDeep: string
  waterShadow: string
}

const LAB_DEFAULT_COLORS: Record<"light" | "dark", LabColorSet> = {
  light: {
    icePale: "#fafafa",
    iceBase: "#dedede",
    iceMid: "#c7c7c7",
    waterBase: "#363636",
    waterMid: "#454545",
    waterDeep: "#474747",
    waterShadow: "#292929",
  },
  dark: {
    icePale: "#828282",
    iceBase: "#4f4f4f",
    iceMid: "#666666",
    waterBase: "#303030",
    waterMid: "#292929",
    waterDeep: "#262626",
    waterShadow: "#212121",
  },
}

const LAB_COLOR_FIELDS: { key: keyof LabColorSet; label: string; cssVar: string }[] = [
  { key: "icePale", label: "Ice — pale (brightest peak facets)", cssVar: "--iceberg-ice-pale" },
  { key: "iceBase", label: "Ice — base (mid peak facets)", cssVar: "--iceberg-ice-base" },
  { key: "iceMid", label: "Ice — mid (darker peak facet)", cssVar: "--iceberg-ice-mid" },
  { key: "waterBase", label: "Water — base (main submerged mass)", cssVar: "--iceberg-water-base" },
  { key: "waterMid", label: "Water — mid (mid-depth facet)", cssVar: "--iceberg-water-mid" },
  { key: "waterDeep", label: "Water — deep (deeper facet + waterline)", cssVar: "--iceberg-water-deep" },
  { key: "waterShadow", label: "Water — shadow (darkest facets)", cssVar: "--iceberg-water-shadow" },
]

const PROD_CANVAS_WIDTH = 512
const PROD_CANVAS_HEIGHT = 650
const PROD_PIVOT_X = PROD_CANVAS_WIDTH / 2
const PROD_PIVOT_Y = 213
const PROD_TOP_SCALE = 1.625
const PROD_BOTTOM_SCALE = 1.43
const PROD_TOP_X_SCALE = 1.3
const PROD_BOTTOM_X_SCALE = 1.25
const PROD_WATERLINE_HALF_THICKNESS = 3
const PROD_Y_OFFSET = 40

interface ProdShape {
  id: string
  colorKey: keyof LabColorSet
  points: [number, number][]
}

const PROD_SHAPES: ProdShape[] = [
  {
    id: "TOP_BASE",
    colorKey: "iceBase",
    points: [
      [154, 205], [373, 205], [350, 172], [337, 181], [297, 134], [282, 148],
      [254, 97], [227, 147], [215, 139], [197, 174], [174, 159],
    ],
  },
  {
    id: "T1",
    colorKey: "iceMid",
    points: [[173, 162], [155, 205], [186, 205], [188, 201], [178, 194], [178, 180]],
  },
  {
    id: "T2",
    colorKey: "icePale",
    points: [
      [175, 161], [180, 193], [191, 200], [188, 205], [194, 205], [198, 198], [188, 190], [195, 174],
    ],
  },
  {
    id: "T3",
    colorKey: "iceMid",
    points: [
      [216, 140], [190, 191], [200, 197], [196, 205], [227, 205], [233, 175], [222, 171], [225, 148],
    ],
  },
  {
    id: "T4",
    colorKey: "iceBase",
    points: [
      [240, 124], [226, 152], [224, 170], [235, 175], [229, 205], [286, 205],
      [300, 166], [287, 145], [272, 168], [258, 159], [247, 188],
    ],
  },
  {
    id: "T5",
    colorKey: "icePale",
    points: [[254, 98], [242, 120], [248, 183], [257, 156], [271, 165], [281, 149]],
  },
  {
    id: "T6",
    colorKey: "icePale",
    points: [[297, 135], [289, 144], [303, 171], [288, 205], [357, 205]],
  },
  {
    id: "T7",
    colorKey: "iceBase",
    points: [[350, 173], [339, 181], [359, 205], [372, 205]],
  },
  {
    id: "U0",
    colorKey: "waterBase",
    points: [
      [141, 219], [135, 230], [138, 276], [178, 308], [179, 354], [199, 365],
      [230, 462], [265, 470], [297, 381], [323, 384], [330, 321], [353, 321],
      [363, 274], [379, 254], [371, 240], [369, 219],
    ],
  },
  {
    id: "U1",
    colorKey: "waterMid",
    points: [[167, 220], [167, 267], [204, 256], [242, 303], [264, 220]],
  },
  {
    id: "U2",
    colorKey: "waterDeep",
    points: [
      [167, 269], [203, 258], [241, 305], [256, 391], [237, 428], [213, 411], [236, 362], [204, 329], [199, 297],
    ],
  },
  {
    id: "U3",
    colorKey: "waterShadow",
    points: [
      [141, 220], [135, 232], [138, 275], [179, 308], [180, 354], [199, 364],
      [212, 408], [234, 363], [203, 331], [197, 298], [165, 270], [165, 220],
    ],
  },
  {
    id: "U4",
    colorKey: "waterShadow",
    points: [[300, 220], [266, 220], [243, 304], [257, 387], [271, 362], [265, 305], [312, 305], [325, 283]],
  },
  {
    id: "U5",
    colorKey: "waterShadow",
    points: [[214, 415], [230, 460], [263, 469], [238, 433]],
  },
  {
    id: "W",
    colorKey: "waterDeep",
    points: [[41, 206], [473, 206], [473, 220], [41, 220]],
  },
]

function prodStretchX(x: number, y: number): number {
  const scale = y < PROD_PIVOT_Y ? PROD_TOP_X_SCALE : PROD_BOTTOM_X_SCALE
  return PROD_PIVOT_X + (x - PROD_PIVOT_X) * scale
}

function prodStretchY(y: number): number {
  const stretched =
    y < PROD_PIVOT_Y
      ? PROD_PIVOT_Y - (PROD_PIVOT_Y - y) * PROD_TOP_SCALE
      : PROD_PIVOT_Y + (y - PROD_PIVOT_Y) * PROD_BOTTOM_SCALE
  return stretched + PROD_Y_OFFSET
}

const PROD_WATERLINE_TOP = PROD_PIVOT_Y - PROD_WATERLINE_HALF_THICKNESS + PROD_Y_OFFSET
const PROD_WATERLINE_BOTTOM = PROD_PIVOT_Y + PROD_WATERLINE_HALF_THICKNESS + PROD_Y_OFFSET

const PROD_WATERLINE_POINTS: [number, number][] = [
  [41, PROD_WATERLINE_TOP],
  [473, PROD_WATERLINE_TOP],
  [473, PROD_WATERLINE_BOTTOM],
  [41, PROD_WATERLINE_BOTTOM],
]

function prodRenderedPoints(shape: ProdShape): [number, number][] {
  if (shape.id === "W") return PROD_WATERLINE_POINTS
  return shape.points.map(([x, y]) => [prodStretchX(x, y), prodStretchY(y)])
}

function prodPointsAttr(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ")
}

type OutlineKey =
  | "leftPeakApex"
  | "valleyDip"
  | "rightPeakApex"
  | "waterlineRight"
  | "rightTaper1"
  | "rightTaper2"
  | "rightTaper3"
  | "bottomTip"
  | "leftTaper3"
  | "leftTaper2"
  | "leftTaper1"
  | "waterlineLeft"
  | "facetBEnd"

// Outline order — how the 12 silhouette points connect into one closed
// path. facetBEnd is deliberately not in this list (it's a facet-line
// endpoint only, not part of the outline).
const OUTLINE_ORDER: OutlineKey[] = [
  "leftPeakApex",
  "valleyDip",
  "rightPeakApex",
  "waterlineRight",
  "rightTaper1",
  "rightTaper2",
  "rightTaper3",
  "bottomTip",
  "leftTaper3",
  "leftTaper2",
  "leftTaper1",
  "waterlineLeft",
]

const OUTLINE_LABELS: Record<OutlineKey, string> = {
  leftPeakApex: "Left peak apex",
  valleyDip: "Valley between peaks",
  rightPeakApex: "Right peak apex",
  waterlineRight: "Waterline (right)",
  rightTaper1: "Right taper 1",
  rightTaper2: "Right taper 2",
  rightTaper3: "Right taper 3",
  bottomTip: "Bottom tip",
  leftTaper3: "Left taper 3",
  leftTaper2: "Left taper 2",
  leftTaper1: "Left taper 1",
  waterlineLeft: "Waterline (left)",
  facetBEnd: "Facet B end",
}

const DEFAULT_OUTLINE_POINTS: Record<OutlineKey, Point> = {
  leftPeakApex: { x: 192, y: 55 },
  valleyDip: { x: 224, y: 96 },
  rightPeakApex: { x: 276, y: 16 },
  waterlineRight: { x: 368, y: 172 },
  rightTaper1: { x: 344, y: 255 },
  rightTaper2: { x: 306, y: 365 },
  rightTaper3: { x: 256, y: 470 },
  bottomTip: { x: 232, y: 566 },
  leftTaper3: { x: 196, y: 470 },
  leftTaper2: { x: 146, y: 365 },
  leftTaper1: { x: 100, y: 255 },
  waterlineLeft: { x: 65, y: 172 },
  facetBEnd: { x: 278, y: 468 },
}

// Plausible jitter range per outline point — randomizing stays "an
// iceberg" rather than "any polygon" because each point only ever moves
// within a small box around its default position, never anywhere on the
// canvas.
const OUTLINE_JITTER: Record<OutlineKey, { x: [number, number]; y: [number, number] }> = {
  leftPeakApex: { x: [160, 220], y: [25, 85] },
  valleyDip: { x: [205, 245], y: [75, 115] },
  rightPeakApex: { x: [250, 315], y: [5, 50] },
  waterlineRight: { x: [340, 400], y: [155, 190] },
  rightTaper1: { x: [310, 370], y: [230, 280] },
  rightTaper2: { x: [270, 330], y: [340, 390] },
  rightTaper3: { x: [220, 290], y: [445, 495] },
  bottomTip: { x: [200, 260], y: [540, 585] },
  leftTaper3: { x: [160, 230], y: [445, 495] },
  leftTaper2: { x: [110, 170], y: [340, 390] },
  leftTaper1: { x: [70, 130], y: [230, 280] },
  waterlineLeft: { x: [40, 100], y: [155, 190] },
  facetBEnd: { x: [240, 310], y: [440, 495] },
}

function randInRange([min, max]: [number, number]): number {
  return Math.round(min + Math.random() * (max - min))
}

function randomizeOutlinePoints(): Record<OutlineKey, Point> {
  const next = {} as Record<OutlineKey, Point>
  for (const key of [...OUTLINE_ORDER, "facetBEnd" as OutlineKey]) {
    const range = OUTLINE_JITTER[key]
    next[key] = { x: randInRange(range.x), y: randInRange(range.y) }
  }
  return next
}

function randomTriangleAround(cx: number, cy: number, size: number): Point[] {
  const points: Point[] = []
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 * i) / 3 + Math.random() * 1.2
    const radius = size * (0.7 + Math.random() * 0.6)
    points.push({
      x: Math.round(cx + Math.cos(angle) * radius),
      y: Math.round(cy + Math.sin(angle) * radius),
    })
  }
  return points
}

// Random facets always use black (shadow) or white (highlight) at
// varying opacity, never a fixed hue — that reads as shading on top of
// *any* base fill color, rather than only looking right on one.
function randomizeFacetSet(): { facets: Facet[]; points: Record<string, Point> } {
  const count = 4 + Math.floor(Math.random() * 4) // 4..7
  const facets: Facet[] = []
  const points: Record<string, Point> = {}
  for (let i = 0; i < count; i++) {
    const cx = randInRange([70, 390])
    const cy = randInRange([30, 550])
    const size = randInRange([50, 140])
    const isHighlight = Math.random() > 0.5
    const id = nextFacetId()
    const shapePoints = randomTriangleAround(cx, cy, size)
    const pointKeys = shapePoints.map((p, index) => {
      const key = `${id}-${index}`
      points[key] = p
      return key
    })
    facets.push({
      id,
      label: isHighlight ? "Random highlight" : "Random shadow",
      color: isHighlight ? "#ffffff" : "#000000",
      opacity: isHighlight ? randInRange([8, 25]) / 100 : randInRange([15, 40]) / 100,
      visible: true,
      pointKeys,
    })
  }
  return { facets, points }
}

// --- Shading facets — the "how do I add shadows" answer -----------------
//
// A facet is just a small polygon, clipped to the outline so it can
// never spill outside the silhouette, drawn on top of the flat base
// fill with its own color/opacity. Layer a light one where the "sun"
// hits and a dark one where it doesn't, and the flat shape starts
// reading as faceted ice instead of a single flat block.
interface Facet {
  id: string
  label: string
  color: string
  opacity: number
  visible: boolean
  pointKeys: string[]
}

let facetCounter = 0
function nextFacetId(): string {
  facetCounter += 1
  return `facet${facetCounter}`
}

function defaultQuadAround(cx: number, cy: number, size: number): Point[] {
  return [
    { x: cx - size, y: cy - size },
    { x: cx + size, y: cy - size },
    { x: cx + size, y: cy + size },
    { x: cx - size, y: cy + size },
  ]
}

function initialFacets(): { facets: Facet[]; points: Record<string, Point> } {
  const defs: { label: string; color: string; opacity: number; points: Point[] }[] = [
    {
      label: "Peak highlight",
      color: "#6b6b67",
      opacity: 0.9,
      points: [
        { x: 276, y: 16 },
        { x: 330, y: 150 },
        { x: 260, y: 150 },
        { x: 224, y: 96 },
      ],
    },
    {
      label: "Peak shadow",
      color: "#0b0b0a",
      opacity: 0.35,
      points: [
        { x: 192, y: 55 },
        { x: 224, y: 96 },
        { x: 200, y: 172 },
        { x: 100, y: 172 },
      ],
    },
    {
      label: "Body shadow",
      color: "#0b0b0a",
      opacity: 0.3,
      points: [
        { x: 65, y: 172 },
        { x: 232, y: 200 },
        { x: 232, y: 566 },
        { x: 140, y: 400 },
      ],
    },
  ]

  const facets: Facet[] = []
  const points: Record<string, Point> = {}
  for (const def of defs) {
    const id = nextFacetId()
    const pointKeys = def.points.map((p, index) => {
      const key = `${id}-${index}`
      points[key] = p
      return key
    })
    facets.push({ id, label: def.label, color: def.color, opacity: def.opacity, visible: true, pointKeys })
  }
  return { facets, points }
}

function buildOutlinePath(points: Record<string, Point>): string {
  const [first, ...rest] = OUTLINE_ORDER.map((key) => points[key])
  return `M ${first.x},${first.y} L ${rest.map((p) => `${p.x},${p.y}`).join(" L ")} Z`
}

function facetPointsAttr(points: Record<string, Point>, keys: string[]): string {
  return keys.map((key) => `${points[key].x},${points[key].y}`).join(" ")
}

function buildWaterlinePath(y: number, left: number, right: number, amplitude: number): string {
  const segments = 4
  const step = (right - left) / segments
  let d = `M ${left.toFixed(0)},${y.toFixed(0)}`
  for (let i = 0; i < segments; i++) {
    const x1 = left + step * i
    const x2 = left + step * (i + 1)
    const midX = (x1 + x2) / 2
    const dir = i % 2 === 0 ? -1 : 1
    d += ` Q ${midX.toFixed(0)},${(y + dir * amplitude).toFixed(0)} ${x2.toFixed(0)},${y.toFixed(0)}`
  }
  return d
}

const PRESET_FILLS = [
  { label: "Charcoal", value: "#1a1a18" },
  { label: "Near black", value: "#0b0b0a" },
  { label: "Mid gray", value: "#4a4a47" },
  { label: "Slate blue", value: "#2a3a52" },
]

function pointLabel(key: string, facets: Facet[]): string {
  if (key in OUTLINE_LABELS) return OUTLINE_LABELS[key as OutlineKey]
  for (const facet of facets) {
    const index = facet.pointKeys.indexOf(key)
    if (index !== -1) return `${facet.label} — corner ${index + 1}`
  }
  return key
}

export default function IcebergMakerPage() {
  const [{ facets: initFacets, points: initFacetPoints }] = useState(initialFacets)
  const [points, setPoints] = useState<Record<string, Point>>({
    ...DEFAULT_OUTLINE_POINTS,
    ...initFacetPoints,
  })
  const [facets, setFacets] = useState<Facet[]>(initFacets)
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string>("rightPeakApex")
  const [fillColor, setFillColor] = useState("#1a1a18")
  const [waveAmplitude, setWaveAmplitude] = useState(8)
  const [background, setBackground] = useState<"light" | "dark">("light")
  const [showGrid, setShowGrid] = useState(true)
  const [showHandles, setShowHandles] = useState(true)
  const [previewScale, setPreviewScale] = useState(1)
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const [labColors, setLabColors] = useState<Record<"light" | "dark", LabColorSet>>(LAB_DEFAULT_COLORS)
  const [labTheme, setLabTheme] = useState<"light" | "dark">("light")
  const [labCopied, setLabCopied] = useState(false)

  useEffect(() => {
    if (!draggingKey) return
    const key = draggingKey

    function toSvgPoint(clientX: number, clientY: number): Point {
      const svg = svgRef.current
      if (!svg) return { x: 0, y: 0 }
      const rect = svg.getBoundingClientRect()
      const x = Math.round(((clientX - rect.left) / rect.width) * WIDTH)
      const y = Math.round(((clientY - rect.top) / rect.height) * HEIGHT)
      return { x: Math.max(0, Math.min(WIDTH, x)), y: Math.max(0, Math.min(HEIGHT, y)) }
    }

    function handleMove(event: PointerEvent) {
      const next = toSvgPoint(event.clientX, event.clientY)
      setPoints((prev) => ({ ...prev, [key]: next }))
    }
    function handleUp() {
      setDraggingKey(null)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [draggingKey])

  if (process.env.NODE_ENV === "production") {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">
          /dev/iceberg-maker is a development-only tool and isn&apos;t available in production.
        </p>
      </main>
    )
  }

  const outlinePath = buildOutlinePath(points)
  const facetLineA = `M ${points.valleyDip.x},${points.valleyDip.y} L ${points.bottomTip.x},${points.bottomTip.y}`
  const facetLineB = `M ${points.waterlineRight.x},${points.waterlineRight.y} L ${points.facetBEnd.x},${points.facetBEnd.y}`
  const waterlineY = (points.waterlineLeft.y + points.waterlineRight.y) / 2
  const waterlinePath = buildWaterlinePath(
    waterlineY,
    points.waterlineLeft.x - 35,
    points.waterlineRight.x + 35,
    waveAmplitude
  )

  const generatedCode = `const ICEBERG_PATH = \`
  M ${points.leftPeakApex.x},${points.leftPeakApex.y}
  L ${points.valleyDip.x},${points.valleyDip.y}
  L ${points.rightPeakApex.x},${points.rightPeakApex.y}
  L ${points.waterlineRight.x},${points.waterlineRight.y}
  L ${points.rightTaper1.x},${points.rightTaper1.y}
  L ${points.rightTaper2.x},${points.rightTaper2.y}
  L ${points.rightTaper3.x},${points.rightTaper3.y}
  L ${points.bottomTip.x},${points.bottomTip.y}
  L ${points.leftTaper3.x},${points.leftTaper3.y}
  L ${points.leftTaper2.x},${points.leftTaper2.y}
  L ${points.leftTaper1.x},${points.leftTaper1.y}
  L ${points.waterlineLeft.x},${points.waterlineLeft.y}
  Z
\`

const FACET_LINES = [
  "M ${points.valleyDip.x},${points.valleyDip.y} L ${points.bottomTip.x},${points.bottomTip.y}",
  "M ${points.waterlineRight.x},${points.waterlineRight.y} L ${points.facetBEnd.x},${points.facetBEnd.y}",
]

// One <polygon> per shading facet — render each clipped to the outline
// (clipPath="url(#iceberg-clip)"), in this order, between the base fill
// and the outline stroke.
const SHADING_FACETS = [
${facets
  .map(
    (facet) =>
      `  { label: "${facet.label}", color: "${facet.color}", opacity: ${facet.opacity}, points: "${facetPointsAttr(points, facet.pointKeys)}" },`
  )
  .join("\n")}
]

// Fill: ${fillColor}
// Waterline wave amplitude: ${waveAmplitude}
// Waterline y (average of the two waterline points): ${waterlineY.toFixed(0)}
`

  function updateSelectedCoord(axis: "x" | "y", value: number) {
    setPoints((prev) => ({ ...prev, [selectedKey]: { ...prev[selectedKey], [axis]: value } }))
  }

  function updateFacet(id: string, patch: Partial<Facet>) {
    setFacets((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  function addFacet() {
    const id = nextFacetId()
    const newPoints = defaultQuadAround(WIDTH / 2, HEIGHT / 2, 40)
    const pointKeys = newPoints.map((p, index) => {
      const key = `${id}-${index}`
      setPoints((prev) => ({ ...prev, [key]: p }))
      return key
    })
    setFacets((prev) => [
      ...prev,
      { id, label: `Facet ${prev.length + 1}`, color: "#0b0b0a", opacity: 0.3, visible: true, pointKeys },
    ])
  }

  function removeFacet(id: string) {
    const facet = facets.find((f) => f.id === id)
    if (!facet) return
    setFacets((prev) => prev.filter((f) => f.id !== id))
    setPoints((prev) => {
      const next = { ...prev }
      for (const key of facet.pointKeys) delete next[key]
      return next
    })
    if (facet.pointKeys.includes(selectedKey)) setSelectedKey("rightPeakApex")
  }

  function randomizeOutline() {
    setPoints((prev) => ({ ...prev, ...randomizeOutlinePoints() }))
  }

  function randomizeFacets() {
    // Drop every current facet's points, then bring in a fresh random set.
    setPoints((prev) => {
      const next = { ...prev }
      for (const facet of facets) {
        for (const key of facet.pointKeys) delete next[key]
      }
      return next
    })
    const { facets: newFacets, points: newPoints } = randomizeFacetSet()
    setFacets(newFacets)
    setPoints((prev) => ({ ...prev, ...newPoints }))
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function updateLabColor(key: keyof LabColorSet, value: string) {
    setLabColors((prev) => ({ ...prev, [labTheme]: { ...prev[labTheme], [key]: value } }))
  }

  function resetLabColors() {
    setLabColors((prev) => ({ ...prev, [labTheme]: LAB_DEFAULT_COLORS[labTheme] }))
  }

  const labCss = `:root {
${LAB_COLOR_FIELDS.map((field) => `    ${field.cssVar}: ${labColors.light[field.key]};`).join("\n")}
}

.dark {
${LAB_COLOR_FIELDS.map((field) => `    ${field.cssVar}: ${labColors.dark[field.key]};`).join("\n")}
}`

  async function copyLabCss() {
    await navigator.clipboard.writeText(labCss)
    setLabCopied(true)
    setTimeout(() => setLabCopied(false), 1500)
  }

  const bgColor = background === "light" ? "#fcfcfb" : "#0d0d0d"
  const textMuted = background === "light" ? "#89877f" : "#7a7a76"

  return (
    <main className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Iceberg maker</h1>
        <p className="text-sm text-muted-foreground">
          Drag the outline points until the silhouette reads as an iceberg, then layer shading
          facets on top for light/shadow, and copy the generated code into{" "}
          <code className="font-mono text-xs">iceberg-diagram.tsx</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Color lab — current production iceberg</CardTitle>
          <CardDescription>
            The exact shape and stretch geometry currently live on /admin/iceberg — try colors
            against it here, then copy the CSS below into app/globals.css once it looks right.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div
              className="mx-auto w-full overflow-hidden rounded-lg border border-border/60"
              style={{ maxWidth: 420, backgroundColor: labTheme === "light" ? "#fcfcfb" : "#0d0d0d" }}
            >
              <svg
                viewBox={`0 0 ${PROD_CANVAS_WIDTH} ${PROD_CANVAS_HEIGHT}`}
                width="100%"
                style={{ display: "block", shapeRendering: "geometricPrecision" }}
              >
                {PROD_SHAPES.map((shape) => (
                  <polygon
                    key={shape.id}
                    points={prodPointsAttr(prodRenderedPoints(shape))}
                    fill={labColors[labTheme][shape.colorKey]}
                    stroke="none"
                  />
                ))}
              </svg>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Theme</Label>
                <Button
                  type="button"
                  size="sm"
                  variant={labTheme === "light" ? "secondary" : "outline"}
                  onClick={() => setLabTheme("light")}
                >
                  Light
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={labTheme === "dark" ? "secondary" : "outline"}
                  onClick={() => setLabTheme("dark")}
                >
                  Dark
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={resetLabColors}>
                  Reset {labTheme}
                </Button>
              </div>

              <div className="flex flex-col gap-2.5">
                {LAB_COLOR_FIELDS.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">{field.label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={labColors[labTheme][field.key]}
                        onChange={(event) => updateLabColor(field.key, event.target.value)}
                        className="size-8 shrink-0 cursor-pointer rounded border border-input bg-transparent"
                      />
                      <Input
                        value={labColors[labTheme][field.key]}
                        onChange={(event) => updateLabColor(field.key, event.target.value)}
                        className="h-8 font-mono text-xs"
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground/70">{field.cssVar}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <pre className="max-h-56 overflow-auto rounded-lg border border-border/60 bg-muted/40 p-3 text-[11px] leading-relaxed text-foreground">
              {labCss}
            </pre>
            <Button type="button" onClick={copyLabCss} className="w-fit">
              {labCopied ? "Copied!" : "Copy CSS (both themes)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reference trace (exact)</CardTitle>
          <CardDescription>
            A verbatim replica of the traced icon — 512×512, top-left origin, flat fills only, no
            strokes or gradients, transparent background, rendered in the exact draw order given
            (waterline last, on top). Static and non-interactive by design — it exists purely to
            compare against the editable maker below, not to be dragged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="mx-auto max-w-xs overflow-hidden rounded-lg border border-dashed border-border/60"
            style={{
              backgroundImage:
                "linear-gradient(45deg, var(--muted) 25%, transparent 25%), linear-gradient(-45deg, var(--muted) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--muted) 75%), linear-gradient(-45deg, transparent 75%, var(--muted) 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            }}
          >
            <svg
              viewBox={`0 0 ${REFERENCE_CANVAS} ${REFERENCE_CANVAS}`}
              width="100%"
              style={{ display: "block", shapeRendering: "geometricPrecision" }}
            >
              {REFERENCE_SHAPES.map((shape) => (
                <polygon key={shape.id} points={referencePointsAttr(shape.points)} fill={shape.fill} stroke="none" />
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Canvas</CardTitle>
            <CardDescription>
              Orange handles are the outline; colored handles are shading facet corners. Click one
              to select it, or drag it directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="mx-auto overflow-hidden rounded-lg border border-border/60"
              style={{ width: `${WIDTH * previewScale}px`, maxWidth: "100%" }}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                width="100%"
                style={{ backgroundColor: bgColor, display: "block", touchAction: "none" }}
              >
                <defs>
                  <clipPath id="iceberg-clip">
                    <path d={outlinePath} />
                  </clipPath>
                </defs>

                {showGrid ? (
                  <g>
                    {Array.from({ length: Math.floor(WIDTH / 20) }, (_, i) => (
                      <line
                        key={`v${i}`}
                        x1={i * 20}
                        y1={0}
                        x2={i * 20}
                        y2={HEIGHT}
                        stroke={textMuted}
                        strokeOpacity={0.08}
                      />
                    ))}
                    {Array.from({ length: Math.floor(HEIGHT / 20) }, (_, i) => (
                      <line
                        key={`h${i}`}
                        x1={0}
                        y1={i * 20}
                        x2={WIDTH}
                        y2={i * 20}
                        stroke={textMuted}
                        strokeOpacity={0.08}
                      />
                    ))}
                    <line x1={WIDTH / 2} y1={0} x2={WIDTH / 2} y2={HEIGHT} stroke={textMuted} strokeOpacity={0.2} />
                  </g>
                ) : null}

                {/* Base flat fill. */}
                <path d={outlinePath} fill={fillColor} />

                {/* Shading facets — clipped to the outline, drawn in
                 * list order (later ones on top of earlier ones). */}
                {facets.map(
                  (facet) =>
                    facet.visible && (
                      <polygon
                        key={facet.id}
                        points={facetPointsAttr(points, facet.pointKeys)}
                        fill={facet.color}
                        opacity={facet.opacity}
                        clipPath="url(#iceberg-clip)"
                      />
                    )
                )}

                <path d={outlinePath} fill="none" stroke={textMuted} strokeWidth={1.5} strokeLinejoin="round" />
                <path d={facetLineA} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={1.5} />
                <path d={facetLineB} fill="none" stroke="#ffffff" strokeOpacity={0.1} strokeWidth={1.5} />
                <path d={waterlinePath} fill="none" stroke={textMuted} strokeWidth={2} strokeLinecap="round" />

                {showHandles
                  ? [
                      ...OUTLINE_ORDER.map((key) => ({ key, color: "#eda100" })),
                      { key: "facetBEnd" as string, color: "#eda100" },
                      ...facets.flatMap((facet) =>
                        facet.pointKeys.map((key) => ({ key, color: "#1baf7a" }))
                      ),
                    ].map(({ key, color }) => {
                      const p = points[key]
                      const isSelected = key === selectedKey
                      return (
                        <circle
                          key={key}
                          cx={p.x}
                          cy={p.y}
                          r={isSelected ? 8 : 6}
                          fill={isSelected ? "#2a78d6" : color}
                          stroke="#ffffff"
                          strokeWidth={2}
                          className="cursor-grab active:cursor-grabbing"
                          onPointerDown={(event) => {
                            event.preventDefault()
                            setSelectedKey(key)
                            setDraggingKey(key)
                          }}
                        />
                      )
                    })
                  : null}
              </svg>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Preview size</Label>
                <div className="w-32">
                  <Slider
                    value={[previewScale * 100]}
                    min={50}
                    max={150}
                    step={5}
                    onValueChange={(value) => setPreviewScale((Array.isArray(value) ? value[0] : value) / 100)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Background</Label>
                <Button
                  type="button"
                  size="sm"
                  variant={background === "light" ? "secondary" : "outline"}
                  onClick={() => setBackground("light")}
                >
                  Light
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={background === "dark" ? "secondary" : "outline"}
                  onClick={() => setBackground("dark")}
                >
                  Dark
                </Button>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowGrid((v) => !v)}>
                {showGrid ? "Hide grid" : "Show grid"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowHandles((v) => !v)}>
                {showHandles ? "Hide handles" : "Show handles"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPoints((prev) => ({ ...prev, ...DEFAULT_OUTLINE_POINTS }))}
              >
                Reset outline
              </Button>
              <Button type="button" size="sm" onClick={randomizeOutline}>
                🎲 Randomize shape
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected point</CardTitle>
              <CardDescription>{pointLabel(selectedKey, facets)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                {[...OUTLINE_ORDER, "facetBEnd" as OutlineKey].map((key) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={key === selectedKey ? "secondary" : "outline"}
                    className="justify-start text-xs"
                    onClick={() => setSelectedKey(key)}
                  >
                    {OUTLINE_LABELS[key]}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">X</Label>
                  <Input
                    type="number"
                    value={points[selectedKey]?.x ?? 0}
                    onChange={(event) => updateSelectedCoord("x", Number(event.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Y</Label>
                  <Input
                    type="number"
                    value={points[selectedKey]?.y ?? 0}
                    onChange={(event) => updateSelectedCoord("y", Number(event.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shading facets</CardTitle>
              <CardDescription>
                Each facet is a small polygon clipped to the outline — a light one plus a dark one
                is usually enough to fake a &quot;sun hits one side&quot; look.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {facets.map((facet) => (
                <div key={facet.id} className="flex flex-col gap-2 rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-auto justify-start p-0 text-sm font-medium"
                      onClick={() => updateFacet(facet.id, { visible: !facet.visible })}
                    >
                      {facet.visible ? "●" : "○"} {facet.label}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => removeFacet(facet.id)}>
                      Remove
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={facet.color}
                      onChange={(event) => updateFacet(facet.id, { color: event.target.value })}
                      className="size-8 shrink-0 cursor-pointer rounded border border-input bg-transparent"
                    />
                    <Input
                      value={facet.color}
                      onChange={(event) => updateFacet(facet.id, { color: event.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-16 shrink-0 text-xs text-muted-foreground">
                      Opacity {Math.round(facet.opacity * 100)}%
                    </Label>
                    <Slider
                      value={[facet.opacity * 100]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) =>
                        updateFacet(facet.id, { opacity: (Array.isArray(value) ? value[0] : value) / 100 })
                      }
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={addFacet}>
                  + Add facet
                </Button>
                <Button type="button" className="flex-1" onClick={randomizeFacets}>
                  🎲 Randomize shading
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base fill &amp; waterline</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Fill color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(event) => setFillColor(event.target.value)}
                    className="size-9 shrink-0 cursor-pointer rounded border border-input bg-transparent"
                  />
                  <Input value={fillColor} onChange={(event) => setFillColor(event.target.value)} />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_FILLS.map((preset) => (
                    <Button
                      key={preset.value}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setFillColor(preset.value)}
                    >
                      <span
                        className="mr-1.5 inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: preset.value }}
                      />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Wave amplitude ({waveAmplitude}px)</Label>
                <Slider
                  value={[waveAmplitude]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={(value) => setWaveAmplitude(Array.isArray(value) ? value[0] : value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>Copy this into iceberg-diagram.tsx once it looks right.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <pre className="max-h-64 overflow-auto rounded-lg border border-border/60 bg-muted/40 p-3 text-[11px] leading-relaxed text-foreground">
                {generatedCode}
              </pre>
              <Button type="button" onClick={copyCode} className="w-fit">
                {copied ? "Copied!" : "Copy code"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
          Dev only
        </Badge>
        <p className="text-xs text-muted-foreground">
          Not linked from anywhere in the app — this route stays reachable only by URL, and is
          disabled outside development.
        </p>
      </div>
    </main>
  )
}
