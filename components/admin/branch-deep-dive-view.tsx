import { RankedBarChart } from "@/components/admin/charts/ranked-bar-chart"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { BranchFieldSummary } from "@/lib/analytics/patterns/branch-deep-dive"

interface BranchDeepDiveViewProps {
  fields: BranchFieldSummary[]
}

/** One ranked bar chart per branch-specific follow-up question — these
 * only exist within their own branch (the survey never asks a Branch B
 * question of a Branch A respondent), so there's no cross-branch
 * comparison to make; this is a plain within-branch breakdown. Grouped
 * into the branch's own sub-themes (routine, adaptation, disruption, ...)
 * behind a nested accordion rather than a single continuous column of up
 * to 11 charts. */
export function BranchDeepDiveView({ fields }: BranchDeepDiveViewProps) {
  const groups: { name: string; fields: BranchFieldSummary[] }[] = []
  for (const field of fields) {
    const existing = groups.find((g) => g.name === field.group)
    if (existing) {
      existing.fields.push(field)
    } else {
      groups.push({ name: field.group, fields: [field] })
    }
  }

  return (
    <Accordion defaultValue={[groups[0]?.name]}>
      {groups.map((group) => (
        <AccordionItem key={group.name} value={group.name}>
          <AccordionTrigger>{group.name}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-6">
              {group.fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">{field.label}</p>
                  {field.eligibility.eligible === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No respondents in this branch were asked this question yet.
                    </p>
                  ) : (
                    <>
                      <RankedBarChart data={field.distribution} />
                      <p className="text-xs text-muted-foreground">
                        n = {field.eligibility.eligible} eligible ·{" "}
                        {field.eligibility.answered} answered · {field.eligibility.missing} missing
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
