import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayJakarta } from "@/lib/format";
import { CalendarPlus, PlusCircle } from "lucide-react";

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
  // Temukan periode aktif berdasarkan hari ini (milik sendiri atau dibagikan)
  const active = periods?.find(
    (p) =>
      (p.owner_id === user?.id || p.visibility === "shared") &&
      p.start_date <= today &&
      today <= p.end_date,
  );
  if (active) redirect(`/periods/${active.id}`);

  // Jika tidak ada yang strictly aktif hari ini tapi punya periode, redirect ke periode terbaru
  if (periods && periods.length > 0) {
    redirect(`/periods/${periods[0].id}`);
  }

  // Jika belum ada periode sama sekali
  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 space-y-6 text-center">
      <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center specular-border shadow-xl">
        <CalendarPlus aria-hidden="true" className="w-10 h-10 text-white" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Belum Ada Periode</h1>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
          Tentukan rentang tanggal, total uang, dan alokasi BBM mingguan untuk mulai mencatat.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/periods/new"
          className="w-full inline-flex py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold items-center justify-center gap-2 primary-btn-glow active:scale-[0.98] transition-all"
        >
          <span>Buat Periode Baru</span>
          <PlusCircle aria-hidden="true" className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
