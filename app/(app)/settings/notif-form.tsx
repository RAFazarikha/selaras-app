"use client";
import { useActionState } from "react";
import { saveDiscord } from "./notif-actions";

export function DiscordForm({ hint }: { hint: string | null }) {
  const [state, run, pending] = useActionState(saveDiscord, {});
  return (
    <form action={run} className="space-y-2">
      <label className="block text-sm">
        Webhook Discord
        <input
          name="discord_webhook"
          type="url"
          placeholder={hint ? `Tersimpan (…${hint}). Isi untuk mengganti, kosongkan untuk mematikan` : "https://discord.com/api/webhooks/…"}
          autoComplete="off"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.info && <p role="status" className="text-sm text-green-700">{state.info}</p>}
      <button className="min-h-11 rounded-lg bg-teal-700 px-4 text-white disabled:opacity-60" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}
