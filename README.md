# Finance Tracker · AI Spending Coach

A personal finance dashboard built with **Next.js 14 + TypeScript + Tailwind**, with an AI coach (Claude) that summarizes your spending habits, flags overspending, and suggests realistic monthly savings.

> Built as a portfolio MVP — single-user, runs locally, no database. All transactions live in browser localStorage; the AI coach calls Claude server-side via a Next.js API route.

## Features

- **Manual entry** — log income / expense with date, merchant, amount, category
- **Auto-categorization** — merchant names like "Uber Eats", "Tesco", "Netflix" are classified automatically (12 expense categories + income)
- **CSV bank import** — flexible parser handles common bank export formats (Date / Description / Amount, or Debit / Credit columns)
- **Monthly budget** — overall cap + per-category caps with progress bars and over-budget alerts
- **Charts** — daily expense/income trend (area chart) and category breakdown (donut)
- **Month selector** — review any prior month
- **AI Spending Coach** (the headline feature)
  - Compares current month vs previous month per category
  - Generates a one-line headline ("Food Delivery is up 38% vs last month")
  - Lists 2–4 specific observations
  - Suggests 2–3 concrete actions with estimated monthly savings
  - Falls back to a deterministic heuristic if no API key is set, so the demo always works

## Quick start

```bash
npm install
cp .env.example .env.local        # add your ANTHROPIC_API_KEY (optional)
npm run dev
```

Open <http://localhost:3000>.

To try it instantly without typing data: click **Import bank CSV** and choose `sample-statement.csv` from the project root — it spans April + May 2026 so the coach has something to compare.

## AI coach setup

The coach works in two modes:

| Mode      | When                                | Output                                                 |
| --------- | ----------------------------------- | ------------------------------------------------------ |
| **AI**    | `ANTHROPIC_API_KEY` set in `.env.local` | Claude generates the headline, details, and suggestions |
| **Heuristic** | No key set                       | Deterministic comparison of current vs previous month   |

Get an API key at <https://console.anthropic.com/>. The default model is `claude-sonnet-4-6`; override with `ANTHROPIC_MODEL` if you want.

## Project layout

```
app/
  api/coach/route.ts    # Calls Claude with a structured prompt, validates JSON response
  layout.tsx
  page.tsx
  globals.css
components/
  Dashboard.tsx         # Main shell: stats, charts, transactions, sidebar
  AICoach.tsx           # Coach panel that calls /api/coach
  TransactionForm.tsx   # Manual entry with auto-categorization on merchant change
  TransactionList.tsx   # Inline edit + delete
  CategoryChart.tsx     # Recharts donut
  TrendChart.tsx        # Recharts area chart of daily expense/income
  BudgetPanel.tsx       # Total + per-category caps with progress bars
  CsvImport.tsx         # File picker + status feedback
  StatCard.tsx
lib/
  types.ts              # Transaction, Budget, AppState, CoachInsight
  storage.ts            # localStorage I/O + sane defaults
  categories.ts         # 14 categories + regex auto-classifier
  csv.ts                # papaparse wrapper that accepts multiple bank schemas
  analytics.ts          # monthStats, compareMonths, dailyTrend, formatters
sample-statement.csv    # demo data
```

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **Recharts** for charts
- **PapaParse** for CSV parsing
- **@anthropic-ai/sdk** — server-side Claude calls

## Notes / limitations

- Single-user, browser-local storage. No accounts, no syncing across devices.
- The CSV parser auto-detects column names but only handles common English variants. Add more keys in [lib/csv.ts](lib/csv.ts) if your bank uses different headers.
- Auto-categorization rules in [lib/categories.ts](lib/categories.ts) are merchant-name regexes — extend them as needed.
- Currency is a free-form string (defaults to `£`); there's no FX conversion.

## CV / portfolio one-liner

> Built a personal finance dashboard with transaction tracking, category-based analytics and AI-generated spending insights to support budgeting decisions. Next.js + TypeScript + Tailwind, with Claude API integration for natural-language coaching.
