"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { rupiah, formatDateShort } from "@/lib/format";
import { type SpreadsheetDayRow } from "@/supabase/functions/_shared/budget";

export function BurndownChart({
  rows,
  todayStr,
}: {
  rows: SpreadsheetDayRow[];
  todayStr: string;
}) {
  // Format data points for burndown chart
  const data = rows.map((r) => {
    const isPastOrToday = r.date <= todayStr;
    return {
      date: r.date,
      label: formatDateShort(r.date),
      rencana: r.plannedRemaining,
      aktual: isPastOrToday && r.actualRemaining != null ? r.actualRemaining : null,
    };
  });

  return (
    <div className="w-full h-48 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="actualAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="70%" stopColor="#6d28d9" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
          />
          <Tooltip
            formatter={(value, name) => [
              value == null ? "-" : rupiah(Number(value)),
              name === "rencana" ? "Target Rencana" : "Saldo Aktual",
            ]}
            labelStyle={{ fontWeight: "bold", color: "#0b1c30" }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "1rem",
              border: "1px solid rgba(109, 40, 217, 0.15)",
              boxShadow: "0 8px 24px -4px rgba(109, 40, 217, 0.12)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="aktual"
            stroke="#6d28d9"
            strokeWidth={3}
            fill="url(#actualAreaGrad)"
            connectNulls={false}
            name="aktual"
          />
          <Line
            type="monotone"
            dataKey="rencana"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            name="rencana"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
