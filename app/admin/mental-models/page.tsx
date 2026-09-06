import { fetchAnalyticsRows } from "@/lib/analytics/fetch"
import { MentalModelsClient } from "./mental-models-client"

export default async function AdminMentalModelsPage() {
  const { rows, isSampleData } = await fetchAnalyticsRows()

  return <MentalModelsClient rows={rows} isSampleData={isSampleData} />
}
