"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { SurveyLayout } from "@/components/survey/survey-layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function ConsentPage() {
  const router = useRouter()
  const [consented, setConsented] = useState(false)

  return (
    <SurveyLayout
      footer={
        <>
          <Button
            type="button"
            className="h-11 w-full text-base"
            disabled={!consented}
            onClick={() => router.push("/about-you")}
          >
            Continue
          </Button>
          <Button
            variant="ghost"
            className="mx-auto h-11 text-muted-foreground"
            render={<Link href="/exit" />}
          >
            I don&apos;t want to participate
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Before we begin
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            This survey is anonymous. We are not collecting your name or email
            address. We&apos;re trying to understand students&apos; morning
            routines and breakfast experiences on campus. There are no right or
            wrong answers, so please respond based on what you usually do.
            Participation is voluntary, and you may stop at any time.
          </p>
        </div>

        <Label
          htmlFor="consent"
          className="min-h-11 items-start gap-3 py-1 text-base font-normal text-foreground"
        >
          <Checkbox
            id="consent"
            checked={consented}
            onCheckedChange={(checked) => setConsented(checked === true)}
            className="mt-0.5"
          />
          I have read the information above and agree to participate in this
          survey.
        </Label>
      </div>
    </SurveyLayout>
  )
}
