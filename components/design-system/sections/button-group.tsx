"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MoreHorizontalCircle01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"

export default function ButtonGroupDemo() {
  const [page, setPage] = useState(3)

  return (
    <div className="flex flex-col gap-6">
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Previous page">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <ButtonGroupText>Page {page}</ButtonGroupText>
        <Button variant="outline" size="icon" aria-label="Next page">
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline">Save order</Button>
        <Button variant="outline" size="icon" aria-label="More options">
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>
        <ButtonGroupSeparator />
        <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
        <Button variant="outline" size="icon" aria-label="More">
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
        </Button>
      </ButtonGroup>

      <ButtonGroup orientation="vertical" className="w-40">
        <Button variant="outline">Dine in</Button>
        <Button variant="outline">Takeout</Button>
        <Button variant="outline">Delivery</Button>
      </ButtonGroup>
    </div>
  )
}
