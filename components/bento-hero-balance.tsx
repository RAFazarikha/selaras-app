import { rupiah } from "@/lib/format";
import { type actualDailyBudget, type SpreadsheetSummary } from "@/supabase/functions/_shared/budget";

export function BentoHeroBalance({
  summary,
  actual,
  plannedQuota,
  title,
}: {
  summary: SpreadsheetSummary;
  actual: ReturnType<typeof actualDailyBudget>;
  plannedQuota: number;
  title: string;
}) {
  const pctSpent =
    summary.totalAmount > 0
      ? Math.min(100, Math.max(0, Math.round((summary.totalActualSpent / summary.totalAmount) * 100)))
      : 0;
  const pctLeft = 100 - pctSpent;
  const delta = actual.todayQuota - plannedQuota; // > 0 = lebih longgar dari rencana

  return (
    <section className="hero-glass rounded-3xl p-5 text-white space-y-4">
      <div>
        <p className="text-xs font-medium text-on-primary-container">{title}</p>
        <p className="mt-2 text-sm font-semibold text-on-primary-container">Jatah hari ini</p>
        <p className="text-4xl font-extrabold tracking-tight tabular-nums">{rupiah(actual.todayQuota)}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-on-primary-container tabular-nums">
          Rencana {rupiah(plannedQuota)}
          {delta !== 0 && ` · ${delta > 0 ? "longgar" : "lebih ketat"} ${rupiah(Math.abs(delta))}`}
          {" · "}sisa hari ini {rupiah(Math.max(0, actual.todayLeft))}
        </p>
        {actual.shortfall > 0 && (
          <p role="alert" className="mt-1 text-xs font-semibold text-white">
            Saldo kurang {rupiah(actual.shortfall)} untuk BBM yang tersisa
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/15 bg-white/15 p-3">
          <p className="text-xs text-on-primary-container">Saldo sekarang</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums">{rupiah(summary.currentActualBalance)}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/15 p-3">
          <p className="text-xs text-on-primary-container">Sudah dipakai</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums">{rupiah(summary.totalActualSpent)}</p>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-on-primary-container">
          <span>Terpakai {pctSpent}% dari total</span>
          <span className="font-semibold text-white tabular-nums">{pctLeft}% tersisa</span>
        </div>
        <div
          role="progressbar"
          aria-label="Anggaran terpakai"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pctSpent}
          className="h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/25 p-0.5"
        >
          <div className="h-full rounded-full bg-tertiary-fixed transition-all duration-300" style={{ width: `${pctSpent}%` }} />
        </div>
      </div>
    </section>
  );
}
