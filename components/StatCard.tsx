interface Props {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad" | "warn" | "neutral";
  progress?: number;
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  good: "text-emerald-400",
  bad: "text-red-400",
  warn: "text-amber-400",
  neutral: "text-white",
};

const BAR: Record<NonNullable<Props["tone"]>, string> = {
  good: "bg-emerald-400",
  bad: "bg-red-400",
  warn: "bg-amber-400",
  neutral: "bg-zinc-400",
};

export default function StatCard({ label, value, sub, tone = "neutral", progress }: Props) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${TONE[tone]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full ${BAR[tone]} transition-all`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
