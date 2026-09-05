"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SearchIcon,
  Mail01Icon,
  Copy01Icon,
  Edit01Icon,
  Settings01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

export default function CommandDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Command className="h-96 rounded-4xl border border-border">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
              <span>Search documentation</span>
            </CommandItem>
            <CommandItem>
              <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
              <span>Compose a message</span>
              <CommandShortcut>⌘M</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
              <span>Copy share link</span>
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem>
              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
              <span>Rename item</span>
            </CommandItem>
            <CommandItem>
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
              <span>Open settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              <span>Delete item</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
