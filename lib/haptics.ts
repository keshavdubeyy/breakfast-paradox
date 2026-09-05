// A very short, subtle pulse — just enough to register as a nudge, not a
// buzz. Not a state indicator: the UI must read identically without it.
const ERROR_PATTERN_MS = 15

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
}

/**
 * Fires a subtle vibration for validation/error feedback. Safe to call
 * unconditionally — no-ops on unsupported browsers (including iOS Safari,
 * which doesn't implement the Vibration API at all).
 *
 * Only call this from a direct user action (e.g. a submit handler), never
 * from a render path or an effect — it must not repeat on scroll, typing,
 * hover, or re-renders.
 */
function vibrateError() {
  if (!canVibrate()) {
    return
  }

  navigator.vibrate(ERROR_PATTERN_MS)
}

export { vibrateError }
