"use client"

import { forwardRef, useId, type ReactNode } from "react"

import {
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

interface QuestionBlockIds {
  descriptionId?: string
  errorId?: string
  describedBy?: string
}

interface QuestionBlockProps {
  title: string
  helperText?: string
  required?: boolean
  error?: string
  className?: string
  children: ReactNode | ((ids: QuestionBlockIds) => ReactNode)
}

/**
 * Groups a question's title, helper text, input, and error into a single
 * accessible fieldset. Focusable (tabIndex -1) so the survey can scroll to
 * and focus the first unanswered question when validation fails.
 */
const QuestionBlock = forwardRef<HTMLFieldSetElement, QuestionBlockProps>(
  function QuestionBlock(
    { title, helperText, required = false, error, className, children },
    ref
  ) {
    const descriptionId = useId()
    const errorId = useId()

    const ids: QuestionBlockIds = {
      descriptionId: helperText ? descriptionId : undefined,
      errorId: error ? errorId : undefined,
      describedBy:
        [helperText ? descriptionId : null, error ? errorId : null]
          .filter(Boolean)
          .join(" ") || undefined,
    }

    return (
      <FieldSet
        ref={ref}
        tabIndex={-1}
        data-invalid={error ? true : undefined}
        className={cn("min-w-0 scroll-mt-6 gap-4 outline-none", className)}
      >
        <FieldLegend
          variant="legend"
          className="mb-4 text-base font-medium text-balance"
        >
          {title}
          {required ? (
            <>
              <span aria-hidden="true" className="ml-0.5 text-destructive">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          ) : null}
        </FieldLegend>

        {helperText ? (
          <FieldDescription id={descriptionId}>{helperText}</FieldDescription>
        ) : null}

        {typeof children === "function" ? children(ids) : children}

        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </FieldSet>
    )
  }
)

export { QuestionBlock }
export type { QuestionBlockIds }
