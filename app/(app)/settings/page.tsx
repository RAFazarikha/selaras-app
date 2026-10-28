import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { InviteButton } from "./invite";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: members } = await supabase.from("workspace_members").select("user_id, role");
  const me = members?.find((m) => m.user_id === user?.id);
  const full = (members?.length ?? 0) >= 2;
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Pengaturan</h1>
      <section className="space-y-2">
        <h2 className="font-semibold">Workspace ({members?.length ?? 0}/2 anggota)</h2>
        {me?.role === "owner" && !full && <InviteButton />}
        {full && <p className="text-sm text-zinc-500">Workspace sudah penuh.</p>}
      </section>
      <form action={signOut}>
        <button className="min-h-11 rounded-lg border border-zinc-300 px-4 dark:border-zinc-700">Keluar</button>
      </form>
    </div>
  );
}
