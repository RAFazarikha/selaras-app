import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { UsageBar } from "@/components/usage-bar";
import { PlanVsActualChart } from "@/components/plan-vs-actual-chart";
import { CumulativeChart } from "@/components/cumulative-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  adaptiveAllowance,
  balances,
  daysBetween,
  eachDay,
  usage,
  type Item,
  type Period,
  type Tx,
} from "@/supabase/functions/_shared/budget";
import { rupiah, todayJakarta } from "@/lib/format";
import { deletePlannedItem, deleteTransaction } from "./actions";
import { ExportLinks } from "./export-links";
import { PlannedItemForm, TransactionForm } from "./forms";

export default async function PeriodPage(props: PageProps<"/periods/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: pRow } = await supabase.from("periods").select("*").eq("id", id).maybeSingle();
  if (!pRow) notFound();

  const [{ data: txRows }, { data: itemRows }, { data: cats }] = await Promise.all([
    supabase.from("transactions").select("*").eq("period_id", id).order("transaction_date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("planned_items").select("*").eq("period_id", id).order("planned_date"),
    supabase.from("categories").select("id, name").eq("archived", false).order("name"),
  ]);

  const p: Period = {
    start: pRow.start_date,
    end: pRow.end_date,
    initialBalance: pRow.initial_balance,
    limit: pRow.planned_expense_limit,
  };
  const items: Item[] = (itemRows ?? []).map((i) => ({ date: i.planned_date, amount: i.amount }));
  const txs: Tx[] = (txRows ?? []).map((t) => ({ type: t.type as "expense" | "income", amount: t.amount, date: t.transaction_date }));

  const today = todayJakarta();
  const d = today < p.start ? p.start : today > p.end ? p.end : today;
  const daysLeft = today > p.end ? 0 : daysBetween(d, p.end);

  const u = usage(p, txs);
  const jatahHariIni = adaptiveAllowance(p, items, txs, d);
  const spentToday = txs.filter((t) => t.type === "expense" && t.date === d).reduce((s, x) => s + x.amount, 0);
  const b = balances(p, items, txs, d);

  // Data kumulatif per hari untuk grafik garis
  const days = eachDay(p.start, p.end);
  const chartData = days.map((day) => {
    const bal = balances(p, items, txs, day);
    const hasPassed = day <= d;
    return {
      day,
      label: day.slice(5),
      rencana: bal.planned,
      aktual: hasPassed ? bal.actual : null,
    };
  });

  const mine = pRow.owner_id === user?.id;
  const catName = new Map(cats?.map((c) => [c.id, c.name]));
  const range = { periodId: id, min: p.start, max: p.end, defaultDate: d };
  const del = "min-h-11 px-3 text-sm text-destructive hover:underline";

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold">{pRow.name}</h1>
          <Badge variant={pRow.visibility === "shared" ? "secondary" : "outline"}>
            {pRow.visibility === "shared" ? "Dibagikan" : "Pribadi"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {p.start} s/d {p.end} · {mine ? "Milikmu" : "Milik pasangan (baca saja)"}
        </p>
      </header>

      {/* Banner alert opsi A */}
      {u.alert === "limit" && (
        <Alert variant="destructive">
          <AlertTitle>Batas pengeluaran habis</AlertTitle>
          <AlertDescription>
            Total belanja sudah {rupiah(u.spent)} dari batas {rupiah(p.limit)}. Jatah hari tersisa adalah Rp0.
          </AlertDescription>
        </Alert>
      )}
      {u.alert === "warn" && (
        <Alert className="border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <AlertTitle>Peringatan pengeluaran</AlertTitle>
          <AlertDescription>
            Pemakaian sudah mencapai {Math.round(u.pct * 100)}% dari batas ({rupiah(u.spent)} / {rupiah(p.limit)}).
          </AlertDescription>
        </Alert>
      )}

      {/* Progress bar pemakaian */}
      <Card>
        <CardContent className="pt-6">
          <UsageBar spent={u.spent} limit={p.limit} pct={u.pct} level={u.level} />
        </CardContent>
      </Card>

      {/* Kartu ringkasan 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="p-4 pb-1"><CardTitle className="text-xs text-muted-foreground">Sisa kuota</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-lg font-bold tabular-nums ${u.remaining < 0 ? "text-rose-600" : ""}`}>
              {rupiah(u.remaining)}
            </div>
            <p className="text-[11px] text-muted-foreground">{daysLeft} hari tersisa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1"><CardTitle className="text-xs text-muted-foreground">Jatah hari ini</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold tabular-nums">{rupiah(jatahHariIni)}</div>
            <p className="text-[11px] text-muted-foreground">Hari ini belanja {rupiah(spentToday)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1"><CardTitle className="text-xs text-muted-foreground">Saldo rencana</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold tabular-nums">{rupiah(b.planned)}</div>
            <p className="text-[11px] text-muted-foreground">Target statis s/d hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1"><CardTitle className="text-xs text-muted-foreground">Saldo aktual</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold tabular-nums">{rupiah(b.actual)}</div>
            <p className={`text-[11px] font-medium ${b.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {b.diff >= 0 ? "+" : ""}{rupiah(b.diff)} ({b.diff >= 0 ? "lebih hemat" : "lebih boros"})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual chart: Batas vs Aktual + Saldo Kumulatif */}
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Rencana vs Aktual</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <PlanVsActualChart limit={p.limit} spent={u.spent} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Garis Saldo Kumulatif</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <CumulativeChart data={chartData} />
        </CardContent>
      </Card>

      {/* Input transaksi (hanya owner) */}
      {mine && <TransactionForm {...range} categories={cats?.map((c) => c.name) ?? []} />}

      {/* Daftar transaksi */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Riwayat transaksi ({txs.length})</h2>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {txRows?.map((t) => (
                <li key={t.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <span className="font-medium">{t.note ?? (t.type === "expense" ? "Pengeluaran" : "Pemasukan")}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t.transaction_date}{t.category_id && catName.get(t.category_id) ? ` · ${catName.get(t.category_id)}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`font-semibold tabular-nums ${t.type === "expense" ? "text-rose-600" : "text-emerald-600"}`}>
                      {t.type === "expense" ? "−" : "+"}{rupiah(t.amount)}
                    </span>
                    {mine && (
                      <form action={deleteTransaction}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="period_id" value={id} />
                        <button className={del} aria-label="Hapus transaksi">×</button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
              {!txRows?.length && <li className="p-4 text-center text-xs text-muted-foreground">Belum ada transaksi.</li>}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Alokasi manual */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Alokasi manual ({items.length})</h2>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {itemRows?.map((i) => (
                <li key={i.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <span className="font-medium">{i.label}</span>
                    <span className="block text-xs text-muted-foreground">{i.planned_date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="tabular-nums">{rupiah(i.amount)}</span>
                    {mine && (
                      <form action={deletePlannedItem}>
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="period_id" value={id} />
                        <button className={del} aria-label="Hapus alokasi">×</button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
              {!itemRows?.length && <li className="p-4 text-center text-xs text-muted-foreground">Belum ada alokasi manual.</li>}
            </ul>
          </CardContent>
        </Card>
        {mine && <PlannedItemForm {...range} />}
      </section>

      <ExportLinks periodId={id} />
      <RealtimeRefresh periodId={id} />
    </div>
  );
}
