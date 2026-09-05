import type { ReactNode } from "react"
import { cookies } from "next/headers"

import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthenticated = await verifySessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  )

  // The login page itself renders through this layout too (it's under
  // /admin), so it must not show the authenticated chrome — middleware
  // already lets /admin/login through regardless of session state.
  if (!isAuthenticated) {
    return children
  }

  return <AdminShell>{children}</AdminShell>
}
