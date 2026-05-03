import type { AppState, Budget, Transaction } from "./types";

const KEY = "finance-tracker:v1";

const DEFAULT_BUDGET: Budget = {
  monthlyTotal: 1500,
  perCategory: {
    "Food Delivery": 80,
    Groceries: 300,
    Restaurants: 150,
    Transport: 120,
    "Rent & Bills": 700,
    Shopping: 100,
    Entertainment: 50,
    Subscriptions: 40,
  },
  currency: "£",
};

export const DEFAULT_STATE: AppState = {
  transactions: [],
  budget: DEFAULT_BUDGET,
};

export function loadState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as AppState;
    return {
      transactions: parsed.transactions ?? [],
      budget: { ...DEFAULT_BUDGET, ...parsed.budget },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function sortTx(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
