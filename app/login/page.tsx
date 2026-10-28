"use client";

import { useActionState, useState } from "react";
import { sendMagicLink, signInPassword, signUp } from "./actions";
import { Spinner } from "@/components/ui/spinner";
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Send,
  User,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

type AuthTab = "password" | "magic" | "signup";

export default function LoginPage() {
  const [tab, setTab] = useState<AuthTab>("password");
  const [showPassword, setShowPassword] = useState(false);

  const [pwState, pwAction, pwPending] = useActionState(signInPassword, {});
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, {});
  const [regState, regAction, regPending] = useActionState(signUp, {});

  return (
    <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between px-4 py-6">
      {/* Top Status Bar */}
      <header className="w-full flex items-center justify-between pb-3">
        <div className="flex items-center gap-1.5 text-xs text-[#4a4455] font-medium tracking-tight">
          <span>ID • IDR</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#006544]" />
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[11px] font-semibold text-[#6d28d9]">
          <span>Executive Edition</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center flex-1 justify-center my-4">
        {/* Top Hero Branding */}
        <section className="w-full flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-[#6d28d9]/25 blur-xl scale-125" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#8455ef] flex items-center justify-center specular-border shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
              <div className="absolute top-1 left-1 right-1 h-1/2 bg-white/20 rounded-t-xl pointer-events-none" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight mb-1.5">
            Kelola Keuangan Lebih Selaras
          </h1>
          <p className="text-sm text-[#4a4455] max-w-[290px] leading-relaxed">
            Presisi spreadsheet berbalut estetika executive iOS.
          </p>
        </section>

        {/* Central Frosted Bento Card */}
        <section className="w-full rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-5 specular-border shadow-xl">
          {/* Segmented iOS Segment Pill Control */}
          <div className="w-full p-1 bg-[#eff4ff] rounded-full flex items-center justify-between mb-5 border border-[#ccc3d7]/30">
            <button
              type="button"
              onClick={() => setTab("password")}
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-semibold transition-all text-center ${
                tab === "password"
                  ? "bg-white text-[#6d28d9] shadow-sm"
                  : "text-[#4a4455] hover:text-[#0b1c30]"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setTab("magic")}
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-semibold transition-all text-center truncate ${
                tab === "magic"
                  ? "bg-white text-[#6d28d9] shadow-sm"
                  : "text-[#4a4455] hover:text-[#0b1c30]"
              }`}
            >
              Tautan Email
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-semibold transition-all text-center ${
                tab === "signup"
                  ? "bg-white text-[#6d28d9] shadow-sm"
                  : "text-[#4a4455] hover:text-[#0b1c30]"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Tab 1: Masuk dengan Password */}
          {tab === "password" && (
            <form action={pwAction} className="w-full space-y-3.5">
              <div>
                <label
                  htmlFor="pw-email"
                  className="block text-xs font-semibold text-[#4a4455] mb-1 ml-1"
                >
                  Email Akun
                </label>
                <div className="relative flex items-center rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 transition-all input-ambient-glow">
                  <Mail className="w-4 h-4 text-[#7b7486] mr-2 shrink-0" />
                  <input
                    id="pw-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    required
                    className="w-full bg-transparent border-0 p-0 text-sm text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="pw-pass"
                  className="block text-xs font-semibold text-[#4a4455] mb-1 ml-1"
                >
                  Kata Sandi
                </label>
                <div className="relative flex items-center rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 transition-all input-ambient-glow">
                  <Lock className="w-4 h-4 text-[#7b7486] mr-2 shrink-0" />
                  <input
                    id="pw-pass"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-transparent border-0 p-0 text-sm text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:ring-0 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Tampilkan sandi"
                    className="text-[#7b7486] hover:text-[#0b1c30] p-0.5 ml-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {pwState.error && (
                <p role="alert" className="text-xs font-medium text-[#ba1a1a] px-1">
                  {pwState.error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwPending}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#6d28d9] to-[#8455ef] text-white text-sm font-semibold flex items-center justify-center gap-2 primary-btn-glow active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {pwPending ? (
                    <>
                      <Spinner className="w-4 h-4 text-white" />
                      <span>Memverifikasi…</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Selaras</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Masuk via Magic Link */}
          {tab === "magic" && (
            <form action={magicAction} className="w-full space-y-3.5">
              <div>
                <label
                  htmlFor="magic-email"
                  className="block text-xs font-semibold text-[#4a4455] mb-1 ml-1"
                >
                  Email Anda
                </label>
                <div className="relative flex items-center rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 transition-all input-ambient-glow">
                  <Send className="w-4 h-4 text-[#7b7486] mr-2 shrink-0" />
                  <input
                    id="magic-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    required
                    className="w-full bg-transparent border-0 p-0 text-sm text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:ring-0 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#4a4455] mt-1.5 ml-1">
                  Kami akan mengirimkan tautan masuk instan tanpa perlu kata sandi.
                </p>
              </div>

              {magicState.error && (
                <p role="alert" className="text-xs font-medium text-[#ba1a1a] px-1">
                  {magicState.error}
                </p>
              )}
              {magicState.info && (
                <p role="status" className="text-xs font-medium text-[#006544] px-1">
                  {magicState.info}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={magicPending}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#6d28d9] to-[#8455ef] text-white text-sm font-semibold flex items-center justify-center gap-2 primary-btn-glow active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {magicPending ? (
                    <>
                      <Spinner className="w-4 h-4 text-white" />
                      <span>Mengirim tautan…</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Tautan Masuk</span>
                      <Mail className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Pendaftaran Akun Baru */}
          {tab === "signup" && (
            <form action={regAction} className="w-full space-y-3.5">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-[#4a4455] mb-1 ml-1"
                >
                  Nama Panggilan
                </label>
                <div className="relative flex items-center rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 transition-all input-ambient-glow">
                  <User className="w-4 h-4 text-[#7b7486] mr-2 shrink-0" />
                  <input
                    id="reg-name"
                    name="name"
                    autoComplete="nickname"
                    placeholder="mis. Rakha"
                    required
                    className="w-full bg-transparent border-0 p-0 text-sm text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[#4a4455] mb-1 ml-1"
                >
                  Email
                </label>
                <div className="relative flex items-center rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 transition-all input-ambient-glow">
                  <Mail className="w-4 h-4 text-[#7b7486] mr-2 shrink-0" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    required
                    className="w-full bg-transparent border-0 p-0 text-sm text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-pass"
                  className="block text-xs font-semibold text-[#4a4455] mb-1 ml-1"
                >
                  Kata Sandi (min. 8 karakter)
                </label>
                <div className="relative flex items-center rounded-2xl bg-white/95 border border-[#ccc3d7]/60 px-3 py-2.5 transition-all input-ambient-glow">
                  <Lock className="w-4 h-4 text-[#7b7486] mr-2 shrink-0" />
                  <input
                    id="reg-pass"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    required
                    minLength={8}
                    className="w-full bg-transparent border-0 p-0 text-sm text-[#0b1c30] placeholder:text-[#7b7486]/70 focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              {regState.error && (
                <p role="alert" className="text-xs font-medium text-[#ba1a1a] px-1">
                  {regState.error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regPending}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#6d28d9] to-[#8455ef] text-white text-sm font-semibold flex items-center justify-center gap-2 primary-btn-glow active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {regPending ? (
                    <>
                      <Spinner className="w-4 h-4 text-white" />
                      <span>Mendaftarkan…</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Akun Selaras</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Institutional Trust Micro-Badge */}
          <div className="mt-5 pt-3 border-t border-[#ccc3d7]/25 flex items-center justify-between text-xs text-[#4a4455]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#006544]" />
              <span>Workspace Berdua Terenkripsi</span>
            </span>
            <span className="text-[#7b7486] text-[11px]">v4.8.2 Sequoia</span>
          </div>
        </section>
      </main>

      {/* Bottom Security & Privacy Pill */}
      <footer className="w-full flex flex-col items-center pb-2 pt-3">
        <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-sm text-xs text-[#4a4455]">
          <LockKeyhole className="w-3.5 h-3.5 text-[#006544]" />
          <span>Enkripsi data keuangan end-to-end terproteksi</span>
        </div>
      </footer>
    </div>
  );
}
