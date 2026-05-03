"use client";

import { useState } from "react";
import { ALL_CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES, autoCategorize } from "@/lib/categories";
import { uid } from "@/lib/storage";
import type { Category, Transaction, TxKind } from "@/lib/types";

interface Props {
  onAdd: (tx: Transaction) => void;
  defaultDate: string;
}

export default function TransactionForm({ onAdd, defaultDate }: Props) {
  const [kind, setKind] = useState<TxKind>("expense");
  const [date, setDate] = useState(defaultDate);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Other");
  const [touchedCat, setTouchedCat] = useState(false);

  const cats = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleMerchantChange(v: string) {
    setMerchant(v);
    if (!touchedCat) setCategory(autoCategorize(v, kind));
  }

  function handleKindChange(k: TxKind) {
    setKind(k);
    if (!touchedCat) setCategory(autoCategorize(merchant, k));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!isFinite(n) || n <= 0 || !date || !merchant.trim()) return;
    onAdd({
      id: uid(),
      date,
      amount: Math.round(n * 100) / 100,
      kind,
      category,
      merchant: merchant.trim(),
    });
    setMerchant("");
    setAmount("");
    setCategory("Other");
    setTouchedCat(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        {(["expense", "income"] as TxKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKindChange(k)}
            className={`flex-1 rounded-md border px-3 py-1.5 text-sm capitalize transition ${
              kind === k
                ? k === "expense"
                  ? "border-red-400/40 bg-red-400/10 text-red-300"
                  : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-border bg-muted text-zinc-400 hover:text-white"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full"
          required
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full"
          required
        />
      </div>
      <input
        type="text"
        value={merchant}
        onChange={(e) => handleMerchantChange(e.target.value)}
        placeholder="Merchant (e.g. Tesco, Uber Eats)"
        className="w-full"
        required
      />
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value as Category);
          setTouchedCat(true);
        }}
        className="w-full"
      >
        {cats.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Add transaction
      </button>
    </form>
  );
}
