"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { State } from "@/app/login/actions";

export async function createWorkspace(_: State, f: FormData): Promise<State> {
  const name = String(f.get("name") ?? "").trim();
  if (!name) return { error: "Nama workspace wajib diisi" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_workspace", { ws_name: name });
  if (error) return { error: error.message };
  redirect("/");
}

export async function redeemInvite(_: State, f: FormData): Promise<State> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_invite", { invite_code: String(f.get("code") ?? "").trim() });
  if (error) return { error: error.message };
  redirect("/");
}
