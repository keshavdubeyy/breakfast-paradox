"use client"

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SearchIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"

export default function TooltipDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger
          render={<Button variant="outline" size="icon" aria-label="Search" />}
        >
          <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
        </TooltipTrigger>
        <TooltipContent>Search</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={<Button variant="outline" size="icon" aria-label="Approve" />}
        >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
        </TooltipTrigger>
        <TooltipContent>Approve request</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={<Button variant="outline" size="icon" aria-label="Warning" />}
        >
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        </TooltipTrigger>
        <TooltipContent>This action needs review</TooltipContent>
      </Tooltip>
    </div>
  )
}
