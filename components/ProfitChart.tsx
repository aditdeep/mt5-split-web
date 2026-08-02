"use client";

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { DailyProfitPoint } from "@/lib/types";
import { formatUsd } from "@/lib/format";

export default function ProfitChart({ data }: { data: DailyProfitPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a24b" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#c9a24b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => new Date(v).getDate().toString()}
            stroke="#8891a0"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#262f3b" }}
          />
          <YAxis
            stroke="#8891a0"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: "#141920",
              border: "1px solid #262f3b",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
            labelFormatter={(v) =>
              typeof v === "string" || typeof v === "number"
                ? new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
                : ""
            }
            formatter={(value) => [formatUsd(Number(value)), "Profit kumulatif"]}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#c9a24b"
            strokeWidth={2}
            fill="url(#profitFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
