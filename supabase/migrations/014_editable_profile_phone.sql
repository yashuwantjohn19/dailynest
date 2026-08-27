-- Let authenticated customers maintain their contact number from Account.

drop function if exists public.save_own_profile(text,text);

create function public.save_own_profile(p_name text, p_email text, p_phone text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_id uuid := auth.uid();
  saved_profile public.profiles;
  clean_phone text := nullif(trim(p_phone), '');
begin
  if customer_id is null then raise exception 'Authentication required'; end if;
  if clean_phone is not null and clean_phone !~ '^\+?[0-9][0-9 ()-]{6,19}$' then
    raise exception 'Enter a valid phone number';
  end if;

  insert into public.profiles (id, name, email, phone, role)
  values (
    customer_id,
    coalesce(nullif(trim(p_name), ''), 'DailyNest Resident'),
    nullif(trim(p_email), ''),
    clean_phone,
    'customer'
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now()
  returning * into saved_profile;

  return saved_profile;
end;
$$;

revoke all on function public.save_own_profile(text,text,text) from public, anon;
grant execute on function public.save_own_profile(text,text,text) to authenticated;
