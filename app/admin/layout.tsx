import type { ReactNode } from "react"
import { cookies } from "next/headers"

import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth"
import { logout } from "@/app/admin/login/actions"
import { Button } from "@/components/ui/button"

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

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            Breakfast Paradox — Admin
          </span>
          <span className="text-xs text-muted-foreground">
            Survey analytics, internal only
          </span>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </header>
      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  )
}
