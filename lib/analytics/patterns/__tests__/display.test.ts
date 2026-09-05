import { describe, expect, it } from "vitest"

import type { LikertMatrix, RowPercentageTable } from "../types"
import {
  likertMatrixToDotRows,
  likertMatrixToHeatmapRows,
  rowPercentageTableToBars,
} from "../display"

describe("rowPercentageTableToBars", () => {
  it("carries every row's branch percentages, counts, n and flag through unchanged", () => {
    const table: RowPercentageTable = {
      rows: [
        {
          key: "3",
          label: "3 days",
          percentageByBranch: { A: 40, B: 35, C: 25 },
          countByBranch: { A: 8, B: 7, C: 5 },
          n: 20,
          flag: "small",
        },
      ],
      eligibility: { totalFiltered: 25, eligible: 22, answered: 20, missing: 2 },
    }

    const [bar] = rowPercentageTableToBars(table)
    expect(bar.key).toBe("3")
    expect(bar.label).toBe("3 days")
    expect(bar.n).toBe(20)
    expect(bar.flag).toBe("small")
    expect(bar.percentageBySegment).toEqual({ A: 40, B: 35, C: 25 })
    expect(bar.countBySegment).toEqual({ A: 8, B: 7, C: 5 })
  })
})

function makeMatrix(): LikertMatrix {
  return {
    rows: [
      {
        key: "sleep",
        label: "Sleep",
        meanByBranch: { A: 3.2, B: 2.1, C: null },
        medianByBranch: { A: 3, B: 2, C: null },
        topBoxPercentageByBranch: { A: 72, B: 40, C: null },
        nByBranch: { A: 30, B: 12, C: 2 },
        flagByBranch: { A: "ok", B: "small", C: "suppressed" },
        largestGap: 1.1,
      },
    ],
    eligibility: { totalFiltered: 50, eligible: 44, answered: 44, missing: 0 },
  }
}

describe("likertMatrixToHeatmapRows", () => {
  it("uses topBoxPercentageByBranch as the cell value and moves median/mean into detail", () => {
    const [row] = likertMatrixToHeatmapRows(makeMatrix())
    expect(row.cells.A.value).toBe(72)
    expect(row.cells.A.flag).toBe("ok")
    expect(row.cells.A.detail).toEqual([
      { label: "Median", value: "3" },
      { label: "Mean", value: "3.20" },
    ])
    expect(row.cells.C.value).toBeNull()
    expect(row.cells.C.flag).toBe("suppressed")
    expect(row.sortMetric).toBe(1.1)
  })
})

describe("likertMatrixToDotRows", () => {
  it("positions each branch's dot at its median, keeping mean as a tooltip detail", () => {
    const [row] = likertMatrixToDotRows(makeMatrix())
    const a = row.points.find((p) => p.seriesKey === "A")!
    expect(a.value).toBe(3)
    expect(a.detail).toBe("mean 3.20")
    const c = row.points.find((p) => p.seriesKey === "C")!
    expect(c.value).toBeNull()
    expect(c.flag).toBe("suppressed")
  })
})
