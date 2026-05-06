-- Sarab Al Madina Garage Inventory - Supabase schema
-- Run this in Supabase Dashboard > SQL Editor > New query > Run.

create table if not exists public.parts (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.staff (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.parts enable row level security;
alter table public.jobs enable row level security;
alter table public.vehicles enable row level security;
alter table public.staff enable row level security;

-- Internal garage app: any logged-in user can see and manage shared garage records.
-- Do not use this for public/customer-facing apps without stricter roles.
drop policy if exists "garage users can read parts" on public.parts;
create policy "garage users can read parts" on public.parts
for select to authenticated using (true);

drop policy if exists "garage users can add parts" on public.parts;
create policy "garage users can add parts" on public.parts
for insert to authenticated with check (true);

drop policy if exists "garage users can update parts" on public.parts;
create policy "garage users can update parts" on public.parts
for update to authenticated using (true) with check (true);

drop policy if exists "garage users can delete parts" on public.parts;
create policy "garage users can delete parts" on public.parts
for delete to authenticated using (true);

drop policy if exists "garage users can read jobs" on public.jobs;
create policy "garage users can read jobs" on public.jobs
for select to authenticated using (true);

drop policy if exists "garage users can add jobs" on public.jobs;
create policy "garage users can add jobs" on public.jobs
for insert to authenticated with check (true);

drop policy if exists "garage users can update jobs" on public.jobs;
create policy "garage users can update jobs" on public.jobs
for update to authenticated using (true) with check (true);

drop policy if exists "garage users can delete jobs" on public.jobs;
create policy "garage users can delete jobs" on public.jobs
for delete to authenticated using (true);

drop policy if exists "garage users can read vehicles" on public.vehicles;
create policy "garage users can read vehicles" on public.vehicles
for select to authenticated using (true);

drop policy if exists "garage users can add vehicles" on public.vehicles;
create policy "garage users can add vehicles" on public.vehicles
for insert to authenticated with check (true);

drop policy if exists "garage users can update vehicles" on public.vehicles;
create policy "garage users can update vehicles" on public.vehicles
for update to authenticated using (true) with check (true);

drop policy if exists "garage users can delete vehicles" on public.vehicles;
create policy "garage users can delete vehicles" on public.vehicles
for delete to authenticated using (true);


drop policy if exists "garage users can read staff" on public.staff;
create policy "garage users can read staff" on public.staff
for select to authenticated using (true);

drop policy if exists "garage users can add staff" on public.staff;
create policy "garage users can add staff" on public.staff
for insert to authenticated with check (true);

drop policy if exists "garage users can update staff" on public.staff;
create policy "garage users can update staff" on public.staff
for update to authenticated using (true) with check (true);

drop policy if exists "garage users can delete staff" on public.staff;
create policy "garage users can delete staff" on public.staff
for delete to authenticated using (true);
