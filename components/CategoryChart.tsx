"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@/lib/analytics";
import type { MonthStats } from "@/lib/analytics";
import type { Budget } from "@/lib/types";

interface Props {
  stats: MonthStats;
  budget: Budget;
}

const COLORS = [
  "#7c5cff",
  "#22d3ee",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#ec4899",
  "#84cc16",
  "#06b6d4",
  "#a855f7",
  "#fb923c",
  "#14b8a6",
  "#f43f5e",
];

export default function CategoryChart({ stats, budget }: Props) {
  const data = Object.entries(stats.byCategory)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-zinc-500">
        No expenses to chart for this month.
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#141821",
                border: "1px solid #262d3d",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => formatMoney(v, budget.currency)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 truncate text-zinc-300">{d.name}</span>
            <span className="text-zinc-400 tabular-nums">
              {formatMoney(d.value, budget.currency)}
            </span>
            <span className="w-10 text-right text-xs text-zinc-500 tabular-nums">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
