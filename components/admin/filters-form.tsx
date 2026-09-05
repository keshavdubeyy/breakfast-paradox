"use client"

import type { ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ARCHETYPE_IDS, ARCHETYPES, type ArchetypeId } from "@/lib/archetype-content"
import type { AnalyticsFilters, Branch } from "@/lib/analytics/types"
import {
  BREAKFAST_FREQUENCY_OPTIONS,
  EARLY_COMMITMENT_OPTIONS,
  HOSTEL_OPTIONS,
  YEAR_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"

const BRANCH_FILTER_OPTIONS: SurveyOption[] = [
  { value: "A", label: "Regular eaters" },
  { value: "B", label: "Conditional eaters" },
  { value: "C", label: "Rare / non-eaters" },
]

const ARCHETYPE_FILTER_OPTIONS: SurveyOption[] = ARCHETYPE_IDS.map((id) => ({
  value: id,
  label: ARCHETYPES[id].name,
}))

// `Select.Value` renders the raw stored value ("all", "1"...) unless told
// otherwise — this looks the matching option's label up so the trigger
// reads the same text as the item the user picked, not its value.
function optionLabel(
  options: SurveyOption[],
  value: string,
  allLabel: string
): string {
  if (value === "all") {
    return allLabel
  }
  return options.find((option) => option.value === value)?.label ?? value
}

/** Shared across every dashboard page's filter sheet (Overview, Events,
 * and the rest of the iceberg as they're built) — the sample being
 * filtered is the same across all of them, so the controls are too. */
export function countActiveFilters(filters: AnalyticsFilters): number {
  let count = 0
  if (filters.surveyVersion !== "all") count += 1
  if (filters.hostel !== "all") count += 1
  if (filters.year !== "all") count += 1
  if (filters.earlyCommitmentDays !== "all") count += 1
  if (filters.breakfastFrequency !== "all") count += 1
  if (filters.branch !== "all") count += 1
  if (filters.primaryArchetype !== "all") count += 1
  if (filters.dateFrom) count += 1
  if (filters.dateTo) count += 1
  return count
}

interface FiltersFormProps {
  surveyVersions: number[]
  filters: AnalyticsFilters
  onChange: <K extends keyof AnalyticsFilters>(
    key: K,
    value: AnalyticsFilters[K]
  ) => void
}

export function FiltersForm({ surveyVersions, filters, onChange }: FiltersFormProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
      <FilterField label="Survey version">
        <Select
          value={String(filters.surveyVersion)}
          onValueChange={(value) =>
            onChange("surveyVersion", value === "all" ? "all" : Number(value))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === "all" ? "All versions" : `Version ${value}`
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All versions</SelectItem>
            {surveyVersions.map((version) => (
              <SelectItem key={version} value={String(version)}>
                Version {version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Hostel">
        <Select
          value={filters.hostel}
          onValueChange={(value) => onChange("hostel", value as string)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => optionLabel(HOSTEL_OPTIONS, value, "All hostels")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All hostels</SelectItem>
            {HOSTEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Year">
        <Select
          value={filters.year}
          onValueChange={(value) => onChange("year", value as string)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => optionLabel(YEAR_OPTIONS, value, "All years")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {YEAR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Early commitments">
        <Select
          value={filters.earlyCommitmentDays}
          onValueChange={(value) => onChange("earlyCommitmentDays", value as string)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => optionLabel(EARLY_COMMITMENT_OPTIONS, value, "All")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {EARLY_COMMITMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Breakfast frequency">
        <Select
          value={filters.breakfastFrequency}
          onValueChange={(value) => onChange("breakfastFrequency", value as string)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                optionLabel(BREAKFAST_FREQUENCY_OPTIONS, value, "All")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {BREAKFAST_FREQUENCY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Branch">
        <Select
          value={filters.branch}
          onValueChange={(value) => onChange("branch", value as Branch | "all")}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                optionLabel(BRANCH_FILTER_OPTIONS, value, "All branches")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All branches</SelectItem>
            <SelectItem value="A">Regular eaters</SelectItem>
            <SelectItem value="B">Conditional eaters</SelectItem>
            <SelectItem value="C">Rare / non-eaters</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Archetype">
        <Select
          value={filters.primaryArchetype}
          onValueChange={(value) => onChange("primaryArchetype", value as ArchetypeId | "all")}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                optionLabel(ARCHETYPE_FILTER_OPTIONS, value, "All archetypes")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All archetypes</SelectItem>
            {ARCHETYPE_IDS.map((id) => (
              <SelectItem key={id} value={id}>
                {ARCHETYPES[id].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="From">
        <Input
          type="date"
          className="w-full"
          value={filters.dateFrom ?? ""}
          onChange={(event) => onChange("dateFrom", event.target.value || null)}
        />
      </FilterField>

      <FilterField label="To">
        <Input
          type="date"
          className="w-full"
          value={filters.dateTo ?? ""}
          onChange={(event) => onChange("dateTo", event.target.value || null)}
        />
      </FilterField>
    </div>
  )
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
