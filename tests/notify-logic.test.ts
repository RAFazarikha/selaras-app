import { describe, expect, test } from "bun:test";
import { claim, rp } from "@/supabase/functions/_shared/discord";

describe("rp format", () => {
  test("rupiah tanpa sen", () => {
    expect(rp(50000)).toBe("Rp50.000");
    expect(rp(0)).toBe("Rp0");
  });
});

describe("claim dedupe", () => {
  test("insert berhasil -> true; unik melanggar -> false", async () => {
    const seen = new Set<string>();
    const fakeDb = {
      from: () => ({
        insert: async ({ period_id, kind }: { period_id: string; kind: string }) => {
          const k = `${period_id}:${kind}`;
          if (seen.has(k)) return { error: { code: "23505" } };
          seen.add(k);
          return { error: null };
        },
      }),
    };
    expect(await claim(fakeDb, "p1", "t80")).toBe(true);
    expect(await claim(fakeDb, "p1", "t80")).toBe(false); // dobel dicegah
    expect(await claim(fakeDb, "p1", "t100")).toBe(true);
    expect(await claim(fakeDb, "p2", "t80")).toBe(true);
  });
});
