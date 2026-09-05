"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { SurveyOption } from "@/lib/survey-options"

interface TimeRangeSelectProps {
  heading: string
  idPrefix: string
  options: SurveyOption[]
  weekdayValue: string
  weekendValue: string
  onWeekdayChange: (value: string) => void
  onWeekendChange: (value: string) => void
  weekdayInvalid?: boolean
  weekendInvalid?: boolean
  describedBy?: string
}

/**
 * A weekday/weekend pair of time-range selects, used for both the sleep
 * time and wake time questions.
 */
function TimeRangeSelect({
  heading,
  idPrefix,
  options,
  weekdayValue,
  weekendValue,
  onWeekdayChange,
  onWeekendChange,
  weekdayInvalid,
  weekendInvalid,
  describedBy,
}: TimeRangeSelectProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-input bg-input/30 p-4">
      <p className="text-sm font-medium text-foreground">{heading}</p>

      <TimeRangeRow
        id={`${idPrefix}-weekday`}
        label="Weekdays"
        value={weekdayValue}
        onChange={onWeekdayChange}
        options={options}
        invalid={weekdayInvalid}
        describedBy={describedBy}
      />
      <TimeRangeRow
        id={`${idPrefix}-weekend`}
        label="Weekends"
        value={weekendValue}
        onChange={onWeekendChange}
        options={options}
        invalid={weekendInvalid}
        describedBy={describedBy}
      />
    </div>
  )
}

interface TimeRangeRowProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SurveyOption[]
  invalid?: boolean
  describedBy?: string
}

function TimeRangeRow({
  id,
  label,
  value,
  onChange,
  options,
  invalid,
  describedBy,
}: TimeRangeRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-base font-normal text-foreground">
        {label}
      </Label>
      <Select
        value={value || null}
        onValueChange={(next) => onChange(next as string)}
      >
        <SelectTrigger
          id={id}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="min-h-9 w-auto"
        >
          <SelectValue placeholder="Select time/range" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { TimeRangeSelect }
