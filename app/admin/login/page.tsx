"use client"

import { Suspense, useActionState } from "react"
import { useSearchParams } from "next/navigation"

import { login, type LoginState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const INITIAL_STATE: LoginState = { error: null }

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  )
}

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get("from") ?? ""
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE)

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin dashboard</CardTitle>
          <CardDescription>
            Enter the shared password to view survey analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="from" value={from} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoFocus
                required
                aria-invalid={!!state.error}
              />
            </div>
            {state.error ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" disabled={pending} className="mt-2 h-11">
              {pending ? "Checking…" : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
