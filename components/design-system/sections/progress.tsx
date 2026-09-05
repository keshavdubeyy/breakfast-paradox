"use client"

import { useEffect, useState } from "react"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"

export default function ProgressDemo() {
  const [brewing, setBrewing] = useState(18)

  useEffect(() => {
    const id = setInterval(() => {
      setBrewing((prev) => (prev >= 100 ? 0 : prev + 8))
    }, 600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <Progress value={33}>
        <div className="flex w-full items-center justify-between">
          <ProgressLabel>Pancake batter mixed</ProgressLabel>
          <ProgressValue />
        </div>
      </Progress>

      <Progress value={66}>
        <div className="flex w-full items-center justify-between">
          <ProgressLabel>Bacon crisping</ProgressLabel>
          <ProgressValue />
        </div>
      </Progress>

      <Progress value={100}>
        <div className="flex w-full items-center justify-between">
          <ProgressLabel>Coffee pot filled</ProgressLabel>
          <ProgressValue />
        </div>
      </Progress>

      <Progress value={brewing}>
        <div className="flex w-full items-center justify-between">
          <ProgressLabel>Espresso brewing</ProgressLabel>
          <ProgressValue />
        </div>
      </Progress>
    </div>
  )
}
