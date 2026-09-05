"use client"

import { useState, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "cn"

interface DataDetailsDrawerProps {
  children: ReactNode
  label?: string
}

/** A chart is the primary view everywhere on Patterns now, but exact
 * percentages/counts/eligibility still need to exist for anyone doing
 * follow-up analysis — this is that fallback: collapsed by default,
 * reveals the exact table (secondary stats included) the chart was built
 * from. */
export function DataDetailsDrawer({ children, label = "View data" }: DataDetailsDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-2">
      <CollapsibleTrigger
        className="flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className={cn("size-3.5 transition-transform", open ? "rotate-180" : "")}
        />
        {label}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}
