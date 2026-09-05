import "server-only"
import { createClient } from "@supabase/supabase-js"

// Service-role client for the admin dashboard only — never import this
// from a client component or anything reachable by the browser. It
// bypasses RLS entirely (that's the point: the anon key the survey app
// uses is insert-only, so reading analytics needs a different key), so
// SUPABASE_SERVICE_ROLE_KEY must never carry the NEXT_PUBLIC_ prefix and
// must never be sent to the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
