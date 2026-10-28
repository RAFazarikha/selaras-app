import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "@/components/floating-nav";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .maybeSingle();
  if (!m) redirect("/onboarding");

  return (
    <>
      <div className="mx-auto w-full max-w-md flex-1 pb-28 pt-2">{children}</div>
      <FloatingNav />
    </>
  );
}
