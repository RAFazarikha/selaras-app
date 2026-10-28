"use client";

import { useActionState } from "react";
import type { State } from "@/app/login/actions";
import { createWorkspace, redeemInvite } from "./actions";
import { Spinner } from "@/components/ui/spinner";
import { Home, Key } from "lucide-react";

function Form({
  title,
  action,
  name,
  placeholder,
  cta,
  icon,
}: {
  title: string;
  action: (s: State, f: FormData) => Promise<State>;
  name: string;
  placeholder: string;
  cta: string;
  icon: React.ReactNode;
}) {
  const [state, run, pending] = useActionState(action, {});
  return (
    <form action={run} className="glass-tile rounded-3xl p-5 space-y-3.5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#ebddff] flex items-center justify-center text-[#6d28d9]">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-[#0b1c30]">{title}</h2>
      </div>

      <div className="relative flex items-center rounded-2xl bg-white border border-[#ccc3d7]/60 px-3 py-2.5 input-ambient-glow transition-all">
        <input
          name={name}
          placeholder={placeholder}
          required
          className="w-full bg-transparent border-0 p-0 text-sm text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:outline-none"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-xs font-medium text-[#ba1a1a]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full purple-gradient-btn text-white py-2.5 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Spinner className="w-3.5 h-3.5 text-white" />
            <span>Memproses…</span>
          </>
        ) : (
          <span>{cta}</span>
        )}
      </button>
    </form>
  );
}

export function OnboardingForms() {
  return (
    <div className="space-y-4">
      <Form
        title="Buat Workspace Baru"
        action={createWorkspace}
        name="name"
        placeholder="mis. Rumah Kita"
        cta="Buat Workspace"
        icon={<Home className="w-4 h-4" />}
      />
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-[#ccc3d7]/30" />
        <span className="flex-shrink mx-3 text-xs text-[#7b7486]">atau gabung</span>
        <div className="flex-grow border-t border-[#ccc3d7]/30" />
      </div>
      <Form
        title="Punya Kode Undangan?"
        action={redeemInvite}
        name="code"
        placeholder="Masukkan 12 karakter kode undangan"
        cta="Gabung ke Workspace"
        icon={<Key className="w-4 h-4" />}
      />
    </div>
  );
}
