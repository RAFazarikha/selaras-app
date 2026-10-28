import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: m } = await supabase.from("workspace_members").select("workspace_id").maybeSingle();
  if (!m) redirect("/onboarding");
  const link = "flex min-h-11 flex-1 items-center justify-center text-sm font-medium";
  return (
    <>
      <div className="mx-auto w-full max-w-lg flex-1 p-4 pb-20">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-background dark:border-zinc-800">
        <div className="mx-auto flex max-w-lg">
          <Link href="/" className={link}>Periode</Link>
          <Link href="/settings" className={link}>Pengaturan</Link>
        </div>
      </nav>
    </>
  );
}
