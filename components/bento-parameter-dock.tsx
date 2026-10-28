"use client";

import { useState, useTransition } from "react";
import { formatDateIndo, rupiah } from "@/lib/format";
import { getDayName } from "@/supabase/functions/_shared/budget";
import { updatePeriodParameters } from "@/app/(app)/periods/[id]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Calendar, CalendarDays, PiggyBank, Fuel, Pencil, X } from "lucide-react";

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
        toast.success("Parameter periode berhasil diperbarui");
      }
    });
  };

  return (
    <section className="glass-tile rounded-3xl p-4 sm:p-5 space-y-3">
      {/* Title & Total Days */}
      <div className="flex items-center justify-between pb-2.5 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-primary shrink-0">
            <Calendar aria-hidden="true" className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-foreground tracking-tight">{period.name}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-surface-highest">
            {totalDays} Hari
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary hover:bg-muted size-11 -m-2 rounded-full flex items-center justify-center"
              title="Ubah parameter"
              aria-label={isEditing ? "Tutup form parameter" : "Ubah parameter"}
              aria-expanded={isEditing}
            >
              {isEditing ? <X aria-hidden="true" className="w-4 h-4" /> : <Pencil aria-hidden="true" className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Edit Form or Parameter Display */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div>
            <Label htmlFor="dock-balance" className="block text-xs font-semibold text-muted-foreground mb-1">
              Total Uang (Pagu)
            </Label>
            <div className="relative">
<span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">Rp</span>
<Input id="dock-balance"
                type="number"
                inputMode="numeric"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
               className="pl-10" />
</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dock-routine-amount" className="block text-xs font-semibold text-muted-foreground mb-1">
                Alokasi BBM Mingguan
              </Label>
              <div className="relative">
<span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">Rp</span>
<Input id="dock-routine-amount"
                  type="number"
                  inputMode="numeric"
                  value={routineAmount}
                  onChange={(e) => setRoutineAmount(e.target.value)}
                  required
                 className="pl-10" />
</div>
            </div>
            <div>
              <Label htmlFor="dock-routine-day" className="block text-xs font-semibold text-muted-foreground mb-1">
                Jadwal Hari BBM
              </Label>
              <select id="dock-routine-day"
                value={routineDay}
                onChange={(e) => setRoutineDay(e.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-white/95 px-3 text-base text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
            <p role="alert" className="text-xs font-medium text-destructive">
              {errorMsg}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              disabled={isPending}
              variant="brand" className="flex-1 rounded-2xl"
            >
              {isPending ? (
                <>
                  <Spinner className="w-3.5 h-3.5 text-white" />
                  <span>Menyimpan…</span>
                </>
              ) : (
                <span>Simpan Parameter</span>
              )}
            </Button>
            <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setIsEditing(false)}>Batal</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          {/* Total Uang */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-muted/60 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <PiggyBank aria-hidden="true" className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Total Uang</span>
            </div>
            <span className="text-xs font-bold tabular-nums text-foreground">
              {rupiah(period.initial_balance)}
            </span>
          </div>

          {/* Rentang Tanggal */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-muted/60 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="w-4 h-4 text-outline" />
              <span className="text-xs font-medium text-muted-foreground">Rentang Tanggal</span>
            </div>
            <span className="text-xs font-medium text-foreground">
              {formatDateIndo(period.start_date)} – {formatDateIndo(period.end_date)}
            </span>
          </div>

          {/* Alokasi Rutin BBM */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-muted/60 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <Fuel aria-hidden="true" className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">Alokasi Rutin (BBM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-accent text-accent-foreground">
                Setiap {getDayName(period.routine_day)}
              </span>
              <span className="text-xs font-bold tabular-nums text-foreground">
                {rupiah(period.routine_amount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
