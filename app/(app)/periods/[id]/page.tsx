import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { rupiah, todayJakarta } from "@/lib/format";
import { deletePlannedItem, deleteTransaction } from "./actions";
import { PlannedItemForm, TransactionForm } from "./forms";

export default async function PeriodPage(props: PageProps<"/periods/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: period } = await supabase.from("periods").select("*").eq("id", id).maybeSingle();
  if (!period) notFound();
  const [{ data: txs }, { data: items }, { data: cats }] = await Promise.all([
    supabase.from("transactions").select("*").eq("period_id", id).order("transaction_date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("planned_items").select("*").eq("period_id", id).order("planned_date"),
    supabase.from("categories").select("id, name").eq("archived", false).order("name"),
  ]);
  const mine = period.owner_id === user?.id;
  const today = todayJakarta();
  const defaultDate = today < period.start_date ? period.start_date : today > period.end_date ? period.end_date : today;
  const catName = new Map(cats?.map((c) => [c.id, c.name]));
  const range = { periodId: id, min: period.start_date, max: period.end_date, defaultDate };
  const del = "min-h-11 px-3 text-sm text-red-600";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">{period.name}</h1>
        <p className="text-sm text-zinc-500">
          {period.start_date} – {period.end_date} · {mine ? "Milikmu" : "Milik pasangan (baca saja)"}
        </p>
        <p className="text-sm">Batas {rupiah(period.planned_expense_limit)} · Saldo awal {rupiah(period.initial_balance)}</p>
      </header>

      {mine && <TransactionForm {...range} categories={cats?.map((c) => c.name) ?? []} />}

      <section className="space-y-2">
        <h2 className="font-semibold">Transaksi</h2>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {txs?.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2">
              <span>
                <span className="block">{t.note ?? (t.type === "expense" ? "Pengeluaran" : "Pemasukan")}</span>
                <span className="text-xs text-zinc-500">
                  {t.transaction_date}{t.category_id && catName.get(t.category_id) ? ` · ${catName.get(t.category_id)}` : ""}
                </span>
              </span>
              <span className="flex items-center">
                <span className={t.type === "expense" ? "text-red-600" : "text-green-700"}>
                  {t.type === "expense" ? "−" : "+"}{rupiah(t.amount)}
                </span>
                {mine && (
                  <form action={deleteTransaction}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="period_id" value={id} />
                    <button className={del} aria-label="Hapus transaksi">Hapus</button>
                  </form>
                )}
              </span>
            </li>
          ))}
          {!txs?.length && <li className="py-2 text-sm text-zinc-500">Belum ada transaksi.</li>}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Alokasi manual</h2>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items?.map((i) => (
            <li key={i.id} className="flex items-center justify-between py-2">
              <span>{i.label} <span className="text-xs text-zinc-500">{i.planned_date}</span></span>
              <span className="flex items-center">
                {rupiah(i.amount)}
                {mine && (
                  <form action={deletePlannedItem}>
                    <input type="hidden" name="id" value={i.id} />
                    <input type="hidden" name="period_id" value={id} />
                    <button className={del} aria-label="Hapus alokasi">Hapus</button>
                  </form>
                )}
              </span>
            </li>
          ))}
          {!items?.length && <li className="py-2 text-sm text-zinc-500">Belum ada alokasi.</li>}
        </ul>
        {mine && <PlannedItemForm {...range} />}
      </section>

      <RealtimeRefresh periodId={id} />
    </div>
  );
}
