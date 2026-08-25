-- Allow customers to create or update only their own safe profile fields.
create or replace function public.save_own_profile(p_name text, p_email text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_id uuid := auth.uid();
  auth_phone text;
  saved_profile public.profiles;
begin
  if customer_id is null then raise exception 'Authentication required'; end if;

  select phone into auth_phone from auth.users where id = customer_id;

  insert into public.profiles (id, name, email, phone, role)
  values (
    customer_id,
    nullif(trim(p_name), ''),
    nullif(trim(p_email), ''),
    auth_phone,
    'customer'
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    phone = coalesce(public.profiles.phone, excluded.phone),
    updated_at = now()
  returning * into saved_profile;

  return saved_profile;
end;
$$;

revoke all on function public.save_own_profile(text,text) from public, anon;
grant execute on function public.save_own_profile(text,text) to authenticated;
