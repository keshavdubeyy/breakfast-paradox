"use client"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Edit01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

export default function ContextMenuDemo() {
  return (
    <div className="flex flex-col gap-6">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-40 w-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
          Right-click this area
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem>
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
            Copy
          </ContextMenuItem>
          <ContextMenuItem>
            <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
            Edit
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Duplicate to...</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Project A</ContextMenuItem>
              <ContextMenuItem>Project B</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
