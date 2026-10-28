import { createClient } from "npm:@supabase/supabase-js@2";
import { adaptiveAllowance, isBigDay, usage } from "../_shared/budget.ts";
import { claim, rp, sendDiscord } from "../_shared/discord.ts";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type TxRecord = { period_id: string; type: string; amount: number; note: string | null; transaction_date: string };

async function handle(tx: TxRecord) {
  const { data: per } = await db.from("periods").select("*").eq("id", tx.period_id).single();
  if (!per) return;
  const [{ data: itemRows }, { data: txRows }, { data: settings }, { data: u }] = await Promise.all([
    db.from("planned_items").select("planned_date, amount").eq("period_id", per.id),
    db.from("transactions").select("type, amount, transaction_date").eq("period_id", per.id),
    db.from("notification_settings").select("destination, event").eq("user_id", per.owner_id).eq("channel", "discord").eq("enabled", true),
    db.auth.admin.getUserById(per.owner_id),
  ]);
  const p = { start: per.start_date, end: per.end_date, initialBalance: per.initial_balance, limit: per.planned_expense_limit };
  const items = (itemRows ?? []).map((i) => ({ date: i.planned_date, amount: i.amount }));
  const txs = (txRows ?? []).map((t) => ({ type: t.type as "expense" | "income", amount: t.amount, date: t.transaction_date }));
  const name = u?.user?.user_metadata?.name || u?.user?.email?.split("@")[0] || "Seseorang";
  const us = usage(p, txs);
  const to = (event: string) => (settings ?? []).filter((s) => s.event === event).map((s) => s.destination as string);

  // 1. transaksi baru
  const label = tx.note ?? (tx.type === "expense" ? "Pengeluaran" : "Pemasukan");
  for (const url of to("transaction")) await sendDiscord(url, `${name}: ${label} ${rp(tx.amount)}, sisa kuota ${rp(us.remaining)}`);
  if (tx.type !== "expense") return;

  // 2. ambang 80% dan 100%, sekali per ambang
  for (const [kind, hit, lbl] of [["t80", us.pct >= 0.8, "80%"], ["t100", us.pct >= 1, "100%"]] as const) {
    if (hit && (await claim(db, per.id, kind))) {
      for (const url of to("threshold")) {
        await sendDiscord(url, `${name}: pemakaian "${per.name}" mencapai ${lbl} (${rp(us.spent)} dari ${rp(p.limit)})`);
      }
    }
  }

  // 3. transaksi besar, sekali per hari per periode
  if (isBigDay(p, items, txs, tx.transaction_date) && (await claim(db, per.id, `big:${tx.transaction_date}`))) {
    const jatah = adaptiveAllowance(p, items, txs, tx.transaction_date);
    for (const url of to("big")) await sendDiscord(url, `${name}: pengeluaran ${tx.transaction_date} melewati jatah hari itu (${rp(jatah)})`);
  }
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }
  try {
    const body = await req.json();
    if (body.type === "INSERT") await handle(body.record);
  } catch (e) {
    console.error(e);
  }
  return new Response("ok"); // selalu 200: jangan memicu retry webhook
});
