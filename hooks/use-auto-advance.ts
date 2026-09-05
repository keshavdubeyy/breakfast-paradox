"use client"

import { useRef } from "react"

/**
 * Registers each question block so it can be found and scrolled to later
 * (e.g. jumping to the first/all unanswered questions on a failed
 * Continue). `order` is kept as an input for that future lookup, not for
 * scrolling on every answer.
 *
 * `advance()` is intentionally a no-op: this hook used to auto-scroll to
 * the next question the instant a single-answer field was set, but that
 * behavior was removed — every call site still calls `advance(key)` after
 * saving an answer, so it's kept as a harmless no-op here rather than
 * ripping it out of every page.
 */
function useAutoAdvance<Key extends string>(order: readonly Key[]) {
  const blockRefs = useRef<Partial<Record<Key, HTMLElement | null>>>({})

  function registerBlock(key: Key) {
    return (node: HTMLElement | null) => {
      blockRefs.current[key] = node
    }
  }

  function getBlock(key: Key) {
    return blockRefs.current[key] ?? null
  }

  function advance(key: Key) {
    // Auto-advance-on-select removed — see the note above. `key`/`order`
    // are kept as no-op references so every existing call site (and this
    // hook's generic signature) stays unchanged.
    void key
    void order
  }

  return { registerBlock, getBlock, advance }
}

export { useAutoAdvance }
