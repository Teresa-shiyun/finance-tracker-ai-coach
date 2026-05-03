"use client";

import { useState } from "react";
import type { CategoryDelta } from "@/lib/analytics";
import { formatMoney } from "@/lib/analytics";
import type { Budget, CoachInsight, Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  budget: Budget;
  deltas: CategoryDelta[];
}

interface CoachResponse {
  insight: CoachInsight;
  source: "ai" | "fallback";
  note?: string;
  error?: string;
}

export default function AICoach({ transactions, budget, deltas }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CoachResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, budget }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as CoachResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const topMover = deltas.find((d) => d.deltaAbs > 0 && d.previous > 0);

  return (
    <div className="rounded-xl border border-accent/30 bg-gradient-to-b from-accent/10 to-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-accent2">AI Spending Coach</h2>
        {data && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
            {data.source === "ai" ? "Claude" : "Heuristic"}
          </span>
        )}
      </div>

      {!data && !loading && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">
            Ask the coach where your money went this month.
            {topMover && (
              <>
                {" "}
                Quick read: <strong>{topMover.category}</strong> is up{" "}
                {Math.round(topMover.deltaPct)}% (
                {formatMoney(topMover.deltaAbs, budget.currency)}) vs last month.
              </>
            )}
          </p>
          <button
            onClick={run}
            disabled={transactions.length === 0}
            className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {transactions.length === 0 ? "Add transactions first" : "Analyze my spending"}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-4 text-sm text-zinc-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent2" />
          Coach is reviewing your last two months…
        </div>
      )}

      {error && (
        <div className="rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <p className="text-base font-medium text-white">{data.insight.headline}</p>
          {data.insight.details?.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
              {data.insight.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
          {data.insight.suggestions?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Try this</div>
              {data.insight.suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <span className="text-zinc-200">{s.action}</span>
                  <span className="shrink-0 text-emerald-400 tabular-nums">
                    Save ~{formatMoney(s.estimatedSaving, budget.currency)}/mo
                  </span>
                </div>
              ))}
            </div>
          )}
          {data.note && <p className="text-xs text-zinc-500">{data.note}</p>}
          <button
            onClick={run}
            className="text-xs text-accent2 hover:underline"
          >
            Re-run analysis
          </button>
        </div>
      )}
    </div>
  );
}
