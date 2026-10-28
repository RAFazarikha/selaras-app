"use client";

import { useState, useTransition } from "react";
import { formatDateIndo, rupiah } from "@/lib/format";
import { getDayName } from "@/supabase/functions/_shared/budget";
import { updatePeriodParameters } from "@/app/(app)/periods/[id]/actions";
import { Spinner } from "@/components/ui/spinner";

export function BentoParameterDock({
  period,
  isOwner,
  totalDays,
}: {
  period: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    initial_balance: number;
    routine_amount: number;
    routine_day: number;
  };
  isOwner: boolean;
  totalDays: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState(String(period.initial_balance));
  const [routineAmount, setRoutineAmount] = useState(String(period.routine_amount));
  const [routineDay, setRoutineDay] = useState(String(period.routine_day));
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("period_id", period.id);
    fd.set("initial_balance", balance);
    fd.set("routine_amount", routineAmount);
    fd.set("routine_day", routineDay);

    startTransition(async () => {
      const res = await updatePeriodParameters({}, fd);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setIsEditing(false);
        setErrorMsg(null);
      }
    });
  };

  return (
    <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-3">
      {/* Title & Total Days */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#e5eeff]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#e9ddff] flex items-center justify-center text-[#6d28d9] shrink-0">
            <span className="material-symbols-outlined text-[15px]">calendar_month</span>
          </div>
          <h2 className="text-xs font-bold text-[#0b1c30] tracking-tight">{period.name}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff4ff] text-[#4a4455] border border-[#d3e4fe]">
            {totalDays} Hari
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[#6d28d9] hover:opacity-80 p-0.5"
              title="Ubah parameter"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isEditing ? "close" : "edit"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Form or Parameter Display */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-semibold text-[#4a4455] mb-1">
              Total Uang (Pagu)
            </label>
            <div className="relative flex items-center rounded-xl bg-white border border-[#ccc3d7] px-2.5 py-1.5 input-ambient-glow">
              <span className="text-xs font-bold text-[#6d28d9] mr-1.5">Rp</span>
              <input
                type="number"
                inputMode="numeric"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-xs font-bold tabular-nums text-[#0b1c30] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#4a4455] mb-1">
                Alokasi BBM Mingguan
              </label>
              <div className="relative flex items-center rounded-xl bg-white border border-[#ccc3d7] px-2.5 py-1.5 input-ambient-glow">
                <span className="text-xs font-bold text-[#8455ef] mr-1.5">Rp</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={routineAmount}
                  onChange={(e) => setRoutineAmount(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-bold tabular-nums text-[#0b1c30] focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4a4455] mb-1">
                Jadwal Hari BBM
              </label>
              <select
                value={routineDay}
                onChange={(e) => setRoutineDay(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#ccc3d7] px-2 py-1.5 text-xs text-[#0b1c30] focus:outline-none input-ambient-glow"
              >
                <option value="1">Setiap Senin</option>
                <option value="2">Setiap Selasa</option>
                <option value="3">Setiap Rabu</option>
                <option value="4">Setiap Kamis</option>
                <option value="5">Setiap Jumat</option>
                <option value="6">Setiap Sabtu</option>
                <option value="0">Setiap Minggu</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <p role="alert" className="text-xs font-medium text-[#ba1a1a]">
              {errorMsg}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#8455ef] text-white text-xs font-semibold flex items-center justify-center gap-1.5 primary-btn-glow active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Spinner className="w-3.5 h-3.5 text-white" />
                  <span>Menyimpan…</span>
                </>
              ) : (
                <span>Simpan Parameter</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="py-1.5 px-3 rounded-xl bg-[#eff4ff] text-[#4a4455] text-xs font-medium hover:bg-[#e5eeff]"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          {/* Total Uang */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#eff4ff]/60 hover:bg-[#eff4ff] transition-colors">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6d28d9]">
                savings
              </span>
              <span className="text-xs font-medium text-[#4a4455]">Total Uang</span>
            </div>
            <span className="text-xs font-bold tabular-nums text-[#0b1c30]">
              {rupiah(period.initial_balance)}
            </span>
          </div>

          {/* Rentang Tanggal */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#eff4ff]/60 hover:bg-[#eff4ff] transition-colors">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#7b7486]">
                date_range
              </span>
              <span className="text-xs font-medium text-[#4a4455]">Rentang Tanggal</span>
            </div>
            <span className="text-[11px] font-medium text-[#0b1c30]">
              {formatDateIndo(period.start_date)} – {formatDateIndo(period.end_date)}
            </span>
          </div>

          {/* Alokasi Rutin BBM */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#eff4ff]/60 hover:bg-[#eff4ff] transition-colors">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#8455ef]">
                local_gas_station
              </span>
              <span className="text-xs font-medium text-[#4a4455]">Alokasi Rutin (BBM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#e9ddff] text-[#23005c]">
                Setiap {getDayName(period.routine_day)}
              </span>
              <span className="text-xs font-bold tabular-nums text-[#0b1c30]">
                {rupiah(period.routine_amount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
