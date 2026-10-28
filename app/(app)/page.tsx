import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayJakarta } from "@/lib/format";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: periods } = await supabase
    .from("periods")
    .select("*")
    .order("start_date", { ascending: false });

  const today = todayJakarta();
  // Temukan periode aktif berdasarkan hari ini
  const active = periods?.find(
    (p) => p.owner_id === user?.id && p.start_date <= today && today <= p.end_date,
  );
  if (active) redirect(`/periods/${active.id}`);

  // Jika tidak ada yang strictly aktif hari ini tapi punya periode, redirect ke periode terbaru
  if (periods && periods.length > 0) {
    redirect(`/periods/${periods[0].id}`);
  }

  // Jika belum ada periode sama sekali
  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 space-y-6 text-center">
      <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-[#6d28d9] to-[#8455ef] flex items-center justify-center specular-border shadow-xl">
        <span className="material-symbols-outlined text-white text-[40px]">
          calendar_add_on
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0b1c30]">Belum Ada Periode</h1>
        <p className="text-sm text-[#4a4455] max-w-[280px] mx-auto leading-relaxed">
          Mulai dengan menentukan rentang tanggal, total pagu uang, dan jadwal rutin BBM mingguan.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/periods/new"
          className="w-full inline-flex py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6d28d9] to-[#8455ef] text-white text-sm font-semibold items-center justify-center gap-2 primary-btn-glow active:scale-[0.98] transition-all"
        >
          <span>Buat Periode Baru</span>
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
        </Link>
      </div>
    </div>
  );
}
