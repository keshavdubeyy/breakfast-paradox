// Structures-specific constants: which influence-grid rows count as
// "structural" (system/environment conditions) vs. personal/contextual,
// plus the analyst-defined display categories layered on top of them.
// None of this changes how a row is scored — see
// lib/analytics/patterns/normalization.ts for influenceRowScore/
// INFLUENCE_SCALE, reused as-is.

import { INFLUENCE_FACTOR_ITEMS, type ScaleRowItem } from "@/lib/survey-options"

function itemsByKey(keys: string[]): ScaleRowItem[] {
  return keys.map((key) => {
    const item = INFLUENCE_FACTOR_ITEMS.find((candidate) => candidate.key === key)
    if (!item) {
      throw new Error(`lib/analytics/structures/normalization: unknown influence key "${key}"`)
    }
    return item
  })
}

/** Service/access conditions of the mess breakfast itself — Structures
 * §9B. Deliberately excludes sleep/hunger/friends/attention-check (those
 * are personal/social conditions, not system structure) and the
 * alternative-ecosystem trio below (kept as their own group, §9C). */
export const SERVICE_ENVIRONMENT_KEYS = [
  "firstCommitmentTimeInfluence",
  "morningTimeInfluence",
  "breakfastServingTimeInfluence",
  "breakfastMenuInfluence",
  "messAllocationInfluence",
  "distanceInfluence",
  "queueWaitInfluence",
] as const

export const SERVICE_ENVIRONMENT_ITEMS: ScaleRowItem[] = itemsByKey([...SERVICE_ENVIRONMENT_KEYS])

/** Competing/substitute infrastructure around mess breakfast — Structures
 * §9C. */
export const ALTERNATIVE_ECOSYSTEM_KEYS = [
  "canteenAvailabilityInfluence",
  "onlineOrderingInfluence",
  "resaleAbilityInfluence",
] as const

export const ALTERNATIVE_ECOSYSTEM_ITEMS: ScaleRowItem[] = itemsByKey([...ALTERNATIVE_ECOSYSTEM_KEYS])

/** The combined "what shapes breakfast behaviour, structurally" ranking —
 * Structures §10, the page's primary analytical visualization. */
export const STRUCTURAL_DRIVER_ITEMS: ScaleRowItem[] = [
  ...SERVICE_ENVIRONMENT_ITEMS,
  ...ALTERNATIVE_ECOSYSTEM_ITEMS,
]

/** Analyst-defined display grouping for the Structural Drivers ranking —
 * a UI tag only, never presented as something a respondent chose. Every
 * key in STRUCTURAL_DRIVER_ITEMS must appear here (enforced by tests). */
export const STRUCTURAL_DRIVER_CATEGORY: Record<string, string> = {
  firstCommitmentTimeInfluence: "Schedule",
  morningTimeInfluence: "Schedule",
  breakfastServingTimeInfluence: "Service",
  breakfastMenuInfluence: "Service",
  queueWaitInfluence: "Service",
  messAllocationInfluence: "Allocation",
  distanceInfluence: "Access",
  canteenAvailabilityInfluence: "Alternatives",
  onlineOrderingInfluence: "Alternatives",
  resaleAbilityInfluence: "Alternatives",
}

/** Analyst-defined system/personal/alternative split for the "Biggest
 * influence" ranking (§11) — that question's own option list mixes
 * genuinely structural factors (serving time, allocation) with personal/
 * contextual ones (sleep, hunger) and the alternative ecosystem. Covers
 * every SUBSTANTIVE_INFLUENCE_ITEMS key (i.e. all 14 non-attention-check
 * rows), enforced by tests. */
export type InfluenceCategory = "system" | "personal" | "alternative"

export const INFLUENCE_CATEGORY: Record<string, InfluenceCategory> = {
  sleepAmountInfluence: "personal",
  firstCommitmentTimeInfluence: "system",
  morningTimeInfluence: "personal",
  breakfastServingTimeInfluence: "system",
  breakfastMenuInfluence: "system",
  messAllocationInfluence: "system",
  distanceInfluence: "system",
  queueWaitInfluence: "system",
  friendsGoingInfluence: "personal",
  hungerOnWakingInfluence: "personal",
  ateLatePreviousNightInfluence: "personal",
  canteenAvailabilityInfluence: "alternative",
  onlineOrderingInfluence: "alternative",
  resaleAbilityInfluence: "alternative",
}

export const INFLUENCE_CATEGORY_LABEL: Record<InfluenceCategory, string> = {
  system: "System / institutional",
  personal: "Personal / contextual",
  alternative: "Alternative ecosystem",
}

/** The three "student found a workaround" option values shared across
 * unwantedMessActions, breakfastPlanChangeActions, and
 * unusedAllottedMealActions — used only to point readers at where
 * transfer-related evidence already lives on the page (see the §8A data
 * note in structures-client.tsx); never combined across those three
 * differently-gated questions into a single fabricated "transfer rate". */
export const TRANSFER_ACTION_VALUES = ["sell", "exchange", "give-away"] as const
