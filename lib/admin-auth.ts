// Shared-password gate for /admin — there's no per-user login, just one
// password (ADMIN_DASHBOARD_PASSWORD) that unlocks a signed session
// cookie. The token is a stateless "timestamp + HMAC" pair rather than a
// server-side session store, so it works the same in middleware (which
// may run on the Edge runtime) and in Node — both environments implement
// the Web Crypto API (`crypto.subtle`), so that's what signs it instead
// of Node's `crypto` module.

export const ADMIN_SESSION_COOKIE = "bp_admin_session"
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function getSigningSecret(): string | null {
  const password = process.env.ADMIN_DASHBOARD_PASSWORD
  return password ? `${password}:bp-admin-session` : null
}

// Edge runtime has no Node `Buffer` global, so the ArrayBuffer → hex step
// below is done by hand rather than via `Buffer.from(...).toString("hex")`
// — this needs to run the same way in middleware (Edge) and in Node.
function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

async function hmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  )
  return bytesToHex(signature)
}

/** Returns null if ADMIN_DASHBOARD_PASSWORD isn't set — callers should
 * treat that as "admin dashboard not configured yet", not as a crash. */
export async function createSessionToken(): Promise<string | null> {
  const secret = getSigningSecret()
  if (!secret) {
    return null
  }
  const issuedAt = Date.now().toString()
  const signature = await hmac(issuedAt, secret)
  return `${issuedAt}.${signature}`
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  const secret = getSigningSecret()
  if (!secret || !token) {
    return false
  }

  const [issuedAt, signature] = token.split(".")
  if (!issuedAt || !signature) {
    return false
  }

  const age = Date.now() - Number(issuedAt)
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_MS) {
    return false
  }

  const expected = await hmac(issuedAt, secret)
  return expected === signature
}

export function verifyPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD
  return Boolean(expected) && candidate === expected
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000
