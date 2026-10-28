"use client";
import { useActionState, useEffect, useRef } from "react";
import { addPlannedItem, addTransaction } from "./actions";

const input = "w-full rounded-lg border border-zinc-300 px-3 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900";
const button = "min-h-11 w-full rounded-lg bg-teal-700 px-3 font-medium text-white disabled:opacity-60";

type Common = { periodId: string; min: string; max: string; defaultDate: string };

export function TransactionForm({ periodId, min, max, defaultDate, categories }: Common & { categories: string[] }) {
  const [state, run, pending] = useActionState(addTransaction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.info) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={run} className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="font-semibold">Tambah transaksi</h2>
      <input type="hidden" name="period_id" value={periodId} />
      <select className={input} name="type" defaultValue="expense" aria-label="Tipe">
        <option value="expense">Pengeluaran</option>
        <option value="income">Pemasukan</option>
      </select>
      <input className={input} name="amount" type="number" inputMode="numeric" min={1} step={1} placeholder="Nominal (Rp)" required />
      <input className={input} name="transaction_date" type="date" min={min} max={max} defaultValue={defaultDate} required />
      <input className={input} name="category" list="cats" placeholder="Kategori (opsional)" />
      <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
      <input className={input} name="note" placeholder="Catatan (opsional)" />
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.info && <p role="status" className="text-sm text-green-700">{state.info}</p>}
      <button className={button} disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>
    </form>
  );
}

export function PlannedItemForm({ periodId, min, max, defaultDate }: Common) {
  const [state, run, pending] = useActionState(addPlannedItem, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.info) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={run} className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="font-semibold">Tambah alokasi manual</h2>
      <input type="hidden" name="period_id" value={periodId} />
      <input className={input} name="planned_date" type="date" min={min} max={max} defaultValue={defaultDate} required />
      <input className={input} name="label" placeholder="Label (mis. Bensin)" required />
      <input className={input} name="amount" type="number" inputMode="numeric" min={1} step={1} placeholder="Nominal (Rp)" required />
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.info && <p role="status" className="text-sm text-green-700">{state.info}</p>}
      <button className={button} disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>
    </form>
  );
}
