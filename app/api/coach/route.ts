import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  compareMonths,
  currentMonthKey,
  formatYm,
  monthStats,
  previousMonthKey,
} from "@/lib/analytics";
import type { Budget, Transaction } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  transactions: Transaction[];
  budget: Budget;
}

function buildPrompt(body: Body): string {
  const { transactions, budget } = body;
  const cur = currentMonthKey();
  const prev = previousMonthKey();
  const curStats = monthStats(transactions, cur);
  const prevStats = monthStats(transactions, prev);
  const deltas = compareMonths(transactions, cur, prev);

  const lines: string[] = [];
  lines.push(`Currency: ${budget.currency}`);
  lines.push(`Monthly budget: ${budget.monthlyTotal}`);
  lines.push(`Current month (${formatYm(cur)}): income=${curStats.income.toFixed(2)}, expense=${curStats.expense.toFixed(2)}, net=${curStats.net.toFixed(2)}`);
  lines.push(`Previous month (${formatYm(prev)}): income=${prevStats.income.toFixed(2)}, expense=${prevStats.expense.toFixed(2)}, net=${prevStats.net.toFixed(2)}`);
  lines.push("");
  lines.push("Spending by category, current vs previous month:");
  for (const d of deltas) {
    const cap = budget.perCategory[d.category as keyof typeof budget.perCategory];
    const capStr = cap ? `, budget=${cap}` : "";
    lines.push(`- ${d.category}: now ${d.current.toFixed(2)}, was ${d.previous.toFixed(2)} (${d.deltaPct >= 0 ? "+" : ""}${d.deltaPct.toFixed(0)}%${capStr})`);
  }
  lines.push("");
  lines.push("Top merchants this month:");
  for (const m of curStats.topMerchants) {
    lines.push(`- ${m.merchant}: ${m.total.toFixed(2)}`);
  }
  lines.push("");
  lines.push(
    "Return strict JSON only — no prose, no markdown, no code fences. Schema:"
  );
  lines.push(
    `{ "headline": string, "details": string[], "suggestions": [{ "action": string, "estimatedSaving": number }] }`
  );
  lines.push(
    "Rules: headline is one punchy sentence about the biggest change. details are 2-4 short observations comparing months and noting budget overruns. suggestions are 2-3 concrete actions with realistic monthly saving estimates in the user's currency (numeric, no symbol)."
  );
  return lines.join("\n");
}

function fallbackInsight(body: Body) {
  const cur = currentMonthKey();
  const prev = previousMonthKey();
  const deltas = compareMonths(body.transactions, cur, prev).filter(
    (d) => d.current > 0 || d.previous > 0
  );
  const top = deltas.find((d) => d.deltaAbs > 0) ?? deltas[0];
  const overspent = Object.entries(body.budget.perCategory)
    .map(([cat, cap]) => {
      const d = deltas.find((x) => x.category === cat);
      return d && cap && d.current > cap ? { cat, over: d.current - cap } : null;
    })
    .filter(Boolean) as { cat: string; over: number }[];

  const headline = top
    ? top.deltaAbs > 0
      ? `${top.category} is up ${Math.round(top.deltaPct)}% vs last month.`
      : `Spending is roughly flat vs last month.`
    : `No transactions yet this month.`;

  const details: string[] = [];
  for (const d of deltas.slice(0, 3)) {
    details.push(
      `${d.category}: ${body.budget.currency}${d.current.toFixed(2)} now vs ${body.budget.currency}${d.previous.toFixed(2)} last month (${d.deltaPct >= 0 ? "+" : ""}${Math.round(d.deltaPct)}%).`
    );
  }
  for (const o of overspent) {
    details.push(`Over budget on ${o.cat} by ${body.budget.currency}${o.over.toFixed(2)}.`);
  }

  const suggestions = deltas
    .filter((d) => d.deltaAbs > 0)
    .slice(0, 2)
    .map((d) => ({
      action: `Trim ${d.category} back toward last month's level.`,
      estimatedSaving: Math.round(d.deltaAbs),
    }));

  return { headline, details, suggestions };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      insight: fallbackInsight(body),
      source: "fallback",
      note: "Set ANTHROPIC_API_KEY in .env.local for AI-generated insights.",
    });
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  const prompt = buildPrompt(body);

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 800,
      system:
        "You are a concise personal finance coach. You analyze spending data and reply with strict JSON matching the requested schema. Be specific, blunt, and helpful. Do not invent transactions. Numbers must be plausible given the data.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ insight: fallbackInsight(body), source: "fallback", raw: text });
    }
    const insight = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return NextResponse.json({ insight, source: "ai", model });
  } catch (err) {
    return NextResponse.json({
      insight: fallbackInsight(body),
      source: "fallback",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
