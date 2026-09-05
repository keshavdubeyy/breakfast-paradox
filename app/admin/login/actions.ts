"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyPassword,
} from "@/lib/admin-auth"

export interface LoginState {
  error: string | null
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!process.env.ADMIN_DASHBOARD_PASSWORD) {
    return { error: "Admin dashboard isn't configured yet (missing ADMIN_DASHBOARD_PASSWORD)." }
  }

  const password = formData.get("password")
  if (typeof password !== "string" || !verifyPassword(password)) {
    return { error: "Incorrect password." }
  }

  const token = await createSessionToken()
  if (!token) {
    return { error: "Admin dashboard isn't configured yet (missing ADMIN_DASHBOARD_PASSWORD)." }
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  })

  const redirectTo = formData.get("from")
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/admin/overview")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
  redirect("/admin/login")
}
