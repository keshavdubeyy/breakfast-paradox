"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { ScaleRowItem, SurveyOption } from "@/lib/survey-options"

interface ScaleGridProps {
  idPrefix: string
  scaleOptions: SurveyOption[]
  rows: ScaleRowItem[]
  values: Record<string, string>
  onChange: (rowKey: string, value: string) => void
  invalidRowKeys?: string[]
}

/**
 * A Likert-style grid: one row per statement/factor, one column per scale
 * point. Used for the before/after comparison (Q4), the influence ratings
 * (Q7), and the agreement statements (Q9) — each with a different scale and
 * row set, so both are passed in rather than hardcoded.
 */
function ScaleGrid({
  idPrefix,
  scaleOptions,
  rows,
  values,
  onChange,
  invalidRowKeys,
}: ScaleGridProps) {
  const gridTemplateColumns = `minmax(0,1fr) repeat(${scaleOptions.length}, minmax(2.75rem, 1fr))`
  const minWidth = `${14 + scaleOptions.length * 3.25}rem`

  return (
    <div className="min-w-0 overflow-x-auto">
      <div className="flex flex-col gap-0" style={{ minWidth }}>
        <div
          className="grid gap-1 pb-2"
          style={{ gridTemplateColumns }}
        >
          <span aria-hidden="true" />
          {scaleOptions.map((option) => (
            <span
              key={option.value}
              className="px-0.5 text-center text-[0.6875rem] leading-tight text-balance text-muted-foreground"
            >
              {option.label}
            </span>
          ))}
        </div>

        {rows.map((row) => (
          <RadioGroup
            key={row.key}
            value={values[row.key] ?? ""}
            onValueChange={(value) => onChange(row.key, value as string)}
            aria-label={row.label}
            aria-invalid={invalidRowKeys?.includes(row.key)}
            className="grid items-center gap-1 border-t border-border/50 py-2.5"
            style={{ gridTemplateColumns }}
          >
            <span className="pr-2 text-sm text-foreground">
              {row.label}
              {row.helperText ? (
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {row.helperText}
                </span>
              ) : null}
            </span>
            {scaleOptions.map((option) => (
              <div key={option.value} className="flex justify-center">
                <Label
                  htmlFor={`${idPrefix}-${row.key}-${option.value}`}
                  className="sr-only"
                >
                  {row.label}: {option.label}
                </Label>
                <RadioGroupItem
                  id={`${idPrefix}-${row.key}-${option.value}`}
                  value={option.value}
                />
              </div>
            ))}
          </RadioGroup>
        ))}
      </div>
    </div>
  )
}

export { ScaleGrid }
