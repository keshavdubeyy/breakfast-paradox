import { fetchAnalyticsRows } from "@/lib/analytics/fetch"
import { OverviewClient } from "./overview-client"

export default async function AdminOverviewPage() {
  const { rows, isSampleData } = await fetchAnalyticsRows()

  return <OverviewClient rows={rows} isSampleData={isSampleData} />
}
