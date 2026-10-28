import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RouteProgress } from "@/components/route-progress";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Selaras — Pencatat Anggaran Harian",
  description: "Catat pengeluaran harian dan pantau sisa anggaran berdua.",
  appleWebApp: { capable: true, title: "Selaras", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#6d28d9", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-foreground selection:bg-primary selection:text-white relative">
        <RouteProgress />
        <Toaster position="top-center" />
        <div className="relative z-10 flex-1 flex flex-col animate-in fade-in duration-200">{children}</div>
      </body>
    </html>
  );
}
