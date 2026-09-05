"use client"

import { useMemo, useSyncExternalStore, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { SurveyLayout } from "@/components/survey/survey-layout"
import { QuestionBlock } from "@/components/survey/question-block"
import { TimeRangeSelect } from "@/components/survey/time-range-select"
import { RankList } from "@/components/survey/rank-list"
import { useAutoAdvance } from "@/hooks/use-auto-advance"
import { vibrateError } from "@/lib/haptics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import {
  clearInactiveBreakfastBranchFields,
  getUsualRoutineServerSnapshot,
  getUsualRoutineSnapshot,
  saveUsualRoutineAnswers,
  subscribeUsualRoutine,
  type UsualRoutineAnswers,
} from "@/lib/survey-state"
import {
  BEFORE_SLEEP_ACTIVITY_OPTIONS,
  BREAKFAST_CHANGE_ACTION_OPTIONS,
  BREAKFAST_FREQUENCY_OPTIONS,
  FREQUENCY_OPTIONS,
  MESS_DECISION_OPTIONS,
  MESS_FOOD_QUALITY_OPTIONS,
  MORNING_ACTIVITY_OPTIONS,
  OTHER_ACTIVITY_VALUE,
  RESALE_ACTION_VALUES,
  SLEEP_TIME_OPTIONS,
  WAKE_TIME_OPTIONS,
  type SurveyOption,
} from "@/lib/survey-options"
import { getSurveySectionProgress } from "@/lib/survey-sections"

type RequiredFieldKey =
  | "sleepTime"
  | "beforeSleepActivities"
  | "beforeSleepMostTime"
  | "wakeTime"
  | "morningActivities"
  | "messDecision"
  | "messFoodQuality"
  | "breakfastPlanChangeFrequency"
  | "breakfastPlanChangeActions"
  | "breakfastResaleSuccessRate"
  | "breakfastFrequency"

const FIELD_ORDER: RequiredFieldKey[] = [
  "sleepTime",
  "beforeSleepActivities",
  "beforeSleepMostTime",
  "wakeTime",
  "morningActivities",
  "messDecision",
  "messFoodQuality",
  "breakfastPlanChangeFrequency",
  "breakfastPlanChangeActions",
  "breakfastResaleSuccessRate",
  "breakfastFrequency",
]

// Every question block on the page, in the order they appear, so
// auto-advance knows what "next" means. "morningActivityOrder" (the
// re-order list for Q4a) isn't a required field but still needs a slot.
type BlockKey = RequiredFieldKey | "morningActivityOrder"

const SCROLL_ORDER: BlockKey[] = [
  "sleepTime",
  "beforeSleepActivities",
  "beforeSleepMostTime",
  "wakeTime",
  "morningActivities",
  "morningActivityOrder",
  "messDecision",
  "messFoodQuality",
  "breakfastPlanChangeFrequency",
  "breakfastPlanChangeActions",
  "breakfastResaleSuccessRate",
  "breakfastFrequency",
]

function showsBreakfastPlanChangeActions(values: UsualRoutineAnswers) {
  return (
    values.breakfastPlanChangeFrequency !== "" &&
    values.breakfastPlanChangeFrequency !== "never"
  )
}

function showsBreakfastResaleSuccessRate(values: UsualRoutineAnswers) {
  return values.breakfastPlanChangeActions.some((value) =>
    (RESALE_ACTION_VALUES as readonly string[]).includes(value)
  )
}

function validate(
  values: UsualRoutineAnswers
): Partial<Record<RequiredFieldKey, string>> {
  const errors: Partial<Record<RequiredFieldKey, string>> = {}

  if (!values.sleepTimeWeekday || !values.sleepTimeWeekend) {
    errors.sleepTime =
      "Please select your usual weekday and weekend sleep time."
  }

  if (values.beforeSleepActivities.length === 0) {
    errors.beforeSleepActivities = "Please select at least one option."
  } else if (
    values.beforeSleepActivities.includes(OTHER_ACTIVITY_VALUE) &&
    !values.beforeSleepActivityOther.trim()
  ) {
    errors.beforeSleepActivities = "Please describe the other activity."
  }

  if (values.beforeSleepActivities.length > 0 && !values.beforeSleepMostTime) {
    errors.beforeSleepMostTime = "Please select one option."
  }

  if (!values.wakeTimeWeekday || !values.wakeTimeWeekend) {
    errors.wakeTime =
      "Please select your usual weekday and weekend wake time."
  }

  if (values.morningActivities.length === 0) {
    errors.morningActivities = "Please select at least one option."
  } else if (
    values.morningActivities.includes(OTHER_ACTIVITY_VALUE) &&
    !values.morningActivityOther.trim()
  ) {
    errors.morningActivities = "Please describe the other activity."
  }

  if (!values.messDecision) {
    errors.messDecision = "Please select an option."
  }

  if (!values.messFoodQuality) {
    errors.messFoodQuality = "Please select an option."
  }

  if (!values.breakfastPlanChangeFrequency) {
    errors.breakfastPlanChangeFrequency = "Please select an option."
  }

  if (showsBreakfastPlanChangeActions(values)) {
    if (values.breakfastPlanChangeActions.length === 0) {
      errors.breakfastPlanChangeActions = "Please select at least one option."
    } else if (
      values.breakfastPlanChangeActions.includes(OTHER_ACTIVITY_VALUE) &&
      !values.breakfastPlanChangeActionOther.trim()
    ) {
      errors.breakfastPlanChangeActions = "Please describe the other option."
    }
  }

  if (
    showsBreakfastPlanChangeActions(values) &&
    showsBreakfastResaleSuccessRate(values) &&
    !values.breakfastResaleSuccessRate
  ) {
    errors.breakfastResaleSuccessRate = "Please select an option."
  }

  if (!values.breakfastFrequency) {
    errors.breakfastFrequency = "Please select an option."
  }

  return errors
}

function optionLabel(options: SurveyOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

function toggleValue(list: string[], value: string, checked: boolean) {
  return checked ? [...list, value] : list.filter((item) => item !== value)
}

export default function UsualRoutinePage() {
  const router = useRouter()
  const values = useSyncExternalStore(
    subscribeUsualRoutine,
    getUsualRoutineSnapshot,
    getUsualRoutineServerSnapshot
  )
  const [submitted, setSubmitted] = useState(false)
  const { registerBlock, getBlock, advance } = useAutoAdvance<BlockKey>(SCROLL_ORDER)

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

  function updateSleepTime(
    field: "sleepTimeWeekday" | "sleepTimeWeekend",
    value: string
  ) {
    const next = { ...values, [field]: value }
    saveUsualRoutineAnswers(next)
    if (next.sleepTimeWeekday && next.sleepTimeWeekend) {
      advance("sleepTime")
    }
  }

  function updateWakeTime(
    field: "wakeTimeWeekday" | "wakeTimeWeekend",
    value: string
  ) {
    const next = { ...values, [field]: value }
    saveUsualRoutineAnswers(next)
    if (next.wakeTimeWeekday && next.wakeTimeWeekend) {
      advance("wakeTime")
    }
  }

  function updateBeforeSleepActivities(value: string, checked: boolean) {
    const nextActivities = toggleValue(
      values.beforeSleepActivities,
      value,
      checked
    )
    saveUsualRoutineAnswers({
      ...values,
      beforeSleepActivities: nextActivities,
      beforeSleepMostTime:
        !checked && values.beforeSleepMostTime === value
          ? ""
          : values.beforeSleepMostTime,
    })
  }

  function updateMorningActivities(value: string, checked: boolean) {
    saveUsualRoutineAnswers({
      ...values,
      morningActivities: toggleValue(values.morningActivities, value, checked),
      morningActivityOrder: toggleValue(
        values.morningActivityOrder,
        value,
        checked
      ),
    })
  }

  function updateBreakfastPlanChangeFrequency(value: string) {
    const isNever = value === "never"
    saveUsualRoutineAnswers({
      ...values,
      breakfastPlanChangeFrequency: value,
      breakfastPlanChangeActions: isNever
        ? []
        : values.breakfastPlanChangeActions,
      breakfastPlanChangeActionOther: isNever
        ? ""
        : values.breakfastPlanChangeActionOther,
      breakfastResaleSuccessRate: isNever
        ? ""
        : values.breakfastResaleSuccessRate,
    })
    advance("breakfastPlanChangeFrequency")
  }

  function updateBreakfastFrequency(value: string) {
    // Switching which branch (A/B/C) this answer selects must not leave
    // a previously-answered branch's fields sitting around stale — see
    // clearInactiveBreakfastBranchFields for why.
    saveUsualRoutineAnswers(
      clearInactiveBreakfastBranchFields({
        ...values,
        breakfastFrequency: value,
      })
    )
    advance("breakfastFrequency")
  }

  function updateBreakfastPlanChangeActions(value: string, checked: boolean) {
    const nextActions = toggleValue(
      values.breakfastPlanChangeActions,
      value,
      checked
    )
    const stillShowsResale = nextActions.some((item) =>
      (RESALE_ACTION_VALUES as readonly string[]).includes(item)
    )
    saveUsualRoutineAnswers({
      ...values,
      breakfastPlanChangeActions: nextActions,
      breakfastResaleSuccessRate: stillShowsResale
        ? values.breakfastResaleSuccessRate
        : "",
    })
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

    // What happens next branches on the breakfastFrequency answer just
    // above — handled as its own section rather than inline here.
    router.push("/breakfast-routine")
  }

  const morningActivityRankItems = values.morningActivityOrder.map((value) => ({
    value,
    label:
      value === OTHER_ACTIVITY_VALUE && values.morningActivityOther.trim()
        ? values.morningActivityOther.trim()
        : optionLabel(MORNING_ACTIVITY_OPTIONS, value),
  }))

  return (
    <SurveyLayout
      progress={getSurveySectionProgress("usual-routine")}
      footer={
        <div className="flex flex-row gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            className="min-h-11 flex-1 text-base"
            render={<Link href="/about-you" />}
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
            Your Usual Routine
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Now let&apos;s talk through what a typical day looks like for you.
          </p>
        </div>

        <QuestionBlock
          ref={registerBlock("sleepTime")}
          title="Around what time do you usually go to sleep?"
          required
          error={errors.sleepTime}
        >
          {({ describedBy }) => (
            <TimeRangeSelect
              heading="Usual sleep time"
              idPrefix="sleep-time"
              options={SLEEP_TIME_OPTIONS}
              weekdayValue={values.sleepTimeWeekday}
              weekendValue={values.sleepTimeWeekend}
              onWeekdayChange={(value) =>
                updateSleepTime("sleepTimeWeekday", value)
              }
              onWeekendChange={(value) =>
                updateSleepTime("sleepTimeWeekend", value)
              }
              weekdayInvalid={!!errors.sleepTime}
              weekendInvalid={!!errors.sleepTime}
              describedBy={describedBy}
            />
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("beforeSleepActivities")}
          title="What do you usually spend time doing in the hours before you go to sleep?"
          helperText="Select all that apply."
          required
          error={errors.beforeSleepActivities}
        >
          {({ describedBy }) => (
            <div className="flex flex-col gap-3">
              <div
                role="group"
                aria-describedby={describedBy}
                data-invalid={!!errors.beforeSleepActivities}
                className="flex flex-col gap-0"
              >
                {BEFORE_SLEEP_ACTIVITY_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`before-sleep-activity-${option.value}`}
                    className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                  >
                    <Checkbox
                      id={`before-sleep-activity-${option.value}`}
                      checked={values.beforeSleepActivities.includes(
                        option.value
                      )}
                      onCheckedChange={(checked) =>
                        updateBeforeSleepActivities(
                          option.value,
                          checked === true
                        )
                      }
                    />
                    {option.label}
                  </Label>
                ))}
              </div>

              {values.beforeSleepActivities.includes(OTHER_ACTIVITY_VALUE) ? (
                <Input
                  id="before-sleep-activity-other"
                  placeholder="Describe the other activity"
                  value={values.beforeSleepActivityOther}
                  onChange={(event) =>
                    updateField("beforeSleepActivityOther", event.target.value)
                  }
                />
              ) : null}
            </div>
          )}
        </QuestionBlock>

        {values.beforeSleepActivities.length > 0 ? (
          <QuestionBlock
            ref={registerBlock("beforeSleepMostTime")}
            title="Which of these usually takes up most of your time before you sleep?"
            required
            error={errors.beforeSleepMostTime}
          >
            {({ describedBy }) => (
              <RadioGroup
                aria-describedby={describedBy}
                aria-invalid={!!errors.beforeSleepMostTime}
                value={values.beforeSleepMostTime}
                onValueChange={(value) => {
                  updateField("beforeSleepMostTime", value as string)
                  advance("beforeSleepMostTime")
                }}
                className="gap-0"
              >
                {values.beforeSleepActivities.map((value) => (
                  <Label
                    key={value}
                    htmlFor={`before-sleep-most-time-${value}`}
                    className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                  >
                    <RadioGroupItem
                      id={`before-sleep-most-time-${value}`}
                      value={value}
                    />
                    {value === OTHER_ACTIVITY_VALUE &&
                    values.beforeSleepActivityOther.trim()
                      ? values.beforeSleepActivityOther.trim()
                      : optionLabel(BEFORE_SLEEP_ACTIVITY_OPTIONS, value)}
                  </Label>
                ))}
              </RadioGroup>
            )}
          </QuestionBlock>
        ) : null}

        <QuestionBlock
          ref={registerBlock("wakeTime")}
          title="Around what time do you generally wake up in the morning?"
          required
          error={errors.wakeTime}
        >
          {({ describedBy }) => (
            <TimeRangeSelect
              heading="Usual wake time"
              idPrefix="wake-time"
              options={WAKE_TIME_OPTIONS}
              weekdayValue={values.wakeTimeWeekday}
              weekendValue={values.wakeTimeWeekend}
              onWeekdayChange={(value) =>
                updateWakeTime("wakeTimeWeekday", value)
              }
              onWeekendChange={(value) =>
                updateWakeTime("wakeTimeWeekend", value)
              }
              weekdayInvalid={!!errors.wakeTime}
              weekendInvalid={!!errors.wakeTime}
              describedBy={describedBy}
            />
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("morningActivities")}
          title="On a typical weekday, which of the following are usually part of your morning after you wake up?"
          helperText="Select all that apply."
          required
          error={errors.morningActivities}
        >
          {({ describedBy }) => (
            <div className="flex flex-col gap-3">
              <div
                role="group"
                aria-describedby={describedBy}
                data-invalid={!!errors.morningActivities}
                className="flex flex-col gap-0"
              >
                {MORNING_ACTIVITY_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`morning-activity-${option.value}`}
                    className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                  >
                    <Checkbox
                      id={`morning-activity-${option.value}`}
                      checked={values.morningActivities.includes(option.value)}
                      onCheckedChange={(checked) =>
                        updateMorningActivities(option.value, checked === true)
                      }
                    />
                    {option.label}
                  </Label>
                ))}
              </div>

              {values.morningActivities.includes(OTHER_ACTIVITY_VALUE) ? (
                <Input
                  id="morning-activity-other"
                  placeholder="Describe the other activity"
                  value={values.morningActivityOther}
                  onChange={(event) =>
                    updateField("morningActivityOther", event.target.value)
                  }
                />
              ) : null}
            </div>
          )}
        </QuestionBlock>

        {morningActivityRankItems.length > 1 ? (
          <QuestionBlock
            ref={registerBlock("morningActivityOrder")}
            title="Arrange these in the order they normally happen."
          >
            {() => (
              <RankList
                items={morningActivityRankItems}
                onReorder={(nextValues) =>
                  updateField("morningActivityOrder", nextValues)
                }
              />
            )}
          </QuestionBlock>
        ) : null}

        <QuestionBlock
          ref={registerBlock("messDecision")}
          title="How is the mess for your breakfast usually decided?"
          required
          error={errors.messDecision}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.messDecision}
              value={values.messDecision}
              onValueChange={(value) => {
                updateField("messDecision", value as string)
                advance("messDecision")
              }}
              className="gap-0"
            >
              {MESS_DECISION_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`mess-decision-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`mess-decision-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("messFoodQuality")}
          title="How would you rate the food quality of the breakfast served at your mess?"
          required
          error={errors.messFoodQuality}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.messFoodQuality}
              value={values.messFoodQuality}
              onValueChange={(value) => {
                updateField("messFoodQuality", value as string)
                advance("messFoodQuality")
              }}
              className="gap-0"
            >
              {MESS_FOOD_QUALITY_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`mess-food-quality-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`mess-food-quality-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        <QuestionBlock
          ref={registerBlock("breakfastPlanChangeFrequency")}
          title="How often does your breakfast plan change after it is already too late to cancel that meal?"
          required
          error={errors.breakfastPlanChangeFrequency}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.breakfastPlanChangeFrequency}
              value={values.breakfastPlanChangeFrequency}
              onValueChange={(value) =>
                updateBreakfastPlanChangeFrequency(value as string)
              }
              className="gap-0"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`breakfast-plan-change-frequency-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`breakfast-plan-change-frequency-${option.value}`}
                    value={option.value}
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        </QuestionBlock>

        {showsBreakfastPlanChangeActions(values) ? (
          <QuestionBlock
            ref={registerBlock("breakfastPlanChangeActions")}
            title="When that happens, what do you usually do?"
            helperText="Select all that apply."
            required
            error={errors.breakfastPlanChangeActions}
          >
            {({ describedBy }) => (
              <div className="flex flex-col gap-3">
                <div
                  role="group"
                  aria-describedby={describedBy}
                  data-invalid={!!errors.breakfastPlanChangeActions}
                  className="flex flex-col gap-0"
                >
                  {BREAKFAST_CHANGE_ACTION_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`breakfast-plan-change-action-${option.value}`}
                      className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                    >
                      <Checkbox
                        id={`breakfast-plan-change-action-${option.value}`}
                        checked={values.breakfastPlanChangeActions.includes(
                          option.value
                        )}
                        onCheckedChange={(checked) =>
                          updateBreakfastPlanChangeActions(
                            option.value,
                            checked === true
                          )
                        }
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>

                {values.breakfastPlanChangeActions.includes(
                  OTHER_ACTIVITY_VALUE
                ) ? (
                  <Input
                    id="breakfast-plan-change-action-other"
                    placeholder="Describe what you usually do"
                    value={values.breakfastPlanChangeActionOther}
                    onChange={(event) =>
                      updateField(
                        "breakfastPlanChangeActionOther",
                        event.target.value
                      )
                    }
                  />
                ) : null}
              </div>
            )}
          </QuestionBlock>
        ) : null}

        {showsBreakfastPlanChangeActions(values) &&
        showsBreakfastResaleSuccessRate(values) ? (
          <QuestionBlock
            ref={registerBlock("breakfastResaleSuccessRate")}
            title="When you try to sell, exchange, or give away your breakfast, how often are you able to find someone to take it?"
            required
            error={errors.breakfastResaleSuccessRate}
          >
            {({ describedBy }) => (
              <RadioGroup
                aria-describedby={describedBy}
                aria-invalid={!!errors.breakfastResaleSuccessRate}
                value={values.breakfastResaleSuccessRate}
                onValueChange={(value) => {
                  updateField("breakfastResaleSuccessRate", value as string)
                  advance("breakfastResaleSuccessRate")
                }}
                className="gap-0"
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`breakfast-resale-success-${option.value}`}
                    className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                  >
                    <RadioGroupItem
                      id={`breakfast-resale-success-${option.value}`}
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
          ref={registerBlock("breakfastFrequency")}
          title="In a typical week, how often do you usually eat breakfast at the mess?"
          required
          error={errors.breakfastFrequency}
        >
          {({ describedBy }) => (
            <RadioGroup
              aria-describedby={describedBy}
              aria-invalid={!!errors.breakfastFrequency}
              value={values.breakfastFrequency}
              onValueChange={(value) =>
                updateBreakfastFrequency(value as string)
              }
              className="gap-0"
            >
              {BREAKFAST_FREQUENCY_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`breakfast-frequency-${option.value}`}
                  className="min-h-11 items-center gap-3 py-1 text-base font-normal text-foreground"
                >
                  <RadioGroupItem
                    id={`breakfast-frequency-${option.value}`}
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
