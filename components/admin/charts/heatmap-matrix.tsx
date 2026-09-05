"use client"

import { useState } from "react"

import { heatColorVar, heatNeedsLightText } from "@/components/admin/charts/palette"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SampleFlag } from "@/lib/analytics/patterns/types"

export interface HeatmapColumnDef {
  key: string
  label: string
}

export interface HeatmapCellData {
  /** 0-100. The value the cell's color intensity encodes — null when
   * this row/column combination has no eligible respondents at all
   * (distinct from a suppressed-but-eligible cell, which still gets a
   * flag and an n). */
  value: number | null
  n: number
  flag: SampleFlag
  /** Extra rows shown in the hover tooltip only (median/mean/top-box —
   * whatever the caller already computed) so the cell itself can stay a
   * single number. */
  detail?: { label: string; value: string }[]
}

export interface HeatmapRowData {
  key: string
  label: string
  /** Keyed by column key — a column with no entry renders as empty. */
  cells: Record<string, HeatmapCellData>
  /** Used for the optional "biggest difference" sort. */
  sortMetric?: number | null
}

interface HeatmapMatrixProps {
  rows: HeatmapRowData[]
  columns: HeatmapColumnDef[]
  rowHeaderLabel: string
  valueSuffix?: string
  /** e.g. "Multiple selections were allowed." for multi-select prevalence. */
  caption?: string
  /** Enables the "biggest difference / overall" sort toggle — omit for
   * matrices with only one sensible order (e.g. a fixed ordinal axis). */
  sortable?: boolean
}

/** One row per factor/belief/option, one column per group — cell color
 * intensity (a single sequential ramp) encodes the primary percentage;
 * everything else the caller already computed (median, mean, top-box, n)
 * moves into the hover tooltip instead of competing with the color for
 * attention. Suppressed cells never show a value or a color — colored
 * intensity from a single-digit n is exactly the "confident-looking
 * number built from a handful of people" suppression exists to prevent. */
export function HeatmapMatrix({
  rows,
  columns,
  rowHeaderLabel,
  valueSuffix = "%",
  caption,
  sortable = false,
}: HeatmapMatrixProps) {
  const [sortMode, setSortMode] = useState<"gap" | "overall">("gap")

  const sortedRows =
    sortable && sortMode === "overall"
      ? [...rows].sort((a, b) => (overallAverage(b) ?? -1) - (overallAverage(a) ?? -1))
      : [...rows].sort((a, b) => (b.sortMetric ?? -1) - (a.sortMetric ?? -1))

  return (
    <div className="flex flex-col gap-2">
      {sortable ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Sort by</span>
          <Button
            type="button"
            size="sm"
            variant={sortMode === "gap" ? "secondary" : "outline"}
            onClick={() => setSortMode("gap")}
          >
            Biggest difference
          </Button>
          <Button
            type="button"
            size="sm"
            variant={sortMode === "overall" ? "secondary" : "outline"}
            onClick={() => setSortMode("overall")}
          >
            Overall
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="min-w-48 px-3 py-2 text-left font-medium text-muted-foreground">
                {rowHeaderLabel}
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-2 py-2 text-center font-medium text-muted-foreground"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.key} className="border-t border-border/60">
                <td className="max-w-56 px-3 py-2 align-middle font-medium whitespace-normal text-foreground">
                  {row.label}
                </td>
                {columns.map((column) => {
                  const cell = row.cells[column.key]
                  return (
                    <td key={column.key} className="px-1.5 py-1.5 text-center align-middle">
                      <HeatmapCell cell={cell} valueSuffix={valueSuffix} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
    </div>
  )
}

function overallAverage(row: HeatmapRowData): number | null {
  const values = Object.values(row.cells)
    .map((cell) => cell.value)
    .filter((value): value is number => value !== null)
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function HeatmapCell({
  cell,
  valueSuffix,
}: {
  cell: HeatmapCellData | undefined
  valueSuffix: string
}) {
  if (!cell || cell.value === null) {
    return <div className="rounded-md py-2 text-xs text-muted-foreground">—</div>
  }

  if (cell.flag === "suppressed") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <div className="flex flex-col items-center gap-0.5 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground">
              <span>—</span>
            </div>
          }
        />
        <TooltipContent>Not enough responses to display safely (n = {cell.n}).</TooltipContent>
      </Tooltip>
    )
  }

  const lightText = heatNeedsLightText(cell.value)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className="relative flex items-center justify-center gap-1 rounded-md py-2 text-xs font-medium tabular-nums"
            style={{
              backgroundColor: heatColorVar(cell.value),
              color: lightText ? "#ffffff" : "#0b0b0b",
            }}
          >
            {cell.value}
            {valueSuffix}
            {cell.flag === "small" ? (
              <span
                aria-hidden
                className="absolute top-0.5 right-0.5 size-1.5 rounded-full"
                style={{ backgroundColor: lightText ? "#ffffff" : "#0b0b0b", opacity: 0.6 }}
              />
            ) : null}
          </div>
        }
      />
      <TooltipContent>
        <div className="flex flex-col gap-0.5">
          <span>
            {cell.value}
            {valueSuffix} · n = {cell.n}
            {cell.flag === "small" ? " (small sample)" : ""}
          </span>
          {cell.detail?.map((row) => (
            <span key={row.label} className="text-background/70">
              {row.label}: {row.value}
            </span>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
