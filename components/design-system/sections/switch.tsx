"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch id="switch-demo-marketing" defaultChecked />
        <Label htmlFor="switch-demo-marketing">Marketing emails</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-demo-security" />
        <Label htmlFor="switch-demo-security">Security alerts</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-demo-disabled" disabled />
        <Label htmlFor="switch-demo-disabled">
          Beta features (unavailable)
        </Label>
      </div>
    </div>
  )
}
