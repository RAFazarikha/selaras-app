import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BurndownChart } from "@/components/analytics-charts";
import {
  calculateSpreadsheet,
  type Period,
  type Tx,
} from "@/supabase/functions/_shared/budget";
import { formatDateShort, rupiah, todayJakarta } from "@/lib/format";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: periods } = await supabase
    .from("periods")
    .select("*")
    .order("start_date", { ascending: false });

  if (!periods || periods.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 text-center space-y-4">
        <h1 className="text-xl font-bold text-[#0b1c30]">Belum Ada Data Analitik</h1>
        <p className="text-xs text-[#4a4455]">Buat periode anggaran terlebih dahulu untuk melihat grafik.</p>
        <Link
          href="/periods/new"
          className="inline-flex py-2 px-4 rounded-full bg-[#6d28d9] text-white text-xs font-semibold"
        >
          Buat Periode
        </Link>
      </div>
    );
  }

  const today = todayJakarta();
  const activePeriod =
    periods.find(
      (p) => p.owner_id === user?.id && p.start_date <= today && today <= p.end_date,
    ) ?? periods[0];

  const { data: txRows } = await supabase
    .from("transactions")
    .select("id, type, amount, note, transaction_date")
    .eq("period_id", activePeriod.id)
    .order("transaction_date", { ascending: true });

  const p: Period = {
    start: activePeriod.start_date,
    end: activePeriod.end_date,
    initialBalance: activePeriod.initial_balance,
    routineAmount: (activePeriod as Record<string, unknown>).routine_amount != null
      ? Number((activePeriod as Record<string, unknown>).routine_amount)
      : 50_000,
    routineDay: (activePeriod as Record<string, unknown>).routine_day != null
      ? Number((activePeriod as Record<string, unknown>).routine_day)
      : 1,
  };

  const txs: Tx[] = (txRows ?? []).map((t) => ({
    type: t.type as "expense" | "income",
    amount: t.amount,
    date: t.transaction_date,
  }));

  const { summary, rows } = calculateSpreadsheet(p, txs);

  // Group rows into 7-day calendar weeks for the Weekly Comparison Bento
  const weeks: { name: string; dateRange: string; budget: number; actual: number }[] = [];
  const chunkSize = 7;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const weekNum = Math.floor(i / chunkSize) + 1;
    const startStr = formatDateShort(chunk[0].date);
    const endStr = formatDateShort(chunk[chunk.length - 1].date);
    const weekBudget = chunk.reduce((acc, r) => acc + r.totalBudgetToday, 0);
    const weekActual = chunk.reduce((acc, r) => acc + (r.hasActual ? r.actualSpent : 0), 0);

    weeks.push({
      name: `Minggu ${weekNum}`,
      dateRange: `${startStr} – ${endStr}`,
      budget: weekBudget,
      actual: weekActual,
    });
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-2 space-y-4">
      {/* Header */}
      <header className="flex justify-between items-center py-2 border-b border-[#e5eeff]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#e9ddff] flex items-center justify-center text-[#6d28d9]">
            <span className="material-symbols-outlined text-[15px]">monitoring</span>
          </div>
          <span className="text-xs font-bold text-[#0b1c30]">Analitik & Visualisasi</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] border border-[#d3e4fe] text-[11px] font-semibold text-[#6d28d9]">
          <span>{formatDateShort(activePeriod.start_date)} – {formatDateShort(activePeriod.end_date)}</span>
        </div>
      </header>

      {/* Hero Aggregate Header Strip */}
      <section className="flex items-center justify-between px-1">
        <div>
          <span className="text-[10px] text-[#7b7486] uppercase tracking-wider font-semibold">
            Status Burn-Down Keuangan
          </span>
          <h1 className="text-xl font-extrabold text-[#0b1c30] tracking-tight">
            Performa Anggaran
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-[#4edea3]/20 border border-[#4edea3]/40 px-2.5 py-1 rounded-full text-[#004b31]">
          <span className="w-2 h-2 rounded-full bg-[#006544] animate-pulse" />
          <span className="text-xs font-bold tabular-nums">
            {summary.cumulativeSavings >= 0 ? "+" : ""}
            {rupiah(summary.cumulativeSavings)} {summary.cumulativeSavings >= 0 ? "Hemat" : "Defisit"}
          </span>
        </div>
      </section>

      {/* Bento Card 1: Garis Saldo Kumulatif */}
      <section className="glass-tile rounded-3xl p-4 sm:p-5 relative overflow-hidden space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#6d28d9] text-[18px]">
                trending_down
              </span>
              <h2 className="text-sm font-bold text-[#0b1c30]">Garis Saldo Kumulatif</h2>
            </div>
            <p className="text-[11px] text-[#4a4455]">Trajektori burn-down sisa pagu anggaran</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#7b7486]">Sisa Aktual</span>
            <div className="text-sm font-extrabold text-[#6d28d9] tabular-nums">
              {rupiah(summary.currentActualBalance)}
            </div>
          </div>
        </div>

        {/* Burn-down Spline Visual */}
        <BurndownChart rows={rows} todayStr={today} />

        {/* Footnote Legend */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#e5eeff] text-[11px]">
          <div className="flex items-center gap-1.5 text-[#4a4455]">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-[#94a3b8] inline-block" />
            <span>Rencana Pagu</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#4a4455]">
            <span className="w-3 h-1 bg-[#6d28d9] rounded-full inline-block" />
            <span>Realisasi Aktual</span>
          </div>
          <div className="flex items-center gap-1 text-[#006544] font-semibold">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Terkendali</span>
          </div>
        </div>
      </section>

      {/* Bento Card 2: Rencana vs Aktual per Pekan */}
      <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8455ef] text-[18px]">
                bar_chart
              </span>
              <h2 className="text-sm font-bold text-[#0b1c30]">Rencana vs Aktual per Pekan</h2>
            </div>
            <p className="text-[11px] text-[#4a4455]">Komparasi deviasi anggaran per pekan</p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#6d28d9]">
            {weeks.length} Pekan
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {weeks.map((w, idx) => {
            const pct = w.budget > 0 ? Math.min(100, Math.round((w.actual / w.budget) * 100)) : 0;
            const isOver = w.actual > w.budget;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#0b1c30]">
                    {w.name} ({w.dateRange})
                  </span>
                  <span className="tabular-nums font-semibold text-[#0b1c30]">
                    {rupiah(w.actual)} / <span className="text-[#7b7486] font-normal">{rupiah(w.budget)}</span>
                  </span>
                </div>
                <div className="w-full bg-[#eff4ff] rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? "bg-gradient-to-r from-[#6d28d9] to-[#ba1a1a]"
                        : "bg-gradient-to-r from-[#6d28d9] to-[#8455ef]"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bento Card 3: Alokasi & BBM Tracker */}
      <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#6d28d9] text-[18px]">
                pie_chart
              </span>
              <h2 className="text-sm font-bold text-[#0b1c30]">Alokasi Pos & BBM Tracker</h2>
            </div>
            <p className="text-[11px] text-[#4a4455]">Realisasi per pos distribusi anggaran</p>
          </div>
          <span className="text-[11px] text-[#7b7486] font-medium">Bulan Berjalan</span>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2 pt-1 text-xs">
          {/* Pos BBM */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#eff4ff]/60 border border-white/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ebddff] flex items-center justify-center text-[#6d28d9]">
                <span className="material-symbols-outlined text-[18px]">local_gas_station</span>
              </div>
              <div>
                <span className="font-semibold text-[#0b1c30] block">BBM Rutin</span>
                <span className="text-[10px] text-[#7b7486]">Pagu: {rupiah(summary.totalRoutine)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold tabular-nums text-[#0b1c30] block">
                {summary.routineDayCount}x @{rupiah(summary.routineAmountPerDay)}
              </span>
              <span className="text-[10px] text-[#006544] font-medium">Pagu {rupiah(summary.totalRoutine)}</span>
            </div>
          </div>

          {/* Pos Kebutuhan Harian */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#eff4ff]/60 border border-white/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e9ddff] flex items-center justify-center text-[#8455ef]">
                <span className="material-symbols-outlined text-[18px]">restaurant</span>
              </div>
              <div>
                <span className="font-semibold text-[#0b1c30] block">Kebutuhan Harian</span>
                <span className="text-[10px] text-[#7b7486]">Pagu: {rupiah(summary.netForDaily)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold tabular-nums text-[#0b1c30] block">
                {rupiah(summary.totalActualSpent)}
              </span>
              <span className="text-[10px] text-[#4a4455] font-medium">
                Pagu {rupiah(summary.dailyBudget)}/hr
              </span>
            </div>
          </div>

          {/* Cadangan Pembulatan */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#eff4ff]/60 border border-white/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#d3e4fe] flex items-center justify-center text-[#006544]">
                <span className="material-symbols-outlined text-[18px]">savings</span>
              </div>
              <div>
                <span className="font-semibold text-[#0b1c30] block">Cadangan Pembulatan</span>
                <span className="text-[10px] text-[#7b7486]">Akumulasi pembulatan Rp 100</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold tabular-nums text-[#006544] block">
                {rupiah(summary.roundingReserve)}
              </span>
              <span className="text-[10px] text-[#7b7486] font-medium">Otomatis</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
