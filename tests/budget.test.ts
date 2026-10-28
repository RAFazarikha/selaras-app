import { describe, expect, test } from "bun:test";
import {
  adaptiveAllowance,
  balances,
  calculateSpreadsheet,
  daysBetween,
  isBigDay,
  staticAllowance,
  usage,
  type Item,
  type Period,
  type Tx,
} from "@/supabase/functions/_shared/budget";

// 10 hari, batas 1.000.000, saldo awal 2.000.000
const p: Period = { start: "2026-11-01", end: "2026-11-10", initialBalance: 2_000_000, limit: 1_000_000 };
const exp = (date: string, amount: number): Tx => ({ type: "expense", date, amount });
const inc = (date: string, amount: number): Tx => ({ type: "income", date, amount });

describe("daysBetween", () => {
  test("inklusif", () => {
    expect(daysBetween("2026-11-01", "2026-11-10")).toBe(10);
    expect(daysBetween("2026-11-05", "2026-11-05")).toBe(1);
  });
});

describe("staticAllowance", () => {
  test("tanpa alokasi manual = batas / jumlah hari", () => {
    expect(staticAllowance(p, [], "2026-11-04")).toBe(100_000);
  });
  test("dengan alokasi manual", () => {
    const items: Item[] = [{ date: "2026-11-03", amount: 100_000 }];
    expect(staticAllowance(p, items, "2026-11-02")).toBe(90_000);
    expect(staticAllowance(p, items, "2026-11-03")).toBe(190_000);
  });
});

describe("adaptiveAllowance", () => {
  test("hari pertama sama dengan statis", () => {
    expect(adaptiveAllowance(p, [], [], "2026-11-01")).toBe(100_000);
  });
  test("hari boros memperkecil jatah hari berikutnya", () => {
    expect(adaptiveAllowance(p, [], [exp("2026-11-01", 200_000)], "2026-11-02")).toBeCloseTo(800_000 / 9, 5);
  });
  test("hari hemat memperbesar jatah (carry-over)", () => {
    expect(adaptiveAllowance(p, [], [], "2026-11-02")).toBeCloseTo(1_000_000 / 9, 5);
  });
  test("alokasi manual dicadangkan di hari-hari sebelum tanggalnya", () => {
    const items: Item[] = [{ date: "2026-11-03", amount: 100_000 }];
    expect(adaptiveAllowance(p, items, [], "2026-11-01")).toBe(90_000);
    expect(adaptiveAllowance(p, items, [], "2026-11-03")).toBeCloseTo(900_000 / 8 + 100_000, 5);
  });
  test("alokasi manual yang lewat dan tidak terpakai kembali ke pool", () => {
    const items: Item[] = [{ date: "2026-11-03", amount: 100_000 }];
    expect(adaptiveAllowance(p, items, [], "2026-11-04")).toBeCloseTo(1_000_000 / 7, 5);
  });
  test("alokasi manual yang terpakai tidak dihitung dua kali", () => {
    const items: Item[] = [{ date: "2026-11-03", amount: 100_000 }];
    expect(adaptiveAllowance(p, items, [exp("2026-11-03", 100_000)], "2026-11-04")).toBeCloseTo(900_000 / 7, 5);
  });
  test("batas habis -> jatah 0, tidak negatif", () => {
    expect(adaptiveAllowance(p, [], [exp("2026-11-01", 1_500_000)], "2026-11-02")).toBe(0);
  });
  test("hari terakhir = sisa batas", () => {
    expect(adaptiveAllowance(p, [], [exp("2026-11-05", 900_000)], "2026-11-10")).toBe(100_000);
  });
  test("pemasukan tidak mempengaruhi jatah", () => {
    expect(adaptiveAllowance(p, [], [inc("2026-11-01", 5_000_000)], "2026-11-02")).toBeCloseTo(1_000_000 / 9, 5);
  });
  test("tanggal di luar periode -> RangeError", () => {
    expect(() => adaptiveAllowance(p, [], [], "2026-11-11")).toThrow(RangeError);
    expect(() => adaptiveAllowance(p, [], [], "2026-10-31")).toThrow(RangeError);
  });
});

describe("balances", () => {
  test("saldo rencana, aktual, selisih sampai hari ke-3", () => {
    const txs = [exp("2026-11-01", 150_000), inc("2026-11-02", 50_000)];
    const b = balances(p, [], txs, "2026-11-03");
    expect(b.planned).toBe(1_700_000); // 2.000.000 - 3 x 100.000
    expect(b.actual).toBe(1_900_000); // 2.000.000 + 50.000 - 150.000
    expect(b.diff).toBe(200_000); // positif = lebih hemat
  });
  test("transaksi setelah hari D tidak dihitung", () => {
    expect(balances(p, [], [exp("2026-11-04", 999)], "2026-11-03").actual).toBe(2_000_000);
  });
});

describe("isBigDay", () => {
  test("lebih besar dari jatah -> true; sama -> false", () => {
    expect(isBigDay(p, [], [exp("2026-11-01", 100_001)], "2026-11-01")).toBe(true);
    expect(isBigDay(p, [], [exp("2026-11-01", 100_000)], "2026-11-01")).toBe(false);
  });
  test("pembelian teralokasi tidak memicu", () => {
    const items: Item[] = [{ date: "2026-11-03", amount: 100_000 }];
    expect(isBigDay(p, items, [exp("2026-11-03", 100_000)], "2026-11-03")).toBe(false);
  });
  test("pemasukan tidak dihitung", () => {
    expect(isBigDay(p, [], [inc("2026-11-01", 9_999_999)], "2026-11-01")).toBe(false);
  });
});

describe("usage", () => {
  test("warna 70/90", () => {
    const lvl = (spent: number) => usage(p, [exp("2026-11-01", spent)]).level;
    expect(lvl(690_000)).toBe("green");
    expect(lvl(700_000)).toBe("yellow");
    expect(lvl(900_000)).toBe("yellow");
    expect(lvl(910_000)).toBe("red");
  });
  test("alert 80/100", () => {
    const al = (spent: number) => usage(p, [exp("2026-11-01", spent)]).alert;
    expect(al(799_999)).toBe(null);
    expect(al(800_000)).toBe("warn");
    expect(al(1_000_000)).toBe("limit");
  });
  test("sisa kuota dan batas 0", () => {
    expect(usage(p, [exp("2026-11-01", 300_000)]).remaining).toBe(700_000);
    expect(usage({ ...p, limit: 0 }, []).pct).toBe(0);
    expect(usage({ ...p, limit: 0 }, [exp("2026-11-01", 1)]).level).toBe("red");
  });
});

describe("calculateSpreadsheet (Stitch / Excel Spec)", () => {
  // Contoh spreadsheet: 26 Okt 2026 (Senin) - 30 Nov 2026 (Senin) = 36 hari
  // Total Uang = 1.553.232, BBM = 50.000 setiap Senin
  const spPeriod: Period = {
    start: "2026-10-26",
    end: "2026-11-30",
    initialBalance: 1_553_232,
    routineAmount: 50_000,
    routineDay: 1, // Senin
  };

  test("ringkasan kalkulasi otomatis persis dengan dokumen desain", () => {
    const { summary, rows } = calculateSpreadsheet(spPeriod, [
      exp("2026-10-26", 100_000),
      exp("2026-10-27", 41_500),
      exp("2026-10-28", 60_000),
    ]);

    expect(summary.totalAmount).toBe(1_553_232);
    expect(summary.totalDays).toBe(36);
    expect(summary.routineDayCount).toBe(6); // 6 hari Senin
    expect(summary.totalRoutine).toBe(300_000); // 6 x 50.000
    expect(summary.netForDaily).toBe(1_253_232); // 1.553.232 - 300.000
    expect(summary.dailyBudget).toBe(34_800); // floor(1.253.232 / 36 / 100) * 100
    expect(summary.roundingReserve).toBe(432); // 1.253.232 - (34.800 * 36)
    expect(summary.totalAllocatedBudget).toBe(1_552_800);

    // Pengeluaran aktual terakumulasi
    expect(summary.totalActualSpent).toBe(201_500); // 100k + 41.5k + 60k
    expect(summary.currentActualBalance).toBe(1_351_732); // 1.553.232 - 201.500

    // Cek detail baris hari 1 (Senin 26 Okt)
    const row1 = rows[0];
    expect(row1.date).toBe("2026-10-26");
    expect(row1.isRoutineDay).toBe(true);
    expect(row1.routineBudget).toBe(50_000);
    expect(row1.dailyBudget).toBe(34_800);
    expect(row1.totalBudgetToday).toBe(84_800);
    expect(row1.actualSpent).toBe(100_000);
    expect(row1.diff).toBe(15_200); // 100.000 - 84.800 (over 15.200)
    expect(row1.actualRemaining).toBe(1_453_232);

    // Cek detail baris hari 2 (Selasa 27 Okt)
    const row2 = rows[1];
    expect(row2.date).toBe("2026-10-27");
    expect(row2.isRoutineDay).toBe(false);
    expect(row2.routineBudget).toBe(0);
    expect(row2.totalBudgetToday).toBe(34_800);
    expect(row2.actualSpent).toBe(41_500);
    expect(row2.diff).toBe(6_700); // 41.500 - 34.800
    expect(row2.actualRemaining).toBe(1_411_732);

    // Cek detail baris hari 3 (Rabu 28 Okt)
    const row3 = rows[2];
    expect(row3.date).toBe("2026-10-28");
    expect(row3.actualSpent).toBe(60_000);
    expect(row3.diff).toBe(25_200); // 60.000 - 34.800
    expect(row3.actualRemaining).toBe(1_351_732);

    // Cek baris hari tanpa transaksi (29 Okt)
    const row4 = rows[3];
    expect(row4.hasActual).toBe(false);
    expect(row4.actualSpent).toBe(0);
    expect(row4.actualRemaining).toBe(null);

    // Sisa rencana hari terakhir harus tepat sama dengan cadangan pembulatan (432)
    const lastRow = rows[rows.length - 1];
    expect(lastRow.plannedRemaining).toBe(432);
  });
});
