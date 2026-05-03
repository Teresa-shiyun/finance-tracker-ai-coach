export type TxKind = "expense" | "income";

export type Category =
  | "Food Delivery"
  | "Groceries"
  | "Restaurants"
  | "Transport"
  | "Rent & Bills"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Travel"
  | "Subscriptions"
  | "Education"
  | "Salary"
  | "Other Income"
  | "Other";

export interface Transaction {
  id: string;
  date: string; // ISO yyyy-mm-dd
  amount: number; // positive number; sign derived from `kind`
  kind: TxKind;
  category: Category;
  merchant: string;
  note?: string;
}

export interface Budget {
  monthlyTotal: number;
  perCategory: Partial<Record<Category, number>>;
  currency: string;
}

export interface AppState {
  transactions: Transaction[];
  budget: Budget;
}

export interface CoachInsight {
  headline: string;
  details: string[];
  suggestions: { action: string; estimatedSaving: number }[];
}
