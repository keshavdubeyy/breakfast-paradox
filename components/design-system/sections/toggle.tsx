"use client"

import { Toggle } from "@/components/ui/toggle"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Alert02Icon } from "@hugeicons/core-free-icons"

export default function ToggleDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle aria-label="Toggle favorite" defaultPressed>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
        Favorite
      </Toggle>
      <Toggle aria-label="Toggle notify" variant="outline">
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        Notify
      </Toggle>
      <Toggle aria-label="Disabled toggle" disabled>
        Disabled
      </Toggle>
    </div>
  )
}
