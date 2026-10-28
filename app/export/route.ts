import { notFound } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const periodId = request.nextUrl.searchParams.get("period");
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  if (!periodId) notFound();

  const supabase = await createClient();
  const { data: period } = await supabase.from("periods").select("*").eq("id", periodId).maybeSingle();
  if (!period) notFound(); // RLS menyembunyikan bila bukan owner atau shared member

  const [{ data: txRows }, { data: cats }] = await Promise.all([
    supabase.from("transactions").select("*").eq("period_id", periodId).order("transaction_date"),
    supabase.from("categories").select("id, name"),
  ]);
  const catName = new Map(cats?.map((c) => [c.id, c.name]));
  const safeName = period.name.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");

  if (format === "csv") {
    const rows = (txRows ?? []).map((t) => ({
      tanggal: t.transaction_date,
      tipe: t.type,
      nominal: t.amount,
      kategori: (t.category_id && catName.get(t.category_id)) ?? "",
      catatan: t.note ?? "",
    }));
    const csv = toCsv(rows, ["tanggal", "tipe", "nominal", "kategori", "catatan"]);
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="selaras-${safeName}.csv"`,
      },
    });
  }

  return Response.json(
    { period, transactions: txRows ?? [] },
    {
      headers: {
        "content-disposition": `attachment; filename="selaras-${safeName}.json"`,
      },
    },
  );
}
