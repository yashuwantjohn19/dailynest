-- Prevent authenticated customers from changing their authorization role.

create or replace function public.prevent_unauthorized_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() = old.id
     and not public.is_admin() then
    raise exception 'Only an administrator can change account roles';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_profile_role_change on public.profiles;
create trigger prevent_unauthorized_profile_role_change
  before update of role on public.profiles
  for each row execute procedure public.prevent_unauthorized_profile_role_change();

revoke all on function public.prevent_unauthorized_profile_role_change() from public;
revoke insert, delete on public.profiles from authenticated;
