-- 在 Supabase 的 SQL Editor 里整段粘贴并运行一次

create table if not exists public.days (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day text not null,
  orders jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table if not exists public.config (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.days enable row level security;
alter table public.config enable row level security;

drop policy if exists "own days" on public.days;
create policy "own days" on public.days for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own config" on public.config;
create policy "own config" on public.config for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 让多台设备实时同步（如果这两行提示已存在，可以忽略）
alter publication supabase_realtime add table public.days;
alter publication supabase_realtime add table public.config;
