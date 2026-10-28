import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Selaras — Executive Bento Finance Tracker",
  description: "Presisi spreadsheet berbalut estetika executive iOS.",
  appleWebApp: { capable: true, title: "Selaras", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#6d28d9" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-[#0b1c30] selection:bg-[#6d28d9] selection:text-white relative">
        {/* Ambient Luxury Violet Mesh Background Orbs from Stitch */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-violet-200/45 blur-3xl" />
          <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-blue-100/50 blur-3xl" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
