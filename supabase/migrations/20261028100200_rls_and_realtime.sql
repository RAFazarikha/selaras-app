alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.categories enable row level security;
alter table public.periods enable row level security;
alter table public.planned_items enable row level security;
alter table public.transactions enable row level security;
alter table public.notification_settings enable row level security;
alter table public.notification_log enable row level security;   -- tanpa policy: hanya service role

create policy ws_select on public.workspaces for select to authenticated
  using (public.is_workspace_member(id));
create policy wm_select on public.workspace_members for select to authenticated
  using (public.is_workspace_member(workspace_id));
create policy inv_select on public.workspace_invites for select to authenticated
  using (exists (select 1 from public.workspace_members m
                 where m.workspace_id = workspace_invites.workspace_id and m.user_id = auth.uid() and m.role = 'owner'));
-- insert/update/delete workspaces, members, invites: hanya lewat fungsi security definer.

create policy cat_all on public.categories for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy ns_all on public.notification_settings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy per_select on public.periods for select to authenticated
  using (owner_id = auth.uid() or (visibility = 'shared' and public.is_workspace_member(workspace_id)));
create policy per_insert on public.periods for insert to authenticated
  with check (owner_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy per_update on public.periods for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy per_delete on public.periods for delete to authenticated
  using (owner_id = auth.uid());

create policy pi_select on public.planned_items for select to authenticated using (public.can_see_period(period_id));
create policy pi_write on public.planned_items for all to authenticated
  using (public.owns_period(period_id)) with check (public.owns_period(period_id));

create policy tx_select on public.transactions for select to authenticated using (public.can_see_period(period_id));
create policy tx_insert on public.transactions for insert to authenticated
  with check (public.owns_period(period_id) and created_by = auth.uid());
create policy tx_update on public.transactions for update to authenticated
  using (public.owns_period(period_id)) with check (public.owns_period(period_id));
create policy tx_delete on public.transactions for delete to authenticated using (public.owns_period(period_id));

alter publication supabase_realtime add table public.periods, public.planned_items, public.transactions;
