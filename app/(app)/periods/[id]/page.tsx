import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { BentoParameterDock } from "@/components/bento-parameter-dock";
import { BentoHeroBalance } from "@/components/bento-hero-balance";
import { BentoAutoCalculated } from "@/components/bento-auto-calculated";
import { BentoDailyLedger } from "@/components/bento-daily-ledger";
import {
  calculateSpreadsheet,
  type Period,
  type Tx,
} from "@/supabase/functions/_shared/budget";
import { todayJakarta } from "@/lib/format";
import { Plus } from "lucide-react";

export default async function PeriodPage(props: PageProps<"/periods/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: pRow } = await supabase
    .from("periods")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!pRow) notFound();

  const { data: txRows } = await supabase
    .from("transactions")
    .select("id, type, amount, note, transaction_date")
    .eq("period_id", id)
    .order("transaction_date", { ascending: true })
    .order("created_at", { ascending: true });

  const p: Period = {
    start: pRow.start_date,
    end: pRow.end_date,
    initialBalance: pRow.initial_balance,
    routineAmount: (pRow as Record<string, unknown>).routine_amount != null
      ? Number((pRow as Record<string, unknown>).routine_amount)
      : 50_000,
    routineDay: (pRow as Record<string, unknown>).routine_day != null
      ? Number((pRow as Record<string, unknown>).routine_day)
      : 1,
  };

  const txs: Tx[] = (txRows ?? []).map((t) => ({
    type: t.type as "expense" | "income",
    amount: t.amount,
    date: t.transaction_date,
  }));

  const { summary, rows } = calculateSpreadsheet(p, txs);

  const today = todayJakarta();
  const todayRow = rows.find((r) => r.date === today);
  const todayQuota = todayRow ? todayRow.totalBudgetToday : summary.dailyBudget;

  const isOwner = pRow.owner_id === user?.id;

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-2 space-y-4">
      {/* Top App Bar from Stitch */}
      <header className="flex justify-between items-center py-2 border-b border-[#e5eeff]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full ring-2 ring-white/90 overflow-hidden shadow-sm flex items-center justify-center bg-gradient-to-br from-[#6d28d9] to-[#8455ef] text-white font-bold text-sm shrink-0">
            {user?.user_metadata?.name ? user.user_metadata.name[0]?.toUpperCase() : "S"}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-[#0b1c30] tracking-tight">Selaras</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ebddff] text-[#250059] tracking-wide">
              {pRow.visibility === "shared" ? "Dibagikan" : "Pribadi"}
            </span>
          </div>
        </div>

        <Link
          href="/periods/new"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#4a4455] hover:bg-[#e5eeff] transition-all active:scale-95"
          title="Buat periode baru"
          aria-label="Buat periode baru"
        >
          <Plus className="w-5 h-5 text-[#4a4455]" />
        </Link>
      </header>

      {/* Bento 1: Setup & Parameter Dock */}
      <BentoParameterDock
        period={{
          id: pRow.id,
          name: pRow.name,
          start_date: pRow.start_date,
          end_date: pRow.end_date,
          initial_balance: pRow.initial_balance,
          routine_amount: p.routineAmount!,
          routine_day: p.routineDay!,
        }}
        isOwner={isOwner}
        totalDays={summary.totalDays}
      />

      {/* Bento 2: Hero Balance & Quota Progress */}
      <BentoHeroBalance summary={summary} />

      {/* Bento 3: Auto-Calculated Breakdown Micro-Grid */}
      <BentoAutoCalculated
        summary={summary}
        routineDay={p.routineDay!}
        todayQuota={todayQuota}
      />

      {/* Bento 4: Interactive 'Budget Harian' Ledger */}
      <BentoDailyLedger
        periodId={id}
        isOwner={isOwner}
        rows={rows}
        summary={summary}
        todayStr={today}
        transactions={(txRows ?? []).map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          note: t.note,
          transaction_date: t.transaction_date,
        }))}
      />

      <RealtimeRefresh periodId={id} />
    </div>
  );
}
