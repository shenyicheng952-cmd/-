create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('todo', 'inspo')),
  content text not null check (char_length(trim(content)) > 0),
  source text check (source in ('wechat', 'douyin', 'xhs', 'web')),
  source_url text,
  source_name text,
  due_date date,
  created_at timestamptz not null default now(),
  done_at timestamptz
);

create index if not exists tasks_user_type_due_idx
  on public.tasks (user_id, type, due_date, created_at desc);

alter table public.tasks enable row level security;

create policy "Users can read their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);
