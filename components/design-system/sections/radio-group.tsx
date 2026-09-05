"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="standard">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="standard" id="shipping-standard" />
        <Label htmlFor="shipping-standard">Standard — 5-7 business days</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="express" id="shipping-express" />
        <Label htmlFor="shipping-express">Express — 2-3 business days</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="overnight" id="shipping-overnight" />
        <Label htmlFor="shipping-overnight">
          Overnight — next business day
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="pickup" id="shipping-pickup" disabled />
        <Label htmlFor="shipping-pickup">Local pickup (unavailable)</Label>
      </div>
    </RadioGroup>
  )
}
