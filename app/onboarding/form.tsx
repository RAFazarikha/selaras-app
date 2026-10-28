"use client";
import { useActionState } from "react";
import type { State } from "@/app/login/actions";
import { createWorkspace, redeemInvite } from "./actions";

const input = "w-full rounded-lg border border-zinc-300 px-3 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900";
const button = "w-full rounded-lg bg-teal-700 px-3 py-3 text-base font-medium text-white disabled:opacity-60";

function Form({
  title, action, name, placeholder, cta,
}: {
  title: string;
  action: (s: State, f: FormData) => Promise<State>;
  name: string;
  placeholder: string;
  cta: string;
}) {
  const [state, run, pending] = useActionState(action, {});
  return (
    <form action={run} className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">{title}</h2>
      <input className={input} name={name} placeholder={placeholder} required />
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button className={button} disabled={pending}>{pending ? "Memproses…" : cta}</button>
    </form>
  );
}

export function OnboardingForms() {
  return (
    <>
      <Form title="Buat workspace baru" action={createWorkspace} name="name" placeholder="Nama workspace" cta="Buat" />
      <Form title="Punya kode undangan?" action={redeemInvite} name="code" placeholder="Kode undangan" cta="Gabung" />
    </>
  );
}
