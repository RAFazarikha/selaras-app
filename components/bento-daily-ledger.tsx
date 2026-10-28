"use client";

import { useState, useTransition } from "react";
import { type SpreadsheetDayRow, type SpreadsheetSummary } from "@/supabase/functions/_shared/budget";
import { formatDateIndo, rupiah } from "@/lib/format";
import { addTransaction, deleteTransaction } from "@/app/(app)/periods/[id]/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileSpreadsheet, Plus, Download, FileJson, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [showPast, setShowPast] = useState(false);
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

  const pastCount = rows.filter((r) => r.date < todayStr).length;
  const hasUpcoming = rows.some((r) => r.date >= todayStr);
  const visibleRows = showPast || !hasUpcoming ? rows : rows.filter((r) => r.date >= todayStr);

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
        toast.error(res.error);
      } else {
        setAmountInput("");
        setNoteInput("");
        toast.success("Pengeluaran berhasil dicatat");
      }
    });
  };

  const handleDelete = async (txId: string) => {
    const fd = new FormData();
    fd.set("id", txId);
    fd.set("period_id", periodId);
    startTransition(async () => {
      await deleteTransaction(fd);
      toast.success("Transaksi berhasil dihapus");
    });
  };

  return (
    <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Catatan Harian</h3>
          <p className="text-xs text-muted-foreground">Ketuk kolom Aktual untuk lihat atau tambah rincian</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
          <FileSpreadsheet aria-hidden="true" className="w-4 h-4" />
        </div>
      </div>


      {/* Ledger Entries List */}
      <div className="space-y-2.5">
        {pastCount > 0 && hasUpcoming && (
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            aria-expanded={showPast}
            className="min-h-11 w-full rounded-2xl border border-dashed border-outline-variant text-sm font-semibold text-primary transition-colors hover:bg-muted"
          >
            {showPast ? "Sembunyikan hari sebelumnya" : `Lihat ${pastCount} hari sebelumnya`}
          </button>
        )}
        {visibleRows.map((row) => {
          const isToday = row.date === todayStr;
          const isExpanded = selectedDate === row.date;
          const dayTxs = txByDate.get(row.date) ?? [];

          return (
            <div
              key={row.date}
              className={`rounded-2xl transition-all ${
                isToday
                  ? "bg-white border-2 border-primary/45 shadow-sm ring-2 ring-primary/10"
                  : row.hasActual
                  ? "bg-muted/60 border border-outline-variant/50"
                  : "bg-muted/30 border border-dashed border-outline-variant/60 opacity-80"
              }`}
            >
              {/* Row Main Content */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? "text-primary font-bold" : "text-foreground"
                      }`}
                    >
                      {formatDateIndo(row.date)} • {row.dayName}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed">
                        Hari Ini
                      </span>
                    )}
                    {row.isRoutineDay && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                        BBM {rupiah(row.routineBudget)}
                      </span>
                    )}
                  </div>

                  {/* Diff / Status Badge */}
                  <div>
                    {row.hasActual ? (
                      row.diff < 0 ? (
                        <span className="badge-positive text-xs px-2 py-0.5 rounded-full font-semibold">
                          +{rupiah(Math.abs(row.diff))} Hemat
                        </span>
                      ) : row.diff > 0 ? (
                        <span className="badge-negative text-xs px-2 py-0.5 rounded-full font-semibold">
                          −{rupiah(row.diff)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          Rp 0
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-outline font-medium">Proyeksi</span>
                    )}
                  </div>
                </div>

                {/* 3 Columns: Budget | Aktual | Sisa Saldo */}
                <div className="grid grid-cols-3 gap-2 items-center text-left pt-1.5 border-t border-surface-container">
                  <div>
                    <span className="text-xs text-outline block">Budget</span>
                    <span className="text-xs font-medium tabular-nums text-foreground">
                      {rupiah(row.totalBudgetToday)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-outline block">Aktual</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(isExpanded ? null : row.date)}
                      aria-expanded={isExpanded}
                      aria-controls={`ledger-drawer-${row.date}`}
                      className={`w-full min-h-9 py-1 px-2 rounded-xl text-xs font-bold tabular-nums transition-all flex items-center justify-center ${
                        row.hasActual
                          ? "editable-amber hover:opacity-90"
                          : isToday
                          ? "focused-amber"
                          : "bg-white/80 border border-outline-variant/60 text-outline hover:border-[#f59e0b]"
                      }`}
                    >
                      {row.hasActual ? rupiah(row.actualSpent) : isToday ? "+ Ketik" : "−"}
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-outline block">
                      {row.hasActual ? "Sisa Saldo" : "Estimasi"}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {rupiah(row.actualRemaining ?? row.plannedRemaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inline Expansion Drawer (Detail & Multi-Transaction Add) */}
              {isExpanded && (
                <div id={`ledger-drawer-${row.date}`} className="p-3 bg-white/95 border-t border-surface-container rounded-b-2xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Rincian Pengeluaran ({dayTxs.length} transaksi)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(null)}
                      className="min-h-9 px-3 py-1 rounded-lg text-xs text-outline hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      Tutup
                    </button>
                  </div>

                  {/* List of items on this day */}
                  {dayTxs.length > 0 ? (
                    <ul className="divide-y divide-surface-container text-xs">
                      {dayTxs.map((tx) => (
                        <li key={tx.id} className="py-1.5 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-foreground">
                              {tx.note || "Pengeluaran"}
                            </span>
                            <span className="block text-xs text-outline">
                              {formatDateIndo(tx.transaction_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-destructive tabular-nums">
                              {rupiah(tx.amount)}
                            </span>
                            {isOwner && (
                              <AlertDialog>
                                <AlertDialogTrigger
                                  type="button"
                                  disabled={isPending}
                                  className="text-destructive hover:bg-destructive/10 size-10 rounded-lg flex items-center justify-center transition-colors"
                                  aria-label="Hapus pengeluaran"
                                >
                                  <Trash2 aria-hidden="true" className="size-4" />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Transaksi &ldquo;{tx.note || "Pengeluaran"}&rdquo; sebesar {rupiah(tx.amount)} akan dihapus dari buku kas.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      variant="destructive"
                                      onClick={() => handleDelete(tx.id)}
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-outline italic">
                      Belum ada catatan pengeluaran di tanggal ini.
                    </p>
                  )}

                  {/* Inline Quick Add Form */}
                  {isOwner && (
                    <form onSubmit={handleQuickAdd} className="space-y-2 pt-2 border-t border-surface-container">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">Rp</span>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            placeholder="Nominal"
                            aria-label="Nominal pengeluaran"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            required
                            className="pl-10 text-base tabular-nums"
                          />
                        </div>
                        <Input
                          type="text"
                          placeholder="Catatan (opsional)"
                          aria-label="Catatan pengeluaran"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          className="text-base"
                        />
                      </div>

                      {formError && (
                        <p role="alert" className="text-xs text-destructive">
                          {formError}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={isPending}
                        variant="brand" className="w-full rounded-2xl"
                      >
                        {isPending ? (
                          <>
                            <Spinner className="w-3.5 h-3.5 text-white" />
                            <span>Menyimpan…</span>
                          </>
                        ) : (
                          <>
                            <Plus aria-hidden="true" className="w-4 h-4" />
                            <span>Tambah Pengeluaran</span>
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Summary from Stitch */}
      <div className="pt-3 border-t border-surface-container space-y-2.5">
        <div className="flex justify-between items-center bg-muted p-3 rounded-2xl">
          <div>
            <span className="text-xs uppercase tracking-wider text-outline block">
              Total Budget Alokasi
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {rupiah(summary.totalAllocatedBudget)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-outline block">
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
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-muted hover:bg-surface-container border border-surface-highest text-primary text-xs font-semibold transition-all active:scale-95"
          >
            <Download aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </a>
          <a
            href={`/export?period=${periodId}&format=json`}
            download
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-muted hover:bg-surface-container border border-surface-highest text-primary text-xs font-semibold transition-all active:scale-95"
          >
            <FileJson aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Ekspor JSON</span>
          </a>
        </div>
      </div>
    </section>
  );
}
