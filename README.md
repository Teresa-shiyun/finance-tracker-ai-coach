# Finance Tracker AI Coach / 个人财务记录与消费建议工具

## Overview / 项目简介

Finance Tracker AI Coach is a single-user budgeting dashboard built with Next.js. It supports manual transactions, CSV import, category analytics, monthly budgets and optional AI spending notes when an Anthropic API key is configured.

Finance Tracker AI Coach 是一个单用户个人财务记录面板，使用 Next.js 构建。它支持手动记账、CSV 导入、分类统计、月度预算，以及在配置 Anthropic API key 后生成可选消费分析 notes。

## Why I Built It / 项目背景

I built this as a portfolio MVP to practise product-style frontend work with real state management, charts and CSV parsing. The project is local-first: transactions are stored in the browser, so it can be tested without a database.

我做这个项目是为了练习更接近产品形态的前端开发，包括状态管理、图表、CSV 解析和预算逻辑。项目保持 local-first，交易数据存在浏览器里，因此不需要数据库也能测试。

## Features / 功能

- Add, edit and delete transactions.
- Import demo or bank-style CSV data.
- Auto-categorise merchants with regex rules.
- Show monthly income, spending, net balance and budget usage.
- Display category breakdowns and daily spending trends.
- Support monthly and category budgets.
- Compare current-month and previous-month spending.
- Generate AI or heuristic spending notes.

- 新增、编辑和删除交易记录。
- 导入 demo 或常见银行流水风格的 CSV。
- 使用正则规则自动识别商户分类。
- 展示月收入、支出、净余额和预算使用情况。
- 展示分类占比和每日消费趋势。
- 支持月度预算和分类预算。
- 对比本月与上月消费变化。
- 可生成 AI 或规则型消费 notes。

## Tech Stack / 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- PapaParse
- Anthropic SDK
- Browser `localStorage`

## Current Status / 当前状态

Working local-first prototype. The dashboard can be tested with `sample-statement.csv`, and the coach panel falls back to deterministic notes when no API key is set.

当前是可运行的 local-first 原型。可以使用 `sample-statement.csv` 快速测试 dashboard；没有 API key 时，coach 面板会使用确定性的规则建议。

## How to Run / 本地运行

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

运行后打开 <http://localhost:3000>。快速测试时可以导入项目根目录的 `sample-statement.csv`。如果没有配置 `ANTHROPIC_API_KEY`，项目仍然可用，只是使用规则型消费建议。

## Screenshots / 项目截图

![Finance Tracker dashboard](docs/assets/finance-tracker-dashboard.png)

## Limitations / 当前限制

- Data is stored only in the current browser.
- No account system or cloud sync.
- CSV parsing supports common English headers, but not every bank format.
- Currency is display-only; there is no exchange-rate conversion.
- AI notes are budgeting reflections, not financial advice.

- 数据只保存在当前浏览器。
- 没有账号系统或云端同步。
- CSV 解析支持常见英文表头，但不能覆盖所有银行格式。
- 货币只是显示用途，没有汇率换算。
- AI notes 只是预算复盘，不是金融建议。

## Roadmap / 后续计划

- Add tests for CSV parsing, category rules and monthly analytics.
- Add export for cleaned transactions.
- Add more category rules and custom categories.
- Add database storage only if multi-device sync becomes a goal.
- Improve accessibility checks for charts and form controls.

- 为 CSV 解析、分类规则和月度统计补充测试。
- 增加清洗后交易数据导出。
- 增加更多分类规则和自定义分类。
- 只有在需要多设备同步时再考虑数据库。
- 改进图表和表单控件的可访问性检查。

## What I Learned / 我的收获

This project helped me practise building a dashboard from raw transaction data. The hardest part was making the CSV import and category logic tolerant enough for messy real-world inputs.

这个项目让我练习了如何从原始交易数据搭建可读的财务面板。最需要耐心的是 CSV 导入和自动分类，因为真实数据字段和商户名称经常不统一。

## License / 许可证

MIT. See [LICENSE](LICENSE).
