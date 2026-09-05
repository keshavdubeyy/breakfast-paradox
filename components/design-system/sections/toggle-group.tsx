"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons"

export default function ToggleGroupDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Text alignment (single select)
        </span>
        <ToggleGroup defaultValue={["left"]} variant="outline">
          <ToggleGroupItem value="left" aria-label="Align left">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Text style (multi select)</span>
        <ToggleGroup defaultValue={["bold"]} multiple>
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            Bold
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic">
            Italic
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Toggle underline">
            Underline
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
