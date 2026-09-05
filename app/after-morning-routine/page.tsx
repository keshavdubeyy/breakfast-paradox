"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { SurveyLayout } from "@/components/survey/survey-layout"
import { QuestionBlock } from "@/components/survey/question-block"
import { ScaleGrid } from "@/components/survey/scale-grid"
import { useAutoAdvance } from "@/hooks/use-auto-advance"
import { vibrateError } from "@/lib/haptics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

import {
  getAfterMorningRoutineServerSnapshot,
  getAfterMorningRoutineSnapshot,
  getUsualRoutineServerSnapshot,
  getUsualRoutineSnapshot,
  saveAfterMorningRoutineAnswers,
  subscribeAfterMorningRoutine,
  subscribeUsualRoutine,
  type AfterMorningRoutineAnswers,
  type UsualRoutineAnswers,
} from "@/lib/survey-state"
import {
  AGREEMENT_SCALE_OPTIONS,
  AGREEMENT_STATEMENT_ITEMS,
  ATTENTION_CHECK_INFLUENCE_KEY,
  BREAKFAST_IMPROVEMENT_OPTIONS,
  COMPARISON_ROW_ITEMS,
  COMPARISON_SCALE_OPTIONS,
  EARLY_COMMITMENT_BREAKFAST_FREQUENCY_OPTIONS,
  FREQUENCY_OPTIONS,
  INFLUENCE_FACTOR_ITEMS,
  INFLUENCE_SCALE_OPTIONS,
  MAX_BREAKFAST_IMPROVEMENT_SELECTIONS,
  MEAL_VALUE_PERCEPTION_OPTIONS,
  NEXT_FOOD_TIME_OPTIONS,
  NON_BREAKFAST_MEAL_SOURCE_OPTIONS,
  NON_BREAKFAST_SPENDING_AMOUNT_OPTIONS,
  NON_BREAKFAST_SPENDING_FREQUENCY_OPTIONS,
  OTHER_ACTIVITY_VALUE,
  PREVIOUS_NIGHT_AFFECTS_OPTIONS,
  PREVIOUS_NIGHT_FACTOR_OPTIONS,
  SEMESTER_BREAKFAST_CHANGE_OPTIONS,
  WEEKEND_BREAKFAST_COMPARISON_OPTIONS,
  WEEKEND_DIFFERENTIATOR_OPTIONS,
} from "@/lib/survey-options"
import { getSurveySectionProgress } from "@/lib/survey-sections"

// Whether Q4 (the breakfast vs. no-breakfast comparison) applies depends on
// which Q7 branch the respondent landed in back on the Breakfast Routine
// page — someone who never eats mess breakfast has no basis to compare.
function isRegularBreakfastEater(values: UsualRoutineAnswers) {
  return (
    values.breakfastFrequency === "almost-every-day" ||
    values.breakfastFrequency === "most-days"
  )
}

function isConditionalBreakfastEater(values: UsualRoutineAnswers) {
  return values.breakfastFrequency === "some-days"
}

function isRareOrNonBreakfastEater(values: UsualRoutineAnswers) {
  return (
    values.breakfastFrequency === "rarely" ||
    values.breakfastFrequency === "never"
  )
}

function showsComparisonMatrix(usualRoutineValues: UsualRoutineAnswers) {
  if (isConditionalBreakfastEater(usualRoutineValues)) {
    return true
  }
  if (isRegularBreakfastEater(usualRoutineValues)) {
    return (
      usualRoutineValues.missedBreakfastFrequency === "sometimes" ||
      usualRoutineValues.missedBreakfastFrequency === "rarely"
    )
  }
  if (isRareOrNonBreakfastEater(usualRoutineValues)) {
    return (
      usualRoutineValues.occasionalBreakfastFrequency !== "" &&
      usualRoutineValues.occasionalBreakfastFrequency !== "never"
    )
  }
  return false
}

function showsWeekendDifferentiators(values: AfterMorningRoutineAnswers) {
  return (
    values.weekendBreakfastComparison === "more-often" ||
    values.weekendBreakfastComparison === "less-often"
  )
}

function showsNonBreakfastSpendingAmount(values: AfterMorningRoutineAnswers) {
  return (
    values.nonBreakfastSpendingFrequency !== "" &&
    values.nonBreakfastSpendingFrequency !== "never"
  )
}

function showsSemesterBreakfastChangeDescription(
  values: AfterMorningRoutineAnswers
) {
  return (
    values.semesterBreakfastChange !== "" &&
    values.semesterBreakfastChange !== "about-the-same" &&
    values.semesterBreakfastChange !== "not-sure"
  )
}

function showsPreviousNightFactors(values: AfterMorningRoutineAnswers) {
  return (
    values.previousNightAffectsBreakfast === "yes-often" ||
    values.previousNightAffectsBreakfast === "sometimes" ||
    values.previousNightAffectsBreakfast === "rarely"
  )
}

type RequiredFieldKey =
  | "nonBreakfastMealSource"
  | "nextFoodTime"
  | "earlyCommitmentBreakfastFrequency"
  | "noEarlyCommitmentBreakfastFrequency"
  | "weekendBreakfastComparison"
  | "weekendDifferentiators"
  | "nonBreakfastSpendingFrequency"
  | "nonBreakfastSpendingAmount"
  | "semesterBreakfastChange"
  | "semesterBreakfastChangeDescription"
  | "comparisonRatings"
  | "previousNightAffectsBreakfast"
  | "previousNightFactors"
  | "influenceRatings"
  | "biggestInfluenceFactor"
  | "mealValuePerception"
  | "agreementRatings"
  | "breakfastImprovementOptions"
  | "breakfastSystemChangeSuggestion"

const FIELD_ORDER: RequiredFieldKey[] = [
  "nonBreakfastMealSource",
  "nextFoodTime",
  "earlyCommitmentBreakfastFrequency",
  "noEarlyCommitmentBreakfastFrequency",
  "weekendBreakfastComparison",
  "weekendDifferentiators",
  "nonBreakfastSpendingFrequency",
  "nonBreakfastSpendingAmount",
  "semesterBreakfastChange",
  "semesterBreakfastChangeDescription",
  "comparisonRatings",
  "previousNightAffectsBreakfast",
  "previousNightFactors",
  "influenceRatings",
  "biggestInfluenceFactor",
  "mealValuePerception",
  "agreementRatings",
  "breakfastImprovementOptions",
  "breakfastSystemChangeSuggestion",
]

function validate(
  values: AfterMorningRoutineAnswers,
  usualRoutineValues: UsualRoutineAnswers
): Partial<Record<RequiredFieldKey, string>> {
  const errors: Partial<Record<RequiredFieldKey, string>> = {}

  if (!values.nonBreakfastMealSource) {
    errors.nonBreakfastMealSource = "Please select an option."
  } else if (
    values.nonBreakfastMealSource === OTHER_ACTIVITY_VALUE &&
    !values.nonBreakfastMealSourceOther.trim()
  ) {
    errors.nonBreakfastMealSource = "Please describe the other option."
  }

  if (!values.nextFoodTime) {
    errors.nextFoodTime = "Please select an option."
  }

  if (!values.earlyCommitmentBreakfastFrequency) {
    errors.earlyCommitmentBreakfastFrequency = "Please select an option."
  }

  if (!values.noEarlyCommitmentBreakfastFrequency) {
    errors.noEarlyCommitmentBreakfastFrequency = "Please select an option."
  }

  if (!values.weekendBreakfastComparison) {
    errors.weekendBreakfastComparison = "Please select an option."
  }

  if (showsWeekendDifferentiators(values)) {
    if (values.weekendDifferentiators.length === 0) {
      errors.weekendDifferentiators = "Please select at least one option."
    } else if (
      values.weekendDifferentiators.includes(OTHER_ACTIVITY_VALUE) &&
      !values.weekendDifferentiatorOther.trim()
    ) {
      errors.weekendDifferentiators = "Please describe the other option."
    }
  }

  if (!values.nonBreakfastSpendingFrequency) {
    errors.nonBreakfastSpendingFrequency = "Please select an option."
  }

  if (
    showsNonBreakfastSpendingAmount(values) &&
    !values.nonBreakfastSpendingAmount
  ) {
    errors.nonBreakfastSpendingAmount = "Please select an option."
  }

  if (!values.semesterBreakfastChange) {
    errors.semesterBreakfastChange = "Please select an option."
  }

  if (
    showsSemesterBreakfastChangeDescription(values) &&
    !values.semesterBreakfastChangeDescription.trim()
  ) {
    errors.semesterBreakfastChangeDescription = "Please describe what changed."
  }

  if (showsComparisonMatrix(usualRoutineValues)) {
    const missingRow = COMPARISON_ROW_ITEMS.some(
      (row) => !values.comparisonRatings[row.key]
    )
    if (missingRow) {
      errors.comparisonRatings = "Please rate every item."
    }
  }

  if (!values.previousNightAffectsBreakfast) {
    errors.previousNightAffectsBreakfast = "Please select an option."
  }

  if (showsPreviousNightFactors(values)) {
    if (values.previousNightFactors.length === 0) {
      errors.previousNightFactors = "Please select at least one option."
    } else if (
      values.previousNightFactors.includes(OTHER_ACTIVITY_VALUE) &&
      !values.previousNightFactorOther.trim()
    ) {
      errors.previousNightFactors = "Please describe the other option."
    }
  }

  const missingInfluenceRow = INFLUENCE_FACTOR_ITEMS.some(
    (row) => !values.influenceRatings[row.key]
  )
  if (missingInfluenceRow) {
    errors.influenceRatings = "Please rate every item."
  }

  if (!values.biggestInfluenceFactor) {
    errors.biggestInfluenceFactor = "Please select an option."
  }

  if (!values.mealValuePerception) {
    errors.mealValuePerception = "Please select an option."
  }

  const missingAgreementRow = AGREEMENT_STATEMENT_ITEMS.some(
    (row) => !values.agreementRatings[row.key]
  )
  if (missingAgreementRow) {
    errors.agreementRatings = "Please rate every statement."
  }

  if (values.breakfastImprovementOptions.length === 0) {
    errors.breakfastImprovementOptions = "Please select at least one option."
  } else if (
    values.breakfastImprovementOptions.includes(OTHER_ACTIVITY_VALUE) &&
    !values.breakfastImprovementOptionOther.trim()
  ) {
    errors.breakfastImprovementOptions = "Please describe the other option."
  }

  if (!values.breakfastSystemChangeSuggestion.trim()) {
    errors.breakfastSystemChangeSuggestion = "Please share your answer."
  }

  return errors
}

function toggleValue(list: string[], value: string, checked: boolean) {
  return checked ? [...list, value] : list.filter((item) => item !== value)
}

export default function AfterMorningRoutinePage() {
  const router = useRouter()
  const values = useSyncExternalStore(
    subscribeAfterMorningRoutine,
    getAfterMorningRoutineSnapshot,
    getAfterMorningRoutineServerSnapshot
  )
  const usualRoutineValues = useSyncExternalStore(
    subscribeUsualRoutine,
    getUsualRoutineSnapshot,
    getUsualRoutineServerSnapshot
  )
  const [submitted, setSubmitted] = useState(false)
  const { registerBlock, getBlock, advance } =
    useAutoAdvance<RequiredFieldKey>(FIELD_ORDER)

  const errors = useMemo(
    () => (submitted ? validate(values, usualRoutineValues) : {}),
    [submitted, values, usualRoutineValues]
  )

  function updateField<K extends keyof AfterMorningRoutineAnswers>(
    key: K,
    value: AfterMorningRoutineAnswers[K]
  ) {
    saveAfterMorningRoutineAnswers({ ...values, [key]: value })
  }

  function updateNonBreakfastMealSource(value: string) {
    updateField("nonBreakfastMealSource", value)
    advance("nonBreakfastMealSource")
  }

  function updateWeekendBreakfastComparison(value: string) {
    const showsDifferentiators =
      value === "more-often" || value === "less-often"
    saveAfterMorningRoutineAnswers({
      ...values,
      weekendBreakfastComparison: value,
      weekendDifferentiators: showsDifferentiators
        ? values.weekendDifferentiators
        : [],
      weekendDifferentiatorOther: showsDifferentiators
        ? values.weekendDifferentiatorOther
        : "",
    })
    advance("weekendBreakfastComparison")
  }

  function updateWeekendDifferentiators(value: string, checked: boolean) {
    updateField(
      "weekendDifferentiators",
      toggleValue(values.weekendDifferentiators, value, checked)
    )
  }

  function updateNonBreakfastSpendingFrequency(value: string) {
    const showsAmount = value !== "never"
    saveAfterMorningRoutineAnswers({
      ...values,
      nonBreakfastSpendingFrequency: value,
      nonBreakfastSpendingAmount: showsAmount
        ? values.nonBreakfastSpendingAmount
        : "",
    })
    advance("nonBreakfastSpendingFrequency")
  }

  function updateSemesterBreakfastChange(value: string) {
    const showsDescription =
      value !== "about-the-same" && value !== "not-sure"
    saveAfterMorningRoutineAnswers({
      ...values,
      semesterBreakfastChange: value,
      semesterBreakfastChangeDescription: showsDescription
        ? values.semesterBreakfastChangeDescription
        : "",
    })
    advance("semesterBreakfastChange")
  }

  function updateComparisonRating(rowKey: string, value: string) {
    updateField("comparisonRatings", {
      ...values.comparisonRatings,
      [rowKey]: value,
    })
  }

  function updatePreviousNightAffectsBreakfast(value: string) {
    const showsFactors =
      value === "yes-often" || value === "sometimes" || value === "rarely"
    saveAfterMorningRoutineAnswers({
      ...values,
      previousNightAffectsBreakfast: value,
      previousNightFactors: showsFactors ? values.previousNightFactors : [],
      previousNightFactorOther: showsFactors
        ? values.previousNightFactorOther
        : "",
    })
    advance("previousNightAffectsBreakfast")
  }

  function updatePreviousNightFactors(value: string, checked: boolean) {
    updateField(
      "previousNightFactors",
      toggleValue(values.previousNightFactors, value, checked)
    )
  }

  function updateInfluenceRating(rowKey: string, value: string) {
    updateField("influenceRatings", {
      ...values.influenceRatings,
      [rowKey]: value,
    })
  }

  function updateAgreementRating(rowKey: string, value: string) {
    updateField("agreementRatings", {
      ...values.agreementRatings,
      [rowKey]: value,
    })
  }

  function updateBreakfastImprovementOptions(value: string, checked: boolean) {
    updateField(
      "breakfastImprovementOptions",
      toggleValue(values.breakfastImprovementOptions, value, checked)
    )
  }

  function handleContinue() {
    setSubmitted(true)
    const nextErrors = validate(values, usualRoutineValues)

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

    router.push("/exit")
  }

  const showsMatrix = showsComparisonMatrix(usualRoutineValues)
  const improvementLimitReached =
    values.breakfastImprovementOptions.length >=
    MAX_BREAKFAST_IMPROVEMENT_SELECTIONS

  return (
    <SurveyLayout
      progress={getSurveySectionProgress("after-morning-routine")}
      footer={
        <div className="flex flex-row gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            className="min-h-11 flex-1 text-base"
            render={<Link href="/breakfast-routine" />}
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
            After Your Morning Routine
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            A few last questions about what happens around and beyond
            breakfast.
          </p>
        </div>

        <QuestionBlock
          ref={registerBlock("nonBreakfastMealSource")}
          title="On days when you don’t eat breakfast at the mess, what do you usually do before lunch?"
          helperText="Select the option that happens most often."
          required
          error={errors.nonBreakfastMealSource}
        >
          {({ describedBy }) => (
            <div className="flex flex-col gap-3">
              <RadioGroup
                aria-describedby={describedBy}
                aria-invalid={!!errors.nonBreakfastMealSource}
                value={values.nonBreakfastMealSource}
                onValueChange={(value) =>
                  updateNonBreakfastMealSource(value as string)
                }
                className="gap-0"
              >
                {NON_BREAKFAST_MEAL_SOURCE_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`non-breakfast-meal-source-${option.value}`}
                    className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                  >
                    <RadioGroupItem
                      id={`non-breakfast-meal-source-${option.value}`}
                      value={option.value}
                    />
                    {option.label}
                  </Label>
                ))}
              </RadioGroup>

              {values.nonBreakfastMealSource === OTHER_ACTIVITY_VALUE ? (
                <Input
                  id="non-breakfast-meal-source-other-input"
                  placeholder="Describe what you usually do"
                  value={values.nonBreakfastMealSourceOther}
                  onChange={(event) =>
                    updateField(
                      "nonBreakfastMealSourceOther",
                      event.target.value
                    )
                  }
                />
              ) : null}
            </div>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("nextFoodTime")}
          title="Around what time do you usually have your next food or drink other than water?"
          required
          error={errors.nextFoodTime}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.nextFoodTime}
              value={values.nextFoodTime}
              onValueChange={(value) => {
                updateField("nextFoodTime", value as string)
                advance("nextFoodTime")
              }}
              className="gap-0"
            >
              {NEXT_FOOD_TIME_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`next-food-time-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`next-food-time-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("earlyCommitmentBreakfastFrequency")}
          title="On days when you have a class, lab, meeting, or other mandatory activity before 9:00 AM, how often do you eat breakfast at the mess?"
          required
          error={errors.earlyCommitmentBreakfastFrequency}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.earlyCommitmentBreakfastFrequency}
              value={values.earlyCommitmentBreakfastFrequency}
              onValueChange={(value) => {
                updateField(
                  "earlyCommitmentBreakfastFrequency",
                  value as string
                )
                advance("earlyCommitmentBreakfastFrequency")
              }}
              className="gap-0"
            >
              {EARLY_COMMITMENT_BREAKFAST_FREQUENCY_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`early-commitment-breakfast-frequency-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`early-commitment-breakfast-frequency-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("noEarlyCommitmentBreakfastFrequency")}
          title="On days when you do not have a mandatory activity before 9:00 AM, how often do you eat breakfast at the mess?"
          required
          error={errors.noEarlyCommitmentBreakfastFrequency}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.noEarlyCommitmentBreakfastFrequency}
              value={values.noEarlyCommitmentBreakfastFrequency}
              onValueChange={(value) => {
                updateField(
                  "noEarlyCommitmentBreakfastFrequency",
                  value as string
                )
                advance("noEarlyCommitmentBreakfastFrequency")
              }}
              className="gap-0"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`no-early-commitment-breakfast-frequency-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`no-early-commitment-breakfast-frequency-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("weekendBreakfastComparison")}
          title="Compared with weekdays, how often do you eat breakfast at the mess on weekends?"
          required
          error={errors.weekendBreakfastComparison}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.weekendBreakfastComparison}
              value={values.weekendBreakfastComparison}
              onValueChange={(value) =>
                updateWeekendBreakfastComparison(value as string)
              }
              className="gap-0"
            >
              {WEEKEND_BREAKFAST_COMPARISON_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`weekend-breakfast-comparison-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`weekend-breakfast-comparison-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        {showsWeekendDifferentiators(values) ? (
          <QuestionBlock
            ref={registerBlock("weekendDifferentiators")}
            title="What is usually different about your weekends?"
            helperText="Select all that apply."
            required
            error={errors.weekendDifferentiators}
          >
            {({ describedBy }) => (
              <div className="flex flex-col gap-3">
                <div
                  role="group"
                  aria-describedby={describedBy}
                  data-invalid={!!errors.weekendDifferentiators}
                  className="flex flex-col gap-0"
                >
                  {WEEKEND_DIFFERENTIATOR_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`weekend-differentiator-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <Checkbox
                        id={`weekend-differentiator-${option.value}`}
                        checked={values.weekendDifferentiators.includes(
                          option.value
                        )}
                        onCheckedChange={(checked) =>
                          updateWeekendDifferentiators(
                            option.value,
                            checked === true
                          )
                        }
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>

                {values.weekendDifferentiators.includes(
                  OTHER_ACTIVITY_VALUE
                ) ? (
                  <Input
                    id="weekend-differentiator-other-input"
                    placeholder="Describe what else is different"
                    value={values.weekendDifferentiatorOther}
                    onChange={(event) =>
                      updateField(
                        "weekendDifferentiatorOther",
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
          ref={registerBlock("nonBreakfastSpendingFrequency")}
          title="On days when you don't eat breakfast at the mess, how often do you spend money on food or drinks before lunch?"
          required
          error={errors.nonBreakfastSpendingFrequency}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.nonBreakfastSpendingFrequency}
              value={values.nonBreakfastSpendingFrequency}
              onValueChange={(value) =>
                updateNonBreakfastSpendingFrequency(value as string)
              }
              className="gap-0"
            >
              {NON_BREAKFAST_SPENDING_FREQUENCY_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`non-breakfast-spending-frequency-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`non-breakfast-spending-frequency-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        {showsNonBreakfastSpendingAmount(values) ? (
          <QuestionBlock
            ref={registerBlock("nonBreakfastSpendingAmount")}
            title="Approximately how much do you usually spend before lunch on those days?"
            required
            error={errors.nonBreakfastSpendingAmount}
          >
            {({ describedBy }) => (
              <RadioGroup
                aria-describedby={describedBy}
                aria-invalid={!!errors.nonBreakfastSpendingAmount}
                value={values.nonBreakfastSpendingAmount}
                onValueChange={(value) => {
                  updateField("nonBreakfastSpendingAmount", value as string)
                  advance("nonBreakfastSpendingAmount")
                }}
                className="gap-0"
              >
                {NON_BREAKFAST_SPENDING_AMOUNT_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`non-breakfast-spending-amount-${option.value}`}
                    className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                  >
                    <RadioGroupItem
                      id={`non-breakfast-spending-amount-${option.value}`}
                      value={option.value}
                    />
                    {option.label}
                  </Label>
                ))}
              </RadioGroup>
            )}
          </QuestionBlock>
        ) : null}

        <QuestionBlock
          ref={registerBlock("semesterBreakfastChange")}
          title="Compared with the beginning of this semester, has how often you eat breakfast at the mess changed?"
          required
          error={errors.semesterBreakfastChange}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.semesterBreakfastChange}
              value={values.semesterBreakfastChange}
              onValueChange={(value) =>
                updateSemesterBreakfastChange(value as string)
              }
              className="gap-0"
            >
              {SEMESTER_BREAKFAST_CHANGE_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`semester-breakfast-change-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`semester-breakfast-change-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        {showsSemesterBreakfastChangeDescription(values) ? (
          <QuestionBlock
            ref={registerBlock("semesterBreakfastChangeDescription")}
            title="What changed around the same time?"
            required
            error={errors.semesterBreakfastChangeDescription}
          >
            {({ describedBy }) => (
              <Textarea
                aria-describedby={describedBy}
                aria-invalid={!!errors.semesterBreakfastChangeDescription}
                placeholder="Share what changed"
                value={values.semesterBreakfastChangeDescription}
                onChange={(event) =>
                  updateField(
                    "semesterBreakfastChangeDescription",
                    event.target.value
                  )
                }
              />
            )}
          </QuestionBlock>
        ) : null}

        {showsMatrix ? (
          <QuestionBlock
            ref={registerBlock("comparisonRatings")}
            title="Compared with days when you eat breakfast at the mess, how do you usually feel before lunch on days when you don’t?"
            required
            error={errors.comparisonRatings}
          >
            {() => (
              <ScaleGrid
                idPrefix="comparison"
                scaleOptions={COMPARISON_SCALE_OPTIONS}
                rows={COMPARISON_ROW_ITEMS}
                values={values.comparisonRatings}
                onChange={updateComparisonRating}
                invalidRowKeys={
                  errors.comparisonRatings
                    ? COMPARISON_ROW_ITEMS.filter(
                        (row) => !values.comparisonRatings[row.key]
                      ).map((row) => row.key)
                    : undefined
                }
              />
            )}
          </QuestionBlock>
        ) : null}

        <QuestionBlock
          ref={registerBlock("previousNightAffectsBreakfast")}
          title="Does what happened the previous night or earlier in the day usually affect whether you have breakfast the next morning?"
          required
          error={errors.previousNightAffectsBreakfast}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.previousNightAffectsBreakfast}
              value={values.previousNightAffectsBreakfast}
              onValueChange={(value) =>
                updatePreviousNightAffectsBreakfast(value as string)
              }
              className="gap-0"
            >
              {PREVIOUS_NIGHT_AFFECTS_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`previous-night-affects-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`previous-night-affects-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        {showsPreviousNightFactors(values) ? (
          <QuestionBlock
            ref={registerBlock("previousNightFactors")}
            title="What usually affects that decision?"
            helperText="Select all that apply."
            required
            error={errors.previousNightFactors}
          >
            {({ describedBy }) => (
              <div className="flex flex-col gap-3">
                <div
                  role="group"
                  aria-describedby={describedBy}
                  data-invalid={!!errors.previousNightFactors}
                  className="flex flex-col gap-0"
                >
                  {PREVIOUS_NIGHT_FACTOR_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`previous-night-factor-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <Checkbox
                        id={`previous-night-factor-${option.value}`}
                        checked={values.previousNightFactors.includes(
                          option.value
                        )}
                        onCheckedChange={(checked) =>
                          updatePreviousNightFactors(
                            option.value,
                            checked === true
                          )
                        }
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>

                {values.previousNightFactors.includes(OTHER_ACTIVITY_VALUE) ? (
                  <Input
                    id="previous-night-factor-other-input"
                    placeholder="Describe what else affects it"
                    value={values.previousNightFactorOther}
                    onChange={(event) =>
                      updateField(
                        "previousNightFactorOther",
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
          ref={registerBlock("influenceRatings")}
          title="How much do the following usually affect whether you eat breakfast at the mess?"
          required
          error={errors.influenceRatings}
        >
          {() => (
            <ScaleGrid
              idPrefix="influence"
              scaleOptions={INFLUENCE_SCALE_OPTIONS}
              rows={INFLUENCE_FACTOR_ITEMS}
              values={values.influenceRatings}
              onChange={updateInfluenceRating}
              invalidRowKeys={
                errors.influenceRatings
                  ? INFLUENCE_FACTOR_ITEMS.filter(
                      (row) => !values.influenceRatings[row.key]
                    ).map((row) => row.key)
                  : undefined
              }
            />
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("biggestInfluenceFactor")}
          title="Of the factors above, which one usually has the biggest influence on whether you eat breakfast at the mess?"
          required
          error={errors.biggestInfluenceFactor}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.biggestInfluenceFactor}
              value={values.biggestInfluenceFactor}
              onValueChange={(value) => {
                updateField("biggestInfluenceFactor", value as string)
                advance("biggestInfluenceFactor")
              }}
              className="gap-0"
            >
              {INFLUENCE_FACTOR_ITEMS.filter(
                (item) => item.key !== ATTENTION_CHECK_INFLUENCE_KEY
              ).map((item) => (
                <Label
                  key={item.key}
                  htmlFor={`biggest-influence-factor-${item.key}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`biggest-influence-factor-${item.key}`}
                    value={item.key}
                  />
                  {item.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("mealValuePerception")}
          title="Thinking about how often you actually use your registered/allotted breakfast, how do you feel about what you pay for it?"
          required
          error={errors.mealValuePerception}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.mealValuePerception}
              value={values.mealValuePerception}
              onValueChange={(value) => {
                updateField("mealValuePerception", value as string)
                advance("mealValuePerception")
              }}
              className="gap-0"
            >
              {MEAL_VALUE_PERCEPTION_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`meal-value-perception-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`meal-value-perception-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("agreementRatings")}
          title="How much do you agree with the following statements?"
          required
          error={errors.agreementRatings}
        >
          {() => (
            <ScaleGrid
              idPrefix="agreement"
              scaleOptions={AGREEMENT_SCALE_OPTIONS}
              rows={AGREEMENT_STATEMENT_ITEMS}
              values={values.agreementRatings}
              onChange={updateAgreementRating}
              invalidRowKeys={
                errors.agreementRatings
                  ? AGREEMENT_STATEMENT_ITEMS.filter(
                      (row) => !values.agreementRatings[row.key]
                    ).map((row) => row.key)
                  : undefined
              }
            />
          )}
        </QuestionBlock>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What could make breakfast work better?
          </h2>
        </div>

        <QuestionBlock
          ref={registerBlock("breakfastImprovementOptions")}
          title="Which of the following would make it easier for you to have breakfast at the mess more regularly?"
          helperText={`Select up to ${MAX_BREAKFAST_IMPROVEMENT_SELECTIONS}.`}
          required
          error={errors.breakfastImprovementOptions}
        >
          {({ describedBy }) => (
            <div className="flex flex-col gap-3">
              <div
                role="group"
                aria-describedby={describedBy}
                data-invalid={!!errors.breakfastImprovementOptions}
                className="flex flex-col gap-0"
              >
                {BREAKFAST_IMPROVEMENT_OPTIONS.map((option) => {
                  const checked = values.breakfastImprovementOptions.includes(
                    option.value
                  )
                  return (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-improvement-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground has-disabled:opacity-50"
                    >
                      <Checkbox
                        id={`breakfast-improvement-${option.value}`}
                        checked={checked}
                        disabled={!checked && improvementLimitReached}
                        onCheckedChange={(nextChecked) =>
                          updateBreakfastImprovementOptions(
                            option.value,
                            nextChecked === true
                          )
                        }
                      />
                      {option.label}
                    </Label>
                  )
                })}
              </div>

              {values.breakfastImprovementOptions.includes(
                OTHER_ACTIVITY_VALUE
              ) ? (
                <Input
                  id="breakfast-improvement-other-input"
                  placeholder="Describe what else would help"
                  value={values.breakfastImprovementOptionOther}
                  onChange={(event) =>
                    updateField(
                      "breakfastImprovementOptionOther",
                      event.target.value
                    )
                  }
                />
              ) : null}
            </div>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("breakfastSystemChangeSuggestion")}
          title="If you could change one thing about the current breakfast system, what would you change and why?"
          required
          error={errors.breakfastSystemChangeSuggestion}
        >
          {({ describedBy }) => (
            <Textarea
              aria-describedby={describedBy}
              aria-invalid={!!errors.breakfastSystemChangeSuggestion}
              placeholder="Share your answer"
              value={values.breakfastSystemChangeSuggestion}
              onChange={(event) =>
                updateField(
                  "breakfastSystemChangeSuggestion",
                  event.target.value
                )
              }
            />
          )}
        </QuestionBlock>
      </div>
    </SurveyLayout>
  )
}
