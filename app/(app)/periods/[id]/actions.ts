"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { State } from "@/app/login/actions";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const money = (f: FormData, k: string) => Number(f.get(k));
const okAmount = (n: number) => Number.isInteger(n) && n > 0;

/** Ambil id kategori milik user dari nama; buat bila belum ada. */
async function categoryId(supabase: Awaited<ReturnType<typeof createClient>>, name: string) {
  if (!name) return null;
  const { data, error } = await supabase
    .from("categories")
    .upsert({ name, archived: false }, { onConflict: "owner_id,name" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function addTransaction(_: State, f: FormData): Promise<State> {
  const periodId = str(f, "period_id");
  const type = str(f, "type");
  const amount = money(f, "amount");
  const date = str(f, "transaction_date");
  if (type !== "expense" && type !== "income") return { error: "Tipe tidak valid" };
  if (!okAmount(amount)) return { error: "Nominal harus bilangan bulat > 0" };
  if (!date) return { error: "Tanggal wajib diisi" };

  const supabase = await createClient();
  let category_id: string | null;
  try {
    category_id = await categoryId(supabase, str(f, "category"));
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase.from("transactions").insert({
    period_id: periodId,
    type,
    amount,
    transaction_date: date,
    note: str(f, "note") || null,
    category_id,
  });
  if (error) return { error: error.message };
  revalidatePath(`/periods/${periodId}`);
  return { info: "Tersimpan" };
}

export async function deleteTransaction(f: FormData): Promise<void> {
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", str(f, "id"));
  revalidatePath(`/periods/${str(f, "period_id")}`);
}

export async function addPlannedItem(_: State, f: FormData): Promise<State> {
  const periodId = str(f, "period_id");
  const amount = money(f, "amount");
  if (!okAmount(amount)) return { error: "Nominal harus bilangan bulat > 0" };
  if (!str(f, "planned_date") || !str(f, "label")) return { error: "Tanggal dan label wajib diisi" };
  const supabase = await createClient();
  const { error } = await supabase.from("planned_items").insert({
    period_id: periodId,
    planned_date: str(f, "planned_date"),
    amount,
    label: str(f, "label"),
  });
  if (error) return { error: error.message };
  revalidatePath(`/periods/${periodId}`);
  return { info: "Tersimpan" };
}

export async function deletePlannedItem(f: FormData): Promise<void> {
  const supabase = await createClient();
  await supabase.from("planned_items").delete().eq("id", str(f, "id"));
  revalidatePath(`/periods/${str(f, "period_id")}`);
}
