import { fetchMessAttendance } from "@/lib/analytics/mess-attendance/fetch"
import { MessAttendanceClient } from "./mess-attendance-client"

export default async function MessAttendancePage() {
  const { rows, isConfigured } = await fetchMessAttendance()

  return <MessAttendanceClient rows={rows} isConfigured={isConfigured} />
}
