export type Period = { start: string; end: string; initialBalance: number; limit: number };
export type Item = { date: string; amount: number };
export type Tx = { type: "expense" | "income"; amount: number; date: string };

const DAY = 86_400_000;
const ms = (d: string) => Date.parse(`${d}T00:00:00Z`);
const sum = (xs: { amount: number }[]) => xs.reduce((s, x) => s + x.amount, 0);

/** Jumlah hari inklusif antara dua tanggal YYYY-MM-DD. */
export const daysBetween = (a: string, b: string) => Math.round((ms(b) - ms(a)) / DAY) + 1;

export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  for (let t = ms(start); t <= ms(end); t += DAY) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

function assertInside(p: Period, d: string) {
  if (d < p.start || d > p.end) throw new RangeError(`${d} di luar periode ${p.start}..${p.end}`);
}

/** Jatah rencana awal (statis) hari d. Dipakai untuk saldo rencana. */
export function staticAllowance(p: Period, items: Item[], d: string): number {
  assertInside(p, d);
  const manual = sum(items);
  return (p.limit - manual) / daysBetween(p.start, p.end) + sum(items.filter((i) => i.date === d));
}

/** Jatah adaptif hari d. Hanya memakai pengeluaran SEBELUM d. */
export function adaptiveAllowance(p: Period, items: Item[], txs: Tx[], d: string): number {
  assertInside(p, d);
  const spentBefore = sum(txs.filter((t) => t.type === "expense" && t.date < d));
  const manualFromD = sum(items.filter((i) => i.date >= d));
  const auto = Math.max(0, p.limit - spentBefore - manualFromD) / daysBetween(d, p.end);
  return auto + sum(items.filter((i) => i.date === d));
}

/** Saldo rencana vs aktual di akhir hari d. diff > 0 = lebih hemat dari rencana. */
export function balances(p: Period, items: Item[], txs: Tx[], d: string) {
  assertInside(p, d);
  const planned = p.initialBalance - eachDay(p.start, d).reduce((s, x) => s + staticAllowance(p, items, x), 0);
  const upTo = txs.filter((t) => t.date <= d);
  const actual =
    p.initialBalance + sum(upTo.filter((t) => t.type === "income")) - sum(upTo.filter((t) => t.type === "expense"));
  return { planned, actual, diff: actual - planned };
}

/** Transaksi besar: total expense hari d > jatah adaptif hari d. */
export function isBigDay(p: Period, items: Item[], txs: Tx[], d: string): boolean {
  const spentToday = sum(txs.filter((t) => t.type === "expense" && t.date === d));
  return spentToday > adaptiveAllowance(p, items, txs, d);
}

export function usage(p: Period, txs: Tx[]) {
  const spent = sum(txs.filter((t) => t.type === "expense"));
  const pct = p.limit > 0 ? spent / p.limit : spent > 0 ? Infinity : 0;
  const level = pct < 0.7 ? "green" : pct <= 0.9 ? "yellow" : "red";
  const alert = pct >= 1 ? "limit" : pct >= 0.8 ? "warn" : null;
  return { spent, remaining: p.limit - spent, pct, level, alert } as const;
}
