"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dailyTrend } from "@/lib/analytics";
import type { Transaction } from "@/lib/types";

interface Props {
  data: Transaction[];
  ym: string;
  currency: string;
}

export default function TrendChart({ data, ym, currency }: Props) {
  const trend = dailyTrend(data, ym);

  if (trend.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-zinc-500">
        No activity for this month.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={trend} margin={{ top: 5, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#262d3d" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#141821",
              border: "1px solid #262d3d",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number, name) => [`${currency}${v.toFixed(2)}`, name]}
            labelFormatter={(d) => `Day ${d}`}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            fill="url(#exp)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#22c55e"
            fill="url(#inc)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
