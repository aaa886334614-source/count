-- 奇門遁甲工作台：profiles / charts / chart_notes + RLS

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chart_type text not null check (chart_type in ('time', 'ke', 'single_palace')),
  title text not null,
  raw_input jsonb not null default '{}'::jsonb,
  normalized_input jsonb not null default '{}'::jsonb,
  calculation_context jsonb not null default '{}'::jsonb,
  chart_snapshot jsonb not null default '{}'::jsonb,
  engine_version text not null default '',
  schema_version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists charts_user_id_created_at_idx
  on public.charts (user_id, created_at desc);

create table if not exists public.chart_notes (
  id uuid primary key default gen_random_uuid(),
  chart_id uuid not null references public.charts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  palace_number int,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chart_notes_chart_id_idx on public.chart_notes (chart_id);

alter table public.profiles enable row level security;
alter table public.charts enable row level security;
alter table public.chart_notes enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- charts
create policy "charts_select_own" on public.charts
  for select using (auth.uid() = user_id);
create policy "charts_insert_own" on public.charts
  for insert with check (auth.uid() = user_id);
create policy "charts_update_own" on public.charts
  for update using (auth.uid() = user_id);
create policy "charts_delete_own" on public.charts
  for delete using (auth.uid() = user_id);

-- chart_notes：須為 chart 擁有者
create policy "chart_notes_select_own" on public.chart_notes
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from public.charts c
      where c.id = chart_notes.chart_id and c.user_id = auth.uid()
    )
  );
create policy "chart_notes_insert_own" on public.chart_notes
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.charts c
      where c.id = chart_notes.chart_id and c.user_id = auth.uid()
    )
  );
create policy "chart_notes_update_own" on public.chart_notes
  for update using (
    auth.uid() = user_id
    and exists (
      select 1 from public.charts c
      where c.id = chart_notes.chart_id and c.user_id = auth.uid()
    )
  );
create policy "chart_notes_delete_own" on public.chart_notes
  for delete using (
    auth.uid() = user_id
    and exists (
      select 1 from public.charts c
      where c.id = chart_notes.chart_id and c.user_id = auth.uid()
    )
  );

comment on table public.charts is '刪除 auth.users 時 CASCADE 刪除盤面與備註';
