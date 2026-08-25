-- Citywide Chennai service option without inventing individual apartment records.
alter table public.apartments alter column city set default 'Chennai';
alter table public.addresses alter column city set default 'Chennai';

insert into public.apartments (
  id,
  name,
  address,
  city,
  state,
  zip_code,
  is_active
) values (
  '00000000-0000-4000-8000-000000000001',
  'Chennai — citywide delivery',
  'Customer-provided delivery address',
  'Chennai',
  'Tamil Nadu',
  'All Chennai PIN codes',
  true
)
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  zip_code = excluded.zip_code,
  is_active = true,
  updated_at = now();
