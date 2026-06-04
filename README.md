# Finance Tracker AI Coach

Finance Tracker AI Coach is a single-user budgeting dashboard built with Next.js. It supports manual transactions, CSV import, category analytics, monthly budgets and optional AI spending notes when an Anthropic API key is configured.

## Why I Built It

I built this as a portfolio MVP to practise product-style frontend work with real state management, charts and CSV parsing. The project is local-first: transactions are stored in the browser, so it can be tested without a database.

## What It Does

- Adds, edits and deletes transactions.
- Imports demo or bank-style CSV data.
- Auto-categorises merchants with regex rules.
- Shows monthly income, spending, net balance and budget usage.
- Displays category breakdowns and daily spending trends.
- Supports monthly and category budgets.
- Compares current-month and previous-month spending.
- Generates AI or heuristic spending notes.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- PapaParse
- Anthropic SDK
- Browser `localStorage`

## Current Status

Working local-first prototype. The dashboard can be tested with `sample-statement.csv`, and the coach panel falls back to deterministic notes when no API key is set.

## How to Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

To test quickly, import `sample-statement.csv` from the project root.

Optional `.env.local`:

```bash
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-6
```

If `ANTHROPIC_API_KEY` is empty, the app still runs and uses heuristic coaching.

## Screenshot

![Finance Tracker dashboard](docs/assets/finance-tracker-dashboard.png)

## Limitations

- Data is stored only in the current browser.
- No account system or cloud sync.
- CSV parsing supports common English headers, but not every bank format.
- Currency is display-only; there is no exchange-rate conversion.
- AI notes are budgeting reflections, not financial advice.

## Future Improvements

- Add tests for CSV parsing, category rules and monthly analytics.
- Add export for cleaned transactions.
- Add more category rules and custom categories.
- Add database storage only if multi-device sync becomes a goal.
- Improve accessibility checks for charts and form controls.

## What I Learned

This project helped me practise building a dashboard from raw transaction data. The hardest part was making the CSV import and category logic tolerant enough for messy real-world inputs.

## 中文简介

Finance Tracker AI Coach 是一个个人财务记录和预算面板。它支持手动记账、CSV 导入、消费分类、预算进度和消费趋势图；没有 API key 时也能用规则逻辑生成简单建议。当前版本是本地优先的单用户原型。

作者：Shiyun Ni

## License

MIT. See [LICENSE](LICENSE).
