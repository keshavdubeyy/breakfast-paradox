"use client"

import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface DataDetailsDrawerProps {
  children: ReactNode
  /** Shown as the sheet's title — should name the section the data
   * belongs to (e.g. "Early commitments × breakfast behaviour"). */
  title: string
  label?: string
}

/** A chart is the primary view everywhere on Patterns now, but exact
 * percentages/counts/eligibility still need to exist for anyone doing
 * follow-up analysis — this is that fallback: an outline button at the
 * top-right of the section (via CardAction) that opens a sheet from the
 * right with the exact table the chart was built from. */
export function DataDetailsDrawer({ children, title, label = "View data" }: DataDetailsDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm">{label}</Button>} />
      <SheetContent side="right" className="data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Exact percentages, counts, and eligibility behind the chart above.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto px-6 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
