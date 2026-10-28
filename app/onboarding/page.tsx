import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForms } from "./form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .maybeSingle();
  if (m) redirect("/");

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[#0b1c30]">Mulai dengan Selaras</h1>
        <p className="text-xs text-[#4a4455]">
          Pilih untuk membuat workspace baru atau bergabung dengan workspace pasangan Anda.
        </p>
      </div>
      <OnboardingForms />
    </main>
  );
}
