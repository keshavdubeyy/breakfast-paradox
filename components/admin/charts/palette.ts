import { BRANCH_LABELS, BRANCHES } from "@/lib/analytics/patterns/normalization"
import type { Branch } from "@/lib/analytics/types"

// Chart color system for Patterns — see the data-viz palette this was
// validated against (categorical slots 1-3 clear every CVD/contrast gate
// in both light and dark mode as an all-pairs-safe trio). Every value
// here is a CSS custom property defined in app/globals.css (with a
// separate, re-validated .dark set) — components reference the role,
// never a raw hex, so light/dark stay in one place.

/** The one branch -> color mapping used everywhere on Patterns (stacked
 * bars, heatmap legends, dot plots) — defined once so "Regular eaters is
 * always blue" holds across every chart on the page, per the "color
 * follows the entity" rule. */
export const BRANCH_COLOR_VAR: Record<Branch, string> = {
  A: "var(--cat-0)",
  B: "var(--cat-1)",
  C: "var(--cat-2)",
}

export const BRANCH_SEGMENTS = BRANCHES.map((branch) => ({
  key: branch,
  label: BRANCH_LABELS[branch],
  colorVar: BRANCH_COLOR_VAR[branch],
}))

/** Fixed categorical order for ad hoc groupings (Explorer categories)
 * that aren't the branch triad — slot order is the CVD-safety mechanism
 * (see the palette doc), so this must stay a lookup by index, never a
 * per-render color assignment. Beyond 8 categories, callers should fold
 * the tail into "Other" rather than requesting a 9th color. */
export function categoricalColorVar(index: number): string {
  return `var(--cat-${index % 8})`
}

/** The sequential heatmap ramp has 13 steps (0 = near-zero, 12 = highest
 * magnitude); .dark redefines the same 13 custom properties in reverse so
 * low values still recede toward whichever surface is active. */
const HEAT_STEPS = 13

export function heatColorVar(percentage: number | null): string {
  if (percentage === null) return "var(--muted)"
  const clamped = Math.max(0, Math.min(100, percentage))
  const index = Math.round((clamped / 100) * (HEAT_STEPS - 1))
  return `var(--heat-${index})`
}

/** Whether a heatmap cell at this percentage needs light (near-white)
 * text instead of dark ink to stay readable — computed once from the
 * light-mode ramp's relative luminance (steps 0-5 stay light enough for
 * dark text; 6+ need light text). Dark mode reverses which hex sits at
 * which percentage, but pairs the same step index with the same relative
 * luminance, so this cutoff holds in both modes. */
export function heatNeedsLightText(percentage: number | null): boolean {
  if (percentage === null) return false
  const clamped = Math.max(0, Math.min(100, percentage))
  const index = Math.round((clamped / 100) * (HEAT_STEPS - 1))
  return index >= 6
}
