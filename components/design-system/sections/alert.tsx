import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"

export default function AlertDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
        <AlertTitle>New menu items are live</AlertTitle>
        <AlertDescription>
          The fall breakfast lineup has been published and is now visible to
          customers ordering online.
        </AlertDescription>
      </Alert>

      <Alert>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
        <AlertTitle>Changes saved</AlertTitle>
        <AlertDescription>
          Your restaurant hours were updated and will take effect immediately.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          We couldn&apos;t charge your card on file. Update your payment method
          to avoid a service interruption.
        </AlertDescription>
      </Alert>
    </div>
  )
}
