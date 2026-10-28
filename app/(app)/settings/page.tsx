import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { InviteButton } from "./invite";
import { DiscordForm } from "./notif-form";

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
      <header className="flex justify-between items-center py-2 border-b border-[#e5eeff]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#e9ddff] flex items-center justify-center text-[#6d28d9]">
            <span className="material-symbols-outlined text-[15px]">settings</span>
          </div>
          <span className="text-base font-bold text-[#0b1c30]">Pengaturan</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#006544]/10 border border-[#4edea3]/40 text-[11px] font-semibold text-[#006544]">
          <span className="w-2 h-2 rounded-full bg-[#006544] animate-pulse" />
          <span>Aktif</span>
        </div>
      </header>

      {/* Subheader Intro */}
      <div className="px-1">
        <span className="text-[10px] text-[#6d28d9] font-bold uppercase tracking-wider">
          Arsitektur Workspace
        </span>
        <p className="text-xs text-[#4a4455] mt-0.5">
          Konfigurasi sinkronisasi, kolaborator, dan automasi ledger.
        </p>
      </div>

      {/* BENTO CARD 1: Workspace & Kolaborasi */}
      <section className="glass-tile rounded-3xl p-5 relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#e9ddff] flex items-center justify-center text-[#6d28d9] shadow-inner">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0b1c30]">Workspace Berdua</h2>
              <p className="text-[11px] text-[#4a4455]">Sinkronisasi Multi-Entitas</p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] border border-[#d3e4fe] text-[11px] font-semibold text-[#6d28d9]">
            <span className="material-symbols-outlined text-[14px]">group</span>
            <span>{memberCount}/2 anggota</span>
          </div>
        </div>

        {/* Members Sub-grid */}
        <div className="space-y-2">
          {/* Current User */}
          <div className="flex items-center justify-between p-2.5 bg-white/90 rounded-2xl border border-white/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#8455ef] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userName[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#0b1c30]">{userName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#6d28d9]/10 text-[#6d28d9] uppercase">
                    {me?.role === "owner" ? "Owner" : "Member"}
                  </span>
                </div>
                <span className="text-[10px] text-[#4a4455]">{user?.email} (Anda)</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#006544] text-[18px]">verified_user</span>
          </div>

          {/* Partner Slot or Available Slot */}
          {isFull ? (
            <div className="flex items-center justify-between p-2.5 bg-white/90 rounded-2xl border border-white/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8455ef] to-[#d3bbff] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#0b1c30]">Pasangan</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#8455ef]/10 text-[#8455ef] uppercase">
                      Member
                    </span>
                  </div>
                  <span className="text-[10px] text-[#4a4455]">Terkoneksi ke Workspace</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#006544] text-[18px]">check_circle</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 bg-[#eff4ff]/60 rounded-2xl border border-dashed border-[#ccc3d7]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-dashed border-[#7b7486] flex items-center justify-center bg-white/40 text-[#7b7486]">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#4a4455]">Slot Pasangan Tersedia</span>
                  <p className="text-[10px] text-[#7b7486]">Gunakan kode undangan di bawah</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invite Button (Owner only, if not full) */}
        {me?.role === "owner" && !isFull && <InviteButton />}
        {isFull && (
          <p className="text-[11px] text-[#006544] font-medium text-center">
            Workspace sudah lengkap (2/2 anggota).
          </p>
        )}
      </section>

      {/* BENTO CARD 2: Webhook Notifikasi (Discord) */}
      <DiscordForm hint={dc?.destination ? dc.destination.slice(-6) : null} />

      {/* BENTO CARD 3: Preferensi Spreadsheet & Tampilan */}
      <section className="glass-tile rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#e9ddff] flex items-center justify-center text-[#6d28d9] shadow-inner">
            <span className="material-symbols-outlined text-[20px]">table_chart</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0b1c30]">Preferensi Spreadsheet</h2>
            <p className="text-[11px] text-[#4a4455]">Kalkulasi & Format Finansial</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-white/80 rounded-2xl border border-white/60">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#6d28d9] text-[18px]">calculate</span>
              <div>
                <span className="font-semibold text-[#0b1c30] block">Pembulatan Budget Harian</span>
                <span className="text-[10px] text-[#4a4455]">Lining arithmetic otomatis</span>
              </div>
            </div>
            <span className="font-bold text-[#6d28d9] bg-[#eff4ff] px-2 py-0.5 rounded-lg border border-[#d3e4fe]">
              Rp 100
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white/80 rounded-2xl border border-white/60">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#6d28d9] text-[18px]">local_gas_station</span>
              <div>
                <span className="font-semibold text-[#0b1c30] block">Jadwal Alokasi BBM Rutin</span>
                <span className="text-[10px] text-[#4a4455]">Siklus pengisian mingguan</span>
              </div>
            </div>
            <span className="font-semibold text-[#0b1c30] bg-[#eff4ff] px-2 py-0.5 rounded-lg border border-[#d3e4fe]">
              Setiap Senin
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white/80 rounded-2xl border border-white/60">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#6d28d9] text-[18px]">payments</span>
              <div>
                <span className="font-semibold text-[#0b1c30] block">Mata Uang Utama</span>
                <span className="text-[10px] text-[#4a4455]">ISO 4217 Rupiah Indonesia</span>
              </div>
            </div>
            <span className="font-semibold text-[#0b1c30] bg-[#eff4ff] px-2 py-0.5 rounded-lg border border-[#d3e4fe]">
              IDR (Rp)
            </span>
          </div>
        </div>
      </section>

      {/* BENTO CARD 4: Akun & Sesi Keamanan */}
      <section className="glass-tile rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0b1c30]">Akun & Sesi</h2>
            <p className="text-[11px] text-[#4a4455]">{user?.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="py-1.5 px-3 rounded-full border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-rose-50 text-xs font-semibold transition-all active:scale-95"
            >
              Keluar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
