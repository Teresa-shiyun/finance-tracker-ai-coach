"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { formatMoney } from "@/lib/analytics";
import type { MonthStats } from "@/lib/analytics";
import type { Budget, Category } from "@/lib/types";

interface Props {
  budget: Budget;
  stats: MonthStats;
  onChange: (b: Budget) => void;
}

export default function BudgetPanel({ budget, stats, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">Budget</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-accent2 hover:underline"
        >
          {open ? "Done" : "Edit"}
        </button>
      </div>

      {open ? (
        <div className="space-y-3">
          <label className="block text-xs text-zinc-500">
            Currency
            <input
              value={budget.currency}
              onChange={(e) => onChange({ ...budget, currency: e.target.value || "£" })}
              className="mt-1 w-full"
              maxLength={3}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Monthly total
            <input
              type="number"
              min={0}
              value={budget.monthlyTotal}
              onChange={(e) => onChange({ ...budget, monthlyTotal: Number(e.target.value) || 0 })}
              className="mt-1 w-full"
            />
          </label>
          <div>
            <div className="mb-1 text-xs text-zinc-500">Per category cap</div>
            <div className="space-y-1.5">
              {EXPENSE_CATEGORIES.map((c) => (
                <div key={c} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 truncate text-zinc-300">{c}</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="—"
                    value={budget.perCategory[c] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      const next = { ...budget.perCategory };
                      if (v === "") delete next[c];
                      else next[c as Category] = Number(v) || 0;
                      onChange({ ...budget, perCategory: next });
                    }}
                    className="w-24 text-right"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between">
            <span className="text-zinc-400">Monthly total</span>
            <span className="font-medium">
              {formatMoney(stats.expense, budget.currency)} / {formatMoney(budget.monthlyTotal, budget.currency)}
            </span>
          </li>
          {EXPENSE_CATEGORIES.filter((c) => budget.perCategory[c]).map((c) => {
            const cap = budget.perCategory[c]!;
            const spent = stats.byCategory[c] ?? 0;
            const pct = cap > 0 ? (spent / cap) * 100 : 0;
            const over = spent > cap;
            return (
              <li key={c} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{c}</span>
                  <span className={over ? "text-red-400" : "text-zinc-300"}>
                    {formatMoney(spent, budget.currency)} / {formatMoney(cap, budget.currency)}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${over ? "bg-red-400" : pct > 80 ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
