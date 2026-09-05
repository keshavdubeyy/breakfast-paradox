import type { AnalyticsFilters, AnalyticsRow } from "./types"

export function applyFilters(
  rows: AnalyticsRow[],
  filters: AnalyticsFilters
): AnalyticsRow[] {
  return rows.filter((row) => {
    if (
      filters.surveyVersion !== "all" &&
      row.surveyVersion !== filters.surveyVersion
    ) {
      return false
    }
    if (filters.hostel !== "all" && row.hostel !== filters.hostel) {
      return false
    }
    if (filters.year !== "all" && row.year !== filters.year) {
      return false
    }
    if (
      filters.earlyCommitmentDays !== "all" &&
      row.earlyCommitmentDays !== filters.earlyCommitmentDays
    ) {
      return false
    }
    if (
      filters.breakfastFrequency !== "all" &&
      row.breakfastFrequency !== filters.breakfastFrequency
    ) {
      return false
    }
    if (filters.branch !== "all" && row.branch !== filters.branch) {
      return false
    }
    if (
      filters.primaryArchetype !== "all" &&
      row.primaryArchetype !== filters.primaryArchetype
    ) {
      return false
    }
    if (filters.dateFrom && row.createdAt.slice(0, 10) < filters.dateFrom) {
      return false
    }
    if (filters.dateTo && row.createdAt.slice(0, 10) > filters.dateTo) {
      return false
    }
    return true
  })
}
