import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { SYSTEM_CONTEXT } from "@/lib/analytics/structures/system-context"

const STEPS: { title: string; note?: string }[] = [
  { title: "Student decides on a breakfast plan" },
  {
    title: "Breakfast registration happens in advance",
    note: SYSTEM_CONTEXT.registrationLeadTime,
  },
  {
    title: "If the student doesn't register/select, a mess may be automatically allotted",
  },
  {
    title: "The meal cancellation / change window closes",
    note: "Same-day cancellation is not available the way advance cancellation is.",
  },
  { title: "Breakfast day arrives" },
  { title: "The student's real plan may still change" },
]

const OUTCOMES = [
  "Use the meal",
  "Transfer / exchange it",
  "Sell it",
  "Give it away",
  "Seek alternative food",
  "Leave it unused",
  "Skip breakfast",
]

function FlowStep({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card px-4 py-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="flex justify-center py-0.5 text-muted-foreground/60">
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
    </div>
  )
}

/** The verified mechanics of the mess breakfast system, as distinct from
 * anything a respondent reported — every fact drawn here comes from
 * SYSTEM_CONTEXT, never from a survey percentage. Deliberately not a
 * chart: this is "how the system works", the frame the rest of
 * Structures' survey evidence sits inside. */
export function SystemMechanicsFlow() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
          System rule
        </Badge>
        <p className="text-xs text-muted-foreground">
          Current system mechanics — not a survey finding.
        </p>
      </div>

      <div className="flex flex-col">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex flex-col">
            <FlowStep title={step.title} note={step.note} />
            {index < STEPS.length - 1 ? <FlowArrow /> : null}
          </div>
        ))}
      </div>

      <FlowArrow />

      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border/60 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Student can, in any combination:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {OUTCOMES.map((outcome) => (
            <Badge key={outcome} variant="secondary" className="font-normal">
              {outcome}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
