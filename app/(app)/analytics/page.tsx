import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BurndownChart } from "@/components/analytics-charts";
import {
  calculateSpreadsheet,
  type Period,
  type Tx,
} from "@/supabase/functions/_shared/budget";
import { formatDateShort, rupiah, todayJakarta } from "@/lib/format";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  BarChart2,
  PieChart,
  Fuel,
  Utensils,
  PiggyBank,
} from "lucide-react";

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
        <h1 className="text-xl font-bold text-foreground">Belum Ada Data Analitik</h1>
        <p className="text-xs text-muted-foreground">Buat periode anggaran terlebih dahulu untuk melihat grafik.</p>
        <Link
          href="/periods/new"
          className="inline-flex py-2 px-4 rounded-full bg-primary text-white text-xs font-semibold"
        >
          Buat Periode
        </Link>
      </div>
    );
  }

  const today = todayJakarta();
  const activePeriod =
    periods.find(
      (p) =>
        (p.owner_id === user?.id || p.visibility === "shared") &&
        p.start_date <= today &&
        today <= p.end_date,
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
      <header className="flex justify-between items-center py-2 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-primary">
            <TrendingUp aria-hidden="true" className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground">Analitik</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-surface-highest text-xs font-semibold text-primary">
          <span>{formatDateShort(activePeriod.start_date)} – {formatDateShort(activePeriod.end_date)}</span>
        </div>
      </header>

      {/* Hero Aggregate Header Strip */}
      <section className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs text-outline uppercase tracking-wider font-semibold">
            Ringkasan anggaran
          </span>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            Analitik
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-tertiary-fixed/20 border border-tertiary-fixed/40 px-2.5 py-1 rounded-full text-tertiary">
          <span className="w-2 h-2 rounded-full bg-tertiary-container" />
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
              <TrendingDown aria-hidden="true" className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Garis Saldo Kumulatif</h2>
            </div>
            <p className="text-xs text-muted-foreground">Sisa anggaran dari hari ke hari</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-outline">Sisa Aktual</span>
            <div className="text-sm font-extrabold text-primary tabular-nums">
              {rupiah(summary.currentActualBalance)}
            </div>
          </div>
        </div>

        {/* Burn-down Spline Visual */}
        <BurndownChart rows={rows} todayStr={today} />

        {/* Footnote Legend */}
        <div className="flex items-center justify-between pt-2.5 border-t border-surface-container text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-[#94a3b8] inline-block" />
            <span>Rencana Pagu</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-3 h-1 bg-primary rounded-full inline-block" />
            <span>Realisasi Aktual</span>
          </div>
          <div className="flex items-center gap-1 text-tertiary-container font-semibold">
            <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Terkendali</span>
          </div>
        </div>
      </section>

      {/* Bento Card 2: Rencana vs Aktual per Pekan */}
      <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <BarChart2 aria-hidden="true" className="w-4 h-4 text-secondary" />
              <h2 className="text-sm font-bold text-foreground">Rencana vs Aktual per Pekan</h2>
            </div>
            <p className="text-xs text-muted-foreground">Anggaran vs pengeluaran tiap pekan</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-primary">
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
                  <span className="font-medium text-foreground">
                    {w.name} ({w.dateRange})
                  </span>
                  <span className="tabular-nums font-semibold text-foreground">
                    {rupiah(w.actual)} / <span className="text-outline font-normal">{rupiah(w.budget)}</span>
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? "bg-gradient-to-r from-primary to-destructive"
                        : "bg-gradient-to-r from-primary to-secondary"
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
              <PieChart aria-hidden="true" className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Alokasi Pos & BBM Tracker</h2>
            </div>
            <p className="text-xs text-muted-foreground">Realisasi per pos distribusi anggaran</p>
          </div>
          <span className="text-xs text-outline font-medium">Bulan Berjalan</span>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2 pt-1 text-xs">
          {/* Pos BBM */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/60 border border-white/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                <Fuel aria-hidden="true" className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-foreground block">BBM Rutin</span>
                <span className="text-xs text-outline">Pagu: {rupiah(summary.totalRoutine)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold tabular-nums text-foreground block">
                {summary.routineDayCount}x @{rupiah(summary.routineAmountPerDay)}
              </span>
              <span className="text-xs text-tertiary-container font-medium">Pagu {rupiah(summary.totalRoutine)}</span>
            </div>
          </div>

          {/* Pos Kebutuhan Harian */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/60 border border-white/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-secondary">
                <Utensils aria-hidden="true" className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-foreground block">Kebutuhan Harian</span>
                <span className="text-xs text-outline">Pagu: {rupiah(summary.netForDaily)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold tabular-nums text-foreground block">
                {rupiah(summary.totalActualSpent)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Pagu {rupiah(summary.dailyBudget)}/hr
              </span>
            </div>
          </div>

          {/* Cadangan Pembulatan */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/60 border border-white/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-surface-highest flex items-center justify-center text-tertiary-container">
                <PiggyBank aria-hidden="true" className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-foreground block">Cadangan Pembulatan</span>
                <span className="text-xs text-outline">Akumulasi pembulatan Rp 100</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold tabular-nums text-tertiary-container block">
                {rupiah(summary.roundingReserve)}
              </span>
              <span className="text-xs text-outline font-medium">Otomatis</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
