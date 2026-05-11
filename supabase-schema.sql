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

create table if not exists public.logs (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.replacements (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.parts enable row level security;
alter table public.jobs enable row level security;
alter table public.vehicles enable row level security;
alter table public.staff enable row level security;
alter table public.logs enable row level security;
alter table public.tickets enable row level security;
alter table public.clients enable row level security;
alter table public.replacements enable row level security;

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


drop policy if exists "garage users can read logs" on public.logs;
create policy "garage users can read logs" on public.logs
for select to authenticated using (true);

drop policy if exists "garage users can add logs" on public.logs;
create policy "garage users can add logs" on public.logs
for insert to authenticated with check (true);

drop policy if exists "garage users can update logs" on public.logs;
create policy "garage users can update logs" on public.logs
for update to authenticated using (true) with check (true);

drop policy if exists "garage users can delete logs" on public.logs;
create policy "garage users can delete logs" on public.logs
for delete to authenticated using (true);


drop policy if exists "garage users can read tickets" on public.tickets;
create policy "garage users can read tickets" on public.tickets
for select to authenticated using (true);

drop policy if exists "garage users can add tickets" on public.tickets;
create policy "garage users can add tickets" on public.tickets
for insert to authenticated with check (true);

drop policy if exists "garage users can update tickets" on public.tickets;
create policy "garage users can update tickets" on public.tickets
for update to authenticated using (true) with check (true);

drop policy if exists "garage users can delete tickets" on public.tickets;
create policy "garage users can delete tickets" on public.tickets
for delete to authenticated using (true);


drop policy if exists "garage users can read clients" on public.clients;
create policy "garage users can read clients" on public.clients
for select to authenticated using (true);

drop policy if exists "garage users can add clients" on public.clients;
create policy "garage users can add clients" on public.clients
for insert to authenticated with check (true);

drop policy if exists "garage users can update clients" on public.clients;
create policy "garage users can update clients" on public.clients
for update to authenticated using (true) with check (true);

drop policy if exists "garage users can delete clients" on public.clients;
create policy "garage users can delete clients" on public.clients
for delete to authenticated using (true);


drop policy if exists "garage users can read replacements" on public.replacements;
create policy "garage users can read replacements" on public.replacements
for select to authenticated using (true);

drop policy if exists "garage users can add replacements" on public.replacements;
create policy "garage users can add replacements" on public.replacements
for insert to authenticated with check (true);

drop policy if exists "garage users can update replacements" on public.replacements;
create policy "garage users can update replacements" on public.replacements
for update to authenticated using (true) with check (true);

drop policy if exists "garage users can delete replacements" on public.replacements;
create policy "garage users can delete replacements" on public.replacements
for delete to authenticated using (true);

-- Employees module
create table if not exists employees (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table employees enable row level security;
drop policy if exists "Employees are readable by authenticated users" on employees;
drop policy if exists "Employees are writable by authenticated users" on employees;
create policy "Employees are readable by authenticated users" on employees for select using (auth.role() = 'authenticated');
create policy "Employees are writable by authenticated users" on employees for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
