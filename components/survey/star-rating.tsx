"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"

const STAR_VALUES = [1, 2, 3, 4, 5] as const

interface StarRatingProps {
  onRate?: (rating: number) => void
}

/** A simple, client-only 1–5 star rating — no persistence yet. Purely a
 * "thanks, glad you're done" touch on the thank-you screen, not a piece
 * of survey data. */
export function StarRating({ onRate }: StarRatingProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  const displayValue = hovered ?? rating ?? 0

  function handleRate(value: number) {
    setRating(value)
    onRate?.(value)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Rate this survey"
        className="flex gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {STAR_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            onMouseEnter={() => setHovered(value)}
            onFocus={() => setHovered(value)}
            onBlur={() => setHovered(null)}
            onClick={() => handleRate(value)}
            className="rounded-md p-1 text-muted-foreground transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none data-[active=true]:text-primary"
            data-active={value <= displayValue}
          >
            <HugeiconsIcon
              icon={StarIcon}
              strokeWidth={2}
              fill={value <= displayValue ? "currentColor" : "none"}
              className="size-8"
            />
          </button>
        ))}
      </div>
      {rating ? (
        <p className="text-sm text-muted-foreground">
          Thanks for the feedback!
        </p>
      ) : null}
    </div>
  )
}
