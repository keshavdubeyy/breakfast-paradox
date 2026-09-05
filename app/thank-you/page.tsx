"use client"

import { SurveyLayout } from "@/components/survey/survey-layout"
import { StarRating } from "@/components/survey/star-rating"

export default function ThankYouPage() {
  return (
    <SurveyLayout>
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Thank you!
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Your response has been recorded. We really appreciate you taking the
          time to share your morning routine with us.
        </p>

        <div className="flex flex-col items-center gap-3 pt-2">
          <p className="text-sm font-medium text-foreground">
            How was your experience taking this survey?
          </p>
          <StarRating />
        </div>
      </div>
    </SurveyLayout>
  )
}
