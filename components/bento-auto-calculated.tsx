import { rupiah } from "@/lib/format";
import {
  getDayName,
  type SpreadsheetSummary,
} from "@/supabase/functions/_shared/budget";

export function BentoAutoCalculated({
  summary,
  routineDay,
  todayQuota,
}: {
  summary: SpreadsheetSummary;
  routineDay: number;
  todayQuota: number;
}) {
  return (
    <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#4a4455] flex items-center gap-1.5 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px] text-[#6d28d9]">
            calculate
          </span>
          <span>Kalkulasi Otomatis Sistem</span>
        </h3>
        <span className="text-[11px] font-medium text-[#7b7486]">Real-time</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Tile 1 */}
        <div className="p-2.5 rounded-2xl bg-[#eff4ff]/70 border border-white/90">
          <span className="text-[11px] font-medium text-[#4a4455] block">Jumlah Hari</span>
          <span className="text-xs font-bold tabular-nums text-[#0b1c30] mt-0.5 block">
            {summary.totalDays} Hari
          </span>
        </div>

        {/* Tile 2 */}
        <div className="p-2.5 rounded-2xl bg-[#eff4ff]/70 border border-white/90">
          <span className="text-[11px] font-medium text-[#4a4455] block">Frekuensi BBM</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold tabular-nums text-[#0b1c30]">
              {summary.routineDayCount}x {getDayName(routineDay)}
            </span>
            <span className="text-[10px] text-[#7b7486] font-medium">
              ({rupiah(summary.totalRoutine)})
            </span>
          </div>
        </div>

        {/* Tile 3 */}
        <div className="p-2.5 rounded-2xl bg-[#eff4ff]/70 border border-white/90">
          <span className="text-[11px] font-medium text-[#4a4455] block">Sisa Kebutuhan</span>
          <span className="text-xs font-bold tabular-nums text-[#6d28d9] mt-0.5 block">
            {rupiah(summary.netForDaily)}
          </span>
        </div>

        {/* Tile 4 */}
        <div className="p-2.5 rounded-2xl bg-[#eff4ff]/70 border border-white/90">
          <span className="text-[11px] font-medium text-[#4a4455] block">Budget Harian</span>
          <span className="text-xs font-bold tabular-nums text-[#0b1c30] mt-0.5 block">
            {rupiah(summary.dailyBudget)}
            <span className="text-[10px] text-[#7b7486] font-normal ml-0.5">/hr</span>
          </span>
        </div>

        {/* Tile 5 */}
        <div className="p-2.5 rounded-2xl bg-[#eff4ff]/70 border border-white/90">
          <span className="text-[11px] font-medium text-[#4a4455] block">Cadangan Pembulatan</span>
          <span className="text-xs font-bold tabular-nums text-[#7b7486] mt-0.5 block">
            {rupiah(summary.roundingReserve)}
          </span>
        </div>

        {/* Tile 6 */}
        <div className="p-2.5 rounded-2xl bg-[#e9ddff]/60 border border-[#d3bbff]/50">
          <span className="text-[11px] font-bold text-[#23005c] block">Jatah Hari Ini</span>
          <span className="text-xs font-extrabold tabular-nums text-[#6d28d9] mt-0.5 block">
            {rupiah(todayQuota)}
          </span>
        </div>
      </div>
    </section>
  );
}
