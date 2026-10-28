import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForms } from "./form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: m } = await supabase.from("workspace_members").select("workspace_id").maybeSingle();
  if (m) redirect("/");
  return (
    <main className="mx-auto w-full max-w-sm space-y-6 p-6">
      <h1 className="text-2xl font-bold">Mulai dengan Selaras</h1>
      <OnboardingForms />
    </main>
  );
}
