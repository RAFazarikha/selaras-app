"use client";

import { useActionState, useState } from "react";
import { createInvite } from "./actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Key } from "lucide-react";

export function InviteButton() {
  const [state, run, pending] = useActionState(createInvite, {});
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Kode undangan tersalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <form action={run}>
        <Button
          type="submit"
          disabled={pending}
          variant="brand" className="w-full rounded-2xl"
        >
          {pending ? (
            <>
              <Spinner className="w-3.5 h-3.5 text-white" />
              <span>Membuat kode…</span>
            </>
          ) : (
            <>
              <Key aria-hidden="true" className="w-4 h-4" />
              <span>Buat Kode Undangan</span>
            </>
          )}
        </Button>
      </form>

      {state.error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {state.error}
        </p>
      )}

      {state.code && (
        <div className="p-3 rounded-2xl bg-muted border border-surface-highest flex items-center justify-between animate-in fade-in duration-150">
          <div>
            <span className="text-xs text-outline block">Kode Undangan (48 jam, 1x pakai):</span>
            <code className="text-sm font-bold tracking-widest text-primary">
              {state.code}
            </code>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(state.code!)}
            className="min-h-11 px-4 rounded-full bg-white border border-outline-variant text-xs font-semibold text-primary hover:bg-muted transition-all"
          >
            {copied ? "Tersalin!" : "Salin"}
          </button>
        </div>
      )}
    </div>
  );
}
