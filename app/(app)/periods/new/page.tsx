"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPeriod } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, PlusCircle } from "lucide-react";

export default function NewPeriodPage() {
  const [state, run, pending] = useActionState(createPeriod, {});

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="size-11 rounded-full bg-white/80 border border-white/90 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
          aria-label="Kembali"
        >
          <ArrowLeft aria-hidden="true" className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Buat Periode Baru</h1>
        <div className="w-11" />
      </div>

      <form action={run} className="glass-tile rounded-3xl p-5 space-y-4 shadow-sm">
        <div>
          <Label htmlFor="f-name" className="block text-xs font-semibold text-muted-foreground mb-1">
            Nama Periode
          </Label>
          <Input id="f-name"
            name="name"
            placeholder="mis. Budget 26 Okt – 30 Nov 2026"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="f-start_date" className="block text-xs font-semibold text-muted-foreground mb-1">
              Tanggal Mulai
            </Label>
            <Input id="f-start_date"
              name="start_date"
              type="date"
              required
            />
          </div>
          <div>
            <Label htmlFor="f-end_date" className="block text-xs font-semibold text-muted-foreground mb-1">
              Tanggal Akhir
            </Label>
            <Input id="f-end_date"
              name="end_date"
              type="date"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="f-initial_balance" className="block text-xs font-semibold text-muted-foreground mb-1">
            Total Uang (Pagu Periode)
          </Label>
          <div className="relative">
<span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">Rp</span>
<Input id="f-initial_balance"
              name="initial_balance"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="1553232"
              required
             className="pl-10" />
</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="f-routine_amount" className="block text-xs font-semibold text-muted-foreground mb-1">
              Alokasi BBM Mingguan
            </Label>
            <div className="relative">
<span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">Rp</span>
<Input id="f-routine_amount"
                name="routine_amount"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={50000}
                required
               className="pl-10" />
</div>
          </div>
          <div>
            <Label htmlFor="f-routine_day" className="block text-xs font-semibold text-muted-foreground mb-1">
              Hari Rutin BBM
            </Label>
            <select id="f-routine_day"
              name="routine_day"
              defaultValue={1}
              className="h-11 w-full rounded-2xl border border-input bg-white/95 px-3 text-base text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
          <span className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Visibilitas Periode
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex min-h-11 items-center gap-2 p-2.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/40 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="shared"
                defaultChecked
                className="text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Dibagikan</span>
            </label>
            <label className="flex min-h-11 items-center gap-2 p-2.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/40 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                className="text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Pribadi</span>
            </label>
          </div>
        </div>

        {state.error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          variant="brand" className="w-full rounded-2xl"
        >
          {pending ? (
            <>
              <Spinner className="w-4 h-4 text-white" />
              <span>Menyimpan…</span>
            </>
          ) : (
            <>
              <span>Buat Periode Baru</span>
              <PlusCircle aria-hidden="true" className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
