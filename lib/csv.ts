import Papa from "papaparse";
import { autoCategorize } from "./categories";
import { uid } from "./storage";
import type { Transaction, TxKind } from "./types";

interface RawRow {
  [key: string]: string;
}

const DATE_KEYS = ["date", "transaction date", "posted", "posting date", "trans date"];
const AMOUNT_KEYS = ["amount", "value", "debit/credit", "transaction amount"];
const DEBIT_KEYS = ["debit", "money out", "withdrawal", "spent"];
const CREDIT_KEYS = ["credit", "money in", "deposit", "received"];
const DESC_KEYS = ["description", "merchant", "narrative", "details", "memo", "payee", "name"];

function pick(row: RawRow, candidates: string[]): string | undefined {
  const lower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]));
  for (const c of candidates) {
    if (lower[c] !== undefined && lower[c] !== "") return lower[c];
  }
  return undefined;
}

function parseDate(value: string): string | null {
  if (!value) return null;
  // Try ISO first
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // dd/mm/yyyy or dd-mm-yyyy
  const dmy = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/.exec(value);
  if (dmy) {
    let [, d, m, y] = dmy;
    if (y.length === 2) y = "20" + y;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const t = Date.parse(value);
  if (!isNaN(t)) {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return null;
}

function parseAmount(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[£$€,\s]/g, "").replace(/[()]/g, "-");
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}

export interface CsvParseResult {
  transactions: Transaction[];
  skipped: number;
  total: number;
}

export function parseCsv(content: string): CsvParseResult {
  const parsed = Papa.parse<RawRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  const out: Transaction[] = [];
  let skipped = 0;
  for (const row of parsed.data) {
    const dateRaw = pick(row, DATE_KEYS);
    const date = dateRaw ? parseDate(dateRaw) : null;
    const desc = pick(row, DESC_KEYS) ?? "";
    let amount: number | null = null;
    let kind: TxKind = "expense";

    const debit = pick(row, DEBIT_KEYS);
    const credit = pick(row, CREDIT_KEYS);
    if (debit && parseAmount(debit) !== null && parseAmount(debit)! > 0) {
      amount = parseAmount(debit);
      kind = "expense";
    } else if (credit && parseAmount(credit) !== null && parseAmount(credit)! > 0) {
      amount = parseAmount(credit);
      kind = "income";
    } else {
      const single = pick(row, AMOUNT_KEYS);
      const n = single ? parseAmount(single) : null;
      if (n !== null) {
        amount = Math.abs(n);
        kind = n < 0 ? "expense" : "income";
      }
    }

    if (!date || amount === null || !isFinite(amount) || amount === 0) {
      skipped++;
      continue;
    }

    const merchant = desc.replace(/\s+/g, " ").trim() || "Unknown";
    out.push({
      id: uid(),
      date,
      amount: Math.round(amount * 100) / 100,
      kind,
      category: autoCategorize(merchant, kind),
      merchant,
    });
  }
  return { transactions: out, skipped, total: parsed.data.length };
}

export function toCsv(txs: Transaction[]): string {
  return Papa.unparse(
    txs.map((t) => ({
      date: t.date,
      kind: t.kind,
      amount: t.amount,
      category: t.category,
      merchant: t.merchant,
      note: t.note ?? "",
    }))
  );
}
