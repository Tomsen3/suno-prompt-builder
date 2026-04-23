-- ============================================================
-- Suno Prompt Builder - Supabase Schema
-- Ausfuehren in: Supabase Dashboard -> SQL Editor -> New Query
-- Projekt: cnlgpviurgpxcrjtfxqi
-- ============================================================

-- Dieses Schema passt zur aktuellen App-Logik:
-- keine Anmeldung, anonyme Synchronisation ueber eine lange device_id.

-- 1) PROMPTS: gespeicherte Style- und Lyrics-Prompts
-- ============================================================
create table if not exists public.prompts (
  id            uuid primary key default gen_random_uuid(),
  device_id     text not null,
  name          text not null,
  style_prompt  text not null default '',
  lyrics_prompt text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Migration fuer aeltere Auth-basierte Tabellenstaende.
alter table public.prompts add column if not exists device_id text;
alter table public.prompts alter column device_id set default '';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'prompts'
      and column_name = 'user_id'
  ) then
    alter table public.prompts alter column user_id drop not null;
  end if;
end $$;

create index if not exists prompts_device_id_idx on public.prompts(device_id);
create index if not exists prompts_device_created_idx on public.prompts(device_id, created_at desc);

alter table public.prompts enable row level security;

drop policy if exists "prompts_select" on public.prompts;
drop policy if exists "prompts_insert" on public.prompts;
drop policy if exists "prompts_update" on public.prompts;
drop policy if exists "prompts_delete" on public.prompts;

create policy "prompts_select"
  on public.prompts for select
  using (true);

create policy "prompts_insert"
  on public.prompts for insert
  with check (device_id <> '');

create policy "prompts_update"
  on public.prompts for update
  using (true)
  with check (device_id <> '');

create policy "prompts_delete"
  on public.prompts for delete
  using (true);


-- 2) FAVORITES: gespeicherte Chip-Presets
-- ============================================================
create table if not exists public.favorites (
  id           uuid primary key default gen_random_uuid(),
  device_id    text not null,
  name         text not null,
  preset_data  jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.favorites add column if not exists device_id text;
alter table public.favorites alter column device_id set default '';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'favorites'
      and column_name = 'user_id'
  ) then
    alter table public.favorites alter column user_id drop not null;
  end if;
end $$;

create index if not exists favorites_device_id_idx on public.favorites(device_id);
create index if not exists favorites_device_created_idx on public.favorites(device_id, created_at desc);

alter table public.favorites enable row level security;

drop policy if exists "favorites_select" on public.favorites;
drop policy if exists "favorites_insert" on public.favorites;
drop policy if exists "favorites_update" on public.favorites;
drop policy if exists "favorites_delete" on public.favorites;

create policy "favorites_select"
  on public.favorites for select
  using (true);

create policy "favorites_insert"
  on public.favorites for insert
  with check (device_id <> '');

create policy "favorites_update"
  on public.favorites for update
  using (true)
  with check (device_id <> '');

create policy "favorites_delete"
  on public.favorites for delete
  using (true);


-- 3) updated_at automatisch setzen
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prompts_updated_at on public.prompts;
create trigger prompts_updated_at
  before update on public.prompts
  for each row execute function public.set_updated_at();

drop trigger if exists favorites_updated_at on public.favorites;
create trigger favorites_updated_at
  before update on public.favorites
  for each row execute function public.set_updated_at();

-- ============================================================
-- Fertig. Tabellen: prompts, favorites
-- ============================================================
