import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayJakarta } from "@/lib/format";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: periods } = await supabase.from("periods").select("*").order("start_date", { ascending: false });
  const today = todayJakarta();
  const active = periods?.find((p) => p.owner_id === user?.id && p.start_date <= today && today <= p.end_date);
  if (active) redirect(`/periods/${active.id}`);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Periode</h1>
      <Link href="/periods/new" className="flex min-h-11 items-center justify-center rounded-lg bg-teal-700 font-medium text-white">
        Buat periode
      </Link>
      <ul className="space-y-2">
        {periods?.map((p) => (
          <li key={p.id}>
            <Link href={`/periods/${p.id}`} className="block rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <span className="font-medium">{p.name}</span>
              <span className="block text-sm text-zinc-500">
                {p.start_date} – {p.end_date} · {p.owner_id === user?.id ? "Kamu" : "Pasangan"}
              </span>
            </Link>
          </li>
        ))}
        {!periods?.length && <li className="text-sm text-zinc-500">Belum ada periode.</li>}
      </ul>
    </div>
  );
}
