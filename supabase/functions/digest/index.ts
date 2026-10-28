import { createClient } from "npm:@supabase/supabase-js@2";
import { adaptiveAllowance, balances, daysBetween, usage } from "../_shared/budget.ts";
import { claim, rp, sendDiscord } from "../_shared/discord.ts";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const jakarta = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(d);

async function urls(userId: string, event: string) {
  const { data } = await db.from("notification_settings").select("destination")
    .eq("user_id", userId).eq("channel", "discord").eq("event", event).eq("enabled", true);
  return (data ?? []).map((s) => s.destination as string);
}

async function run() {
  const today = jakarta(new Date());
  const yesterday = jakarta(new Date(Date.now() - 86_400_000));

  // Ringkasan harian + pengingat H-3 untuk periode aktif
  const { data: active } = await db.from("periods").select("*").lte("start_date", today).gte("end_date", today);
  for (const per of active ?? []) {
    const [{ data: itemRows }, { data: txRows }] = await Promise.all([
      db.from("planned_items").select("planned_date, amount").eq("period_id", per.id),
      db.from("transactions").select("type, amount, transaction_date").eq("period_id", per.id),
    ]);
    const p = { start: per.start_date, end: per.end_date, initialBalance: per.initial_balance, limit: per.planned_expense_limit };
    const items = (itemRows ?? []).map((i) => ({ date: i.planned_date, amount: i.amount }));
    const txs = (txRows ?? []).map((t) => ({ type: t.type as "expense" | "income", amount: t.amount, date: t.transaction_date }));

    if (await claim(db, per.id, `digest:${today}`)) {
      const us = usage(p, txs);
      const b = balances(p, items, txs, today);
      const msg = `Ringkasan "${per.name}": sisa kuota ${rp(us.remaining)}, jatah hari ini ${rp(adaptiveAllowance(p, items, txs, today))}, ` +
        `saldo aktual ${rp(b.actual)} (rencana ${rp(b.planned)}, selisih ${rp(b.diff)})`;
      for (const url of await urls(per.owner_id, "digest")) await sendDiscord(url, msg);
    }
    if (daysBetween(today, per.end_date) === 4 && (await claim(db, per.id, "end3"))) {
      for (const url of await urls(per.owner_id, "reminder")) await sendDiscord(url, `Periode "${per.name}" berakhir 3 hari lagi (${per.end_date})`);
    }
  }

  // Periode baru: periode berakhir kemarin dan pemilik belum punya periode lanjutan
  const { data: ended } = await db.from("periods").select("*").eq("end_date", yesterday);
  for (const per of ended ?? []) {
    const { count } = await db.from("periods").select("id", { count: "exact", head: true })
      .eq("owner_id", per.owner_id).gt("start_date", per.end_date);
    if (!count && (await claim(db, per.id, "newperiod"))) {
      for (const url of await urls(per.owner_id, "reminder")) {
        await sendDiscord(url, `Periode "${per.name}" sudah berakhir. Buat periode baru beserta saldo awalnya.`);
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }
  try {
    await run();
  } catch (e) {
    console.error(e);
  }
  return new Response("ok");
});
