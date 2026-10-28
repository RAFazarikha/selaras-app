"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addTransaction } from "@/app/(app)/periods/[id]/actions";
import { formatDateIndo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function QuickAddFab({ periodId, todayStr }: { periodId: string; todayStr: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [kb, setKb] = useState(0);

  // ponytail: iOS Safari tidak menggeser elemen fixed saat keyboard muncul; angkat sheet manual. Belum diuji di perangkat nyata.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const on = () => setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener("resize", on);
    vv.addEventListener("scroll", on);
    return () => {
      vv.removeEventListener("resize", on);
      vv.removeEventListener("scroll", on);
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Nominal harus bilangan bulat > 0");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("period_id", periodId);
    fd.set("type", "expense");
    fd.set("amount", String(n));
    fd.set("transaction_date", todayStr);
    fd.set("note", note);
    start(async () => {
      const res = await addTransaction({}, fd);
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        setAmount("");
        setNote("");
        setOpen(false);
        toast.success("Pengeluaran dicatat");
      }
    });
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.75rem)] z-40">
        <div className="mx-auto flex max-w-md justify-end px-4">
          <Button variant="brand" size="lg" className="pointer-events-auto rounded-full px-5 shadow-lg" onClick={() => setOpen(true)}>
            <Plus aria-hidden="true" className="size-5" />
            Catat pengeluaran
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          style={{ bottom: open ? kb : 0 }}
          className="mx-auto max-w-md rounded-t-3xl px-4 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="p-0">
            <SheetTitle>Catat pengeluaran</SheetTitle>
            <SheetDescription>Untuk hari ini, {formatDateIndo(todayStr)}</SheetDescription>
          </SheetHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="qa-amount" className="text-xs font-semibold text-muted-foreground">Nominal</Label>
              <div className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">Rp</span>
                <Input
                  id="qa-amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  autoFocus
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "qa-error" : undefined}
                  className="pl-10 tabular-nums"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="qa-note" className="text-xs font-semibold text-muted-foreground">Catatan (opsional)</Label>
              <Input id="qa-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            {error && (
              <p id="qa-error" role="alert" className="text-xs font-medium text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" variant="brand" size="lg" disabled={pending} className="w-full rounded-2xl">
              {pending ? (
                <>
                  <Spinner className="w-4 h-4 text-white" />
                  <span>Menyimpan…</span>
                </>
              ) : (
                <span>Simpan</span>
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
