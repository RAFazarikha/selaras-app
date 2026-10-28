import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { InviteButton } from "./invite";
import { DiscordForm } from "./notif-form";
import {
  Settings,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Table2,
  Calculator,
  Fuel,
  Coins,
} from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: members } = await supabase
    .from("workspace_members")
    .select("user_id, role");

  const { data: dc } = await supabase
    .from("notification_settings")
    .select("destination")
    .eq("channel", "discord")
    .limit(1)
    .maybeSingle();

  const me = members?.find((m) => m.user_id === user?.id);
  const memberCount = members?.length ?? 0;
  const isFull = memberCount >= 2;

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-2 space-y-4">
      {/* Top Header */}
      <header className="flex justify-between items-center py-2 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-primary">
            <Settings aria-hidden="true" className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Pengaturan</h1>
        </div>

      </header>

      {/* Subheader Intro */}
      <div className="px-1">
        <p className="text-sm text-muted-foreground">
          Atur pasangan, notifikasi Discord, dan akun.
        </p>
      </div>

      {/* BENTO CARD 1: Workspace & Kolaborasi */}
      <section className="glass-tile rounded-3xl p-5 relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-accent flex items-center justify-center text-primary shadow-inner">
              <Building2 aria-hidden="true" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Workspace Berdua</h2>
              <p className="text-xs text-muted-foreground">Anggaran dipakai berdua</p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-surface-highest text-xs font-semibold text-primary">
            <Users aria-hidden="true" className="w-3.5 h-3.5 mr-0.5" />
            <span>{memberCount}/2 anggota</span>
          </div>
        </div>

        {/* Members Sub-grid */}
        <div className="space-y-2">
          {/* Current User */}
          <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-2xl border border-surface-high">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userName[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">{userName}</span>
                  <span className="px-1.5 py-0.2 rounded text-xs font-bold bg-primary/10 text-primary uppercase">
                    {me?.role === "owner" ? "Owner" : "Member"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{user?.email} (Anda)</span>
              </div>
            </div>
            <ShieldCheck aria-hidden="true" className="w-4 h-4 text-tertiary-container" />
          </div>

          {/* Partner Slot or Available Slot */}
          {isFull ? (
            <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-2xl border border-surface-high">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">Pasangan</span>
                    <span className="px-1.5 py-0.2 rounded text-xs font-bold bg-secondary/10 text-secondary uppercase">
                      Member
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Terkoneksi ke Workspace</span>
                </div>
              </div>
              <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-tertiary-container" />
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 bg-muted/60 rounded-2xl border border-dashed border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-dashed border-outline flex items-center justify-center bg-white/40 text-outline">
                  <UserPlus aria-hidden="true" className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Slot Pasangan Tersedia</span>
                  <p className="text-xs text-muted-foreground">Gunakan kode undangan di bawah</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invite Button (Owner only, if not full) */}
        {me?.role === "owner" && !isFull && <InviteButton />}
        {isFull && (
          <p className="text-xs text-tertiary-container font-medium text-center">
            Workspace sudah lengkap (2/2 anggota).
          </p>
        )}
      </section>

      {/* BENTO CARD 2: Webhook Notifikasi (Discord) */}
      <DiscordForm hint={dc?.destination ? dc.destination.slice(-6) : null} />

      {/* BENTO CARD 3: Pengaturan Hitungan & Tampilan */}
      <section className="glass-tile rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-accent flex items-center justify-center text-primary shadow-inner">
            <Table2 aria-hidden="true" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Pengaturan Hitungan</h2>
            <p className="text-xs text-muted-foreground">Cara anggaran dihitung</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-2xl border border-surface-high">
            <div className="flex items-center gap-2.5">
              <Calculator aria-hidden="true" className="w-4 h-4 text-primary" />
              <div>
                <span className="font-semibold text-foreground block">Pembulatan Budget Harian</span>
                <span className="text-xs text-muted-foreground">Dibulatkan ke bawah per Rp 100</span>
              </div>
            </div>
            <span className="font-bold text-primary bg-muted px-2 py-0.5 rounded-lg border border-surface-highest">
              Rp 100
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-2xl border border-surface-high">
            <div className="flex items-center gap-2.5">
              <Fuel aria-hidden="true" className="w-4 h-4 text-primary" />
              <div>
                <span className="font-semibold text-foreground block">Jadwal Alokasi BBM Rutin</span>
                <span className="text-xs text-muted-foreground">Pengeluaran BBM tiap minggu</span>
              </div>
            </div>
            <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-surface-highest">
              Setiap Senin
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-2xl border border-surface-high">
            <div className="flex items-center gap-2.5">
              <Coins aria-hidden="true" className="w-4 h-4 text-primary" />
              <div>
                <span className="font-semibold text-foreground block">Mata Uang Utama</span>
                <span className="text-xs text-muted-foreground">Rupiah Indonesia</span>
              </div>
            </div>
            <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-surface-highest">
              IDR (Rp)
            </span>
          </div>
        </div>
      </section>

      {/* BENTO CARD 4: Akun & Sesi Keamanan */}
      <section className="glass-tile rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Akun & Sesi</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="min-h-11 px-4 rounded-full border border-destructive/30 text-destructive hover:bg-rose-50 text-sm font-semibold transition-all active:scale-95"
            >
              Keluar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
