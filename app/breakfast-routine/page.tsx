"use client"

import { useMemo, useRef, useSyncExternalStore, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { SurveyLayout } from "@/components/survey/survey-layout"
import { QuestionBlock } from "@/components/survey/question-block"
import { useAutoAdvance } from "@/hooks/use-auto-advance"
import { vibrateError } from "@/lib/haptics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import {
  getUsualRoutineServerSnapshot,
  getUsualRoutineSnapshot,
  saveUsualRoutineAnswers,
  subscribeUsualRoutine,
  type UsualRoutineAnswers,
} from "@/lib/survey-state"
import {
  BREAKFAST_ABSENCE_DECISION_POINT_OPTIONS,
  BREAKFAST_ABSENCE_REASON_OPTIONS,
  BREAKFAST_DAY_DIFFERENTIATOR_OPTIONS,
  BREAKFAST_DECISION_POINT_OPTIONS,
  BREAKFAST_MOMENT_OPTIONS,
  BREAKFAST_MOTIVATION_OPTIONS,
  BREAKFAST_PLAN_CHANGE_REASON_OPTIONS,
  BREAKFAST_ROUTINE_DESCRIPTION_OPTIONS,
  BREAKFAST_ROUTINE_DURATION_OPTIONS,
  BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS,
  EARLY_CLASS_ROUTINE_CHANGE_OPTIONS,
  MESS_BREAKFAST_TIME_OPTIONS,
  MESS_CHANGE_DETERMINANT_OPTIONS,
  MESS_CONSISTENCY_OPTIONS,
  MISSED_BREAKFAST_FREQUENCY_OPTIONS,
  MISSED_BREAKFAST_REASON_OPTIONS,
  OCCASIONAL_BREAKFAST_DIFFERENTIATOR_OPTIONS,
  OCCASIONAL_BREAKFAST_FREQUENCY_OPTIONS,
  OTHER_ACTIVITY_VALUE,
  UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS,
  UNWANTED_MESS_ACTION_OPTIONS,
  YES_NO_NOT_SURE_OPTIONS,
  YES_NO_SOMETIMES_OPTIONS,
} from "@/lib/survey-options"
import { getSurveySectionProgress } from "@/lib/survey-sections"

// Q7 ("In a typical week, how often do you usually eat breakfast at the
// mess?") on the Usual Routine page branches into a different follow-up
// question set here.
function isRegularBreakfastEater(values: UsualRoutineAnswers) {
  return (
    values.breakfastFrequency === "almost-every-day" ||
    values.breakfastFrequency === "most-days"
  )
}

function showsEarlyClassRoutineChangeActions(values: UsualRoutineAnswers) {
  return (
    values.earlyClassRoutineChange === "yes" ||
    values.earlyClassRoutineChange === "sometimes"
  )
}

function showsMissedBreakfastReasons(values: UsualRoutineAnswers) {
  return (
    values.missedBreakfastFrequency !== "" &&
    values.missedBreakfastFrequency !== "never"
  )
}

function showsMessChangeDeterminants(values: UsualRoutineAnswers) {
  return (
    values.messConsistency === "changes-sometimes" ||
    values.messConsistency === "changes-frequently"
  )
}

// Branch B: conditional breakfast eaters (Q7 = some days)
function isConditionalBreakfastEater(values: UsualRoutineAnswers) {
  return values.breakfastFrequency === "some-days"
}

function showsBreakfastPlanChangeReasons(values: UsualRoutineAnswers) {
  const mismatched = (frequency: string) =>
    frequency !== "" && frequency !== "never"
  return (
    mismatched(values.breakfastPlannedButSkippedFrequency) ||
    mismatched(values.breakfastUnplannedButWentFrequency)
  )
}

// Branch C: rare / non-breakfast eaters (Q7 = rarely / never)
function isRareOrNonBreakfastEater(values: UsualRoutineAnswers) {
  return (
    values.breakfastFrequency === "rarely" ||
    values.breakfastFrequency === "never"
  )
}

function showsOccasionalBreakfastDifferentiators(
  values: UsualRoutineAnswers
) {
  return (
    values.occasionalBreakfastFrequency !== "" &&
    values.occasionalBreakfastFrequency !== "never"
  )
}

function showsBreakfastFrequencyChangeDescription(
  values: UsualRoutineAnswers
) {
  return values.breakfastFrequencyChanged === "yes"
}

type RequiredFieldKey =
  | "messBreakfastTime"
  | "breakfastMoment"
  | "breakfastRoutineDuration"
  | "earlyClassRoutineChange"
  | "earlyClassRoutineChangeActions"
  | "missedBreakfastFrequency"
  | "missedBreakfastReasons"
  | "unwantedMessActions"
  | "messConsistency"
  | "messChangeDeterminants"
  | "breakfastRoutineDescription"
  | "breakfastMotivationFactors"
  | "conditionalMessBreakfastTime"
  | "breakfastDecisionPoint"
  | "breakfastDayDifferentiators"
  | "breakfastPlannedButSkippedFrequency"
  | "breakfastUnplannedButWentFrequency"
  | "breakfastPlanChangeReasons"
  | "breakfastServedTimeActivity"
  | "breakfastAbsenceReason"
  | "breakfastAbsenceDecisionPoint"
  | "occasionalBreakfastFrequency"
  | "occasionalBreakfastDifferentiators"
  | "unusedAllottedMealActions"
  | "breakfastFrequencyChanged"
  | "breakfastFrequencyChangeDescription"

const FIELD_ORDER: RequiredFieldKey[] = [
  "messBreakfastTime",
  "breakfastMoment",
  "breakfastRoutineDuration",
  "earlyClassRoutineChange",
  "earlyClassRoutineChangeActions",
  "missedBreakfastFrequency",
  "missedBreakfastReasons",
  "unwantedMessActions",
  "messConsistency",
  "messChangeDeterminants",
  "breakfastRoutineDescription",
  "breakfastMotivationFactors",
  "conditionalMessBreakfastTime",
  "breakfastDecisionPoint",
  "breakfastDayDifferentiators",
  "breakfastPlannedButSkippedFrequency",
  "breakfastUnplannedButWentFrequency",
  "breakfastPlanChangeReasons",
  "breakfastMotivationFactors",
  "breakfastServedTimeActivity",
  "breakfastAbsenceReason",
  "breakfastAbsenceDecisionPoint",
  "occasionalBreakfastFrequency",
  "occasionalBreakfastDifferentiators",
  "breakfastMotivationFactors",
  "unusedAllottedMealActions",
  "breakfastFrequencyChanged",
  "breakfastFrequencyChangeDescription",
]

function validateBranchA(
  values: UsualRoutineAnswers
): Partial<Record<RequiredFieldKey, string>> {
  const errors: Partial<Record<RequiredFieldKey, string>> = {}

  if (!values.messBreakfastTime) {
    errors.messBreakfastTime = "Please select an option."
  }

  if (!values.breakfastMoment) {
    errors.breakfastMoment = "Please select an option."
  } else if (
    values.breakfastMoment === OTHER_ACTIVITY_VALUE &&
    !values.breakfastMomentOther.trim()
  ) {
    errors.breakfastMoment = "Please describe the other option."
  }

  if (!values.breakfastRoutineDuration) {
    errors.breakfastRoutineDuration = "Please select an option."
  }

  if (!values.earlyClassRoutineChange) {
    errors.earlyClassRoutineChange = "Please select an option."
  }

  if (showsEarlyClassRoutineChangeActions(values)) {
    if (values.earlyClassRoutineChangeActions.length === 0) {
      errors.earlyClassRoutineChangeActions =
        "Please select at least one option."
    } else if (
      values.earlyClassRoutineChangeActions.includes(OTHER_ACTIVITY_VALUE) &&
      !values.earlyClassRoutineChangeActionOther.trim()
    ) {
      errors.earlyClassRoutineChangeActions =
        "Please describe the other option."
    }
  }

  if (!values.missedBreakfastFrequency) {
    errors.missedBreakfastFrequency = "Please select an option."
  }

  if (showsMissedBreakfastReasons(values)) {
    if (values.missedBreakfastReasons.length === 0) {
      errors.missedBreakfastReasons = "Please select at least one option."
    } else if (
      values.missedBreakfastReasons.includes(OTHER_ACTIVITY_VALUE) &&
      !values.missedBreakfastReasonOther.trim()
    ) {
      errors.missedBreakfastReasons = "Please describe the other option."
    }
  }

  if (values.unwantedMessActions.length === 0) {
    errors.unwantedMessActions = "Please select at least one option."
  } else if (
    values.unwantedMessActions.includes(OTHER_ACTIVITY_VALUE) &&
    !values.unwantedMessActionOther.trim()
  ) {
    errors.unwantedMessActions = "Please describe the other option."
  }

  if (!values.messConsistency) {
    errors.messConsistency = "Please select an option."
  }

  if (showsMessChangeDeterminants(values)) {
    if (values.messChangeDeterminants.length === 0) {
      errors.messChangeDeterminants = "Please select at least one option."
    } else if (
      values.messChangeDeterminants.includes(OTHER_ACTIVITY_VALUE) &&
      !values.messChangeDeterminantOther.trim()
    ) {
      errors.messChangeDeterminants = "Please describe the other option."
    }
  }

  if (!values.breakfastRoutineDescription) {
    errors.breakfastRoutineDescription = "Please select an option."
  } else if (
    values.breakfastRoutineDescription === OTHER_ACTIVITY_VALUE &&
    !values.breakfastRoutineDescriptionOther.trim()
  ) {
    errors.breakfastRoutineDescription = "Please describe the other option."
  }

  if (values.breakfastMotivationFactors.length === 0) {
    errors.breakfastMotivationFactors = "Please select at least one option."
  } else if (
    values.breakfastMotivationFactors.includes(OTHER_ACTIVITY_VALUE) &&
    !values.breakfastMotivationFactorOther.trim()
  ) {
    errors.breakfastMotivationFactors = "Please describe the other option."
  }

  return errors
}

function validateBranchB(
  values: UsualRoutineAnswers
): Partial<Record<RequiredFieldKey, string>> {
  const errors: Partial<Record<RequiredFieldKey, string>> = {}

  if (!values.conditionalMessBreakfastTime) {
    errors.conditionalMessBreakfastTime = "Please select an option."
  }

  if (!values.breakfastDecisionPoint) {
    errors.breakfastDecisionPoint = "Please select an option."
  }

  if (values.breakfastDayDifferentiators.length === 0) {
    errors.breakfastDayDifferentiators = "Please select at least one option."
  } else if (
    values.breakfastDayDifferentiators.includes(OTHER_ACTIVITY_VALUE) &&
    !values.breakfastDayDifferentiatorOther.trim()
  ) {
    errors.breakfastDayDifferentiators = "Please describe the other option."
  }

  if (!values.breakfastPlannedButSkippedFrequency) {
    errors.breakfastPlannedButSkippedFrequency = "Please select an option."
  }

  if (!values.breakfastUnplannedButWentFrequency) {
    errors.breakfastUnplannedButWentFrequency = "Please select an option."
  }

  if (showsBreakfastPlanChangeReasons(values)) {
    if (values.breakfastPlanChangeReasons.length === 0) {
      errors.breakfastPlanChangeReasons = "Please select at least one option."
    } else if (
      values.breakfastPlanChangeReasons.includes(OTHER_ACTIVITY_VALUE) &&
      !values.breakfastPlanChangeReasonOther.trim()
    ) {
      errors.breakfastPlanChangeReasons = "Please describe the other option."
    }
  }

  if (values.breakfastMotivationFactors.length === 0) {
    errors.breakfastMotivationFactors = "Please select at least one option."
  } else if (
    values.breakfastMotivationFactors.includes(OTHER_ACTIVITY_VALUE) &&
    !values.breakfastMotivationFactorOther.trim()
  ) {
    errors.breakfastMotivationFactors = "Please describe the other option."
  }

  return errors
}

function validateBranchC(
  values: UsualRoutineAnswers
): Partial<Record<RequiredFieldKey, string>> {
  const errors: Partial<Record<RequiredFieldKey, string>> = {}

  if (!values.breakfastServedTimeActivity) {
    errors.breakfastServedTimeActivity = "Please select an option."
  } else if (
    values.breakfastServedTimeActivity === OTHER_ACTIVITY_VALUE &&
    !values.breakfastServedTimeActivityOther.trim()
  ) {
    errors.breakfastServedTimeActivity = "Please describe the other option."
  }

  if (!values.breakfastAbsenceReason) {
    errors.breakfastAbsenceReason = "Please select an option."
  }

  if (!values.breakfastAbsenceDecisionPoint) {
    errors.breakfastAbsenceDecisionPoint = "Please select an option."
  }

  if (!values.occasionalBreakfastFrequency) {
    errors.occasionalBreakfastFrequency = "Please select an option."
  }

  if (showsOccasionalBreakfastDifferentiators(values)) {
    if (values.occasionalBreakfastDifferentiators.length === 0) {
      errors.occasionalBreakfastDifferentiators =
        "Please select at least one option."
    } else if (
      values.occasionalBreakfastDifferentiators.includes(
        OTHER_ACTIVITY_VALUE
      ) &&
      !values.occasionalBreakfastDifferentiatorOther.trim()
    ) {
      errors.occasionalBreakfastDifferentiators =
        "Please describe the other option."
    }
  }

  if (showsOccasionalBreakfastDifferentiators(values)) {
    if (values.breakfastMotivationFactors.length === 0) {
      errors.breakfastMotivationFactors = "Please select at least one option."
    } else if (
      values.breakfastMotivationFactors.includes(OTHER_ACTIVITY_VALUE) &&
      !values.breakfastMotivationFactorOther.trim()
    ) {
      errors.breakfastMotivationFactors = "Please describe the other option."
    }
  }

  if (values.unusedAllottedMealActions.length === 0) {
    errors.unusedAllottedMealActions = "Please select at least one option."
  } else if (
    values.unusedAllottedMealActions.includes(OTHER_ACTIVITY_VALUE) &&
    !values.unusedAllottedMealActionOther.trim()
  ) {
    errors.unusedAllottedMealActions = "Please describe the other option."
  }

  if (!values.breakfastFrequencyChanged) {
    errors.breakfastFrequencyChanged = "Please select an option."
  }

  if (
    showsBreakfastFrequencyChangeDescription(values) &&
    !values.breakfastFrequencyChangeDescription.trim()
  ) {
    errors.breakfastFrequencyChangeDescription = "Please describe what changed."
  }

  return errors
}

function validate(
  values: UsualRoutineAnswers
): Partial<Record<RequiredFieldKey, string>> {
  if (isRegularBreakfastEater(values)) {
    return validateBranchA(values)
  }
  if (isConditionalBreakfastEater(values)) {
    return validateBranchB(values)
  }
  if (isRareOrNonBreakfastEater(values)) {
    return validateBranchC(values)
  }
  return {}
}

function toggleValue(list: string[], value: string, checked: boolean) {
  return checked ? [...list, value] : list.filter((item) => item !== value)
}

export default function BreakfastRoutinePage() {
  const router = useRouter()
  const values = useSyncExternalStore(
    subscribeUsualRoutine,
    getUsualRoutineSnapshot,
    getUsualRoutineServerSnapshot
  )
  const [submitted, setSubmitted] = useState(false)
  const { registerBlock, getBlock, advance } =
    useAutoAdvance<RequiredFieldKey>(FIELD_ORDER)
  const fallbackFocusRef = useRef<HTMLDivElement | null>(null)

  const errors = useMemo(
    () => (submitted ? validate(values) : {}),
    [submitted, values]
  )

  function updateField<K extends keyof UsualRoutineAnswers>(
    key: K,
    value: UsualRoutineAnswers[K]
  ) {
    saveUsualRoutineAnswers({ ...values, [key]: value })
  }

  function updateEarlyClassRoutineChange(value: string) {
    const showsActions = value === "yes" || value === "sometimes"
    saveUsualRoutineAnswers({
      ...values,
      earlyClassRoutineChange: value,
      earlyClassRoutineChangeActions: showsActions
        ? values.earlyClassRoutineChangeActions
        : [],
      earlyClassRoutineChangeActionOther: showsActions
        ? values.earlyClassRoutineChangeActionOther
        : "",
    })
    advance("earlyClassRoutineChange")
  }

  function updateEarlyClassRoutineChangeActions(
    value: string,
    checked: boolean
  ) {
    updateField(
      "earlyClassRoutineChangeActions",
      toggleValue(values.earlyClassRoutineChangeActions, value, checked)
    )
  }

  function updateMissedBreakfastFrequency(value: string) {
    const showsReasons = value !== "never"
    saveUsualRoutineAnswers({
      ...values,
      missedBreakfastFrequency: value,
      missedBreakfastReasons: showsReasons ? values.missedBreakfastReasons : [],
      missedBreakfastReasonOther: showsReasons
        ? values.missedBreakfastReasonOther
        : "",
    })
    advance("missedBreakfastFrequency")
  }

  function updateMissedBreakfastReasons(value: string, checked: boolean) {
    updateField(
      "missedBreakfastReasons",
      toggleValue(values.missedBreakfastReasons, value, checked)
    )
  }

  function updateUnwantedMessActions(value: string, checked: boolean) {
    updateField(
      "unwantedMessActions",
      toggleValue(values.unwantedMessActions, value, checked)
    )
  }

  function updateMessConsistency(value: string) {
    const showsDeterminants =
      value === "changes-sometimes" || value === "changes-frequently"
    saveUsualRoutineAnswers({
      ...values,
      messConsistency: value,
      messChangeDeterminants: showsDeterminants
        ? values.messChangeDeterminants
        : [],
      messChangeDeterminantOther: showsDeterminants
        ? values.messChangeDeterminantOther
        : "",
    })
    advance("messConsistency")
  }

  function updateMessChangeDeterminants(value: string, checked: boolean) {
    updateField(
      "messChangeDeterminants",
      toggleValue(values.messChangeDeterminants, value, checked)
    )
  }

  function updateBreakfastDayDifferentiators(value: string, checked: boolean) {
    updateField(
      "breakfastDayDifferentiators",
      toggleValue(values.breakfastDayDifferentiators, value, checked)
    )
  }

  function updateBreakfastMismatchFrequency(
    field: "breakfastPlannedButSkippedFrequency" | "breakfastUnplannedButWentFrequency",
    value: string
  ) {
    const next = { ...values, [field]: value }
    const showsReasons = showsBreakfastPlanChangeReasons(next)
    saveUsualRoutineAnswers({
      ...next,
      breakfastPlanChangeReasons: showsReasons
        ? next.breakfastPlanChangeReasons
        : [],
      breakfastPlanChangeReasonOther: showsReasons
        ? next.breakfastPlanChangeReasonOther
        : "",
    })
    advance(field)
  }

  function updateBreakfastPlanChangeReasons(value: string, checked: boolean) {
    updateField(
      "breakfastPlanChangeReasons",
      toggleValue(values.breakfastPlanChangeReasons, value, checked)
    )
  }

  function updateOccasionalBreakfastFrequency(value: string) {
    const showsDifferentiators = value !== "never"
    saveUsualRoutineAnswers({
      ...values,
      occasionalBreakfastFrequency: value,
      occasionalBreakfastDifferentiators: showsDifferentiators
        ? values.occasionalBreakfastDifferentiators
        : [],
      occasionalBreakfastDifferentiatorOther: showsDifferentiators
        ? values.occasionalBreakfastDifferentiatorOther
        : "",
    })
    advance("occasionalBreakfastFrequency")
  }

  function updateOccasionalBreakfastDifferentiators(
    value: string,
    checked: boolean
  ) {
    updateField(
      "occasionalBreakfastDifferentiators",
      toggleValue(values.occasionalBreakfastDifferentiators, value, checked)
    )
  }

  function updateUnusedAllottedMealActions(value: string, checked: boolean) {
    updateField(
      "unusedAllottedMealActions",
      toggleValue(values.unusedAllottedMealActions, value, checked)
    )
  }

  // Shared across all three branches — same question, different position.
  function updateBreakfastMotivationFactors(value: string, checked: boolean) {
    updateField(
      "breakfastMotivationFactors",
      toggleValue(values.breakfastMotivationFactors, value, checked)
    )
  }

  function updateBreakfastFrequencyChanged(value: string) {
    const showsDescription = value === "yes"
    saveUsualRoutineAnswers({
      ...values,
      breakfastFrequencyChanged: value,
      breakfastFrequencyChangeDescription: showsDescription
        ? values.breakfastFrequencyChangeDescription
        : "",
    })
    if (!showsDescription) {
      advance("breakfastFrequencyChanged")
    }
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

    router.push("/after-morning-routine")
  }

  return (
    <SurveyLayout
      progress={getSurveySectionProgress("breakfast-routine")}
      footer={
        <div className="flex flex-row gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            className="min-h-11 flex-1 text-base"
            render={<Link href="/usual-routine" />}
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
        <div className="flex flex-col gap-3" ref={fallbackFocusRef}>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Your Breakfast Routine
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            A few more questions, based on how often you usually eat
            breakfast at the mess.
          </p>
        </div>

        {isRegularBreakfastEater(values) ? (
          <>
            <QuestionBlock
              ref={registerBlock("messBreakfastTime")}
              title="Around what time do you usually go to the mess for breakfast?"
              required
              error={errors.messBreakfastTime}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.messBreakfastTime}
                  value={values.messBreakfastTime}
                  onValueChange={(value) => {
                    updateField("messBreakfastTime", value as string)
                    advance("messBreakfastTime")
                  }}
                  className="gap-0"
                >
                  {MESS_BREAKFAST_TIME_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`mess-breakfast-time-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`mess-breakfast-time-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastMoment")}
              title="At what point in your morning do you usually have breakfast?"
              required
              error={errors.breakfastMoment}
            >
              {({ describedBy }) => (
                <div className="flex flex-col gap-3">
                  <RadioGroup
                    aria-describedby={describedBy}
                    aria-invalid={!!errors.breakfastMoment}
                    value={values.breakfastMoment}
                    onValueChange={(value) => {
                      updateField("breakfastMoment", value as string)
                      advance("breakfastMoment")
                    }}
                    className="gap-0"
                  >
                    {BREAKFAST_MOMENT_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`breakfast-moment-${option.value}`}
                        className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                      >
                        <RadioGroupItem
                          id={`breakfast-moment-${option.value}`}
                          value={option.value}
                        />
                        {option.label}
                      </Label>
                    ))}
                  </RadioGroup>

                  {values.breakfastMoment === OTHER_ACTIVITY_VALUE ? (
                    <Input
                      id="breakfast-moment-other-input"
                      placeholder="Describe the other option"
                      value={values.breakfastMomentOther}
                      onChange={(event) =>
                        updateField("breakfastMomentOther", event.target.value)
                      }
                    />
                  ) : null}
                </div>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastRoutineDuration")}
              title="Around how much time does your usual breakfast routine take, including going to the mess, eating, and leaving?"
              required
              error={errors.breakfastRoutineDuration}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.breakfastRoutineDuration}
                  value={values.breakfastRoutineDuration}
                  onValueChange={(value) => {
                    updateField("breakfastRoutineDuration", value as string)
                    advance("breakfastRoutineDuration")
                  }}
                  className="gap-0"
                >
                  {BREAKFAST_ROUTINE_DURATION_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-routine-duration-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`breakfast-routine-duration-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("earlyClassRoutineChange")}
              title="On days when you have an early class or commitment, do you usually change your morning routine to make time for breakfast?"
              required
              error={errors.earlyClassRoutineChange}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.earlyClassRoutineChange}
                  value={values.earlyClassRoutineChange}
                  onValueChange={(value) =>
                    updateEarlyClassRoutineChange(value as string)
                  }
                  className="gap-0"
                >
                  {YES_NO_SOMETIMES_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`early-class-routine-change-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`early-class-routine-change-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            {showsEarlyClassRoutineChangeActions(values) ? (
              <QuestionBlock
                ref={registerBlock("earlyClassRoutineChangeActions")}
                title="If yes, what do you usually change?"
                helperText="Select all that apply."
                required
                error={errors.earlyClassRoutineChangeActions}
              >
                {({ describedBy }) => (
                  <div className="flex flex-col gap-3">
                    <div
                      role="group"
                      aria-describedby={describedBy}
                      data-invalid={!!errors.earlyClassRoutineChangeActions}
                      className="flex flex-col gap-0"
                    >
                      {EARLY_CLASS_ROUTINE_CHANGE_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`early-class-routine-change-action-${option.value}`}
                          className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                        >
                          <Checkbox
                            id={`early-class-routine-change-action-${option.value}`}
                            checked={values.earlyClassRoutineChangeActions.includes(
                              option.value
                            )}
                            onCheckedChange={(checked) =>
                              updateEarlyClassRoutineChangeActions(
                                option.value,
                                checked === true
                              )
                            }
                          />
                          {option.label}
                        </Label>
                      ))}
                    </div>

                    {values.earlyClassRoutineChangeActions.includes(
                      OTHER_ACTIVITY_VALUE
                    ) ? (
                      <Input
                        id="early-class-routine-change-action-other-input"
                        placeholder="Describe what you usually change"
                        value={values.earlyClassRoutineChangeActionOther}
                        onChange={(event) =>
                          updateField(
                            "earlyClassRoutineChangeActionOther",
                            event.target.value
                          )
                        }
                      />
                    ) : null}
                  </div>
                )}
              </QuestionBlock>
            ) : null}

            <QuestionBlock
              ref={registerBlock("missedBreakfastFrequency")}
              title="Are there days when you usually intend to have breakfast at the mess but end up missing it?"
              required
              error={errors.missedBreakfastFrequency}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.missedBreakfastFrequency}
                  value={values.missedBreakfastFrequency}
                  onValueChange={(value) =>
                    updateMissedBreakfastFrequency(value as string)
                  }
                  className="gap-0"
                >
                  {MISSED_BREAKFAST_FREQUENCY_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`missed-breakfast-frequency-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`missed-breakfast-frequency-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            {showsMissedBreakfastReasons(values) ? (
              <QuestionBlock
                ref={registerBlock("missedBreakfastReasons")}
                title="What usually happens on those days?"
                helperText="Select all that apply."
                required
                error={errors.missedBreakfastReasons}
              >
                {({ describedBy }) => (
                  <div className="flex flex-col gap-3">
                    <div
                      role="group"
                      aria-describedby={describedBy}
                      data-invalid={!!errors.missedBreakfastReasons}
                      className="flex flex-col gap-0"
                    >
                      {MISSED_BREAKFAST_REASON_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`missed-breakfast-reason-${option.value}`}
                          className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                        >
                          <Checkbox
                            id={`missed-breakfast-reason-${option.value}`}
                            checked={values.missedBreakfastReasons.includes(
                              option.value
                            )}
                            onCheckedChange={(checked) =>
                              updateMissedBreakfastReasons(
                                option.value,
                                checked === true
                              )
                            }
                          />
                          {option.label}
                        </Label>
                      ))}
                    </div>

                    {values.missedBreakfastReasons.includes(
                      OTHER_ACTIVITY_VALUE
                    ) ? (
                      <Input
                        id="missed-breakfast-reason-other-input"
                        placeholder="Describe what usually happens"
                        value={values.missedBreakfastReasonOther}
                        onChange={(event) =>
                          updateField(
                            "missedBreakfastReasonOther",
                            event.target.value
                          )
                        }
                      />
                    ) : null}
                  </div>
                )}
              </QuestionBlock>
            ) : null}

            <QuestionBlock
              ref={registerBlock("unwantedMessActions")}
              title="If the mess you are allotted/registered for is not the one you want, what do you usually do?"
              helperText="Select all that apply."
              required
              error={errors.unwantedMessActions}
            >
              {({ describedBy }) => (
                <div className="flex flex-col gap-3">
                  <div
                    role="group"
                    aria-describedby={describedBy}
                    data-invalid={!!errors.unwantedMessActions}
                    className="flex flex-col gap-0"
                  >
                    {UNWANTED_MESS_ACTION_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`unwanted-mess-action-${option.value}`}
                        className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                      >
                        <Checkbox
                          id={`unwanted-mess-action-${option.value}`}
                          checked={values.unwantedMessActions.includes(
                            option.value
                          )}
                          onCheckedChange={(checked) =>
                            updateUnwantedMessActions(
                              option.value,
                              checked === true
                            )
                          }
                        />
                        {option.label}
                      </Label>
                    ))}
                  </div>

                  {values.unwantedMessActions.includes(OTHER_ACTIVITY_VALUE) ? (
                    <Input
                      id="unwanted-mess-action-other-input"
                      placeholder="Describe what you usually do"
                      value={values.unwantedMessActionOther}
                      onChange={(event) =>
                        updateField(
                          "unwantedMessActionOther",
                          event.target.value
                        )
                      }
                    />
                  ) : null}
                </div>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("messConsistency")}
              title="Do you usually have breakfast at the same allotted mess?"
              required
              error={errors.messConsistency}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.messConsistency}
                  value={values.messConsistency}
                  onValueChange={(value) =>
                    updateMessConsistency(value as string)
                  }
                  className="gap-0"
                >
                  {MESS_CONSISTENCY_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`mess-consistency-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`mess-consistency-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            {showsMessChangeDeterminants(values) ? (
              <QuestionBlock
                ref={registerBlock("messChangeDeterminants")}
                title="If it changes, what usually determines where you eat?"
                helperText="Select all that apply."
                required
                error={errors.messChangeDeterminants}
              >
                {({ describedBy }) => (
                  <div className="flex flex-col gap-3">
                    <div
                      role="group"
                      aria-describedby={describedBy}
                      data-invalid={!!errors.messChangeDeterminants}
                      className="flex flex-col gap-0"
                    >
                      {MESS_CHANGE_DETERMINANT_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`mess-change-determinant-${option.value}`}
                          className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                        >
                          <Checkbox
                            id={`mess-change-determinant-${option.value}`}
                            checked={values.messChangeDeterminants.includes(
                              option.value
                            )}
                            onCheckedChange={(checked) =>
                              updateMessChangeDeterminants(
                                option.value,
                                checked === true
                              )
                            }
                          />
                          {option.label}
                        </Label>
                      ))}
                    </div>

                    {values.messChangeDeterminants.includes(
                      OTHER_ACTIVITY_VALUE
                    ) ? (
                      <Input
                        id="mess-change-determinant-other-input"
                        placeholder="Describe what else determines it"
                        value={values.messChangeDeterminantOther}
                        onChange={(event) =>
                          updateField(
                            "messChangeDeterminantOther",
                            event.target.value
                          )
                        }
                      />
                    ) : null}
                  </div>
                )}
              </QuestionBlock>
            ) : null}

            <QuestionBlock
              ref={registerBlock("breakfastRoutineDescription")}
              title="How would you describe breakfast in your usual morning routine?"
              required
              error={errors.breakfastRoutineDescription}
            >
              {({ describedBy }) => (
                <div className="flex flex-col gap-3">
                  <RadioGroup
                    aria-describedby={describedBy}
                    aria-invalid={!!errors.breakfastRoutineDescription}
                    value={values.breakfastRoutineDescription}
                    onValueChange={(value) => {
                      updateField("breakfastRoutineDescription", value as string)
                      advance("breakfastRoutineDescription")
                    }}
                    className="gap-0"
                  >
                    {BREAKFAST_ROUTINE_DESCRIPTION_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`breakfast-routine-description-${option.value}`}
                        className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                      >
                        <RadioGroupItem
                          id={`breakfast-routine-description-${option.value}`}
                          value={option.value}
                        />
                        {option.label}
                      </Label>
                    ))}
                  </RadioGroup>

                  {values.breakfastRoutineDescription === OTHER_ACTIVITY_VALUE ? (
                    <Input
                      id="breakfast-routine-description-other-input"
                      placeholder="Describe it in your own words"
                      value={values.breakfastRoutineDescriptionOther}
                      onChange={(event) =>
                        updateField(
                          "breakfastRoutineDescriptionOther",
                          event.target.value
                        )
                      }
                    />
                  ) : null}
                </div>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastMotivationFactors")}
              title="On the days when you do have breakfast at the mess, what usually makes you decide to go?"
              helperText="Select all that apply."
              required
              error={errors.breakfastMotivationFactors}
            >
              {({ describedBy }) => (
                <div className="flex flex-col gap-3">
                  <div
                    role="group"
                    aria-describedby={describedBy}
                    data-invalid={!!errors.breakfastMotivationFactors}
                    className="flex flex-col gap-0"
                  >
                    {BREAKFAST_MOTIVATION_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`breakfast-motivation-${option.value}`}
                        className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                      >
                        <Checkbox
                          id={`breakfast-motivation-${option.value}`}
                          checked={values.breakfastMotivationFactors.includes(
                            option.value
                          )}
                          onCheckedChange={(checked) =>
                            updateBreakfastMotivationFactors(
                              option.value,
                              checked === true
                            )
                          }
                        />
                        {option.label}
                      </Label>
                    ))}
                  </div>

                  {values.breakfastMotivationFactors.includes(
                    OTHER_ACTIVITY_VALUE
                  ) ? (
                    <Input
                      id="breakfast-motivation-other-input"
                      placeholder="Describe what else makes you decide to go"
                      value={values.breakfastMotivationFactorOther}
                      onChange={(event) =>
                        updateField(
                          "breakfastMotivationFactorOther",
                          event.target.value
                        )
                      }
                    />
                  ) : null}
                </div>
              )}
            </QuestionBlock>
          </>
        ) : null}

        {isConditionalBreakfastEater(values) ? (
          <>
            <QuestionBlock
              ref={registerBlock("conditionalMessBreakfastTime")}
              title="On days when you have breakfast at the mess, around what time do you usually go?"
              required
              error={errors.conditionalMessBreakfastTime}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.conditionalMessBreakfastTime}
                  value={values.conditionalMessBreakfastTime}
                  onValueChange={(value) => {
                    updateField("conditionalMessBreakfastTime", value as string)
                    advance("conditionalMessBreakfastTime")
                  }}
                  className="gap-0"
                >
                  {MESS_BREAKFAST_TIME_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`conditional-mess-breakfast-time-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`conditional-mess-breakfast-time-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastDecisionPoint")}
              title="At what point do you usually decide whether you will eat breakfast at the mess that day?"
              required
              error={errors.breakfastDecisionPoint}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.breakfastDecisionPoint}
                  value={values.breakfastDecisionPoint}
                  onValueChange={(value) => {
                    updateField("breakfastDecisionPoint", value as string)
                    advance("breakfastDecisionPoint")
                  }}
                  className="gap-0"
                >
                  {BREAKFAST_DECISION_POINT_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-decision-point-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`breakfast-decision-point-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastDayDifferentiators")}
              title="What is usually different on the days when you eat breakfast at the mess compared with the days when you don’t?"
              helperText="Select all that apply."
              required
              error={errors.breakfastDayDifferentiators}
            >
              {({ describedBy }) => (
                <div className="flex flex-col gap-3">
                  <div
                    role="group"
                    aria-describedby={describedBy}
                    data-invalid={!!errors.breakfastDayDifferentiators}
                    className="flex flex-col gap-0"
                  >
                    {BREAKFAST_DAY_DIFFERENTIATOR_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`breakfast-day-differentiator-${option.value}`}
                        className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                      >
                        <Checkbox
                          id={`breakfast-day-differentiator-${option.value}`}
                          checked={values.breakfastDayDifferentiators.includes(
                            option.value
                          )}
                          onCheckedChange={(checked) =>
                            updateBreakfastDayDifferentiators(
                              option.value,
                              checked === true
                            )
                          }
                        />
                        {option.label}
                      </Label>
                    ))}
                  </div>

                  {values.breakfastDayDifferentiators.includes(
                    OTHER_ACTIVITY_VALUE
                  ) ? (
                    <Input
                      id="breakfast-day-differentiator-other-input"
                      placeholder="Describe what else is different"
                      value={values.breakfastDayDifferentiatorOther}
                      onChange={(event) =>
                        updateField(
                          "breakfastDayDifferentiatorOther",
                          event.target.value
                        )
                      }
                    />
                  ) : null}
                </div>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastPlannedButSkippedFrequency")}
              title="How often do you plan to eat breakfast at the mess but end up not going?"
              required
              error={errors.breakfastPlannedButSkippedFrequency}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.breakfastPlannedButSkippedFrequency}
                  value={values.breakfastPlannedButSkippedFrequency}
                  onValueChange={(value) =>
                    updateBreakfastMismatchFrequency(
                      "breakfastPlannedButSkippedFrequency",
                      value as string
                    )
                  }
                  className="gap-0"
                >
                  {MISSED_BREAKFAST_FREQUENCY_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-planned-but-skipped-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`breakfast-planned-but-skipped-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastUnplannedButWentFrequency")}
              title="How often do you initially not plan to eat breakfast at the mess but end up going anyway?"
              required
              error={errors.breakfastUnplannedButWentFrequency}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.breakfastUnplannedButWentFrequency}
                  value={values.breakfastUnplannedButWentFrequency}
                  onValueChange={(value) =>
                    updateBreakfastMismatchFrequency(
                      "breakfastUnplannedButWentFrequency",
                      value as string
                    )
                  }
                  className="gap-0"
                >
                  {MISSED_BREAKFAST_FREQUENCY_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-unplanned-but-went-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`breakfast-unplanned-but-went-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            {showsBreakfastPlanChangeReasons(values) ? (
              <QuestionBlock
                ref={registerBlock("breakfastPlanChangeReasons")}
                title="What usually makes your breakfast plan change?"
                helperText="Select all that apply."
                required
                error={errors.breakfastPlanChangeReasons}
              >
                {({ describedBy }) => (
                  <div className="flex flex-col gap-3">
                    <div
                      role="group"
                      aria-describedby={describedBy}
                      data-invalid={!!errors.breakfastPlanChangeReasons}
                      className="flex flex-col gap-0"
                    >
                      {BREAKFAST_PLAN_CHANGE_REASON_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`breakfast-plan-change-reason-${option.value}`}
                          className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                        >
                          <Checkbox
                            id={`breakfast-plan-change-reason-${option.value}`}
                            checked={values.breakfastPlanChangeReasons.includes(
                              option.value
                            )}
                            onCheckedChange={(checked) =>
                              updateBreakfastPlanChangeReasons(
                                option.value,
                                checked === true
                              )
                            }
                          />
                          {option.label}
                        </Label>
                      ))}
                    </div>

                    {values.breakfastPlanChangeReasons.includes(
                      OTHER_ACTIVITY_VALUE
                    ) ? (
                      <Input
                        id="breakfast-plan-change-reason-other-input"
                        placeholder="Describe what else makes it change"
                        value={values.breakfastPlanChangeReasonOther}
                        onChange={(event) =>
                          updateField(
                            "breakfastPlanChangeReasonOther",
                            event.target.value
                          )
                        }
                      />
                    ) : null}
                  </div>
                )}
              </QuestionBlock>
            ) : null}

            <QuestionBlock
              ref={registerBlock("breakfastMotivationFactors")}
              title="On the days when you do have breakfast at the mess, what usually makes you decide to go?"
              helperText="Select all that apply."
              required
              error={errors.breakfastMotivationFactors}
            >
              {({ describedBy }) => (
                <div className="flex flex-col gap-3">
                  <div
                    role="group"
                    aria-describedby={describedBy}
                    data-invalid={!!errors.breakfastMotivationFactors}
                    className="flex flex-col gap-0"
                  >
                    {BREAKFAST_MOTIVATION_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`breakfast-motivation-${option.value}`}
                        className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                      >
                        <Checkbox
                          id={`breakfast-motivation-${option.value}`}
                          checked={values.breakfastMotivationFactors.includes(
                            option.value
                          )}
                          onCheckedChange={(checked) =>
                            updateBreakfastMotivationFactors(
                              option.value,
                              checked === true
                            )
                          }
                        />
                        {option.label}
                      </Label>
                    ))}
                  </div>

                  {values.breakfastMotivationFactors.includes(
                    OTHER_ACTIVITY_VALUE
                  ) ? (
                    <Input
                      id="breakfast-motivation-other-input"
                      placeholder="Describe what else makes you decide to go"
                      value={values.breakfastMotivationFactorOther}
                      onChange={(event) =>
                        updateField(
                          "breakfastMotivationFactorOther",
                          event.target.value
                        )
                      }
                    />
                  ) : null}
                </div>
              )}
            </QuestionBlock>
          </>
        ) : null}

        {isRareOrNonBreakfastEater(values) ? (
          <>
            <QuestionBlock
              ref={registerBlock("breakfastServedTimeActivity")}
              title="During the time breakfast is usually being served, what are you most often doing?"
              required
              error={errors.breakfastServedTimeActivity}
            >
              {({ describedBy }) => (
                <div className="flex flex-col gap-3">
                  <RadioGroup
                    aria-describedby={describedBy}
                    aria-invalid={!!errors.breakfastServedTimeActivity}
                    value={values.breakfastServedTimeActivity}
                    onValueChange={(value) => {
                      updateField("breakfastServedTimeActivity", value as string)
                      advance("breakfastServedTimeActivity")
                    }}
                    className="gap-0"
                  >
                    {BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`breakfast-served-time-activity-${option.value}`}
                        className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                      >
                        <RadioGroupItem
                          id={`breakfast-served-time-activity-${option.value}`}
                          value={option.value}
                        />
                        {option.label}
                      </Label>
                    ))}
                  </RadioGroup>

                  {values.breakfastServedTimeActivity === OTHER_ACTIVITY_VALUE ? (
                    <Input
                      id="breakfast-served-time-activity-other-input"
                      placeholder="Describe what else you're usually doing"
                      value={values.breakfastServedTimeActivityOther}
                      onChange={(event) =>
                        updateField(
                          "breakfastServedTimeActivityOther",
                          event.target.value
                        )
                      }
                    />
                  ) : null}
                </div>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastAbsenceReason")}
              title="Is not going to the mess for breakfast usually a conscious decision for you, or does it simply not become part of your morning routine?"
              required
              error={errors.breakfastAbsenceReason}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.breakfastAbsenceReason}
                  value={values.breakfastAbsenceReason}
                  onValueChange={(value) => {
                    updateField("breakfastAbsenceReason", value as string)
                    advance("breakfastAbsenceReason")
                  }}
                  className="gap-0"
                >
                  {BREAKFAST_ABSENCE_REASON_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-absence-reason-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`breakfast-absence-reason-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastAbsenceDecisionPoint")}
              title="At what point do you usually know that you will not go to the mess for breakfast?"
              required
              error={errors.breakfastAbsenceDecisionPoint}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.breakfastAbsenceDecisionPoint}
                  value={values.breakfastAbsenceDecisionPoint}
                  onValueChange={(value) => {
                    updateField("breakfastAbsenceDecisionPoint", value as string)
                    advance("breakfastAbsenceDecisionPoint")
                  }}
                  className="gap-0"
                >
                  {BREAKFAST_ABSENCE_DECISION_POINT_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-absence-decision-point-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`breakfast-absence-decision-point-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("occasionalBreakfastFrequency")}
              title="Are there situations when you do end up having breakfast at the mess?"
              required
              error={errors.occasionalBreakfastFrequency}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.occasionalBreakfastFrequency}
                  value={values.occasionalBreakfastFrequency}
                  onValueChange={(value) =>
                    updateOccasionalBreakfastFrequency(value as string)
                  }
                  className="gap-0"
                >
                  {OCCASIONAL_BREAKFAST_FREQUENCY_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`occasional-breakfast-frequency-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`occasional-breakfast-frequency-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            {showsOccasionalBreakfastDifferentiators(values) ? (
              <QuestionBlock
                ref={registerBlock("occasionalBreakfastDifferentiators")}
                title="If yes, what is usually different on those days?"
                helperText="Select all that apply."
                required
                error={errors.occasionalBreakfastDifferentiators}
              >
                {({ describedBy }) => (
                  <div className="flex flex-col gap-3">
                    <div
                      role="group"
                      aria-describedby={describedBy}
                      data-invalid={!!errors.occasionalBreakfastDifferentiators}
                      className="flex flex-col gap-0"
                    >
                      {OCCASIONAL_BREAKFAST_DIFFERENTIATOR_OPTIONS.map(
                        (option) => (
                          <Label
                            key={option.value}
                            htmlFor={`occasional-breakfast-differentiator-${option.value}`}
                            className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                          >
                            <Checkbox
                              id={`occasional-breakfast-differentiator-${option.value}`}
                              checked={values.occasionalBreakfastDifferentiators.includes(
                                option.value
                              )}
                              onCheckedChange={(checked) =>
                                updateOccasionalBreakfastDifferentiators(
                                  option.value,
                                  checked === true
                                )
                              }
                            />
                            {option.label}
                          </Label>
                        )
                      )}
                    </div>

                    {values.occasionalBreakfastDifferentiators.includes(
                      OTHER_ACTIVITY_VALUE
                    ) ? (
                      <Input
                        id="occasional-breakfast-differentiator-other-input"
                        placeholder="Describe what else is different"
                        value={values.occasionalBreakfastDifferentiatorOther}
                        onChange={(event) =>
                          updateField(
                            "occasionalBreakfastDifferentiatorOther",
                            event.target.value
                          )
                        }
                      />
                    ) : null}
                  </div>
                )}
              </QuestionBlock>
            ) : null}

            {showsOccasionalBreakfastDifferentiators(values) ? (
              <QuestionBlock
                ref={registerBlock("breakfastMotivationFactors")}
                title="On the days when you do have breakfast at the mess, what usually makes you decide to go?"
                helperText="Select all that apply."
                required
                error={errors.breakfastMotivationFactors}
              >
                {({ describedBy }) => (
                  <div className="flex flex-col gap-3">
                    <div
                      role="group"
                      aria-describedby={describedBy}
                      data-invalid={!!errors.breakfastMotivationFactors}
                      className="flex flex-col gap-0"
                    >
                      {BREAKFAST_MOTIVATION_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`breakfast-motivation-${option.value}`}
                          className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                        >
                          <Checkbox
                            id={`breakfast-motivation-${option.value}`}
                            checked={values.breakfastMotivationFactors.includes(
                              option.value
                            )}
                            onCheckedChange={(checked) =>
                              updateBreakfastMotivationFactors(
                                option.value,
                                checked === true
                              )
                            }
                          />
                          {option.label}
                        </Label>
                      ))}
                    </div>

                    {values.breakfastMotivationFactors.includes(
                      OTHER_ACTIVITY_VALUE
                    ) ? (
                      <Input
                        id="breakfast-motivation-other-input"
                        placeholder="Describe what else makes you decide to go"
                        value={values.breakfastMotivationFactorOther}
                        onChange={(event) =>
                          updateField(
                            "breakfastMotivationFactorOther",
                            event.target.value
                          )
                        }
                      />
                    ) : null}
                  </div>
                )}
              </QuestionBlock>
            ) : null}

            <QuestionBlock
              ref={registerBlock("unusedAllottedMealActions")}
              title="When you don't use a breakfast that has been registered or automatically allotted to you, what usually happens to that meal?"
              helperText="Select all that apply."
              required
              error={errors.unusedAllottedMealActions}
            >
              {({ describedBy }) => (
                <div className="flex flex-col gap-3">
                  <div
                    role="group"
                    aria-describedby={describedBy}
                    data-invalid={!!errors.unusedAllottedMealActions}
                    className="flex flex-col gap-0"
                  >
                    {UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`unused-allotted-meal-action-${option.value}`}
                        className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                      >
                        <Checkbox
                          id={`unused-allotted-meal-action-${option.value}`}
                          checked={values.unusedAllottedMealActions.includes(
                            option.value
                          )}
                          onCheckedChange={(checked) =>
                            updateUnusedAllottedMealActions(
                              option.value,
                              checked === true
                            )
                          }
                        />
                        {option.label}
                      </Label>
                    ))}
                  </div>

                  {values.unusedAllottedMealActions.includes(
                    OTHER_ACTIVITY_VALUE
                  ) ? (
                    <Input
                      id="unused-allotted-meal-action-other-input"
                      placeholder="Describe what else usually happens"
                      value={values.unusedAllottedMealActionOther}
                      onChange={(event) =>
                        updateField(
                          "unusedAllottedMealActionOther",
                          event.target.value
                        )
                      }
                    />
                  ) : null}
                </div>
              )}
            </QuestionBlock>

            <QuestionBlock
              ref={registerBlock("breakfastFrequencyChanged")}
              title="Have there been times when you used to eat breakfast at the mess more often than you do now?"
              required
              error={errors.breakfastFrequencyChanged}
            >
              {({ describedBy }) => (
                <RadioGroup
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.breakfastFrequencyChanged}
                  value={values.breakfastFrequencyChanged}
                  onValueChange={(value) =>
                    updateBreakfastFrequencyChanged(value as string)
                  }
                  className="gap-0"
                >
                  {YES_NO_NOT_SURE_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-frequency-changed-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <RadioGroupItem
                        id={`breakfast-frequency-changed-${option.value}`}
                        value={option.value}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </QuestionBlock>

            {showsBreakfastFrequencyChangeDescription(values) ? (
              <QuestionBlock
                ref={registerBlock("breakfastFrequencyChangeDescription")}
                title="If yes, what changed?"
                required
                error={errors.breakfastFrequencyChangeDescription}
              >
                {({ describedBy }) => (
                  <Input
                    id="breakfast-frequency-change-description"
                    placeholder="Describe what changed"
                    value={values.breakfastFrequencyChangeDescription}
                    onChange={(event) =>
                      updateField(
                        "breakfastFrequencyChangeDescription",
                        event.target.value
                      )
                    }
                    aria-describedby={describedBy}
                    aria-invalid={!!errors.breakfastFrequencyChangeDescription}
                  />
                )}
              </QuestionBlock>
            ) : null}
          </>
        ) : null}
      </div>
    </SurveyLayout>
  )
}
