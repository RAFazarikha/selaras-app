"use client";
import { useActionState } from "react";
import { createInvite } from "./actions";

export function InviteButton() {
  const [state, run, pending] = useActionState(createInvite, {});
  return (
    <form action={run} className="space-y-2">
      <button className="min-h-11 rounded-lg bg-teal-700 px-4 text-white disabled:opacity-60" disabled={pending}>
        Buat kode undangan
      </button>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.code && (
        <p role="status">
          Kode: <code className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">{state.code}</code>
          <span className="block text-sm text-zinc-500">Berlaku 48 jam, sekali pakai.</span>
        </p>
      )}
    </form>
  );
}
