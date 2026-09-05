import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth"

export const config = {
  matcher: ["/admin/:path*"],
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const isAuthenticated = await verifySessionToken(token)

  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
