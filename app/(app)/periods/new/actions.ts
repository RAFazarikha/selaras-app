"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { State } from "@/app/login/actions";

export async function createPeriod(_: State, f: FormData): Promise<State> {
  const name = String(f.get("name") ?? "").trim();
  const start = String(f.get("start_date") ?? "");
  const end = String(f.get("end_date") ?? "");
  const balance = Number(f.get("initial_balance"));
  const limit = Number(f.get("planned_expense_limit"));
  if (!name || !start || !end) return { error: "Nama dan tanggal wajib diisi" };
  if (end < start) return { error: "Tanggal akhir tidak boleh lebih awal dari tanggal mulai" };
  if (![balance, limit].every((n) => Number.isInteger(n) && n >= 0)) {
    return { error: "Saldo dan batas harus bilangan bulat >= 0" };
  }

  const supabase = await createClient();
  const { data: m } = await supabase.from("workspace_members").select("workspace_id").single();
  if (!m) return { error: "Belum punya workspace" };
  const { data, error } = await supabase
    .from("periods")
    .insert({
      workspace_id: m.workspace_id,
      name,
      start_date: start,
      end_date: end,
      initial_balance: balance,
      planned_expense_limit: limit,
      visibility: f.get("visibility") === "private" ? "private" : "shared",
    })
    .select("id")
    .single();
  if (error) {
    return { error: error.code === "23P01" ? "Rentang tanggal beririsan dengan periodemu yang lain" : error.message };
  }
  redirect(`/periods/${data.id}`);
}
