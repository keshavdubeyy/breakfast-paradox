"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export default function SliderDemo() {
  const [volume, setVolume] = useState(60)
  const [range, setRange] = useState([20, 80])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Volume</Label>
          <span className="text-sm text-muted-foreground">{volume}</span>
        </div>
        <Slider
          value={[volume]}
          onValueChange={(value) =>
            setVolume(Array.isArray(value) ? value[0] : value)
          }
          max={100}
          step={1}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Price range</Label>
          <span className="text-sm text-muted-foreground">
            ${range[0]} - ${range[1]}
          </span>
        </div>
        <Slider
          value={range}
          onValueChange={(value) =>
            setRange(Array.isArray(value) ? value : [value, value])
          }
          max={100}
          step={1}
        />
      </div>
    </div>
  )
}
