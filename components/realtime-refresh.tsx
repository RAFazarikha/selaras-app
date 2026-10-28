"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RealtimeRefresh({ periodId }: { periodId: string }) {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    const refresh = () => router.refresh();
    const ch = supabase
      .channel(`period-${periodId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `period_id=eq.${periodId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "planned_items", filter: `period_id=eq.${periodId}` }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [periodId, router]);
  return null;
}
