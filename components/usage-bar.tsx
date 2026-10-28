import { rupiah } from "@/lib/format";

export function UsageBar({ spent, limit, pct, level }: { spent: number; limit: number; pct: number; level: "green" | "yellow" | "red" }) {
  const color = level === "green" ? "bg-emerald-600" : level === "yellow" ? "bg-amber-500" : "bg-rose-600";
  const w = Math.min(100, Math.max(0, Math.round(pct * 100)));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Pemakaian kuota</span>
        <span className="tabular-nums font-semibold">{Math.round(pct * 100)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={w}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress pemakaian anggaran"
        className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
      >
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${w}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Terpakai {rupiah(spent)}</span>
        <span>Batas {rupiah(limit)}</span>
      </div>
    </div>
  );
}
