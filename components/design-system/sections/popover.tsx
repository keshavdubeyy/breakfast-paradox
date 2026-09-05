"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function PopoverDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <Popover>
        <PopoverTrigger
          render={<Button variant="outline">Table settings</Button>}
        />
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Table dimensions</PopoverTitle>
            <PopoverDescription>
              Set the size of the new patio table.
            </PopoverDescription>
          </PopoverHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="table-width">Width</Label>
              <Input id="table-width" defaultValue="36" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="table-height">Height</Label>
              <Input id="table-height" defaultValue="24" />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger
          render={<Button variant="secondary">Quick tip</Button>}
        />
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Syrup pairing</PopoverTitle>
            <PopoverDescription>
              Maple syrup pairs best with buttermilk pancakes and crispy bacon.
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  )
}
