"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { rupiah } from "@/lib/format";

type Point = { day: string; label: string; rencana: number; aktual: number | null };

export function CumulativeChart({ data }: { data: Point[] }) {
  if (!data.length) return null;
  return (
    <div className="h-56 w-full" aria-label="Grafik kumulatif saldo rencana vs aktual">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip formatter={(v) => (v == null ? ["-", ""] : [rupiah(Number(v)), ""])} />
          <Legend />
          <Line type="monotone" dataKey="rencana" stroke="#0f766e" strokeWidth={2} dot={false} name="Rencana" />
          <Line type="monotone" dataKey="aktual" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} name="Aktual" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
