"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { SurveyLayout } from "@/components/survey/survey-layout"
import { QuestionBlock } from "@/components/survey/question-block"
import { useAutoAdvance } from "@/hooks/use-auto-advance"
import { vibrateError } from "@/lib/haptics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import {
  getAboutYouServerSnapshot,
  getAboutYouSnapshot,
  saveAboutYouAnswers,
  subscribeAboutYou,
  type AboutYouAnswers,
} from "@/lib/survey-state"
import { OTHER_PROGRAM_VALUE, PROGRAM_OPTIONS } from "@/lib/program-options"
import {
  EARLY_COMMITMENT_OPTIONS,
  GENDER_OPTIONS,
  HOSTEL_OPTIONS,
  YEAR_OPTIONS,
} from "@/lib/survey-options"
import { getSurveySectionProgress } from "@/lib/survey-sections"

type RequiredFieldKey =
  | "program"
  | "programOther"
  | "year"
  | "hostel"
  | "earlyCommitmentDays"

const FIELD_ORDER: RequiredFieldKey[] = [
  "program",
  "programOther",
  "year",
  "hostel",
  "earlyCommitmentDays",
]

// Includes every single-answer question block on the page, in the order
// they appear, so auto-advance knows what "next" means — "gender" isn't a
// required field, but it still needs a slot to scroll to and from.
type BlockKey = RequiredFieldKey | "gender"

const SCROLL_ORDER: BlockKey[] = [
  "program",
  "year",
  "hostel",
  "gender",
  "earlyCommitmentDays",
]

function validate(
  values: AboutYouAnswers
): Partial<Record<RequiredFieldKey, string>> {
  const errors: Partial<Record<RequiredFieldKey, string>> = {}

  if (!values.program) {
    errors.program = "Please select your program."
  } else if (
    values.program === OTHER_PROGRAM_VALUE &&
    !values.programOther.trim()
  ) {
    errors.programOther = "Please enter your program."
  }

  if (!values.year) {
    errors.year = "Please select your year."
  }

  if (!values.hostel) {
    errors.hostel = "Please select your hostel."
  }

  if (!values.earlyCommitmentDays) {
    errors.earlyCommitmentDays = "Please select an option."
  }

  return errors
}

function programLabel(value: string) {
  return PROGRAM_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export default function AboutYouPage() {
  const router = useRouter()
  // Sourced from sessionStorage so answers survive Back/Continue within the
  // same browser session. useSyncExternalStore (rather than "load in an
  // effect + setState") renders the server snapshot through hydration and
  // only swaps in the real client value right after, so there's no
  // server/client mismatch and no setState-in-effect race to manage.
  const values = useSyncExternalStore(
    subscribeAboutYou,
    getAboutYouSnapshot,
    getAboutYouServerSnapshot
  )
  const [submitted, setSubmitted] = useState(false)
  const { registerBlock, getBlock, advance } = useAutoAdvance<BlockKey>(SCROLL_ORDER)

  const errors = useMemo(
    () => (submitted ? validate(values) : {}),
    [submitted, values]
  )

  function updateField<K extends keyof AboutYouAnswers>(
    key: K,
    value: AboutYouAnswers[K]
  ) {
    saveAboutYouAnswers({ ...values, [key]: value })
  }

  function handleContinue() {
    setSubmitted(true)
    const nextErrors = validate(values)

    if (Object.keys(nextErrors).length > 0) {
      vibrateError()
      const firstInvalidKey = FIELD_ORDER.find((key) => nextErrors[key])
      if (firstInvalidKey) {
        const node = getBlock(firstInvalidKey)
        node?.focus()
        node?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    saveAboutYouAnswers(values)
    router.push("/usual-routine")
  }

  return (
    <SurveyLayout
      progress={getSurveySectionProgress("about-you")}
      footer={
        <div className="flex flex-row gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            className="min-h-11 flex-1 text-base"
            render={<Link href="/" />}
          >
            Back
          </Button>
          <Button
            type="button"
            className="min-h-11 flex-1 text-base"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            About You
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            A few quick questions to help us understand the context of your
            routine.
          </p>
        </div>

        <QuestionBlock
          ref={registerBlock("program")}
          title="Which program are you enrolled in?"
          required
          error={errors.program}
        >
          {({ describedBy }) => (
            <div className="flex flex-col gap-3">
              <Label htmlFor="about-you-program" className="sr-only">
                Which program are you currently enrolled in?
              </Label>
              <Combobox
                items={PROGRAM_OPTIONS.map((option) => option.value)}
                itemToStringLabel={programLabel}
                value={values.program || null}
                onValueChange={(value) => {
                  const nextValue = value ?? ""
                  updateField("program", nextValue)
                  if (nextValue && nextValue !== OTHER_PROGRAM_VALUE) {
                    advance("program")
                  }
                }}
              >
                <ComboboxInput
                  id="about-you-program"
                  placeholder="Select your program"
                  showClear
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.program}
                  className="h-8"
                />
                <ComboboxContent>
                  <ComboboxEmpty>No matching program found.</ComboboxEmpty>
                  <ComboboxList>
                    {(value: string) => (
                      <ComboboxItem key={value} value={value}>
                        {programLabel(value)}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              {values.program === OTHER_PROGRAM_VALUE ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="about-you-program-other" className="sr-only">
                    Enter your program
                  </Label>
                  <Input
                    id="about-you-program-other"
                    placeholder="Enter your program"
                    value={values.programOther}
                    onChange={(event) =>
                      updateField("programOther", event.target.value)
                    }
                    aria-invalid={!!errors.programOther}
                    aria-describedby={
                      errors.programOther
                        ? "about-you-program-other-error"
                        : undefined
                    }
                  />
                  {errors.programOther ? (
                    <p
                      id="about-you-program-other-error"
                      role="alert"
                      className="text-sm font-medium text-destructive"
                    >
                      {errors.programOther}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("year")}
          title="Which year of your program are you in?"
          required
          error={errors.year}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.year}
              value={values.year}
              onValueChange={(value) => {
                updateField("year", value as string)
                advance("year")
              }}
              className="gap-0"
            >
              {YEAR_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`about-you-year-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`about-you-year-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("hostel")}
          title="Which hostel do you currently stay in?"
          required
          error={errors.hostel}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.hostel}
              value={values.hostel}
              onValueChange={(value) => {
                updateField("hostel", value as string)
                advance("hostel")
              }}
              className="gap-0"
            >
              {HOSTEL_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`about-you-hostel-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`about-you-hostel-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("gender")}
          title="How do you describe your gender?"
        >
          {() => (
            <RadioGroup
              value={values.gender}
              onValueChange={(value) => {
                updateField("gender", value as string)
                advance("gender")
              }}
              className="gap-0"
            >
              {GENDER_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`about-you-gender-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`about-you-gender-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("earlyCommitmentDays")}
          title="In a typical week, on how many days do you have a class, lab, meeting, or other required activity before 9:00 AM?"
          required
          error={errors.earlyCommitmentDays}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.earlyCommitmentDays}
              value={values.earlyCommitmentDays}
              onValueChange={(value) => {
                updateField("earlyCommitmentDays", value as string)
                advance("earlyCommitmentDays")
              }}
              className="gap-0"
            >
              {EARLY_COMMITMENT_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`about-you-early-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`about-you-early-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>
      </div>
    </SurveyLayout>
  )
}
