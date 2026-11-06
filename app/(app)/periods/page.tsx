import Link from "next/link";
import { ArrowLeft, ChevronRight, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateIndo, rupiah, todayJakarta } from "@/lib/format";
import { DeletePeriod } from "./delete-period";

export default async function PeriodsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: periods } = await supabase
    .from("periods")
    .select("id, name, start_date, end_date, initial_balance, owner_id, visibility")
    .order("start_date", { ascending: false });
  const today = todayJakarta();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 space-y-4">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="size-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-surface-container"
          aria-label="Kembali"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Semua Periode</h1>
        <Link
          href="/periods/new"
          className="size-11 rounded-full flex items-center justify-center text-primary hover:bg-surface-container"
          aria-label="Buat periode baru"
        >
          <PlusCircle aria-hidden="true" className="size-5" />
        </Link>
      </header>

      {!periods?.length && <p className="text-sm text-muted-foreground text-center py-8">Belum ada periode.</p>}

      <ul className="space-y-2">
        {periods?.map((p) => {
          const active = p.start_date <= today && today <= p.end_date;
          return (
            <li key={p.id} className="glass-tile rounded-2xl flex items-center gap-1 pr-2">
              <Link href={`/periods/${p.id}`} className="flex-1 min-w-0 flex items-center gap-2 p-4 min-h-11">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {p.name}
                    {active && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                        Aktif
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatDateIndo(p.start_date)} – {formatDateIndo(p.end_date)} · {rupiah(p.initial_balance)}
                    {p.visibility === "shared" && " · Dibagikan"}
                  </p>
                </div>
                <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground shrink-0" />
              </Link>
              {p.owner_id === user?.id && <DeletePeriod id={p.id} name={p.name} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
