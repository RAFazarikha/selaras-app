-- 1. Max 2 anggota per workspace
create function public.enforce_max_members() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.workspace_members where workspace_id = new.workspace_id) >= 2 then
    raise exception 'workspace sudah berisi 2 anggota' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger trg_max_members before insert on public.workspace_members
  for each row execute function public.enforce_max_members();

-- 2. Transaksi harus di dalam rentang periode
create function public.enforce_tx_in_period() returns trigger
language plpgsql as $$
declare p public.periods;
begin
  select * into p from public.periods where id = new.period_id;
  if new.transaction_date < p.start_date or new.transaction_date > p.end_date then
    raise exception 'tanggal transaksi di luar rentang periode' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger trg_tx_in_period before insert or update on public.transactions
  for each row execute function public.enforce_tx_in_period();

-- 3. Alokasi manual: di dalam periode dan total <= batas
create function public.enforce_item_rules() returns trigger
language plpgsql as $$
declare p public.periods; total bigint;
begin
  select * into p from public.periods where id = new.period_id;
  if new.planned_date < p.start_date or new.planned_date > p.end_date then
    raise exception 'tanggal alokasi di luar rentang periode' using errcode = 'P0001';
  end if;
  select coalesce(sum(amount),0) into total from public.planned_items
    where period_id = new.period_id and id is distinct from new.id;
  if total + new.amount > p.planned_expense_limit then
    raise exception 'total alokasi manual melebihi batas pengeluaran' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger trg_item_rules before insert or update on public.planned_items
  for each row execute function public.enforce_item_rules();

-- 4. Helper RLS (security definer supaya tidak rekursif)
create function public.is_workspace_member(ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.workspace_members where workspace_id = ws and user_id = auth.uid())
$$;
create function public.owns_period(pid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.periods where id = pid and owner_id = auth.uid())
$$;
create function public.can_see_period(pid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.periods p
    where p.id = pid and (p.owner_id = auth.uid()
      or (p.visibility = 'shared' and public.is_workspace_member(p.workspace_id)))
  )
$$;

-- 5. Fungsi server untuk workspace dan undangan
create function public.create_workspace(ws_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare wid uuid;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  insert into public.workspaces (name, created_by) values (ws_name, auth.uid()) returning id into wid;
  insert into public.workspace_members (workspace_id, user_id, role) values (wid, auth.uid(), 'owner');
  return wid;
end $$;

create function public.create_invite(ws uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  if not exists (select 1 from public.workspace_members
                 where workspace_id = ws and user_id = auth.uid() and role = 'owner') then
    raise exception 'hanya owner yang boleh membuat undangan';
  end if;
  c := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  insert into public.workspace_invites (workspace_id, code, expires_at)
    values (ws, c, now() + interval '48 hours');
  return c;
end $$;

create function public.redeem_invite(invite_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare inv public.workspace_invites;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  select * into inv from public.workspace_invites where code = invite_code for update;
  if not found then raise exception 'kode tidak valid'; end if;
  if inv.used_at is not null then raise exception 'kode sudah dipakai'; end if;
  if inv.expires_at < now() then raise exception 'kode kedaluwarsa'; end if;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (inv.workspace_id, auth.uid(), 'member');   -- trigger max 2 + unique(user_id) menjaga
  update public.workspace_invites set used_at = now(), used_by = auth.uid() where id = inv.id;
  return inv.workspace_id;
end $$;

revoke all on function public.create_workspace(text), public.create_invite(uuid), public.redeem_invite(text) from public, anon;
grant execute on function public.create_workspace(text), public.create_invite(uuid), public.redeem_invite(text) to authenticated;
