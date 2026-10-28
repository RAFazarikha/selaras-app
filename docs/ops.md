# Operasional Notifikasi Selaras (Discord + Cron)

Langkah ini dilakukan di Dashboard / CLI Supabase. Tidak menyimpan secret di repositori.

## 1. Environment Secrets

Pasang rahasia di Supabase CLI (lokal atau cloud):

```bash
bunx supabase secrets set WEBHOOK_SECRET="<buat_acak_32_karakter>"
```

Generate secret acak:
```bash
openssl rand -hex 16
```

## 2. Database Webhook (Transaksi Baru & Ambang)

Di Supabase Dashboard:
1. Masuk ke **Database** -> **Webhooks**.
2. Klik **Create a new webhook**:
   - **Name**: `on_transaction_insert`
   - **Table**: `public.transactions`
   - **Events**: centang hanya `INSERT`
   - **Type**: `Supabase Edge Functions`
   - **Edge Function**: pilih `notify`
   - **HTTP Headers**:
     - Key: `x-webhook-secret`
     - Value: `<nilai WEBHOOK_SECRET di atas>`
3. Simpan.

Setiap transaksi baru yang dicatat akan memicu fungsi `notify` untuk:
- Mengirim pesan transaksi ke Discord pemilik.
- Memeriksa ambang 80% dan 100% (dikirim maksimal 1x per ambang via tabel `notification_log`).
- Memeriksa apakah transaksi hari itu melebihi jatah harian (transaksi besar, dikirim 1x per hari).

## 3. Cron Terjadwal (Ringkasan Harian 21:00 WIB)

Jalankan perintah SQL ini di Supabase SQL Editor:

```sql
-- 14:00 UTC = 21:00 WIB
select cron.schedule(
  'selaras-daily-digest',
  '0 14 * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/digest',
    headers := jsonb_build_object(
      'x-webhook-secret', '<nilai WEBHOOK_SECRET di atas>',
      'content-type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Cron ini akan memicu fungsi `digest` untuk:
- Mengirim ringkasan harian (sisa kuota, jatah hari ini, saldo rencana vs aktual) ke Discord.
- Mengirim pengingat H-3 sebelum periode berakhir.
- Mengirim pengingat buat periode baru saat periode kemarin telah berakhir.
