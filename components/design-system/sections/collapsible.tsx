"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

const extraItems = [
  "Maple Bacon Waffles",
  "Smoked Salmon Bagel",
  "Huevos Rancheros",
  "Blueberry French Toast",
]

export default function CollapsibleDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Today&apos;s menu (3 featured items)
          </p>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Toggle menu items"
              />
            }
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className={
                open
                  ? "rotate-180 transition-transform"
                  : "transition-transform"
              }
            />
          </CollapsibleTrigger>
        </div>

        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
          <li>Classic Pancakes</li>
          <li>Belgian Waffles</li>
          <li>Avocado Toast</li>
        </ul>

        <CollapsibleContent className="overflow-hidden">
          <ul className="mt-1.5 flex flex-col gap-1.5 text-sm text-muted-foreground">
            {extraItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <p className="text-sm text-muted-foreground">
        {open ? "Showing all menu items." : "Showing featured items only."}
      </p>
    </div>
  )
}
