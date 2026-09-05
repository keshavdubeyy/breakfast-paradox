"use client"

import { BRANCH_LABELS } from "@/lib/analytics/patterns/normalization"
import type { AnalyticsRow } from "@/lib/analytics/types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface QualitativeField {
  key: keyof AnalyticsRow
  label: string
  question: string
}

const QUALITATIVE_FIELDS: QualitativeField[] = [
  {
    key: "semesterBreakfastChangeDescription",
    label: "What changed alongside their breakfast routine",
    question: "What changed around the same time as your breakfast routine?",
  },
  {
    key: "breakfastFrequencyChangeDescription",
    label: "What changed (rare/non-eaters who used to eat more often)",
    question: "What changed?",
  },
  {
    key: "breakfastSystemChangeSuggestion",
    label: "One thing they'd change about the breakfast system",
    question: "If you could change one thing about the current breakfast system, what would it be?",
  },
]

interface QualitativeEvidenceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: AnalyticsRow[]
}

/** Open-text responses, browsable as literal excerpts — deliberately not
 * summarized, counted, or scored. Patterns' job is to say what
 * repeatedly changes together in the closed-ended data; the qualitative
 * fields stay here as evidence a reader can check a quantitative claim
 * against, never converted into a quantitative claim themselves. */
export function QualitativeEvidenceDrawer({
  open,
  onOpenChange,
  rows,
}: QualitativeEvidenceDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Written responses</SheetTitle>
          <SheetDescription>
            Open-text excerpts, shown as written — not counted, scored, or
            summarized. No names or emails collected.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-auto px-6 pb-6">
          {QUALITATIVE_FIELDS.map((field) => {
            const excerpts = rows
              .map((row) => ({ row, text: row[field.key] as string | null }))
              .filter(
                (entry): entry is { row: AnalyticsRow; text: string } =>
                  entry.text !== null && entry.text.trim().length > 0
              )

            return (
              <div key={field.key} className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{field.label}</p>
                  <p className="text-xs text-muted-foreground">“{field.question}”</p>
                </div>
                {excerpts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No written responses yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {excerpts.map(({ row, text }) => (
                      <li
                        key={row.id}
                        className="rounded-lg border border-border/60 p-3 text-sm text-foreground"
                      >
                        <p>{text}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {row.branch ? BRANCH_LABELS[row.branch] : "Branch unknown"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
