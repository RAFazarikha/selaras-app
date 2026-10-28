"use client";

import { useActionState, useState } from "react";
import { createInvite } from "./actions";
import { Spinner } from "@/components/ui/spinner";
import { Key } from "lucide-react";

export function InviteButton() {
  const [state, run, pending] = useActionState(createInvite, {});
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <form action={run}>
        <button
          type="submit"
          disabled={pending}
          className="w-full purple-gradient-btn text-white py-2.5 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Spinner className="w-3.5 h-3.5 text-white" />
              <span>Membuat kode…</span>
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              <span>Buat Kode Undangan</span>
            </>
          )}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="text-xs font-medium text-[#ba1a1a]">
          {state.error}
        </p>
      )}

      {state.code && (
        <div className="p-3 rounded-2xl bg-[#eff4ff] border border-[#d3e4fe] flex items-center justify-between animate-in fade-in duration-150">
          <div>
            <span className="text-[10px] text-[#7b7486] block">Kode Undangan (48 jam, 1x pakai):</span>
            <code className="text-sm font-bold tracking-widest text-[#6d28d9]">
              {state.code}
            </code>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(state.code!)}
            className="px-3 py-1.5 rounded-full bg-white border border-[#ccc3d7] text-xs font-semibold text-[#6d28d9] hover:bg-[#eff4ff] transition-all"
          >
            {copied ? "Tersalin!" : "Salin"}
          </button>
        </div>
      )}
    </div>
  );
}
