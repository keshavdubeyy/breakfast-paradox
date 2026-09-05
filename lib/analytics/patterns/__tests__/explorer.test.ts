import { describe, expect, it } from "vitest"

import type { AnalyticsRow } from "../../types"
import {
  analyzeRelationship,
  analyzeRelationshipBySegment,
  computePrevalenceByGroup,
  eligibleRowsFor,
  EXPLORER_FIELDS,
  getExplorerField,
  type ExplorerFieldMeta,
} from "../explorer"

function makeRow(overrides: Partial<AnalyticsRow> & { id: string }): AnalyticsRow {
  return {
    surveyVersion: 1,
    createdAt: "2026-09-01T08:00:00.000Z",
    startedAt: "2026-09-01T07:50:00.000Z",
    durationSeconds: 600,
    durationMinutes: 10,
    year: "2",
    hostel: "parijat",
    earlyCommitmentDays: "3",
    program: null,
    gender: null,
    sleepTimeWeekend: null,
    wakeTimeWeekend: null,
    beforeSleepActivities: [],
    beforeSleepMostTime: null,
    morningActivities: [],
    messDecision: null,
    messFoodQuality: null,
    messBreakfastTime: null,
    breakfastMoment: null,
    breakfastRoutineDuration: null,
    earlyClassRoutineChange: null,
    earlyClassRoutineChangeActions: [],
    unwantedMessActions: [],
    messConsistency: null,
    messChangeDeterminants: [],
    breakfastRoutineDescription: null,
    breakfastMotivationFactors: [],
    conditionalMessBreakfastTime: null,
    breakfastDecisionPoint: null,
    breakfastDayDifferentiators: [],
    breakfastAbsenceReason: null,
    breakfastAbsenceDecisionPoint: null,
    occasionalBreakfastFrequency: null,
    occasionalBreakfastDifferentiators: [],
    breakfastFrequencyChanged: null,
    weekendDifferentiators: [],
    previousNightAffectsBreakfast: null,
    previousNightFactors: [],
    influenceRatings: {},
    biggestInfluenceFactor: null,
    agreementRatings: {},
    mealValuePerception: null,
    breakfastImprovementOptions: [],
    semesterBreakfastChangeDescription: null,
    breakfastFrequencyChangeDescription: null,
    breakfastSystemChangeSuggestion: null,
    breakfastFrequency: "most-days",
    branch: "A",
    wakeTimeWeekday: null,
    earlyCommitmentBreakfastFrequency: null,
    noEarlyCommitmentBreakfastFrequency: null,
    weekendBreakfastComparison: null,
    semesterBreakfastChange: null,
    sleepTimeWeekday: null,
    breakfastPlanChangeFrequency: null,
    breakfastPlanChangeActions: [],
    missedBreakfastFrequency: null,
    missedBreakfastReasons: [],
    breakfastPlannedButSkippedFrequency: null,
    breakfastUnplannedButWentFrequency: null,
    breakfastPlanChangeReasons: [],
    breakfastServedTimeActivity: null,
    unusedAllottedMealActions: [],
    nonBreakfastMealSource: [],
    nextFoodTime: null,
    nonBreakfastSpendingFrequency: null,
    nonBreakfastSpendingAmount: null,
    comparisonRatings: {},
    attentionCheckPassed: null,
    hasArchetypeResult: false,
    primaryArchetype: null,
    secondaryArchetype: null,
    archetypeConfidence: null,
    ...overrides,
  }
}

function rowsOfSize(n: number, factory: (i: number) => Partial<AnalyticsRow>): AnalyticsRow[] {
  return Array.from({ length: n }, (_, i) => makeRow({ id: `r${i}`, ...factory(i) }))
}

describe("analyzeRelationship — method selection", () => {
  it("categorical x categorical -> crosstab + Cramér's V", () => {
    const rows = rowsOfSize(10, (i) => ({
      weekendBreakfastComparison: i % 2 === 0 ? "more-often" : "less-often",
      semesterBreakfastChange: i % 2 === 0 ? "more-often-now" : "less-often-now",
    }))
    const result = analyzeRelationship(rows, "weekendBreakfastComparison", "semesterBreakfastChange")
    expect(result.status).toBe("ok")
    if (result.status === "ok") {
      expect(result.method).toBe("crosstab")
    }
  })

  it("ordinal x ordinal -> spearman", () => {
    const rows = rowsOfSize(10, (i) => ({
      sleepTimeWeekday: ["before-11pm", "11pm-12am", "12am-1am", "1am-2am", "2am-3am"][i % 5],
      wakeTimeWeekday: ["before-630am", "630-700am", "700-730am", "730-800am", "800-830am"][i % 5],
    }))
    const result = analyzeRelationship(rows, "sleepTimeWeekday", "wakeTimeWeekday")
    expect(result.status).toBe("ok")
    if (result.status === "ok") {
      expect(result.method).toBe("spearman")
    }
  })

  it("ordinal x categorical -> ordinal-by-group", () => {
    const rows = rowsOfSize(10, (i) => ({
      sleepTimeWeekday: ["before-11pm", "1am-2am"][i % 2],
      branch: (["A", "B", "C"] as const)[i % 3],
    }))
    const result = analyzeRelationship(rows, "sleepTimeWeekday", "branch")
    expect(result.status).toBe("ok")
    if (result.status === "ok") {
      expect(result.method).toBe("ordinal-by-group")
    }
  })

  it("the early/non-early paired fields -> paired-difference, not spearman", () => {
    const rows = rowsOfSize(10, (i) => ({
      earlyCommitmentBreakfastFrequency: ["rarely", "often", "sometimes"][i % 3],
      noEarlyCommitmentBreakfastFrequency: ["often", "rarely", "sometimes"][i % 3],
    }))
    const result = analyzeRelationship(
      rows,
      "earlyCommitmentBreakfastFrequency",
      "noEarlyCommitmentBreakfastFrequency"
    )
    expect(result.status).toBe("ok")
    if (result.status === "ok") {
      expect(result.method).toBe("paired-difference")
    }
  })

  it("disables a field used on a side it isn't allowed on", () => {
    const rows = rowsOfSize(10, () => ({}))
    const result = analyzeRelationship(rows, "branch", "hostel")
    expect(result.status).toBe("unsupported")
  })

  it("returns 'unsupported' for an unknown field key rather than throwing", () => {
    const rows = rowsOfSize(10, () => ({}))
    const result = analyzeRelationship(rows, "not-a-real-field", "branch")
    expect(result.status).toBe("unsupported")
  })
})

describe("analyzeRelationship — sample suppression", () => {
  it("suppresses a result below MIN_CELL_N instead of computing a misleading statistic", () => {
    const rows = rowsOfSize(3, (i) => ({
      sleepTimeWeekday: ["before-11pm", "1am-2am", "2am-3am"][i],
      wakeTimeWeekday: ["before-630am", "700-730am", "800-830am"][i],
    }))
    const result = analyzeRelationship(rows, "sleepTimeWeekday", "wakeTimeWeekday")
    expect(result.status).toBe("suppressed")
  })
})

describe("eligibleRowsFor — version-aware field availability", () => {
  const v1Only: ExplorerFieldMeta = {
    key: "synthetic",
    label: "Synthetic v1-only field",
    type: "categorical",
    section: "Test",
    surveyVersions: [1],
    allowedAsX: true,
    allowedAsY: true,
    getCategorical: () => "x",
  }

  it("excludes rows from survey versions the field doesn't support", () => {
    const rows = [
      makeRow({ id: "a", surveyVersion: 1 }),
      makeRow({ id: "b", surveyVersion: 2 }),
      makeRow({ id: "c", surveyVersion: 1 }),
    ]
    const eligible = eligibleRowsFor(rows, v1Only)
    expect(eligible.map((r) => r.id)).toEqual(["a", "c"])
  })

  it("'all' means every survey version is eligible", () => {
    const allVersions: ExplorerFieldMeta = { ...v1Only, surveyVersions: "all" }
    const rows = [makeRow({ id: "a", surveyVersion: 1 }), makeRow({ id: "b", surveyVersion: 2 })]
    expect(eligibleRowsFor(rows, allVersions)).toHaveLength(2)
  })

  it("branch eligibility restricts to the listed branches only", () => {
    const branchARestricted: ExplorerFieldMeta = {
      ...v1Only,
      surveyVersions: "all",
      branchEligibility: ["A"],
    }
    const rows = [
      makeRow({ id: "a", branch: "A" }),
      makeRow({ id: "b", branch: "B" }),
      makeRow({ id: "c", branch: null }),
    ]
    expect(eligibleRowsFor(rows, branchARestricted).map((r) => r.id)).toEqual(["a"])
  })
})

describe("computePrevalenceByGroup — multi-select x category (ready for Phase 2 fields)", () => {
  it("computes each option's prevalence within each group, not summing to 100%", () => {
    const groupField: ExplorerFieldMeta = {
      key: "branch",
      label: "Branch",
      type: "categorical",
      section: "Test",
      surveyVersions: "all",
      allowedAsX: true,
      allowedAsY: true,
      getCategorical: (row) => row.branch,
      options: [
        { value: "A", label: "Regular eaters" },
        { value: "B", label: "Conditional eaters" },
      ],
    }
    const multiField: ExplorerFieldMeta = {
      key: "breakfastPlanChangeActions",
      label: "Plan-change actions",
      type: "multi-select",
      section: "Test",
      surveyVersions: "all",
      allowedAsX: true,
      allowedAsY: true,
      getCategorical: () => null,
      getMultiSelect: (row) => row.breakfastPlanChangeActions,
      options: [
        { value: "sell", label: "Sell it" },
        { value: "exchange", label: "Exchange it" },
      ],
    }

    const rows = [
      makeRow({ id: "1", branch: "A", breakfastPlanChangeActions: ["sell"] }),
      makeRow({ id: "2", branch: "A", breakfastPlanChangeActions: ["sell", "exchange"] }),
      makeRow({ id: "3", branch: "B", breakfastPlanChangeActions: [] }),
    ]

    const result = computePrevalenceByGroup(rows, groupField, multiField, undefined)
    expect(result.status).toBe("ok")
    if (result.status !== "ok" || result.method !== "prevalence-by-group") {
      throw new Error("expected prevalence-by-group result")
    }
    const groupA = result.rows.find((r) => r.group === "A")!
    expect(groupA.n).toBe(2)
    expect(groupA.percentageByOption.sell).toBeCloseTo(100, 5) // both A rows sold
    expect(groupA.percentageByOption.exchange).toBeCloseTo(50, 5) // only one exchanged
  })
})

describe("analyzeRelationshipBySegment", () => {
  it("runs the same X/Y analysis separately per segment category", () => {
    const rows = [
      ...rowsOfSize(6, (i) => ({
        hostel: "bakul",
        weekendBreakfastComparison: i % 2 === 0 ? "more-often" : "less-often",
        semesterBreakfastChange: i % 2 === 0 ? "more-often-now" : "less-often-now",
      })),
      ...rowsOfSize(6, () => ({
        hostel: "parijat",
        weekendBreakfastComparison: "more-often",
        semesterBreakfastChange: "more-often-now",
      })),
    ]
    const segments = analyzeRelationshipBySegment(
      rows,
      "weekendBreakfastComparison",
      "semesterBreakfastChange",
      "hostel"
    )
    expect(segments).not.toBeNull()
    const bakul = segments!.find((s) => s.segmentValue === "bakul")!
    const parijat = segments!.find((s) => s.segmentValue === "parijat")!
    expect(bakul.n).toBe(6)
    expect(parijat.n).toBe(6)
    expect(bakul.result.status).toBe("ok")
    expect(parijat.result.status).toBe("ok")
  })

  it("returns null for an unknown segment field", () => {
    const rows = rowsOfSize(10, () => ({}))
    expect(
      analyzeRelationshipBySegment(rows, "branch", "hostel", "not-a-real-field")
    ).toBeNull()
  })
})

describe("suppression applies within a single 'ok' result, not just at the top level", () => {
  it("flags an individual segment result as 'suppressed' when that segment alone is thin", () => {
    // 8 rows in "bakul" (enough to compute), only 2 in "parijat" (too few).
    const rows = [
      ...rowsOfSize(8, (i) => ({
        hostel: "bakul",
        sleepTimeWeekday: ["before-11pm", "1am-2am"][i % 2],
        wakeTimeWeekday: ["before-630am", "700-730am"][i % 2],
      })),
      ...rowsOfSize(2, (i) => ({
        hostel: "parijat",
        sleepTimeWeekday: ["before-11pm", "1am-2am"][i % 2],
        wakeTimeWeekday: ["before-630am", "700-730am"][i % 2],
      })),
    ]
    const segments = analyzeRelationshipBySegment(rows, "sleepTimeWeekday", "wakeTimeWeekday", "hostel")
    const bakul = segments!.find((s) => s.segmentValue === "bakul")!
    const parijat = segments!.find((s) => s.segmentValue === "parijat")!
    expect(bakul.result.status).toBe("ok")
    expect(parijat.result.status).toBe("suppressed")
  })

  it("flags an individual group row within an ordinal-by-group result, even though the overall result is 'ok'", () => {
    const rows = [
      ...rowsOfSize(8, () => ({ branch: "A", sleepTimeWeekday: "before-11pm" })),
      ...rowsOfSize(2, () => ({ branch: "B", sleepTimeWeekday: "1am-2am" })),
    ]
    const result = analyzeRelationship(rows, "sleepTimeWeekday", "branch")
    expect(result.status).toBe("ok")
    if (result.status !== "ok" || result.method !== "ordinal-by-group") {
      throw new Error("expected ordinal-by-group")
    }
    const branchA = result.rows.find((r) => r.group === "A")!
    const branchB = result.rows.find((r) => r.group === "B")!
    expect(branchA.flag).toBe("small") // n=8: >= MIN_CELL_N, < SMALL_SAMPLE_N
    // n=2 -> flagged "suppressed". The data layer still computes a real
    // median/mean here (same "compute the truth, let the UI decide what
    // to show" split as the paired comparison) — it's this flag the UI
    // checks to hide the value below MIN_CELL_N, not a null placeholder.
    expect(branchB.flag).toBe("suppressed")
  })

  it("flags an individual group row within a prevalence-by-group result", () => {
    const groupField: ExplorerFieldMeta = {
      key: "branch",
      label: "Branch",
      type: "categorical",
      section: "Test",
      surveyVersions: "all",
      allowedAsX: true,
      allowedAsY: true,
      getCategorical: (row) => row.branch,
      options: [
        { value: "A", label: "Regular eaters" },
        { value: "B", label: "Conditional eaters" },
      ],
    }
    const multiField: ExplorerFieldMeta = {
      key: "breakfastPlanChangeActions",
      label: "Plan-change actions",
      type: "multi-select",
      section: "Test",
      surveyVersions: "all",
      allowedAsX: true,
      allowedAsY: true,
      getCategorical: () => null,
      getMultiSelect: (row) => row.breakfastPlanChangeActions,
      options: [{ value: "sell", label: "Sell it" }],
    }
    const rows = [
      ...rowsOfSize(6, () => ({ branch: "A", breakfastPlanChangeActions: ["sell"] })),
      ...rowsOfSize(2, () => ({ branch: "B", breakfastPlanChangeActions: [] })),
    ]
    const result = computePrevalenceByGroup(rows, groupField, multiField, undefined)
    if (result.status !== "ok" || result.method !== "prevalence-by-group") {
      throw new Error("expected prevalence-by-group")
    }
    expect(result.rows.find((r) => r.group === "A")!.flag).toBe("small")
    expect(result.rows.find((r) => r.group === "B")!.flag).toBe("suppressed")
  })
})

describe("crosstab sparse-table caution", () => {
  it("flags a table as sparse when categories are numerous relative to n", () => {
    // 6 x-categories x 5 y-categories = 30 cells, only ~10 respondents.
    const rows = rowsOfSize(10, (i) => ({
      earlyCommitmentDays: ["0", "1", "2", "3", "4", "5+"][i % 6],
      breakfastFrequency: ["almost-every-day", "most-days", "some-days", "rarely", "never"][i % 5],
    }))
    const result = analyzeRelationship(rows, "earlyCommitmentDays", "breakfastFrequency")
    // ordinal x ordinal actually dispatches to spearman, not crosstab, for
    // this pair — use two categorical-only fields instead to force a
    // crosstab.
    void result
    const categoricalRows = rowsOfSize(10, (i) => ({
      weekendBreakfastComparison: ["more-often", "about-the-same", "less-often", "rarely-never-either"][i % 4],
      semesterBreakfastChange: ["more-often-now", "about-the-same", "less-often-now", "changed-back-and-forth", "not-sure"][i % 5],
    }))
    const crosstab = analyzeRelationship(
      categoricalRows,
      "weekendBreakfastComparison",
      "semesterBreakfastChange"
    )
    expect(crosstab.status).toBe("ok")
    if (crosstab.status === "ok" && crosstab.method === "crosstab") {
      expect(crosstab.sparse).toBe(true)
    }
  })

  it("does not flag a well-populated table as sparse", () => {
    const rows = rowsOfSize(200, (i) => ({
      weekendBreakfastComparison: ["more-often", "less-often"][i % 2],
      semesterBreakfastChange: ["more-often-now", "less-often-now"][i % 2],
    }))
    const result = analyzeRelationship(rows, "weekendBreakfastComparison", "semesterBreakfastChange")
    expect(result.status).toBe("ok")
    if (result.status === "ok" && result.method === "crosstab") {
      expect(result.sparse).toBe(false)
    }
  })
})

describe("Phase 2 registry extension — full closed-ended-field coverage", () => {
  it("registers a large number of fields (Phase 1 had 10)", () => {
    expect(EXPLORER_FIELDS.length).toBeGreaterThan(30)
  })

  it("excludes the attention-check row from the substantive influence matrix", () => {
    expect(getExplorerField("influenceRatings.attentionCheckInfluence")).toBeUndefined()
  })

  it("registers a real influence row and an agreement row", () => {
    expect(getExplorerField("influenceRatings.sleepAmountInfluence")).toBeDefined()
    expect(getExplorerField("agreementRatings.sleepOverBreakfastAgreement")).toBeDefined()
  })

  it("every registered field has a getCategorical accessor that never throws", () => {
    const blankRow = makeRow({ id: "blank" })
    for (const field of EXPLORER_FIELDS) {
      expect(() => field.getCategorical(blankRow)).not.toThrow()
    }
  })

  it("structural-influence rows dispatch as ordinal-by-group against branch, exactly like Core Pattern 3/4", () => {
    const rows = [
      ...rowsOfSize(8, () => ({
        branch: "A",
        influenceRatings: { sleepAmountInfluence: "not-at-all" },
      })),
      ...rowsOfSize(8, () => ({
        branch: "C",
        influenceRatings: { sleepAmountInfluence: "very-strongly" },
      })),
    ]
    const result = analyzeRelationship(rows, "influenceRatings.sleepAmountInfluence", "branch")
    expect(result.status).toBe("ok")
    if (result.status !== "ok" || result.method !== "ordinal-by-group") {
      throw new Error("expected ordinal-by-group")
    }
    expect(result.rows.find((r) => r.group === "A")!.median).toBe(0)
    expect(result.rows.find((r) => r.group === "C")!.median).toBe(4)
  })

  it("a multi-select field (before-sleep activities) dispatches as prevalence-by-group", () => {
    const rows = rowsOfSize(10, (i) => ({
      branch: (["A", "B"] as const)[i % 2],
      beforeSleepActivities: i % 2 === 0 ? ["studying"] : [],
    }))
    const result = analyzeRelationship(rows, "beforeSleepActivities", "branch")
    expect(result.status).toBe("ok")
    if (result.status === "ok") {
      expect(result.method).toBe("prevalence-by-group")
    }
  })
})

describe("Phase 2 registry extension — branch-only field eligibility", () => {
  it("restricts a Branch-A-only field's eligible rows to branch A", () => {
    const field = getExplorerField("messConsistency")!
    const rows = [
      makeRow({ id: "1", branch: "A", messConsistency: "almost-always-same" }),
      makeRow({ id: "2", branch: "B", messConsistency: null }),
      makeRow({ id: "3", branch: "C", messConsistency: null }),
    ]
    expect(eligibleRowsFor(rows, field).map((r) => r.id)).toEqual(["1"])
  })

  it("restricts a Branch-B-only field's eligible rows to branch B", () => {
    const field = getExplorerField("breakfastDecisionPoint")!
    const rows = [
      makeRow({ id: "1", branch: "A" }),
      makeRow({ id: "2", branch: "B", breakfastDecisionPoint: "on-waking" }),
      makeRow({ id: "3", branch: "C" }),
    ]
    expect(eligibleRowsFor(rows, field).map((r) => r.id)).toEqual(["2"])
  })

  it("restricts a Branch-C-only field's eligible rows to branch C", () => {
    const field = getExplorerField("breakfastAbsenceReason")!
    const rows = [
      makeRow({ id: "1", branch: "A" }),
      makeRow({ id: "2", branch: "B" }),
      makeRow({ id: "3", branch: "C", breakfastAbsenceReason: "decide-not-to-go" }),
    ]
    expect(eligibleRowsFor(rows, field).map((r) => r.id)).toEqual(["3"])
  })

  it("does not restrict the genuinely cross-branch motivation-factors field", () => {
    const field = getExplorerField("breakfastMotivationFactors")!
    expect(field.branchEligibility).toBeUndefined()
  })
})

describe("Phase 2 registry extension — remaining field coverage", () => {
  it("registers the universal plan-stability and alt-food/spending fields", () => {
    expect(getExplorerField("breakfastPlanChangeFrequency")).toBeDefined()
    expect(getExplorerField("breakfastPlanChangeActions")).toBeDefined()
    expect(getExplorerField("nonBreakfastMealSource")).toBeDefined()
    expect(getExplorerField("nextFoodTime")).toBeDefined()
    expect(getExplorerField("nonBreakfastSpendingFrequency")).toBeDefined()
    expect(getExplorerField("nonBreakfastSpendingAmount")).toBeDefined()
  })

  it("registers the branch-specific Events-era fields with correct branch eligibility", () => {
    expect(getExplorerField("missedBreakfastFrequency")?.branchEligibility).toEqual(["A"])
    expect(getExplorerField("breakfastPlannedButSkippedFrequency")?.branchEligibility).toEqual(["B"])
    expect(getExplorerField("breakfastServedTimeActivity")?.branchEligibility).toEqual(["C"])
  })

  it("registers primaryArchetype with one option per archetype", () => {
    const field = getExplorerField("primaryArchetype")!
    expect(field.options!.length).toBeGreaterThanOrEqual(5)
  })

  it("registers the three comparison-ratings rows (energy/concentration/hunger)", () => {
    expect(getExplorerField("comparisonRatings.comparisonEnergyLevel")).toBeDefined()
    expect(getExplorerField("comparisonRatings.comparisonConcentration")).toBeDefined()
    expect(getExplorerField("comparisonRatings.comparisonHunger")).toBeDefined()
  })

  it("dispatches a comparison-ratings row as ordinal-by-group against branch", () => {
    const rows = [
      ...rowsOfSize(6, () => ({
        branch: "A" as const,
        comparisonRatings: { comparisonEnergyLevel: "much-lower" },
      })),
      ...rowsOfSize(6, () => ({
        branch: "C" as const,
        comparisonRatings: { comparisonEnergyLevel: "much-higher" },
      })),
    ]
    const result = analyzeRelationship(rows, "comparisonRatings.comparisonEnergyLevel", "branch")
    expect(result.status).toBe("ok")
    if (result.status !== "ok" || result.method !== "ordinal-by-group") {
      throw new Error("expected ordinal-by-group")
    }
    expect(result.rows.find((r) => r.group === "A")!.median).toBe(-2)
    expect(result.rows.find((r) => r.group === "C")!.median).toBe(2)
  })
})
