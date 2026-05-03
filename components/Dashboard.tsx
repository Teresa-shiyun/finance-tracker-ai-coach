"use client";

import { useEffect, useMemo, useState } from "react";
import {
  compareMonths,
  currentMonthKey,
  formatMoney,
  formatYm,
  monthStats,
  previousMonthKey,
} from "@/lib/analytics";
import { DEFAULT_STATE, loadState, saveState, sortTx } from "@/lib/storage";
import type { AppState, Transaction } from "@/lib/types";
import AICoach from "./AICoach";
import BudgetPanel from "./BudgetPanel";
import CategoryChart from "./CategoryChart";
import CsvImport from "./CsvImport";
import StatCard from "./StatCard";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import TrendChart from "./TrendChart";

export default function Dashboard() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [activeMonth, setActiveMonth] = useState<string>(currentMonthKey());

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const cur = activeMonth;
  const prev = useMemo(() => {
    const [y, m] = cur.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [cur]);

  const stats = useMemo(() => monthStats(state.transactions, cur), [state.transactions, cur]);
  const prevStats = useMemo(() => monthStats(state.transactions, prev), [state.transactions, prev]);
  const deltas = useMemo(() => compareMonths(state.transactions, cur, prev), [state.transactions, cur, prev]);

  const months = useMemo(() => {
    const set = new Set<string>([currentMonthKey()]);
    for (const t of state.transactions) set.add(t.date.slice(0, 7));
    return [...set].sort().reverse();
  }, [state.transactions]);

  const overBudget =
    state.budget.monthlyTotal > 0 && stats.expense > state.budget.monthlyTotal;
  const budgetPct = state.budget.monthlyTotal > 0
    ? Math.min(100, (stats.expense / state.budget.monthlyTotal) * 100)
    : 0;

  function addTx(tx: Transaction) {
    setState((s) => ({ ...s, transactions: sortTx([tx, ...s.transactions]) }));
  }
  function deleteTx(id: string) {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
  }
  function updateTx(updated: Transaction) {
    setState((s) => ({
      ...s,
      transactions: sortTx(s.transactions.map((t) => (t.id === updated.id ? updated : t))),
    }));
  }
  function importTx(list: Transaction[]) {
    setState((s) => ({ ...s, transactions: sortTx([...list, ...s.transactions]) }));
  }
  function clearAll() {
    if (confirm("Delete all transactions? This cannot be undone.")) {
      setState((s) => ({ ...s, transactions: [] }));
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
            Finance Tracker
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Personal spending dashboard with an AI coach that tells you where you overspent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-wide text-zinc-500">Month</label>
          <select
            value={activeMonth}
            onChange={(e) => setActiveMonth(e.target.value)}
            className="min-w-[10rem]"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {formatYm(m)}
              </option>
            ))}
          </select>
        </div>
      </header>

      {overBudget && (
        <div className="mb-4 rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-red-200">
          Heads up — you’re over your monthly budget by{" "}
          <strong>{formatMoney(stats.expense - state.budget.monthlyTotal, state.budget.currency)}</strong>.
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Income"
          value={formatMoney(stats.income, state.budget.currency)}
          tone="good"
          sub={`Last month ${formatMoney(prevStats.income, state.budget.currency)}`}
        />
        <StatCard
          label="Expense"
          value={formatMoney(stats.expense, state.budget.currency)}
          tone="bad"
          sub={`Last month ${formatMoney(prevStats.expense, state.budget.currency)}`}
        />
        <StatCard
          label="Net"
          value={formatMoney(stats.net, state.budget.currency)}
          tone={stats.net >= 0 ? "good" : "bad"}
          sub={stats.net >= 0 ? "Saving this month" : "Spending more than earning"}
        />
        <StatCard
          label="Budget used"
          value={`${Math.round(budgetPct)}%`}
          tone={overBudget ? "bad" : budgetPct > 80 ? "warn" : "good"}
          sub={`${formatMoney(stats.expense, state.budget.currency)} of ${formatMoney(state.budget.monthlyTotal, state.budget.currency)}`}
          progress={budgetPct}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-panel p-5">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-400">
              Daily trend
            </h2>
            <TrendChart data={state.transactions} ym={cur} currency={state.budget.currency} />
          </div>
          <div className="rounded-xl border border-border bg-panel p-5">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-400">
              Spending by category
            </h2>
            <CategoryChart stats={stats} budget={state.budget} />
          </div>
          <div className="rounded-xl border border-border bg-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
                Transactions ({state.transactions.filter((t) => t.date.slice(0, 7) === cur).length})
              </h2>
              <button
                onClick={clearAll}
                className="text-xs text-zinc-500 hover:text-red-400"
              >
                Clear all
              </button>
            </div>
            <TransactionList
              transactions={state.transactions.filter((t) => t.date.slice(0, 7) === cur)}
              currency={state.budget.currency}
              onDelete={deleteTx}
              onUpdate={updateTx}
            />
          </div>
        </div>

        <aside className="space-y-6">
          <AICoach
            transactions={state.transactions}
            budget={state.budget}
            deltas={deltas}
          />
          <div className="rounded-xl border border-border bg-panel p-5">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-400">
              Add transaction
            </h2>
            <TransactionForm onAdd={addTx} defaultDate={`${cur}-${String(new Date().getDate()).padStart(2, "0")}`} />
          </div>
          <div className="rounded-xl border border-border bg-panel p-5">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-400">
              Import bank CSV
            </h2>
            <CsvImport onImport={importTx} />
          </div>
          <BudgetPanel
            budget={state.budget}
            stats={stats}
            onChange={(budget) => setState((s) => ({ ...s, budget }))}
          />
        </aside>
      </section>

      <footer className="mt-10 pb-6 text-center text-xs text-zinc-500">
        Data lives in your browser (localStorage). The AI coach calls Claude server-side.
      </footer>
    </main>
  );
}
