import { fetchAnalyticsRows } from "@/lib/analytics/fetch"
import { EventsClient } from "./events-client"

export default async function AdminEventsPage() {
  const { rows, isSampleData } = await fetchAnalyticsRows()

  return <EventsClient rows={rows} isSampleData={isSampleData} />
}
