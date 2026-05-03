import type { Category, Transaction } from "./types";

export function ymKey(date: string): string {
  return date.slice(0, 7); // yyyy-mm
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function previousMonthKey(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function inMonth(tx: Transaction, ym: string): boolean {
  return ymKey(tx.date) === ym;
}

export interface MonthStats {
  income: number;
  expense: number;
  net: number;
  byCategory: Record<string, number>;
  countByCategory: Record<string, number>;
  topMerchants: { merchant: string; total: number }[];
}

export function monthStats(txs: Transaction[], ym: string): MonthStats {
  const month = txs.filter((t) => inMonth(t, ym));
  const stats: MonthStats = {
    income: 0,
    expense: 0,
    net: 0,
    byCategory: {},
    countByCategory: {},
    topMerchants: [],
  };
  const merchantTotals = new Map<string, number>();
  for (const t of month) {
    if (t.kind === "income") {
      stats.income += t.amount;
    } else {
      stats.expense += t.amount;
      stats.byCategory[t.category] = (stats.byCategory[t.category] ?? 0) + t.amount;
      stats.countByCategory[t.category] = (stats.countByCategory[t.category] ?? 0) + 1;
      const m = t.merchant || "Unknown";
      merchantTotals.set(m, (merchantTotals.get(m) ?? 0) + t.amount);
    }
  }
  stats.net = stats.income - stats.expense;
  stats.topMerchants = [...merchantTotals.entries()]
    .map(([merchant, total]) => ({ merchant, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  return stats;
}

export interface CategoryDelta {
  category: Category | string;
  current: number;
  previous: number;
  deltaPct: number; // positive => spent more this month
  deltaAbs: number;
}

export function compareMonths(
  txs: Transaction[],
  currentYm: string,
  previousYm: string
): CategoryDelta[] {
  const cur = monthStats(txs, currentYm);
  const prev = monthStats(txs, previousYm);
  const cats = new Set<string>([
    ...Object.keys(cur.byCategory),
    ...Object.keys(prev.byCategory),
  ]);
  const result: CategoryDelta[] = [];
  for (const c of cats) {
    const current = cur.byCategory[c] ?? 0;
    const previous = prev.byCategory[c] ?? 0;
    const deltaAbs = current - previous;
    const deltaPct = previous === 0 ? (current === 0 ? 0 : 100) : (deltaAbs / previous) * 100;
    result.push({ category: c, current, previous, deltaAbs, deltaPct });
  }
  return result.sort((a, b) => b.deltaAbs - a.deltaAbs);
}

export function dailyTrend(txs: Transaction[], ym: string): { day: string; expense: number; income: number }[] {
  const byDay = new Map<string, { expense: number; income: number }>();
  for (const t of txs.filter((x) => inMonth(x, ym))) {
    const d = t.date;
    const cur = byDay.get(d) ?? { expense: 0, income: 0 };
    if (t.kind === "expense") cur.expense += t.amount;
    else cur.income += t.amount;
    byDay.set(d, cur);
  }
  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, v]) => ({ day: day.slice(8), expense: round2(v.expense), income: round2(v.income) }));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatMoney(n: number, currency = "£"): string {
  return `${currency}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatYm(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
}
