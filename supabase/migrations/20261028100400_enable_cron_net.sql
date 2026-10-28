-- Dibutuhkan jadwal digest harian (cron.schedule + net.http_post). Jadwalnya sendiri
-- dibuat manual (berisi secret), lihat docs/ops.md.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
