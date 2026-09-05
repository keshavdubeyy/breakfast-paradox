"use client"

import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

export default function SpinnerDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <Spinner className="size-4" />
        <Spinner className="size-6" />
        <Spinner className="size-8" />
      </div>
      <div className="flex items-center gap-3">
        <Button disabled>
          <Spinner className="size-4" />
          Please wait
        </Button>
        <Button variant="outline" disabled>
          <Spinner className="size-4" />
          Saving...
        </Button>
      </div>
    </div>
  )
}
