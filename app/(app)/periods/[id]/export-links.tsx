export function ExportLinks({ periodId }: { periodId: string }) {
  const btn = "inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-accent";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Unduh data:</span>
      <a href={`/export?period=${periodId}&format=csv`} className={btn} download>CSV</a>
      <a href={`/export?period=${periodId}&format=json`} className={btn} download>JSON</a>
    </div>
  );
}
