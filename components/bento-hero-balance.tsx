import { rupiah } from "@/lib/format";
import { type SpreadsheetSummary } from "@/supabase/functions/_shared/budget";

export function BentoHeroBalance({ summary }: { summary: SpreadsheetSummary }) {
  const pctSpent =
    summary.totalAmount > 0
      ? Math.min(100, Math.max(0, Math.round((summary.totalActualSpent / summary.totalAmount) * 100)))
      : 0;
  const pctLeft = 100 - pctSpent;

  return (
    <section className="hero-glass rounded-3xl p-5 text-white relative overflow-hidden">
      {/* Glow ambient background bubble */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#8455ef]/40 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#dac5ff] opacity-90">
            Saldo Saat Ini (Aktual)
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] mr-1.5 animate-pulse" />
            Sinkron
          </span>
        </div>

        {/* Hero Balance Figure */}
        <div className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm tabular-nums">
          {rupiah(summary.currentActualBalance)}
        </div>

        {/* Badges Cluster */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/15">
            <div className="text-[10px] uppercase tracking-wider text-[#dac5ff] font-medium">
              Pengeluaran Aktual
            </div>
            <div className="text-sm font-bold text-white tabular-nums mt-0.5">
              {rupiah(summary.totalActualSpent)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/15">
            <div className="text-[10px] uppercase tracking-wider text-[#4edea3] font-medium">
              Selisih / Hemat
            </div>
            <div className="text-sm font-bold text-[#6ffbbe] tabular-nums mt-0.5">
              {summary.cumulativeSavings >= 0 ? "+" : ""}
              {rupiah(summary.cumulativeSavings)}
            </div>
          </div>
        </div>

        {/* Apple Style Quota Progress Bar */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-xs text-[#dac5ff] mb-1.5">
            <span>Terpakai {pctSpent}% dari Kuota Total</span>
            <span className="font-semibold text-white tabular-nums">{pctLeft}% Tersisa</span>
          </div>
          <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#6ffbbe] to-[#8455ef] rounded-full shadow-sm transition-all duration-300"
              style={{ width: `${pctSpent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
