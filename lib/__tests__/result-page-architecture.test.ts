import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const projectRoot = path.resolve(__dirname, "../..")

function readSource(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8")
}

/**
 * True if the source actually imports or invokes calculateArchetypeResult
 * — as opposed to merely mentioning its name in an explanatory comment,
 * which a plain substring search would false-positive on.
 */
function usesCalculateArchetypeResult(source: string) {
  return (
    /\bcalculateArchetypeResult\s*\(/.test(source) ||
    /import\s*\{[^}]*\bcalculateArchetypeResult\b[^}]*\}/.test(source)
  )
}

// These are source-level architectural guards rather than rendered-output
// assertions (the project has no DOM/component test runner set up) — they
// prove the invariants the audit called for by inspecting what the result
// UI is wired to, not just trusting a description of it.

describe("result page architecture", () => {
  it("the exit page never imports or calls calculateArchetypeResult", () => {
    const source = readSource("app/exit/page.tsx")
    expect(usesCalculateArchetypeResult(source)).toBe(false)
  })

  it("the reusable ResultPage component never imports or calls calculateArchetypeResult", () => {
    const source = readSource("components/survey/result-page.tsx")
    expect(usesCalculateArchetypeResult(source)).toBe(false)
  })

  it("the exit page reads the persisted archetype result rather than recalculating it", () => {
    const source = readSource("app/exit/page.tsx")
    expect(source).toContain("getArchetypeResultSnapshot")
    expect(source).toContain("subscribeArchetypeResult")
  })

  it("the dev result-page preview also never calls calculateArchetypeResult (it's driven by local UI state, not the scoring engine)", () => {
    const source = readSource("app/dev/archetype-results/page.tsx")
    expect(usesCalculateArchetypeResult(source)).toBe(false)
  })
})

describe("primary vs. secondary archetype visuals", () => {
  it("ResultPage's illustration is selected from the primary archetype only", () => {
    const source = readSource("components/survey/result-page.tsx")
    const illustrationUsage = source.match(
      /<ArchetypeIllustration[\s\S]*?\/>/
    )?.[0]
    expect(illustrationUsage).toBeDefined()
    expect(illustrationUsage).toContain("archetypeId={archetypeId}")
    expect(illustrationUsage).not.toContain("secondaryArchetypeId")
  })

  it("ResultPage never renders a second illustration for the secondary archetype", () => {
    const source = readSource("components/survey/result-page.tsx")
    const illustrationOccurrences = (
      source.match(/<ArchetypeIllustration/g) ?? []
    ).length
    expect(illustrationOccurrences).toBe(1)
  })
})

// A blanket /gender/i search would false-positive on legitimate prose
// (e.g. an explanatory comment saying "this never reads gender") — these
// checks instead look for actual code usage: property access, imports,
// and known symbol names.
function referencesGenderInCode(source: string) {
  return (
    /\.gender\b/.test(source) ||
    /\bsubscribeAboutYou\b/.test(source) ||
    /\bgetAboutYouSnapshot\b/.test(source) ||
    /\bgetAboutYouServerSnapshot\b/.test(source) ||
    /["']gender["']/.test(source)
  )
}

describe("gender is disconnected from the result illustration", () => {
  it("the exit page never reads gender or looks up a visual variant", () => {
    const source = readSource("app/exit/page.tsx")
    expect(referencesGenderInCode(source)).toBe(false)
    expect(source).not.toContain("getArchetypeVisualVariant")
    expect(source).not.toContain("ArchetypeVisualVariant")
  })

  it("ResultPage has no gender or visual-variant prop", () => {
    const source = readSource("components/survey/result-page.tsx")
    expect(referencesGenderInCode(source)).toBe(false)
    expect(source).not.toContain("visualVariant")
    expect(source).not.toContain("ArchetypeVisualVariant")
  })

  it("ArchetypeIllustration takes no gender or variant prop", () => {
    const source = readSource("components/survey/archetype-illustration.tsx")
    expect(referencesGenderInCode(source)).toBe(false)
    expect(source).not.toContain("variant")
  })

  it("the dev result-page preview has no visual-variant control", () => {
    const source = readSource("app/dev/archetype-results/page.tsx")
    expect(source).not.toContain("ArchetypeVisualVariant")
    expect(referencesGenderInCode(source)).toBe(false)
  })
})

describe("population nudge never receives internal scores", () => {
  it("PopulationNudge is only ever given populationShare/totalCompleted, never the scores map", () => {
    const source = readSource("components/survey/result-page.tsx")
    const nudgeUsage = source.match(/<PopulationNudge[\s\S]*?\/>/)?.[0]
    expect(nudgeUsage).toBeDefined()
    expect(nudgeUsage).not.toContain("scores")
    expect(nudgeUsage).toContain("populationShare")
    expect(nudgeUsage).toContain("totalCompleted")
  })

  it("the PopulationNudge component itself has no parameter for an archetype score", () => {
    const source = readSource("components/survey/population-nudge.tsx")
    expect(source).not.toMatch(/scores?\s*:/)
  })
})
