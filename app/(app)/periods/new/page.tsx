"use client";
import { useActionState } from "react";
import { createPeriod } from "./actions";

const input = "w-full rounded-lg border border-zinc-300 px-3 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900";

export default function NewPeriodPage() {
  const [state, run, pending] = useActionState(createPeriod, {});
  return (
    <form action={run} className="space-y-3">
      <h1 className="text-xl font-bold">Periode baru</h1>
      <label className="block text-sm">Nama
        <input className={input} name="name" placeholder="mis. Gajian November" required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">Mulai
          <input className={input} name="start_date" type="date" required />
        </label>
        <label className="block text-sm">Akhir
          <input className={input} name="end_date" type="date" required />
        </label>
      </div>
      <label className="block text-sm">Saldo awal (Rp)
        <input className={input} name="initial_balance" type="number" inputMode="numeric" min={0} step={1} required />
      </label>
      <label className="block text-sm">Batas total pengeluaran (Rp)
        <input className={input} name="planned_expense_limit" type="number" inputMode="numeric" min={0} step={1} required />
      </label>
      <fieldset className="flex gap-4 text-sm">
        <legend className="mb-1">Visibilitas</legend>
        <label><input type="radio" name="visibility" value="shared" defaultChecked /> Dibagikan ke pasangan</label>
        <label><input type="radio" name="visibility" value="private" /> Pribadi</label>
      </fieldset>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button className="min-h-11 w-full rounded-lg bg-teal-700 px-3 font-medium text-white disabled:opacity-60" disabled={pending}>
        {pending ? "Menyimpan…" : "Buat periode"}
      </button>
    </form>
  );
}
