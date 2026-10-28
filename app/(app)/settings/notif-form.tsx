"use client";

import { useActionState } from "react";
import { saveDiscord } from "./notif-actions";
import { Spinner } from "@/components/ui/spinner";
import { BellRing, Link2, RefreshCw } from "lucide-react";

export function DiscordForm({ hint }: { hint: string | null }) {
  const [state, run, pending] = useActionState(saveDiscord, {});
  const isConnected = !!hint;

  return (
    <section className="glass-tile rounded-3xl p-5 relative overflow-hidden space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#ebddff] flex items-center justify-center text-[#6d28d9] shadow-inner">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0b1c30]">Webhook Notifikasi</h2>
            <p className="text-[11px] text-[#4a4455]">Integrasi Real-time Ledger ke Discord</p>
          </div>
        </div>

        {/* Status Tag */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
            isConnected
              ? "bg-[#006544]/10 border-[#4edea3]/40 text-[#006544]"
              : "bg-[#eff4ff] border-[#d3e4fe] text-[#7b7486]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-[#006544] animate-pulse" : "bg-[#7b7486]"
            }`}
          />
          <span>{isConnected ? "Terkoneksi" : "Belum Diatur"}</span>
        </div>
      </div>

      <form action={run} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5" htmlFor="discord_webhook">
            Discord Webhook URL
          </label>
          <div className="relative flex items-center rounded-2xl bg-white border border-[#ccc3d7]/60 px-3 py-2.5 input-ambient-glow transition-all">
            <Link2 className="w-4 h-4 text-[#7b7486] mr-2 shrink-0" />
            <input
              id="discord_webhook"
              name="discord_webhook"
              type="url"
              placeholder={
                hint
                  ? `Tersimpan (…${hint}). Ketik untuk ganti, kosongkan untuk matikan`
                  : "https://discord.com/api/webhooks/..."
              }
              autoComplete="off"
              className="w-full bg-transparent border-0 p-0 text-xs text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:outline-none truncate"
            />
          </div>
        </div>

        {/* Info Toggles Preview */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-white/80 rounded-2xl border border-white/80">
            <div className="pr-2">
              <span className="font-semibold text-[#0b1c30] block">Rekap harian jam 21:00 WIB</span>
              <span className="text-[10px] text-[#4a4455]">Laporan pergerakan kas & pembagian budget</span>
            </div>
            <span className="text-[11px] font-bold text-[#006544] bg-[#006544]/10 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white/80 rounded-2xl border border-white/80">
            <div className="pr-2">
              <span className="font-semibold text-[#0b1c30] block">Peringatan over-budget</span>
              <span className="text-[10px] text-[#4a4455]">Trigger instan ketika belanja melewati jatah harian</span>
            </div>
            <span className="text-[11px] font-bold text-[#006544] bg-[#006544]/10 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
        </div>

        {state.error && (
          <p role="alert" className="text-xs font-medium text-[#ba1a1a]">
            {state.error}
          </p>
        )}
        {state.info && (
          <p role="status" className="text-xs font-medium text-[#006544]">
            {state.info}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full purple-gradient-btn text-white py-2.5 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Spinner className="w-3.5 h-3.5 text-white" />
              <span>Menyimpan…</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Simpan Perubahan Webhook</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
