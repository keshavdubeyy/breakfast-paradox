// Public entry point for archetype calculation. Re-exports the content
// (labels/descriptions), the normalization mappings, and the scoring
// engine so callers only need one import path.
//
// See:
//   - lib/archetype-content.ts        — archetype labels & descriptions
//   - lib/archetype-normalization.ts  — every 0-1 scale conversion, in one place
//   - lib/archetype-scoring.ts        — the six pure calculators + calculateArchetypeResult
//   - lib/archetype-fixtures.ts       — deterministic fixtures for tests and the dev debug page

export * from "./archetype-content"
export * from "./archetype-normalization"
export * from "./archetype-scoring"
