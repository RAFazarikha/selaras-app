"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { rupiah } from "@/lib/format";

export function PlanVsActualChart({ limit, spent }: { limit: number; spent: number }) {
  const data = [
    { name: "Rencana", nominal: limit },
    { name: "Aktual", nominal: spent },
  ];
  return (
    <div className="h-44 w-full" aria-label="Grafik batas rencana dibanding pengeluaran aktual">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip formatter={(value) => [rupiah(Number(value ?? 0)), "Nominal"]} labelStyle={{ color: "#333" }} />
          <Bar dataKey="nominal" radius={[6, 6, 0, 0]}>
            <Cell fill="#0f766e" />
            <Cell fill={spent > limit ? "#e11d48" : "#f59e0b"} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
