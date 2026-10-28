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
      className="fixed bottom-4 inset-x-0 z-50 flex justify-around items-center px-2 py-1.5 max-w-[320px] mx-auto rounded-full bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_36px_-6px_rgba(109,40,217,0.18)]"
    >
      {/* Tab 1: Ringkasan */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all duration-150 active:scale-95 ${
          isSummary
            ? "bg-[#6d28d9] text-white shadow-sm"
            : "text-[#4a4455] hover:text-[#6d28d9]"
        }`}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5">Ringkasan</span>
      </Link>

      {/* Tab 2: Analitik */}
      <Link
        href="/analytics"
        className={`flex flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all duration-150 active:scale-95 ${
          isAnalytics
            ? "bg-[#6d28d9] text-white shadow-sm"
            : "text-[#4a4455] hover:text-[#6d28d9]"
        }`}
      >
        <LineChart className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5">Analitik</span>
      </Link>

      {/* Tab 3: Pengaturan */}
      <Link
        href="/settings"
        className={`flex flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all duration-150 active:scale-95 ${
          isSettings
            ? "bg-[#6d28d9] text-white shadow-sm"
            : "text-[#4a4455] hover:text-[#6d28d9]"
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5">Pengaturan</span>
      </Link>
    </nav>
  );
}
