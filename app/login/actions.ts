"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type State = { error?: string; info?: string; code?: string };
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function signInPassword(_: State, f: FormData): Promise<State> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: str(f, "email"), password: str(f, "password") });
  if (error) return { error: "Email atau password salah" };
  redirect("/");
}

export async function signUp(_: State, f: FormData): Promise<State> {
  if (str(f, "password").length < 8) return { error: "Password minimal 8 karakter" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: str(f, "email"),
    password: str(f, "password"),
    options: { data: { name: str(f, "name") } },
  });
  if (error) return { error: error.message };
  redirect("/");
}

export async function sendMagicLink(_: State, f: FormData): Promise<State> {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: str(f, "email"),
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  return error ? { error: error.message } : { info: "Cek email untuk tautan masuk" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
