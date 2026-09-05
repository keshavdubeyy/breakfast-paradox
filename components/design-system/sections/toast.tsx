"use client"

import { Toaster, toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

export default function ToastDemo() {
  return (
    <Toaster>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Changes saved",
              description: "Your profile has been updated successfully.",
              type: "success",
            })
          }
        >
          Show success toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Something went wrong",
              description:
                "We couldn't process your request. Please try again.",
              type: "error",
            })
          }
        >
          Show error toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Heads up",
              description: "A new version of the app is available.",
              type: "info",
            })
          }
        >
          Show info toast
        </Button>
      </div>
    </Toaster>
  )
}
