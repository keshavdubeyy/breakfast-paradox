import { fetchAnalyticsRows } from "@/lib/analytics/fetch"
import { IcebergClient } from "./iceberg-client"

export default async function AdminIcebergPage() {
  const { rows, isSampleData } = await fetchAnalyticsRows()

  return <IcebergClient rows={rows} isSampleData={isSampleData} />
}
