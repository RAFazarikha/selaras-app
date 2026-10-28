"use client";

import { useActionState } from "react";
import type { State } from "@/app/login/actions";
import { createWorkspace, redeemInvite } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>

      <Input
          name={name}
          placeholder={placeholder}
          required
        />

      {state.error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        variant="brand" className="w-full rounded-2xl"
      >
        {pending ? (
          <>
            <Spinner className="w-3.5 h-3.5 text-white" />
            <span>Memproses…</span>
          </>
        ) : (
          <span>{cta}</span>
        )}
      </Button>
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
        icon={<Home aria-hidden="true" className="w-4 h-4" />}
      />
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-outline-variant/30" />
        <span className="flex-shrink mx-3 text-xs text-outline">atau gabung</span>
        <div className="flex-grow border-t border-outline-variant/30" />
      </div>
      <Form
        title="Punya Kode Undangan?"
        action={redeemInvite}
        name="code"
        placeholder="Masukkan 12 karakter kode undangan"
        cta="Gabung ke Workspace"
        icon={<Key aria-hidden="true" className="w-4 h-4" />}
      />
    </div>
  );
}
