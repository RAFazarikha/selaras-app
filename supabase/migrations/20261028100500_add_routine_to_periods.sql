-- Tambah field alokasi rutin mingguan (BBM) ke tabel periods
alter table public.periods
  add column if not exists routine_amount bigint not null default 50000 check (routine_amount >= 0),
  add column if not exists routine_day smallint not null default 1 check (routine_day between 0 and 6); -- 0: Minggu, 1: Senin, dst.
