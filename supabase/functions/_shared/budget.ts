export type Period = {
  start: string;
  end: string;
  initialBalance: number;
  limit?: number;
  routineAmount?: number;
  routineDay?: number; // 0: Minggu, 1: Senin, dst.
};
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

/** Hari dalam pekan (0: Minggu, 1: Senin, ..., 6: Sabtu) dari tanggal YYYY-MM-DD. */
export function dayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

function assertInside(p: Period, d: string) {
  if (d < p.start || d > p.end) throw new RangeError(`${d} di luar periode ${p.start}..${p.end}`);
}

/** Jatah rencana awal (statis) hari d. Dipakai untuk saldo rencana. */
export function staticAllowance(p: Period, items: Item[], d: string): number {
  assertInside(p, d);
  const limit = p.limit ?? p.initialBalance;
  const manual = sum(items);
  return (limit - manual) / daysBetween(p.start, p.end) + sum(items.filter((i) => i.date === d));
}

/** Jatah adaptif hari d. Hanya memakai pengeluaran SEBELUM d. */
export function adaptiveAllowance(p: Period, items: Item[], txs: Tx[], d: string): number {
  assertInside(p, d);
  const limit = p.limit ?? p.initialBalance;
  const spentBefore = sum(txs.filter((t) => t.type === "expense" && t.date < d));
  const manualFromD = sum(items.filter((i) => i.date >= d));
  const auto = Math.max(0, limit - spentBefore - manualFromD) / daysBetween(d, p.end);
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
  const limit = p.limit ?? p.initialBalance;
  const spent = sum(txs.filter((t) => t.type === "expense"));
  const pct = limit > 0 ? spent / limit : spent > 0 ? Infinity : 0;
  const level = pct < 0.7 ? "green" : pct <= 0.9 ? "yellow" : "red";
  const alert = pct >= 1 ? "limit" : pct >= 0.8 ? "warn" : null;
  return { spent, remaining: limit - spent, pct, level, alert } as const;
}

// -------------------------------------------------------------
// LOGIKA SPREADSHEET RINGKASAN & BUDGET HARIAN (STITCH / EXCEL)
// -------------------------------------------------------------

export type SpreadsheetSummary = {
  totalAmount: number;
  totalDays: number;
  routineDayCount: number;
  routineAmountPerDay: number;
  totalRoutine: number;
  netForDaily: number;
  dailyBudget: number; // dibulatkan ke bawah ke 100 terdekat
  roundingReserve: number;
  totalActualSpent: number;
  currentActualBalance: number;
  totalAllocatedBudget: number; // totalRoutine + (dailyBudget * totalDays)
  cumulativeSavings: number;
};

export type SpreadsheetDayRow = {
  date: string; // YYYY-MM-DD
  dayName: string; // Senin, Selasa, dll
  dayOfWeek: number;
  isRoutineDay: boolean;
  dailyBudget: number;
  routineBudget: number;
  totalBudgetToday: number;
  actualSpent: number;
  hasActual: boolean;
  diff: number; // actualSpent - totalBudgetToday (jika hasActual)
  plannedRemaining: number;
  actualRemaining: number | null;
};

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const getDayName = (dow: number) => DAY_NAMES[dow] ?? "";

export function calculateSpreadsheet(
  p: Period,
  txs: Tx[],
): { summary: SpreadsheetSummary; rows: SpreadsheetDayRow[] } {
  const totalAmount = p.initialBalance;
  const totalDays = daysBetween(p.start, p.end);
  const routineAmount = p.routineAmount ?? 50_000;
  const targetDay = p.routineDay ?? 1; // 1 = Senin

  const days = eachDay(p.start, p.end);
  let routineDayCount = 0;
  for (const d of days) {
    if (dayOfWeek(d) === targetDay) routineDayCount++;
  }

  const totalRoutine = routineDayCount * routineAmount;
  const netForDaily = Math.max(0, totalAmount - totalRoutine);
  const rawDaily = totalDays > 0 ? netForDaily / totalDays : 0;
  const dailyBudget = Math.floor(rawDaily / 100) * 100;
  const roundingReserve = netForDaily - dailyBudget * totalDays;
  const totalAllocatedBudget = totalRoutine + dailyBudget * totalDays;

  // Map pengeluaran aktual per tanggal
  const expenseByDate = new Map<string, number>();
  const hasTxOnDate = new Set<string>();
  for (const t of txs) {
    if (t.type === "expense") {
      expenseByDate.set(t.date, (expenseByDate.get(t.date) ?? 0) + t.amount);
      hasTxOnDate.add(t.date);
    }
  }

  const rows: SpreadsheetDayRow[] = [];
  let prevPlanned = totalAmount;
  let prevActual = totalAmount;
  let totalActualSpent = 0;
  let budgetedForDaysWithActual = 0;

  for (const date of days) {
    const dow = dayOfWeek(date);
    const isRoutine = dow === targetDay;
    const routineBudget = isRoutine ? routineAmount : 0;
    const totalBudgetToday = dailyBudget + routineBudget;

    const plannedRemaining = prevPlanned - totalBudgetToday;
    prevPlanned = plannedRemaining;

    const hasActual = hasTxOnDate.has(date);
    const actualSpent = expenseByDate.get(date) ?? 0;
    if (hasActual) {
      totalActualSpent += actualSpent;
      budgetedForDaysWithActual += totalBudgetToday;
    }

    const actualRemaining = hasActual ? prevActual - actualSpent : null;
    if (hasActual) {
      prevActual = actualRemaining!;
    }

    const diff = hasActual ? actualSpent - totalBudgetToday : 0;

    rows.push({
      date,
      dayName: getDayName(dow),
      dayOfWeek: dow,
      isRoutineDay: isRoutine,
      dailyBudget,
      routineBudget,
      totalBudgetToday,
      actualSpent,
      hasActual,
      diff,
      plannedRemaining,
      actualRemaining,
    });
  }

  const currentActualBalance = totalAmount - totalActualSpent;
  const cumulativeSavings = budgetedForDaysWithActual - totalActualSpent;

  return {
    summary: {
      totalAmount,
      totalDays,
      routineDayCount,
      routineAmountPerDay: routineAmount,
      totalRoutine,
      netForDaily,
      dailyBudget,
      roundingReserve,
      totalActualSpent,
      currentActualBalance,
      totalAllocatedBudget,
      cumulativeSavings,
    },
    rows,
  };
}
