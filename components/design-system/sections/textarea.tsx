"use client"

import { Textarea } from "@/components/ui/textarea"

export default function TextareaDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="ds-textarea-bio" className="text-sm font-medium">
          Bio
        </label>
        <Textarea
          id="ds-textarea-bio"
          placeholder="Tell us a little about yourself..."
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="ds-textarea-disabled" className="text-sm font-medium">
          Message (disabled)
        </label>
        <Textarea
          id="ds-textarea-disabled"
          placeholder="You can't edit this right now"
          disabled
        />
      </div>
    </div>
  )
}
