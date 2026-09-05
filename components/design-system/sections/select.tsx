"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SelectDemo() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="menu-time">Serving time</Label>
      <Select defaultValue="brunch">
        <SelectTrigger id="menu-time" className="w-56">
          <SelectValue placeholder="Select a time" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Morning</SelectLabel>
            <SelectItem value="early-bird">Early bird — 6:00 AM</SelectItem>
            <SelectItem value="breakfast">Breakfast — 8:00 AM</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Midday</SelectLabel>
            <SelectItem value="brunch">Brunch — 11:00 AM</SelectItem>
            <SelectItem value="lunch">Lunch — 1:00 PM</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
