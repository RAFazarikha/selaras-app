"use client";

import { useState, useTransition } from "react";
import { type SpreadsheetDayRow, type SpreadsheetSummary } from "@/supabase/functions/_shared/budget";
import { formatDateIndo, rupiah } from "@/lib/format";
import { addTransaction, deleteTransaction } from "@/app/(app)/periods/[id]/actions";

type TxItem = {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  transaction_date: string;
};

export function BentoDailyLedger({
  periodId,
  isOwner,
  rows,
  summary,
  todayStr,
  transactions,
}: {
  periodId: string;
  isOwner: boolean;
  rows: SpreadsheetDayRow[];
  summary: SpreadsheetSummary;
  todayStr: string;
  transactions: TxItem[];
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Group transactions by date
  const txByDate = new Map<string, TxItem[]>();
  for (const t of transactions) {
    if (t.type === "expense") {
      const list = txByDate.get(t.transaction_date) ?? [];
      list.push(t);
      txByDate.set(t.transaction_date, list);
    }
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    const num = Number(amountInput);
    if (!Number.isInteger(num) || num <= 0) {
      setFormError("Nominal harus bilangan bulat > 0");
      return;
    }
    setFormError(null);

    const fd = new FormData();
    fd.set("period_id", periodId);
    fd.set("type", "expense");
    fd.set("amount", String(num));
    fd.set("transaction_date", selectedDate);
    fd.set("note", noteInput);

    startTransition(async () => {
      const res = await addTransaction({}, fd);
      if (res.error) {
        setFormError(res.error);
      } else {
        setAmountInput("");
        setNoteInput("");
      }
    });
  };

  const handleDelete = async (txId: string) => {
    const fd = new FormData();
    fd.set("id", txId);
    fd.set("period_id", periodId);
    startTransition(async () => {
      await deleteTransaction(fd);
    });
  };

  return (
    <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#0b1c30]">Buku Kas Harian</h3>
          <p className="text-xs text-[#4a4455]">Pencatatan realisasi belanja vs kuota</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d28d9]">
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
        </div>
      </div>

      {/* Instructional Banner from Stitch */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-100/60 to-amber-50/70 border border-violet-200/50 flex items-start gap-2">
        <span className="material-symbols-outlined text-[18px] text-[#6d28d9] mt-0.5 shrink-0">
          auto_awesome
        </span>
        <p className="text-xs text-[#0b1c30] leading-relaxed">
          Klik kotak <strong>Aktual</strong> pada tanggal untuk mencatat atau melihat rincian pengeluaran harian.
        </p>
      </div>

      {/* Ledger Entries List */}
      <div className="space-y-2.5">
        {rows.map((row) => {
          const isToday = row.date === todayStr;
          const isExpanded = selectedDate === row.date;
          const dayTxs = txByDate.get(row.date) ?? [];

          return (
            <div
              key={row.date}
              className={`rounded-2xl transition-all ${
                isToday
                  ? "bg-white border-2 border-[#6d28d9]/45 shadow-sm ring-2 ring-[#6d28d9]/10"
                  : row.hasActual
                  ? "bg-[#eff4ff]/60 border border-[#ccc3d7]/50"
                  : "bg-[#eff4ff]/30 border border-dashed border-[#ccc3d7]/60 opacity-80"
              }`}
            >
              {/* Row Main Content */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? "text-[#6d28d9] font-bold" : "text-[#0b1c30]"
                      }`}
                    >
                      {formatDateIndo(row.date)} • {row.dayName}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ebddff] text-[#250059]">
                        Hari Ini
                      </span>
                    )}
                    {row.isRoutineDay && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e9ddff] text-[#23005c]">
                        BBM {rupiah(row.routineBudget)}
                      </span>
                    )}
                  </div>

                  {/* Diff / Status Badge */}
                  <div>
                    {row.hasActual ? (
                      row.diff < 0 ? (
                        <span className="badge-positive text-[11px] px-2 py-0.5 rounded-full font-semibold">
                          +{rupiah(Math.abs(row.diff))} Hemat
                        </span>
                      ) : row.diff > 0 ? (
                        <span className="badge-negative text-[11px] px-2 py-0.5 rounded-full font-semibold">
                          −{rupiah(row.diff)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#eff4ff] text-[#4a4455]">
                          Rp 0
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-[#7b7486] font-medium">Proyeksi</span>
                    )}
                  </div>
                </div>

                {/* 3 Columns: Budget | Aktual | Sisa Saldo */}
                <div className="grid grid-cols-3 gap-2 items-center text-left pt-1.5 border-t border-[#e5eeff]">
                  <div>
                    <span className="text-[10px] text-[#7b7486] block">Budget</span>
                    <span className="text-xs font-medium tabular-nums text-[#0b1c30]">
                      {rupiah(row.totalBudgetToday)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-[#7b7486] block">Aktual</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(isExpanded ? null : row.date)}
                      className={`w-full py-0.5 px-1.5 rounded-xl text-xs font-bold tabular-nums transition-all ${
                        row.hasActual
                          ? "editable-amber hover:opacity-90"
                          : isToday
                          ? "focused-amber"
                          : "bg-white/80 border border-[#ccc3d7]/60 text-[#7b7486] hover:border-[#f59e0b]"
                      }`}
                    >
                      {row.hasActual ? rupiah(row.actualSpent) : isToday ? "+ Ketik" : "−"}
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#7b7486] block">
                      {row.hasActual ? "Sisa Saldo" : "Estimasi"}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-[#0b1c30]">
                      {rupiah(row.actualRemaining ?? row.plannedRemaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inline Expansion Drawer (Detail & Multi-Transaction Add) */}
              {isExpanded && (
                <div className="p-3 bg-white/95 border-t border-[#e5eeff] rounded-b-2xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0b1c30]">
                      Rincian Pengeluaran ({dayTxs.length} transaksi)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(null)}
                      className="text-xs text-[#7b7486] hover:text-[#0b1c30]"
                    >
                      Tutup
                    </button>
                  </div>

                  {/* List of items on this day */}
                  {dayTxs.length > 0 ? (
                    <ul className="divide-y divide-[#e5eeff] text-xs">
                      {dayTxs.map((tx) => (
                        <li key={tx.id} className="py-1.5 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-[#0b1c30]">
                              {tx.note || "Pengeluaran"}
                            </span>
                            <span className="block text-[10px] text-[#7b7486]">
                              {formatDateIndo(tx.transaction_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#ba1a1a] tabular-nums">
                              {rupiah(tx.amount)}
                            </span>
                            {isOwner && (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleDelete(tx.id)}
                                className="text-[#ba1a1a] hover:opacity-75 p-1"
                                aria-label="Hapus item"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-[#7b7486] italic">
                      Belum ada catatan pengeluaran di tanggal ini.
                    </p>
                  )}

                  {/* Inline Quick Add Form */}
                  {isOwner && (
                    <form onSubmit={handleQuickAdd} className="space-y-2 pt-2 border-t border-[#e5eeff]">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative flex items-center rounded-xl bg-white border border-[#ccc3d7]/70 px-2.5 py-1.5 input-ambient-glow">
                          <span className="text-[11px] font-bold text-[#6d28d9] mr-1">Rp</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            placeholder="Nominal"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            className="w-full bg-transparent border-0 p-0 text-xs font-semibold tabular-nums text-[#0b1c30] focus:outline-none"
                            required
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Catatan (opsional)"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          className="rounded-xl bg-white border border-[#ccc3d7]/70 px-2.5 py-1.5 text-xs text-[#0b1c30] focus:outline-none input-ambient-glow"
                        />
                      </div>

                      {formError && (
                        <p role="alert" className="text-[11px] text-[#ba1a1a]">
                          {formError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#8455ef] text-white text-xs font-semibold flex items-center justify-center gap-1.5 primary-btn-glow active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>{isPending ? "Menyimpan…" : "Tambah Pengeluaran"}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Summary from Stitch */}
      <div className="pt-3 border-t border-[#e5eeff] space-y-2.5">
        <div className="flex justify-between items-center bg-[#eff4ff] p-3 rounded-2xl">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#7b7486] block">
              Total Budget Alokasi
            </span>
            <span className="text-sm font-semibold tabular-nums text-[#0b1c30]">
              {rupiah(summary.totalAllocatedBudget)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#7b7486] block">
              Hemat Kumulatif
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                summary.cumulativeSavings >= 0 ? "badge-positive" : "badge-negative"
              }`}
            >
              {summary.cumulativeSavings >= 0 ? "+" : ""}
              {rupiah(summary.cumulativeSavings)}
            </span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <a
            href={`/export?period=${periodId}&format=csv`}
            download
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#eff4ff] hover:bg-[#e5eeff] border border-[#d3e4fe] text-[#6d28d9] text-xs font-semibold transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Ekspor CSV</span>
          </a>
          <a
            href={`/export?period=${periodId}&format=json`}
            download
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#eff4ff] hover:bg-[#e5eeff] border border-[#d3e4fe] text-[#6d28d9] text-xs font-semibold transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            <span>Ekspor JSON</span>
          </a>
        </div>
      </div>
    </section>
  );
}
