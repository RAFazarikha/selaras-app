"use client";

import { useActionState, useState } from "react";
import { sendMagicLink, signInPassword, signUp } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
        <span className="text-sm font-bold text-foreground">Selaras</span>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center flex-1 justify-center my-4">
        {/* Top Hero Branding */}
        <section className="w-full flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center specular-border shadow-lg">
              <Wallet aria-hidden="true" className="w-8 h-8 text-white" />
                          </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
            Kelola Keuangan Lebih Selaras
          </h1>
          <p className="text-sm text-muted-foreground max-w-[290px] leading-relaxed">
            Catat pengeluaran harian dan pantau sisa anggaran berdua.
          </p>
        </section>

        {/* Central Frosted Bento Card */}
        <section className="w-full rounded-3xl bg-white border border-surface-high p-5 specular-border shadow-xl">
          {/* Segmented iOS Segment Pill Control */}
          <div role="tablist" aria-label="Metode masuk" className="w-full p-1 bg-muted rounded-full flex items-center justify-between mb-5 border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setTab("password")}
              role="tab"
              aria-selected={tab === "password"}
              className={`flex-1 min-h-11 px-2 rounded-full text-sm font-semibold transition-all text-center ${
                tab === "password"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setTab("magic")}
              role="tab"
              aria-selected={tab === "magic"}
              className={`flex-1 min-h-11 px-2 rounded-full text-sm font-semibold transition-all text-center truncate ${
                tab === "magic"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tautan Email
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              role="tab"
              aria-selected={tab === "signup"}
              className={`flex-1 min-h-11 px-2 rounded-full text-sm font-semibold transition-all text-center ${
                tab === "signup"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Tab 1: Masuk dengan Password */}
          {tab === "password" && (
            <form action={pwAction} className="w-full space-y-3.5">
              <div>
                <Label
                  htmlFor="pw-email"
                  className="block text-xs font-semibold text-muted-foreground mb-1 ml-1"
                >
                  Email Akun
                </Label>
                <div className="relative">
<Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
<Input
                    id="pw-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    required
                   className="pl-9" />
</div>
              </div>

              <div>
                <Label
                  htmlFor="pw-pass"
                  className="block text-xs font-semibold text-muted-foreground mb-1 ml-1"
                >
                  Kata Sandi
                </Label>
                <div className="relative">
<Lock aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
<Input
                    id="pw-pass"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    required
                   className="pl-9 pr-12" />
                  <button className="absolute right-1 top-1/2 size-11 -translate-y-1/2 rounded-xl flex items-center justify-center text-outline hover:text-foreground"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true"  />
                    ) : (
                      <Eye aria-hidden="true"  />
                    )}
                  </button>
</div>
              </div>

              {pwState.error && (
                <p role="alert" className="text-xs font-medium text-destructive px-1">
                  {pwState.error}
                </p>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={pwPending} variant="brand" size="lg" className="w-full rounded-2xl">
                  {pwPending ? (
                    <>
                      <Spinner className="w-4 h-4 text-white" />
                      <span>Memverifikasi…</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Selaras</span>
                      <ArrowRight aria-hidden="true" className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Tab 2: Masuk via Magic Link */}
          {tab === "magic" && (
            <form action={magicAction} className="w-full space-y-3.5">
              <div>
                <Label
                  htmlFor="magic-email"
                  className="block text-xs font-semibold text-muted-foreground mb-1 ml-1"
                >
                  Email Anda
                </Label>
                <div className="relative">
<Send aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
<Input
                    id="magic-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    required
                   className="pl-9" />
</div>
                <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                  Kami akan mengirimkan tautan masuk instan tanpa perlu kata sandi.
                </p>
              </div>

              {magicState.error && (
                <p role="alert" className="text-xs font-medium text-destructive px-1">
                  {magicState.error}
                </p>
              )}
              {magicState.info && (
                <p role="status" className="text-xs font-medium text-tertiary-container px-1">
                  {magicState.info}
                </p>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={magicPending} variant="brand" size="lg" className="w-full rounded-2xl">
                  {magicPending ? (
                    <>
                      <Spinner className="w-4 h-4 text-white" />
                      <span>Mengirim tautan…</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Tautan Masuk</span>
                      <Mail aria-hidden="true" className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Tab 3: Pendaftaran Akun Baru */}
          {tab === "signup" && (
            <form action={regAction} className="w-full space-y-3.5">
              <div>
                <Label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-muted-foreground mb-1 ml-1"
                >
                  Nama Panggilan
                </Label>
                <div className="relative">
<User aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
<Input
                    id="reg-name"
                    name="name"
                    autoComplete="nickname"
                    placeholder="mis. Rakha"
                    required
                   className="pl-9" />
</div>
              </div>

              <div>
                <Label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-muted-foreground mb-1 ml-1"
                >
                  Email
                </Label>
                <div className="relative">
<Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
<Input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    required
                   className="pl-9" />
</div>
              </div>

              <div>
                <Label
                  htmlFor="reg-pass"
                  className="block text-xs font-semibold text-muted-foreground mb-1 ml-1"
                >
                  Kata Sandi (min. 8 karakter)
                </Label>
                <div className="relative">
<Lock aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
<Input
                    id="reg-pass"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    required
                    minLength={8}
                   className="pl-9" />
</div>
              </div>

              {regState.error && (
                <p role="alert" className="text-xs font-medium text-destructive px-1">
                  {regState.error}
                </p>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={regPending} variant="brand" size="lg" className="w-full rounded-2xl">
                  {regPending ? (
                    <>
                      <Spinner className="w-4 h-4 text-white" />
                      <span>Mendaftarkan…</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Akun Selaras</span>
                      <ArrowRight aria-hidden="true" className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Institutional Trust Micro-Badge */}
          <div className="mt-5 pt-3 border-t border-outline-variant/25 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="w-4 h-4 text-tertiary-container" />
              <span>Data hanya terlihat oleh kalian berdua</span>
            </span>
            
          </div>
        </section>
      </main>

      {/* Bottom Security & Privacy Pill */}
      <footer className="w-full flex flex-col items-center pb-2 pt-3">
        <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white border border-surface-high text-xs text-muted-foreground">
          <LockKeyhole aria-hidden="true" className="w-3.5 h-3.5 text-tertiary-container" />
          <span>Koneksi dilindungi HTTPS</span>
        </div>
      </footer>
    </div>
  );
}
