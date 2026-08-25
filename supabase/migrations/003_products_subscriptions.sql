-- DailyNest Phase 2: canonical chapati bundles and subscription combinations.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('basic', 'standard', 'family')),
  name text not null,
  bundle_quantity integer not null check (bundle_quantity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.products (code, name, bundle_quantity)
values
  ('basic', 'Basic', 10),
  ('standard', 'Standard', 20),
  ('family', 'Family', 32)
on conflict (code) do update set
  name = excluded.name,
  bundle_quantity = excluded.bundle_quantity,
  updated_at = now();

create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_until > valid_from)
);

create unique index if not exists product_prices_one_open_price
  on public.product_prices(product_id)
  where valid_until is null;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  address_id uuid references public.addresses(id) on delete restrict,
  apartment_id uuid references public.apartments(id) on delete restrict,
  status text not null default 'active'
    check (status in ('active', 'paused', 'cancelled')),
  start_date date not null,
  end_date date,
  paused_at timestamptz,
  cancelled_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table if not exists public.subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  units integer not null check (units > 0 and units <= 20),
  bundle_quantity_snapshot integer not null check (bundle_quantity_snapshot > 0),
  created_at timestamptz not null default now(),
  unique (subscription_id, product_id)
);

create table if not exists public.subscription_weekdays (
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  created_at timestamptz not null default now(),
  primary key (subscription_id, weekday)
);

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (
    event_type in ('created', 'changed', 'paused', 'resumed', 'cancelled')
  ),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_status_idx
  on public.subscriptions(user_id, status);
create index if not exists subscription_events_subscription_created_idx
  on public.subscription_events(subscription_id, created_at desc);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

alter table public.products enable row level security;
alter table public.product_prices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_items enable row level security;
alter table public.subscription_weekdays enable row level security;
alter table public.subscription_events enable row level security;

create policy "products_read_active_or_admin" on public.products for select
  to authenticated using (is_active or public.is_admin());
create policy "product_prices_read_active_or_admin" on public.product_prices for select
  to authenticated using (
    public.is_admin() or exists (
      select 1 from public.products p where p.id = product_id and p.is_active
    )
  );

create policy "subscriptions_read_own_or_admin" on public.subscriptions for select
  to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "subscription_items_read_own_or_admin" on public.subscription_items for select
  to authenticated using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id
        and (s.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "subscription_weekdays_read_own_or_admin" on public.subscription_weekdays for select
  to authenticated using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id
        and (s.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "subscription_events_read_own_or_admin" on public.subscription_events for select
  to authenticated using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id
        and (s.user_id = auth.uid() or public.is_admin())
    )
  );

-- Product configuration is an administrative operation. Subscription writes are
-- intentionally performed through validated database functions added with the
-- command API, rather than direct browser table writes.
revoke insert, update, delete on public.products from authenticated;
revoke insert, update, delete on public.product_prices from authenticated;
revoke insert, update, delete on public.subscriptions from authenticated;
revoke insert, update, delete on public.subscription_items from authenticated;
revoke insert, update, delete on public.subscription_weekdays from authenticated;
revoke insert, update, delete on public.subscription_events from authenticated;

create or replace function public.update_subscription_status(
  p_subscription_id uuid,
  p_status text
)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_subscription public.subscriptions;
  updated_subscription public.subscriptions;
  event_name text;
begin
  if p_status not in ('active', 'paused', 'cancelled') then
    raise exception 'Invalid subscription status';
  end if;

  select * into current_subscription
  from public.subscriptions
  where id = p_subscription_id
  for update;

  if current_subscription.id is null then
    raise exception 'Subscription not found';
  end if;

  if current_subscription.user_id <> auth.uid() and not public.is_admin() then
    raise exception 'Not authorized to manage this subscription';
  end if;

  if current_subscription.status = 'cancelled' and p_status <> 'cancelled' then
    raise exception 'A cancelled subscription cannot be reactivated';
  end if;

  event_name := case
    when p_status = 'paused' then 'paused'
    when p_status = 'cancelled' then 'cancelled'
    else 'resumed'
  end;

  update public.subscriptions
  set status = p_status,
      paused_at = case when p_status = 'paused' then now() else null end,
      cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end,
      end_date = case when p_status = 'cancelled' then current_date else end_date end,
      version = version + case when status is distinct from p_status then 1 else 0 end
  where id = p_subscription_id
  returning * into updated_subscription;

  if current_subscription.status is distinct from p_status then
    insert into public.subscription_events (
      subscription_id,
      actor_user_id,
      event_type,
      details
    ) values (
      p_subscription_id,
      auth.uid(),
      event_name,
      jsonb_build_object('from', current_subscription.status, 'to', p_status)
    );
  end if;

  return updated_subscription;
end;
$$;

revoke all on function public.update_subscription_status(uuid, text) from public;
grant execute on function public.update_subscription_status(uuid, text) to authenticated;

create or replace function public.create_subscription(
  p_apartment_id uuid,
  p_start_date date,
  p_bundle_units jsonb,
  p_weekdays smallint[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_subscription_id uuid;
  bundle record;
  selected_product public.products;
  selected_units integer;
  selected_weekday smallint;
  item_count integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_start_date < current_date then
    raise exception 'Start date cannot be in the past';
  end if;

  if p_weekdays is null or cardinality(p_weekdays) = 0 then
    raise exception 'Select at least one delivery day';
  end if;

  if exists (
    select 1 from unnest(p_weekdays) day
    where day < 0 or day > 6
  ) then
    raise exception 'Invalid delivery weekday';
  end if;

  if p_apartment_id is not null and not exists (
    select 1 from public.apartments where id = p_apartment_id and is_active
  ) then
    raise exception 'Selected apartment is unavailable';
  end if;

  insert into public.subscriptions (user_id, apartment_id, start_date)
  values (auth.uid(), p_apartment_id, p_start_date)
  returning id into new_subscription_id;

  for bundle in select key, value from jsonb_each(p_bundle_units)
  loop
    if bundle.key not in ('basic', 'standard', 'family')
       or jsonb_typeof(bundle.value) <> 'number' then
      raise exception 'Invalid bundle selection';
    end if;

    selected_units := (bundle.value #>> '{}')::integer;
    if selected_units < 0 or selected_units > 20 then
      raise exception 'Bundle units must be between 0 and 20';
    end if;

    if selected_units > 0 then
      select * into selected_product
      from public.products
      where code = bundle.key and is_active;

      if selected_product.id is null then
        raise exception 'Bundle is unavailable';
      end if;

      insert into public.subscription_items (
        subscription_id, product_id, units, bundle_quantity_snapshot
      ) values (
        new_subscription_id,
        selected_product.id,
        selected_units,
        selected_product.bundle_quantity
      );
      item_count := item_count + 1;
    end if;
  end loop;

  if item_count = 0 then
    raise exception 'Add at least one bundle';
  end if;

  foreach selected_weekday in array p_weekdays
  loop
    insert into public.subscription_weekdays (subscription_id, weekday)
    values (new_subscription_id, selected_weekday)
    on conflict do nothing;
  end loop;

  insert into public.subscription_events (
    subscription_id, actor_user_id, event_type, details
  ) values (
    new_subscription_id,
    auth.uid(),
    'created',
    jsonb_build_object('bundle_units', p_bundle_units, 'weekdays', p_weekdays)
  );

  return new_subscription_id;
end;
$$;

revoke all on function public.create_subscription(uuid, date, jsonb, smallint[]) from public;
grant execute on function public.create_subscription(uuid, date, jsonb, smallint[]) to authenticated;
