-- Hasil advisor keamanan: kunci search_path trigger dan cabut akses anon dari helper RLS.
alter function public.enforce_max_members() set search_path = '';
alter function public.enforce_tx_in_period() set search_path = '';
alter function public.enforce_item_rules() set search_path = '';

revoke execute on function public.is_workspace_member(uuid), public.owns_period(uuid), public.can_see_period(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid), public.owns_period(uuid), public.can_see_period(uuid) to authenticated;
