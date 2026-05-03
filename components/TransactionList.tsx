"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { formatMoney } from "@/lib/analytics";
import type { Category, Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  currency: string;
  onDelete: (id: string) => void;
  onUpdate: (tx: Transaction) => void;
}

export default function TransactionList({ transactions, currency, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-zinc-500">
        No transactions for this month yet. Add one or import a CSV to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-1 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-2 py-1 font-normal">Date</th>
            <th className="px-2 py-1 font-normal">Merchant</th>
            <th className="px-2 py-1 font-normal">Category</th>
            <th className="px-2 py-1 text-right font-normal">Amount</th>
            <th className="px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const cats = t.kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
            const editing = editingId === t.id;
            return (
              <tr key={t.id} className="rounded-md bg-muted/40 hover:bg-muted">
                <td className="rounded-l-md px-2 py-2 text-zinc-400 whitespace-nowrap">{t.date}</td>
                <td className="px-2 py-2">
                  {editing ? (
                    <input
                      defaultValue={t.merchant}
                      onBlur={(e) => onUpdate({ ...t, merchant: e.target.value })}
                      className="w-full"
                    />
                  ) : (
                    <span className="text-white">{t.merchant}</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  <select
                    value={t.category}
                    onChange={(e) => onUpdate({ ...t, category: e.target.value as Category })}
                    className="text-xs"
                  >
                    {cats.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td
                  className={`px-2 py-2 text-right font-medium whitespace-nowrap ${
                    t.kind === "income" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {t.kind === "income" ? "+" : "−"}
                  {formatMoney(t.amount, currency)}
                </td>
                <td className="rounded-r-md px-2 py-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditingId(editing ? null : t.id)}
                    className="px-1 text-xs text-zinc-500 hover:text-white"
                  >
                    {editing ? "Done" : "Edit"}
                  </button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="px-1 text-xs text-zinc-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
