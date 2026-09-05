"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function CheckboxDemo() {
  const [items, setItems] = useState({
    prep: true,
    tables: false,
    signage: false,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="prep"
          checked={items.prep}
          onCheckedChange={(checked) =>
            setItems((prev) => ({ ...prev, prep: checked === true }))
          }
        />
        <Label htmlFor="prep">Kitchen prep completed</Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="tables"
          checked={items.tables}
          onCheckedChange={(checked) =>
            setItems((prev) => ({ ...prev, tables: checked === true }))
          }
        />
        <Label htmlFor="tables">Tables set for service</Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="signage"
          checked={items.signage}
          onCheckedChange={(checked) =>
            setItems((prev) => ({ ...prev, signage: checked === true }))
          }
        />
        <Label htmlFor="signage">Specials board updated</Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="closed" disabled />
        <Label htmlFor="closed">Closed for holiday (locked)</Label>
      </div>
    </div>
  )
}
