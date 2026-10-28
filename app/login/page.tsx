"use client";
import { useActionState } from "react";
import { sendMagicLink, signInPassword, signUp, type State } from "./actions";

const input = "w-full rounded-lg border border-zinc-300 px-3 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900";
const button = "w-full rounded-lg bg-teal-700 px-3 py-3 text-base font-medium text-white disabled:opacity-60";

function Form({
  title, action, children, cta,
}: {
  title: string;
  action: (s: State, f: FormData) => Promise<State>;
  children: React.ReactNode;
  cta: string;
}) {
  const [state, run, pending] = useActionState(action, {});
  return (
    <form action={run} className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.info && <p role="status" className="text-sm text-green-700">{state.info}</p>}
      <button className={button} disabled={pending}>{pending ? "Memproses…" : cta}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm space-y-6 p-6">
      <h1 className="text-2xl font-bold">Selaras</h1>
      <Form title="Masuk" action={signInPassword} cta="Masuk">
        <input className={input} name="email" type="email" placeholder="Email" autoComplete="email" required />
        <input className={input} name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      </Form>
      <Form title="Masuk dengan tautan email" action={sendMagicLink} cta="Kirim tautan">
        <input className={input} name="email" type="email" placeholder="Email" autoComplete="email" required />
      </Form>
      <Form title="Daftar" action={signUp} cta="Daftar">
        <input className={input} name="name" placeholder="Nama panggilan" autoComplete="nickname" required />
        <input className={input} name="email" type="email" placeholder="Email" autoComplete="email" required />
        <input className={input} name="password" type="password" placeholder="Password (min. 8 karakter)" autoComplete="new-password" required minLength={8} />
      </Form>
    </main>
  );
}
