import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export default function LabelDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="demo-label-name">
          Restaurant name <span className="text-destructive">*</span>
        </Label>
        <Input id="demo-label-name" placeholder="Breakfast Paradox" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="demo-label-notes">Notes</Label>
        <Input id="demo-label-notes" placeholder="Optional details" />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="demo-label-terms" defaultChecked />
        <Label htmlFor="demo-label-terms">
          I agree to the terms of service
        </Label>
      </div>
    </div>
  )
}
