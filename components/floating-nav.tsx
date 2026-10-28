"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LineChart, Settings } from "lucide-react";

export function FloatingNav() {
  const pathname = usePathname();

  const isAnalytics = pathname === "/analytics" || pathname.includes("/analytics");
  const isSettings = pathname === "/settings" || pathname.startsWith("/settings");
  const isSummary = !isAnalytics && !isSettings;

  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 z-50 flex justify-around items-center px-2 py-1.5 max-w-[320px] mx-auto rounded-full bg-white border border-surface-high shadow-[0_8px_24px_-8px_rgba(11,28,48,0.2)]"
    >
      {/* Tab 1: Ringkasan */}
      <Link
        href="/"
        aria-current={isSummary ? "page" : undefined}
        className={`flex min-h-11 flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all duration-150 active:scale-95 ${
          isSummary
            ? "bg-primary text-white shadow-sm"
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        <Wallet className="w-5 h-5" aria-hidden="true" />
        <span className="text-xs font-semibold mt-0.5">Ringkasan</span>
      </Link>

      {/* Tab 2: Analitik */}
      <Link
        href="/analytics"
        aria-current={isAnalytics ? "page" : undefined}
        className={`flex min-h-11 flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all duration-150 active:scale-95 ${
          isAnalytics
            ? "bg-primary text-white shadow-sm"
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        <LineChart className="w-5 h-5" aria-hidden="true" />
        <span className="text-xs font-semibold mt-0.5">Analitik</span>
      </Link>

      {/* Tab 3: Pengaturan */}
      <Link
        href="/settings"
        aria-current={isSettings ? "page" : undefined}
        className={`flex min-h-11 flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all duration-150 active:scale-95 ${
          isSettings
            ? "bg-primary text-white shadow-sm"
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        <Settings className="w-5 h-5" aria-hidden="true" />
        <span className="text-xs font-semibold mt-0.5">Pengaturan</span>
      </Link>
    </nav>
  );
}
