"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { vibrateTick } from "@/lib/haptics"
import { cn } from "@/lib/utils"
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
 * A Likert-style rating list, one slider per statement/factor. Discrete
 * steps map 1:1 to `scaleOptions` (index 0..length-1) — this reads as a
 * compact single-row control at any width, unlike a row of labeled pills
 * which wraps unpredictably once there are 5-6 scale points.
 *
 * A row with no answer yet renders dimmed, sitting at step 0, rather than
 * with no thumb at all (sliders can't represent "empty"). The row is only
 * considered answered — and `onChange` only fires — once the user actually
 * interacts with it, so `values[row.key]` stays "" (and required-field
 * validation stays accurate) until then. A plain click that lands exactly
 * on step 0 wouldn't otherwise change the controlled value and so wouldn't
 * fire Base UI's onValueChange — the pointerdown handler below covers that
 * one case explicitly.
 */
function ScaleGrid({
  idPrefix,
  scaleOptions,
  rows,
  values,
  onChange,
  invalidRowKeys,
}: ScaleGridProps) {
  const maxIndex = scaleOptions.length - 1

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row) => {
        const isInvalid = invalidRowKeys?.includes(row.key) ?? false
        const answeredIndex = scaleOptions.findIndex(
          (option) => option.value === values[row.key]
        )
        const isAnswered = answeredIndex !== -1
        const sliderIndex = isAnswered ? answeredIndex : 0

        const commit = (index: number) => {
          const clamped = Math.min(Math.max(index, 0), maxIndex)
          if (clamped !== sliderIndex) {
            vibrateTick()
          }
          onChange(row.key, scaleOptions[clamped].value)
        }

        return (
          <div
            key={row.key}
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-transparent p-3",
              isInvalid && "border-destructive/40 bg-destructive/5"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex items-start gap-1.5 text-sm font-medium text-foreground">
                {isInvalid ? (
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive"
                  />
                ) : null}
                <span>
                  {row.label}
                  {row.helperText ? (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {row.helperText}
                    </span>
                  ) : null}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-right text-sm font-medium",
                  isAnswered ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isAnswered ? scaleOptions[answeredIndex].label : "Tap to rate"}
              </span>
            </div>

            <div
              onPointerDownCapture={() => {
                if (!isAnswered) commit(0)
              }}
            >
              <SliderPrimitive.Root
                value={[sliderIndex]}
                onValueChange={(value) =>
                  commit(Array.isArray(value) ? value[0] : value)
                }
                min={0}
                max={maxIndex}
                step={1}
                aria-invalid={isInvalid}
                thumbAlignment="edge"
                className="w-full"
              >
                <SliderPrimitive.Control
                  className={cn(
                    "relative flex w-full touch-none items-center py-1.5 select-none",
                    !isAnswered && "opacity-40"
                  )}
                >
                  <SliderPrimitive.Track
                    data-slot="slider-track"
                    className="relative h-3 w-full grow overflow-hidden rounded-4xl bg-muted select-none"
                  >
                    <SliderPrimitive.Indicator
                      data-slot="slider-range"
                      className="h-full bg-primary transition-[width] duration-150 ease-out select-none"
                    />
                  </SliderPrimitive.Track>
                  <SliderPrimitive.Thumb
                    data-slot="slider-thumb"
                    id={`${idPrefix}-${row.key}`}
                    getAriaLabel={() => row.label}
                    getAriaValueText={() =>
                      isAnswered ? scaleOptions[sliderIndex].label : "Not yet rated"
                    }
                    className="block size-5 shrink-0 rounded-4xl border border-primary bg-white shadow-sm ring-ring/50 transition-all duration-150 ease-out select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden"
                  />
                </SliderPrimitive.Control>
              </SliderPrimitive.Root>
            </div>

            <div className="flex justify-between text-[0.6875rem] text-muted-foreground">
              <span>{scaleOptions[0].label}</span>
              <span className="text-right">{scaleOptions[maxIndex].label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { ScaleGrid }
