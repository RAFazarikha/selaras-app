import { rupiah } from "@/lib/format";
import {
  getDayName,
  type SpreadsheetSummary,
} from "@/supabase/functions/_shared/budget";
import { Calculator } from "lucide-react";

export function BentoAutoCalculated({
  summary,
  routineDay,
}: {
  summary: SpreadsheetSummary;
  routineDay: number;
}) {
  return (
    <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Calculator aria-hidden="true" className="w-4 h-4 text-primary" />
          <span>Cara hitungnya</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Tile 1 */}
        <div className="p-2.5 rounded-2xl bg-muted/70 border border-white/90">
          <span className="text-xs font-medium text-muted-foreground block">Jumlah Hari</span>
          <span className="text-xs font-bold tabular-nums text-foreground mt-0.5 block">
            {summary.totalDays} Hari
          </span>
        </div>

        {/* Tile 2 */}
        <div className="p-2.5 rounded-2xl bg-muted/70 border border-white/90">
          <span className="text-xs font-medium text-muted-foreground block">Frekuensi BBM</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold tabular-nums text-foreground">
              {summary.routineDayCount}x {getDayName(routineDay)}
            </span>
            <span className="text-xs text-outline font-medium">
              ({rupiah(summary.totalRoutine)})
            </span>
          </div>
        </div>

        {/* Tile 3 */}
        <div className="p-2.5 rounded-2xl bg-muted/70 border border-white/90">
          <span className="text-xs font-medium text-muted-foreground block">Sisa Kebutuhan</span>
          <span className="text-xs font-bold tabular-nums text-primary mt-0.5 block">
            {rupiah(summary.netForDaily)}
          </span>
        </div>

        {/* Tile 4 */}
        <div className="p-2.5 rounded-2xl bg-muted/70 border border-white/90">
          <span className="text-xs font-medium text-muted-foreground block">Budget Harian</span>
          <span className="text-xs font-bold tabular-nums text-foreground mt-0.5 block">
            {rupiah(summary.dailyBudget)}
            <span className="text-xs text-outline font-normal ml-0.5">/hr</span>
          </span>
        </div>

        {/* Tile 5 */}
        <div className="col-span-2 p-2.5 rounded-2xl bg-muted/70 border border-white/90">
          <span className="text-xs font-medium text-muted-foreground block">Cadangan Pembulatan</span>
          <span className="text-xs font-bold tabular-nums text-outline mt-0.5 block">
            {rupiah(summary.roundingReserve)}
          </span>
        </div>

      </div>
    </section>
  );
}
