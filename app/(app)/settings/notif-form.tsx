"use client";

import { useActionState } from "react";
import { saveDiscord } from "./notif-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BellRing, Link2, RefreshCw } from "lucide-react";

export function DiscordForm({ hint }: { hint: string | null }) {
  const [state, run, pending] = useActionState(saveDiscord, {});
  const isConnected = !!hint;

  return (
    <section className="glass-tile rounded-3xl p-5 relative overflow-hidden space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-inner">
            <BellRing aria-hidden="true" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Webhook Notifikasi</h2>
            <p className="text-xs text-muted-foreground">Kirim catatan ke Discord</p>
          </div>
        </div>

        {/* Status Tag */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
            isConnected
              ? "bg-tertiary-container/10 border-tertiary-fixed/40 text-tertiary-container"
              : "bg-muted border-surface-highest text-outline"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-tertiary-container" : "bg-outline"
            }`}
          />
          <span>{isConnected ? "Terkoneksi" : "Belum Diatur"}</span>
        </div>
      </div>

      <form action={run} className="space-y-3.5">
        <div>
          <Label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="discord_webhook">
            Discord Webhook URL
          </Label>
          <div className="relative">
<Link2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
<Input
              id="discord_webhook"
              name="discord_webhook"
              type="url"
              placeholder={
                hint
                  ? `Tersimpan (…${hint}). Ketik untuk ganti, kosongkan untuk matikan`
                  : "https://discord.com/api/webhooks/..."
              }
              autoComplete="off"
             className="pl-9" />
</div>
        </div>

        {/* Info Toggles Preview */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-2xl border border-surface-high">
            <div className="pr-2">
              <span className="font-semibold text-foreground block">Rekap harian jam 21:00 WIB</span>
              <span className="text-xs text-muted-foreground">Ringkasan pengeluaran tiap malam</span>
            </div>
            <span className="text-xs font-bold text-tertiary-container bg-tertiary-container/10 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-2xl border border-surface-high">
            <div className="pr-2">
              <span className="font-semibold text-foreground block">Peringatan melebihi jatah</span>
              <span className="text-xs text-muted-foreground">Langsung kabari jika melewati jatah harian</span>
            </div>
            <span className="text-xs font-bold text-tertiary-container bg-tertiary-container/10 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
        </div>

        {state.error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {state.error}
          </p>
        )}
        {state.info && (
          <p role="status" className="text-xs font-medium text-tertiary-container">
            {state.info}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          variant="brand" className="w-full rounded-2xl"
        >
          {pending ? (
            <>
              <Spinner className="w-3.5 h-3.5 text-white" />
              <span>Menyimpan…</span>
            </>
          ) : (
            <>
              <RefreshCw aria-hidden="true" className="w-4 h-4" />
              <span>Simpan Perubahan Webhook</span>
            </>
          )}
        </Button>
      </form>
    </section>
  );
}
