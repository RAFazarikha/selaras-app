create extension if not exists btree_gist;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','member')),
  primary key (workspace_id, user_id),
  unique (user_id)  -- satu user, satu workspace
);

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.periods (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  start_date date not null,
  end_date date not null,
  initial_balance bigint not null check (initial_balance >= 0),
  planned_expense_limit bigint not null check (planned_expense_limit >= 0),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  created_at timestamptz not null default now(),
  check (end_date >= start_date),
  exclude using gist (owner_id with =, daterange(start_date, end_date, '[]') with &&)
);

create table public.planned_items (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.periods(id) on delete cascade,
  planned_date date not null,
  amount bigint not null check (amount > 0),
  label text not null check (length(trim(label)) > 0),
  category_id uuid references public.categories(id),
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.periods(id) on delete cascade,
  type text not null check (type in ('expense','income')),
  amount bigint not null check (amount > 0),
  category_id uuid references public.categories(id),
  note text,
  transaction_date date not null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create index on public.transactions (period_id, transaction_date);
create index on public.planned_items (period_id, planned_date);

create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  channel text not null check (channel in ('discord','email')),
  destination text not null,   -- URL webhook Discord (RAHASIA) atau alamat email
  event text not null check (event in ('transaction','threshold','big','digest','reminder')),
  enabled boolean not null default true,
  unique (user_id, channel, event)
);

create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.periods(id) on delete cascade,
  kind text not null,
  sent_at timestamptz not null default now(),
  unique (period_id, kind)
);
