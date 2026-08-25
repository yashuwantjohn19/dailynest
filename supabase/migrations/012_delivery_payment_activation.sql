-- Delivery records and payment-gated subscription activation.

alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('pending_payment', 'active', 'paused', 'cancelled'));
alter table public.subscriptions alter column status set default 'pending_payment';

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  delivery_date date not null,
  quantity integer not null check (quantity > 0),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  amount_paise bigint not null default 0 check (amount_paise >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subscription_id, delivery_date)
);

create index if not exists deliveries_user_date_idx on public.deliveries(user_id, delivery_date);
create index if not exists deliveries_status_date_idx on public.deliveries(status, delivery_date);
drop trigger if exists deliveries_updated_at on public.deliveries;
create trigger deliveries_updated_at before update on public.deliveries
  for each row execute procedure public.set_updated_at();

alter table public.deliveries enable row level security;
drop policy if exists "deliveries_read_own_or_admin" on public.deliveries;
create policy "deliveries_read_own_or_admin" on public.deliveries for select
  to authenticated using (user_id = auth.uid() or public.is_admin());
revoke insert, update, delete on public.deliveries from authenticated;

create or replace function public.subscription_delivery_amount(p_subscription_id uuid)
returns bigint language sql stable security definer set search_path=public as $$
  select coalesce(sum(si.units * price.amount_paise), 0)::bigint
  from public.subscription_items si
  join lateral (
    select pp.amount_paise from public.product_prices pp
    where pp.product_id = si.product_id and pp.valid_until is null
    order by pp.valid_from desc limit 1
  ) price on true
  where si.subscription_id = p_subscription_id;
$$;
revoke all on function public.subscription_delivery_amount(uuid) from public,anon;
grant execute on function public.subscription_delivery_amount(uuid) to authenticated,service_role;

create or replace function public.activate_paid_subscription(p_subscription_id uuid)
returns public.subscriptions language plpgsql security definer set search_path=public as $$
declare
  subscription_row public.subscriptions;
  delivery_quantity integer;
  delivery_amount bigint;
  candidate_date date;
begin
  select * into subscription_row from public.subscriptions where id=p_subscription_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  if subscription_row.status not in ('pending_payment','active') then
    raise exception 'Subscription cannot be activated';
  end if;

  select coalesce(sum(units*bundle_quantity_snapshot),0) into delivery_quantity
  from public.subscription_items where subscription_id=p_subscription_id;
  delivery_amount:=public.subscription_delivery_amount(p_subscription_id);
  if delivery_quantity<=0 or delivery_amount<=0 then raise exception 'Subscription pricing is incomplete'; end if;

  update public.subscriptions set status='active'
  where id=p_subscription_id returning * into subscription_row;

  for candidate_date in
    select day::date from generate_series(
      greatest(subscription_row.start_date,current_date),
      greatest(subscription_row.start_date,current_date)+interval '41 days',
      interval '1 day'
    ) day
    where extract(dow from day)::smallint in (
      select weekday from public.subscription_weekdays where subscription_id=p_subscription_id
    )
  loop
    insert into public.deliveries(user_id,subscription_id,delivery_date,quantity,amount_paise)
    values(subscription_row.user_id,p_subscription_id,candidate_date,delivery_quantity,delivery_amount)
    on conflict(subscription_id,delivery_date) do nothing;
  end loop;
  return subscription_row;
end; $$;
revoke all on function public.activate_paid_subscription(uuid) from public,anon,authenticated;
grant execute on function public.activate_paid_subscription(uuid) to service_role;

create or replace function public.pay_subscription_from_wallet(p_subscription_id uuid)
returns public.subscriptions language plpgsql security definer set search_path=public as $$
declare
  customer_id uuid:=auth.uid();
  subscription_row public.subscriptions;
  amount_due bigint;
begin
  if customer_id is null then raise exception 'Authentication required'; end if;
  select * into subscription_row from public.subscriptions
  where id=p_subscription_id and user_id=customer_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  if subscription_row.status <> 'pending_payment' then raise exception 'Subscription is not awaiting payment'; end if;
  amount_due:=public.subscription_delivery_amount(p_subscription_id);
  if amount_due<=0 then raise exception 'Subscription pricing is incomplete'; end if;
  perform public.post_wallet_transaction(customer_id,'order_deduction','debit',amount_due,
    'First delivery payment','subscription',p_subscription_id::text,
    jsonb_build_object('subscription_id',p_subscription_id),customer_id);
  return public.activate_paid_subscription(p_subscription_id);
end; $$;
revoke all on function public.pay_subscription_from_wallet(uuid) from public,anon;
grant execute on function public.pay_subscription_from_wallet(uuid) to authenticated;

create or replace function public.capture_payment_order(p_order_id uuid,p_payment_id text)
returns public.payment_orders language plpgsql security definer set search_path=public as $$
declare payment_order public.payment_orders;
begin
  select * into payment_order from public.payment_orders where id=p_order_id for update;
  if not found then raise exception 'Payment order not found'; end if;
  if payment_order.status='captured' then return payment_order; end if;
  if payment_order.purpose='wallet_topup' then
    perform public.post_wallet_transaction(payment_order.user_id,'top_up','credit',payment_order.amount_paise,
      'Verified Razorpay wallet top-up','razorpay_payment',p_payment_id,
      jsonb_build_object('payment_order_id',payment_order.id),null);
  elsif payment_order.purpose='subscription_delivery' then
    perform public.activate_paid_subscription(payment_order.subscription_id);
  end if;
  update public.payment_orders set status='captured',razorpay_payment_id=p_payment_id,captured_at=now()
    where id=p_order_id returning * into payment_order;
  return payment_order;
end; $$;
revoke all on function public.capture_payment_order(uuid,text) from public,anon,authenticated;
grant execute on function public.capture_payment_order(uuid,text) to service_role;

create or replace function public.update_subscription_status(p_subscription_id uuid,p_status text)
returns public.subscriptions language plpgsql security definer set search_path=public as $$
declare current_subscription public.subscriptions; updated_subscription public.subscriptions; event_name text;
begin
  if p_status not in ('active','paused','cancelled') then raise exception 'Invalid subscription status'; end if;
  select * into current_subscription from public.subscriptions where id=p_subscription_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  if current_subscription.user_id<>auth.uid() and not public.is_admin() then raise exception 'Not authorized to manage this subscription'; end if;
  if current_subscription.status='pending_payment' and p_status<>'cancelled' then raise exception 'Payment is required before activation'; end if;
  if current_subscription.status='cancelled' and p_status<>'cancelled' then raise exception 'A cancelled subscription cannot be reactivated'; end if;
  event_name:=case when p_status='paused' then 'paused' when p_status='cancelled' then 'cancelled' else 'resumed' end;
  update public.subscriptions set status=p_status,
    paused_at=case when p_status='paused' then now() else null end,
    cancelled_at=case when p_status='cancelled' then now() else cancelled_at end,
    end_date=case when p_status='cancelled' then current_date else end_date end,
    version=version+case when status is distinct from p_status then 1 else 0 end
  where id=p_subscription_id returning * into updated_subscription;
  if current_subscription.status is distinct from p_status then
    insert into public.subscription_events(subscription_id,actor_user_id,event_type,details)
    values(p_subscription_id,auth.uid(),event_name,jsonb_build_object('from',current_subscription.status,'to',p_status));
  end if;
  if p_status='cancelled' then update public.deliveries set status='cancelled'
    where subscription_id=p_subscription_id and delivery_date>=current_date and status='scheduled'; end if;
  return updated_subscription;
end; $$;
revoke all on function public.update_subscription_status(uuid,text) from public;
grant execute on function public.update_subscription_status(uuid,text) to authenticated;
