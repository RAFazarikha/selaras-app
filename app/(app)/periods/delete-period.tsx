"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePeriod } from "./[id]/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeletePeriod({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const run = () =>
    start(async () => {
      const r = await deletePeriod(id);
      if (r.error) toast.error(r.error);
      else toast.success(r.info ?? "Periode dihapus");
    });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        type="button"
        disabled={pending}
        className="text-destructive hover:bg-destructive/10 size-11 rounded-xl flex items-center justify-center transition-colors"
        aria-label={`Hapus periode ${name}`}
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Periode?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{name}&rdquo; beserta semua transaksi dan alokasinya akan dihapus permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={run}>
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
