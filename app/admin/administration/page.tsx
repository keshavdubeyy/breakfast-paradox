import { fetchClassSchedule } from "@/lib/analytics/administration/fetch"
import { AdministrationClient } from "./administration-client"

export default async function AdminAdministrationPage() {
  const { rows, isConfigured } = await fetchClassSchedule()

  return <AdministrationClient rows={rows} isConfigured={isConfigured} />
}
