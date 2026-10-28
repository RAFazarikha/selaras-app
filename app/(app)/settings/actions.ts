"use server";
import { createClient } from "@/lib/supabase/server";
import type { State } from "@/app/login/actions";

export async function createInvite(): Promise<State> {
  const supabase = await createClient();
  const { data: m } = await supabase.from("workspace_members").select("workspace_id").single();
  if (!m) return { error: "Belum punya workspace" };
  const { data, error } = await supabase.rpc("create_invite", { ws: m.workspace_id });
  if (error) return { error: error.message };
  return { code: data };
}
