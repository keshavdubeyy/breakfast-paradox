"use client"

import { useState } from "react"
import { DirectionProvider } from "@/components/ui/direction"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRightIcon } from "@hugeicons/core-free-icons"

export default function DirectionDemo() {
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr")

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outline"
        className="self-start"
        onClick={() => setDir((current) => (current === "ltr" ? "rtl" : "ltr"))}
      >
        Toggle direction ({dir.toUpperCase()})
      </Button>
      <DirectionProvider direction={dir}>
        <div
          dir={dir}
          className="flex items-center gap-3 rounded-2xl border border-border p-4"
        >
          <HugeiconsIcon
            icon={ArrowRightIcon}
            strokeWidth={2}
            className="size-4 shrink-0"
          />
          <span className="flex-1 text-sm">
            This row lays out in{" "}
            {dir === "ltr" ? "left-to-right" : "right-to-left"} order.
          </span>
          <Button size="sm">Action</Button>
        </div>
      </DirectionProvider>
    </div>
  )
}
