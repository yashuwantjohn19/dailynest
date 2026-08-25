-- Backfill profiles for Auth users created before the profile trigger existed.
insert into public.profiles (id, name, phone, email, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'name', 'DailyNest Resident'),
  phone,
  email,
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do update set
  phone = excluded.phone,
  email = excluded.email,
  updated_at = now();
