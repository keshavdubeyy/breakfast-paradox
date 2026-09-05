import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Marker, MarkerIcon, MarkerContent } from "@/components/ui/marker"

export default function MarkerDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-6">
      <Marker>
        <MarkerIcon>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} />
        </MarkerIcon>
        <MarkerContent>Order confirmed · 2 hours ago</MarkerContent>
      </Marker>

      <Marker variant="border">
        <MarkerContent>Shipping address</MarkerContent>
      </Marker>

      <div className="flex items-center">
        <Marker variant="separator">
          <MarkerContent>or continue with email</MarkerContent>
        </Marker>
      </div>
    </div>
  )
}
