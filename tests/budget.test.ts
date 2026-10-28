import { describe, expect, test } from "bun:test";
import {
  adaptiveAllowance,
  balances,
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
