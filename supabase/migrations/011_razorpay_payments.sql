-- Razorpay payment intents and idempotent webhook receipt log.
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  purpose text not null check (purpose in ('wallet_topup','subscription_delivery')),
  subscription_id uuid references public.subscriptions(id) on delete restrict,
  amount_paise bigint not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created','verified','captured','failed','refunded')),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  receipt text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  captured_at timestamptz
);

create table if not exists public.payment_webhook_events (
  event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists payment_orders_user_created_idx on public.payment_orders(user_id,created_at desc);
drop trigger if exists payment_orders_updated_at on public.payment_orders;
create trigger payment_orders_updated_at before update on public.payment_orders for each row execute procedure public.set_updated_at();

alter table public.payment_orders enable row level security;
alter table public.payment_webhook_events enable row level security;
create policy "payment_orders_select_own_or_admin" on public.payment_orders for select to authenticated
  using (user_id=auth.uid() or public.is_admin());
-- Financial writes are service-role only. There are intentionally no browser write policies.

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
  end if;
  update public.payment_orders set status='captured',razorpay_payment_id=p_payment_id,captured_at=now()
    where id=p_order_id returning * into payment_order;
  return payment_order;
end; $$;
revoke all on function public.capture_payment_order(uuid,text) from public,anon,authenticated;
grant execute on function public.capture_payment_order(uuid,text) to service_role;
