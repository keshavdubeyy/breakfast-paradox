"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

interface RankListItem {
  value: string
  label: string
}

interface RankListProps {
  items: RankListItem[]
  onReorder: (nextValues: string[]) => void
}

/** An ordered list with up/down controls for ranking selected options. */
function RankList({ items, onReorder }: RankListProps) {
  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) {
      return
    }

    const nextValues = items.map((item) => item.value)
    ;[nextValues[index], nextValues[nextIndex]] = [
      nextValues[nextIndex],
      nextValues[index],
    ]
    onReorder(nextValues)
  }

  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li
          key={item.value}
          className="flex min-h-11 items-center gap-3 rounded-2xl border border-input bg-input/30 py-1.5 pr-1.5 pl-3"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground tabular-nums">
            {index + 1}
          </span>
          <span className="flex-1 text-base text-foreground">
            {item.label}
          </span>
          <div className="flex shrink-0 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              aria-label={`Move "${item.label}" earlier`}
            >
              <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
              aria-label={`Move "${item.label}" later`}
            >
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
            </Button>
          </div>
        </li>
      ))}
    </ol>
  )
}

export { RankList }
