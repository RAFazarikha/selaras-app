begin;
select plan(7);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'a@t.test'),
  ('00000000-0000-0000-0000-0000000000b2', 'b@t.test'),
  ('00000000-0000-0000-0000-0000000000c3', 'c@t.test');
insert into public.workspaces (id, name, created_by) values
  ('00000000-0000-0000-0000-00000000aaaa', 'W', '00000000-0000-0000-0000-0000000000a1');
insert into public.workspace_members values
  ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-0000000000a1', 'owner');
insert into public.workspace_invites (workspace_id, code, expires_at) values
  ('00000000-0000-0000-0000-00000000aaaa', 'okcode', now() + interval '1 hour'),
  ('00000000-0000-0000-0000-00000000aaaa', 'oldcode', now() - interval '1 hour'),
  ('00000000-0000-0000-0000-00000000aaaa', 'code3', now() + interval '1 hour');

-- bertindak sebagai B
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select throws_ok($$select public.redeem_invite('oldcode')$$, 'kode kedaluwarsa', 'kode kedaluwarsa ditolak');
select lives_ok($$select public.redeem_invite('okcode')$$, 'kode valid diterima');
select throws_ok($$select public.redeem_invite('okcode')$$, 'kode sudah dipakai', 'kode sekali pakai');

-- C ditolak: workspace sudah 2 anggota
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c3","role":"authenticated"}', true);
select throws_ok($$select public.redeem_invite('code3')$$, 'workspace sudah berisi 2 anggota', 'anggota ke-3 ditolak');

-- A membuat periode private; overlap ditolak
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
insert into public.periods (id, workspace_id, name, start_date, end_date, initial_balance, planned_expense_limit, visibility)
  values ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-00000000aaaa', 'P1', '2026-11-01', '2026-11-10', 0, 1000, 'private');
select throws_ok(
  $$insert into public.periods (workspace_id, name, start_date, end_date, initial_balance, planned_expense_limit)
    values ('00000000-0000-0000-0000-00000000aaaa', 'P2', '2026-11-10', '2026-11-20', 0, 1000)$$,
  '23P01', null, 'periode beririsan ditolak');

select throws_ok(
  $$insert into public.transactions (period_id, type, amount, transaction_date)
    values ('00000000-0000-0000-0000-0000000000f1', 'expense', 10, '2026-12-01')$$,
  'tanggal transaksi di luar rentang periode', 'transaksi luar rentang ditolak');

-- B tidak boleh melihat periode private A
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is((select count(*)::int from public.periods), 0, 'periode private tidak terlihat oleh pasangan');

select * from finish();
rollback;
