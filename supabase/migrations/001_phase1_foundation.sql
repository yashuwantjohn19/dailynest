-- DailyNest Phase 1: authentication-linked customer profiles, apartments and addresses.
-- Run this in the Supabase SQL editor for a new project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  email text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.apartments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null default 'Chennai',
  state text not null default 'Tamil Nadu',
  zip_code text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  apartment_id uuid references public.apartments(id) on delete set null,
  label text not null default 'Home',
  line1 text not null,
  line2 text,
  landmark text,
  city text not null default 'Chennai',
  state text not null default 'Tamil Nadu',
  postal_code text not null,
  preferred_delivery_time time,
  assigned_delivery_time time,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists addresses_one_default_per_user
  on public.addresses(user_id) where is_default = true;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'DailyNest Resident'),
    new.phone,
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    phone = excluded.phone,
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of phone, email on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists apartments_updated_at on public.apartments;
create trigger apartments_updated_at before update on public.apartments
  for each row execute procedure public.set_updated_at();

drop trigger if exists addresses_updated_at on public.addresses;
create trigger addresses_updated_at before update on public.addresses
  for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.apartments enable row level security;
alter table public.addresses enable row level security;

-- Users can read/update their own profile. Admins can read all profiles.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Apartment directory is readable by authenticated users, writable by admins only.
drop policy if exists "apartments_select_authenticated" on public.apartments;
create policy "apartments_select_authenticated" on public.apartments for select
  to authenticated using (is_active = true or public.is_admin());

drop policy if exists "apartments_admin_insert" on public.apartments;
create policy "apartments_admin_insert" on public.apartments for insert
  to authenticated with check (public.is_admin());

drop policy if exists "apartments_admin_update" on public.apartments;
create policy "apartments_admin_update" on public.apartments for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "apartments_admin_delete" on public.apartments;
create policy "apartments_admin_delete" on public.apartments for delete
  to authenticated using (public.is_admin());

-- Addresses are private to their owner; admins may read for delivery operations.
drop policy if exists "addresses_select_own_or_admin" on public.addresses;
create policy "addresses_select_own_or_admin" on public.addresses for select
  to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own" on public.addresses for insert
  to authenticated with check (user_id = auth.uid());

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own" on public.addresses for update
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own" on public.addresses for delete
  to authenticated using (user_id = auth.uid());
