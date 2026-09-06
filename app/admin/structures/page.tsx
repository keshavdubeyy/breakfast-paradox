import { fetchAnalyticsRows } from "@/lib/analytics/fetch"
import { StructuresClient } from "./structures-client"

export default async function AdminStructuresPage() {
  const { rows, isSampleData } = await fetchAnalyticsRows()

  return <StructuresClient rows={rows} isSampleData={isSampleData} />
}
