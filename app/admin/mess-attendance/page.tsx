import { fetchMessAttendance } from "@/lib/analytics/mess-attendance/fetch"
import { fetchMessMenu } from "@/lib/analytics/mess-menu/fetch"
import { MessAttendanceClient } from "./mess-attendance-client"

export default async function MessAttendancePage() {
  const [{ rows, isConfigured }, { rows: menuRows }] = await Promise.all([
    fetchMessAttendance(),
    fetchMessMenu(),
  ])

  return <MessAttendanceClient rows={rows} isConfigured={isConfigured} menuRows={menuRows} />
}
