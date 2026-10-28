"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPeriod } from "./actions";
import { Spinner } from "@/components/ui/spinner";

export default function NewPeriodPage() {
  const [state, run, pending] = useActionState(createPeriod, {});

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-white/80 border border-white/90 flex items-center justify-center text-[#4a4455] hover:text-[#6d28d9] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-[#0b1c30]">Buat Periode Baru</h1>
        <div className="w-9" />
      </div>

      <form action={run} className="glass-tile rounded-3xl p-5 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-[#4a4455] mb-1">
            Nama Periode
          </label>
          <input
            name="name"
            placeholder="mis. Budget 26 Okt – 30 Nov 2026"
            required
            className="w-full rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 text-sm text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:outline-none input-ambient-glow"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Tanggal Mulai
            </label>
            <input
              name="start_date"
              type="date"
              required
              className="w-full rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 text-sm text-[#0b1c30] focus:outline-none input-ambient-glow"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Tanggal Akhir
            </label>
            <input
              name="end_date"
              type="date"
              required
              className="w-full rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 text-sm text-[#0b1c30] focus:outline-none input-ambient-glow"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4a4455] mb-1">
            Total Uang (Pagu Periode)
          </label>
          <div className="relative flex items-center rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 transition-all input-ambient-glow">
            <span className="text-xs font-bold text-[#6d28d9] mr-2">Rp</span>
            <input
              name="initial_balance"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="1553232"
              required
              className="w-full bg-transparent border-0 p-0 text-sm font-semibold tabular-nums text-[#0b1c30] focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Alokasi BBM Mingguan
            </label>
            <div className="relative flex items-center rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 transition-all input-ambient-glow">
              <span className="text-xs font-bold text-[#8455ef] mr-2">Rp</span>
              <input
                name="routine_amount"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={50000}
                required
                className="w-full bg-transparent border-0 p-0 text-sm font-semibold tabular-nums text-[#0b1c30] focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Hari Rutin BBM
            </label>
            <select
              name="routine_day"
              defaultValue={1}
              className="w-full rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 text-sm text-[#0b1c30] focus:outline-none input-ambient-glow"
            >
              <option value={1}>Setiap Senin</option>
              <option value={2}>Setiap Selasa</option>
              <option value={3}>Setiap Rabu</option>
              <option value={4}>Setiap Kamis</option>
              <option value={5}>Setiap Jumat</option>
              <option value={6}>Setiap Sabtu</option>
              <option value={0}>Setiap Minggu</option>
            </select>
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-[#4a4455] mb-1.5">
            Visibilitas Periode
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-surface-container-low/70 border border-[#ccc3d7]/40 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="shared"
                defaultChecked
                className="text-[#6d28d9] focus:ring-[#6d28d9]"
              />
              <span className="font-medium text-[#0b1c30]">Dibagikan</span>
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-surface-container-low/70 border border-[#ccc3d7]/40 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                className="text-[#6d28d9] focus:ring-[#6d28d9]"
              />
              <span className="font-medium text-[#0b1c30]">Pribadi</span>
            </label>
          </div>
        </div>

        {state.error && (
          <p role="alert" className="text-xs font-medium text-[#ba1a1a]">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#6d28d9] to-[#8455ef] text-white text-sm font-semibold flex items-center justify-center gap-2 primary-btn-glow active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Spinner className="w-4 h-4 text-white" />
              <span>Menyimpan…</span>
            </>
          ) : (
            <>
              <span>Buat Periode Baru</span>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
