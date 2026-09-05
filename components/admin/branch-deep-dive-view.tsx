import { DistributionBarChart } from "@/components/admin/distribution-bar-chart"
import type { BranchFieldSummary } from "@/lib/analytics/patterns/branch-deep-dive"

interface BranchDeepDiveViewProps {
  fields: BranchFieldSummary[]
}

/** One bar chart per branch-specific follow-up question — these only
 * exist within their own branch (the survey never asks a Branch B
 * question of a Branch A respondent), so there's no cross-branch
 * comparison to make; this is a plain within-branch breakdown. */
export function BranchDeepDiveView({ fields }: BranchDeepDiveViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">{field.label}</p>
          {field.eligibility.eligible === 0 ? (
            <p className="text-sm text-muted-foreground">
              No respondents in this branch were asked this question yet.
            </p>
          ) : (
            <>
              <DistributionBarChart data={field.distribution} height={Math.max(120, field.distribution.length * 36)} />
              <p className="text-xs text-muted-foreground">
                n = {field.eligibility.eligible} eligible · {field.eligibility.answered}{" "}
                answered · {field.eligibility.missing} missing
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
