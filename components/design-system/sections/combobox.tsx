"use client"

import { useState } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt",
  "Remix",
  "Astro",
  "Gatsby",
  "Qwik City",
  "SolidStart",
]

export default function ComboboxDemo() {
  const [value, setValue] = useState<string | null>("Next.js")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full max-w-xs flex-col gap-1.5">
        <Label htmlFor="framework-combobox">Framework</Label>
        <Combobox items={frameworks} value={value} onValueChange={setValue}>
          <ComboboxInput
            id="framework-combobox"
            placeholder="Select a framework..."
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <p className="text-sm text-muted-foreground">
        {value ? `Selected framework: ${value}` : "No framework selected yet."}
      </p>
    </div>
  )
}
