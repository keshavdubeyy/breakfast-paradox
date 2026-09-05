"use client"

import { Separator } from "@/components/ui/separator"

export default function SeparatorDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-sm font-medium">Breakfast Paradox</div>
        <div className="text-sm text-muted-foreground">
          Serving pancakes, waffles, and coffee since 2024.
        </div>
        <Separator className="my-4" />
        <div className="text-sm text-muted-foreground">
          Open daily from 7:00 AM to 2:00 PM.
        </div>
      </div>

      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Menu</span>
        <Separator orientation="vertical" />
        <span>Locations</span>
        <Separator orientation="vertical" />
        <span>Contact</span>
      </div>
    </div>
  )
}
