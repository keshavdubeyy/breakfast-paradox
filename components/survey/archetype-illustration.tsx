"use client"

import { useState } from "react"

import { getArchetypeVisualSrc } from "@/lib/archetype-visuals"
import type { ArchetypeId } from "@/lib/archetype-content"

interface ArchetypeIllustrationProps {
  archetypeId: ArchetypeId
  /** Used for the alt text and the placeholder's accessible label. */
  archetypeName: string
}

/**
 * The archetype's 1:1 transparent illustration — one fixed image per
 * archetype, shown to every respondent. Sized and reserved-space so
 * swapping in a different or higher-fidelity asset later never shifts
 * layout. Not every archetype has final art yet (meal-maximizer doesn't)
 * — a neutral placeholder (never a generated drawing of the archetype)
 * shows instead of breaking the page when an image fails to load.
 */
export function ArchetypeIllustration({
  archetypeId,
  archetypeName,
}: ArchetypeIllustrationProps) {
  const src = getArchetypeVisualSrc(archetypeId)
  const [failed, setFailed] = useState(false)
  // Reset the failure flag when the archetype (and so the src) changes,
  // so switching archetypes without remounting (e.g. in the
  // /dev/archetype-results preview) doesn't get stuck showing the
  // previous src's outcome. This is the "adjust state during render"
  // pattern React recommends over an effect for resetting state when a
  // prop changes.
  const [lastSrc, setLastSrc] = useState(src)
  if (src !== lastSrc) {
    setLastSrc(src)
    setFailed(false)
  }

  return (
    <div className="mx-auto aspect-square w-full max-w-[340px] sm:max-w-[420px]">
      {failed ? (
        <div
          role="img"
          aria-label={`${archetypeName} illustration (not yet available)`}
          className="flex h-full w-full items-center justify-center rounded-3xl bg-muted"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-16 text-muted-foreground/40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="2.5" y="3.5" width="19" height="17" rx="2.5" />
            <circle cx="8" cy="9" r="1.75" />
            <path d="M2.5 16.5 8 11l4 4 3-3 6.5 6.5" />
          </svg>
        </div>
      ) : (
        // Arbitrary future-uploaded PNGs under public, not a
        // build-time-known asset; a plain <img> keeps the graceful
        // onError fallback that next/image doesn't support as directly.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={encodeURI(src)}
          alt={`${archetypeName} illustration`}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
