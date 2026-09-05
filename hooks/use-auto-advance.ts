"use client"

import { useRef } from "react"

/**
 * Smoothly scrolls to the next question block once a single-answer field
 * (radio/select) has been answered. Call `advance(key)` right after saving
 * the new value. The scroll is deferred two animation frames so it runs
 * after React has re-rendered — including any block the answer just
 * revealed or hid — so the registered blocks reflect what's actually on
 * screen.
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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const index = order.indexOf(key)
        for (let i = index + 1; i < order.length; i++) {
          const node = blockRefs.current[order[i]]
          if (node) {
            node.focus()
            node.scrollIntoView({ behavior: "smooth", block: "center" })
            break
          }
        }
      })
    })
  }

  return { registerBlock, getBlock, advance }
}

export { useAutoAdvance }
