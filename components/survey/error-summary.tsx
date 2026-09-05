"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorSummaryItem {
  key: string
  title: string
}

interface ErrorSummaryProps {
  items: ErrorSummaryItem[]
  onJumpTo: (key: string) => void
}

/**
 * Lists every unanswered question at once (not just the first) when
 * Continue fails, each one a link that jumps straight to it. Meant to sit
 * next to the Continue button — visible immediately on a failed attempt,
 * with no scrolling required to see what's outstanding.
 */
function ErrorSummary({ items, onJumpTo }: ErrorSummaryProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" aria-live="assertive">
      <AlertTitle>
        {items.length === 1
          ? "1 question needs your attention before you can continue"
          : `${items.length} questions need your attention before you can continue`}
      </AlertTitle>
      <AlertDescription>
        <ol className="flex max-h-40 flex-col gap-1 overflow-y-auto pl-4 list-decimal marker:text-destructive/70">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onJumpTo(item.key)}
                className="min-h-11 py-1 text-left underline underline-offset-3 hover:text-foreground"
              >
                {item.title}
              </button>
            </li>
          ))}
        </ol>
      </AlertDescription>
    </Alert>
  )
}

export { ErrorSummary }
export type { ErrorSummaryItem }
