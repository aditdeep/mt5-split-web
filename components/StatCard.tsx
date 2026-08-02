import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: "gold" | "profit" | "default";
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "default",
}: StatCardProps) {
  const accentClass =
    accent === "gold" ? "text-gold" : accent === "profit" ? "text-profit" : "text-text";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-wider text-text-dim">{label}</span>
        <Icon size={16} className="text-text-dim" strokeWidth={1.75} />
      </div>
      <div className={`mt-3 font-mono text-2xl font-semibold tabular ${accentClass}`}>
        {value}
      </div>
      {trend && (
        <div
          className={`mt-2 text-xs font-mono ${
            trend.positive ? "text-profit" : "text-loss"
          }`}
        >
          {trend.positive ? "▲" : "▼"} {trend.value}
        </div>
      )}
    </div>
  );
}
