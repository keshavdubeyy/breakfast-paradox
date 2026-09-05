import { ARCHETYPE_IDS } from "@/lib/archetype-content"
import type { ArchetypeResult, ScoreComponentBreakdown } from "@/lib/archetype-scoring"

function formatRaw(raw: ScoreComponentBreakdown["rawInput"]) {
  if (raw === null) {
    return "—"
  }
  if (Array.isArray(raw)) {
    return raw.length > 0 ? raw.join(", ") : "(none selected)"
  }
  return raw
}

function formatNumber(value: number | null, digits = 2) {
  return value === null ? "—" : value.toFixed(digits)
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-1.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function ArchetypeBreakdownTable({
  breakdown,
  isWinner,
  isRunnerUp,
}: {
  breakdown: ArchetypeResult["breakdowns"][keyof ArchetypeResult["breakdowns"]]
  isWinner: boolean
  isRunnerUp: boolean
}) {
  return (
    <div className="rounded-xl border border-border/60">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="font-mono text-sm font-medium text-foreground">
          {breakdown.id}
          {isWinner ? (
            <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
              WINNER
            </span>
          ) : null}
          {isRunnerUp ? (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              RUNNER-UP
            </span>
          ) : null}
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          score {breakdown.scaledScore} · available weight{" "}
          {formatNumber(breakdown.availableWeightTotal)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground">
              <th className="px-3 py-2 font-medium">Component</th>
              <th className="px-3 py-2 font-medium">Raw input</th>
              <th className="px-3 py-2 font-medium">Normalized (0–1)</th>
              <th className="px-3 py-2 font-medium">Weight</th>
              <th className="px-3 py-2 font-medium">Weighted contribution</th>
              <th className="px-3 py-2 font-medium">Available</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {breakdown.components.map((component) => (
              <tr
                key={component.key}
                className="border-b border-border/30 last:border-b-0"
                data-unavailable={!component.available}
              >
                <td className="px-3 py-2 align-top whitespace-normal font-sans text-foreground">
                  {component.label}
                </td>
                <td className="max-w-[220px] px-3 py-2 align-top whitespace-normal break-words">
                  {formatRaw(component.rawInput)}
                </td>
                <td className="px-3 py-2 align-top">
                  {formatNumber(component.normalizedValue)}
                </td>
                <td className="px-3 py-2 align-top">
                  {component.weight.toFixed(2)}
                </td>
                <td className="px-3 py-2 align-top">
                  {formatNumber(component.weightedContribution)}
                </td>
                <td className="px-3 py-2 align-top">
                  {component.available ? (
                    "yes"
                  ) : (
                    <span className="text-destructive">no (excluded)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Development-only inspector for the archetype scoring engine: shows every
 * component's raw input, normalized value, weight, and weighted
 * contribution for all six archetypes, plus the winner/runner-up/
 * tie-breaker/confidence decision. Used by /dev/archetypes.
 */
export function ArchetypeDebugPanel({ result }: { result: ArchetypeResult }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
        <SummaryRow label="Winner" value={result.winner} />
        <SummaryRow label="Runner-up" value={result.runnerUp} />
        <SummaryRow
          label="Difference (winner − runner-up)"
          value={String(result.difference)}
        />
        <SummaryRow
          label="Tie-breaker used"
          value={result.tieBreakerUsed ? "yes" : "no"}
        />
        <SummaryRow
          label="Tie-breaker factor"
          value={result.tieBreakerFactor ?? "—"}
        />
        <SummaryRow label="Confidence" value={result.confidence} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ARCHETYPE_IDS.map((id) => (
          <div
            key={id}
            className="rounded-lg border border-border/60 px-3 py-2 font-mono text-sm"
          >
            <div className="text-muted-foreground">{id}</div>
            <div className="text-lg font-semibold text-foreground">
              {result.scores[id]}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {ARCHETYPE_IDS.map((id) => (
          <ArchetypeBreakdownTable
            key={id}
            breakdown={result.breakdowns[id]}
            isWinner={id === result.winner}
            isRunnerUp={id === result.runnerUp}
          />
        ))}
      </div>
    </div>
  )
}
