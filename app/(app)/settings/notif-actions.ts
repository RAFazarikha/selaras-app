"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { State } from "@/app/login/actions";

const EVENTS = ["transaction", "threshold", "big", "digest", "reminder"] as const;
// Cegah SSRF: hanya host webhook Discord resmi.
const DISCORD = /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/;

export async function saveDiscord(_: State, f: FormData): Promise<State> {
  const url = String(f.get("discord_webhook") ?? "").trim();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Belum login" };

  if (!url) {
    const { error } = await supabase.from("notification_settings").delete().eq("user_id", user.id).eq("channel", "discord");
    if (error) return { error: error.message };
    revalidatePath("/settings");
    return { info: "Notifikasi Discord dimatikan" };
  }
  if (!DISCORD.test(url)) return { error: "URL webhook Discord tidak valid" };
  const { error } = await supabase.from("notification_settings").upsert(
    EVENTS.map((event) => ({ user_id: user.id, channel: "discord", destination: url, event, enabled: true })),
    { onConflict: "user_id,channel,event" },
  );
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { info: "Tersimpan" };
}
