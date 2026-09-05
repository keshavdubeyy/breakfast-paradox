import { fetchAnalyticsRows } from "@/lib/analytics/fetch"
import { PatternsClient } from "./patterns-client"

export default async function AdminPatternsPage() {
  const { rows, isSampleData } = await fetchAnalyticsRows()

  return <PatternsClient rows={rows} isSampleData={isSampleData} />
}
