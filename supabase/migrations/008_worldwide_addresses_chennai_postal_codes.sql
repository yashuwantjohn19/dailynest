-- Worldwide customer addresses with a current Chennai delivery eligibility directory.

alter table public.addresses
  add column if not exists country_name text not null default 'India',
  add column if not exists country_code text not null default 'IN';

alter table public.addresses
  drop constraint if exists addresses_country_code_format,
  add constraint addresses_country_code_format
    check (country_code ~ '^[A-Z]{2}$');

create table if not exists public.service_postal_codes (
  postal_code text primary key,
  city text not null,
  state text not null,
  country_code text not null,
  is_active boolean not null default true,
  source text not null,
  source_updated_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_postal_codes_country_code_format check (country_code ~ '^[A-Z]{2}$')
);

drop trigger if exists service_postal_codes_updated_at on public.service_postal_codes;
create trigger service_postal_codes_updated_at before update on public.service_postal_codes
  for each row execute procedure public.set_updated_at();

alter table public.service_postal_codes enable row level security;

drop policy if exists "service_postal_codes_select_authenticated" on public.service_postal_codes;
create policy "service_postal_codes_select_authenticated" on public.service_postal_codes for select
  to authenticated using (is_active = true or public.is_admin());

drop policy if exists "service_postal_codes_admin_insert" on public.service_postal_codes;
create policy "service_postal_codes_admin_insert" on public.service_postal_codes for insert
  to authenticated with check (public.is_admin());

drop policy if exists "service_postal_codes_admin_update" on public.service_postal_codes;
create policy "service_postal_codes_admin_update" on public.service_postal_codes for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "service_postal_codes_admin_delete" on public.service_postal_codes;
create policy "service_postal_codes_admin_delete" on public.service_postal_codes for delete
  to authenticated using (public.is_admin());

insert into public.service_postal_codes
  (postal_code, city, state, country_code, source, source_updated_on)
select
  postal_code,
  'Chennai',
  'Tamil Nadu',
  'IN',
  'Department of Posts — All India Pincode Directory',
  date '2025-10-03'
from unnest(array[
  '600001','600002','600003','600004','600005','600006','600007','600008','600009','600010',
  '600011','600012','600013','600014','600015','600016','600017','600018','600019','600020',
  '600021','600022','600023','600024','600025','600026','600028','600030','600031','600032',
  '600033','600034','600035','600036','600037','600038','600039','600040','600041','600042',
  '600049','600050','600051','600053','600057','600058','600060','600061','600066','600068',
  '600076','600077','600078','600081','600082','600083','600084','600085','600086','600087',
  '600088','600089','600090','600091','600092','600093','600094','600095','600096','600097',
  '600099','600101','600102','600103','600104','600106','600107','600113','600115','600116',
  '600118','600119','600125'
]) as postal_code
on conflict (postal_code) do update set
  city = excluded.city,
  state = excluded.state,
  country_code = excluded.country_code,
  is_active = true,
  source = excluded.source,
  source_updated_on = excluded.source_updated_on,
  updated_at = now();
