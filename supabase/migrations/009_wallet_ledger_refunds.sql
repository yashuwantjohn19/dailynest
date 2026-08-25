-- DailyNest wallet foundation. All money is stored as integer paise.
create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete restrict,
  balance_paise bigint not null default 0 check (balance_paise >= 0),
  held_paise bigint not null default 0 check (held_paise >= 0 and held_paise <= balance_paise),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
  kind text not null check (kind in ('top_up','order_deduction','refund','withdrawal','adjustment')),
  direction text not null check (direction in ('credit','debit')), amount_paise bigint not null check (amount_paise > 0),
  balance_after_paise bigint not null check (balance_after_paise >= 0), reference_type text, reference_id text,
  description text not null, metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(),
  constraint wallet_transactions_reference_unique unique nulls not distinct (user_id,kind,reference_type,reference_id)
);
create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
  amount_paise bigint not null check (amount_paise > 0), reason text not null check (char_length(reason) between 5 and 500),
  status text not null default 'pending' check (status in ('pending','approved','rejected','processing','paid','failed')),
  review_note text, reviewed_by uuid references public.profiles(id) on delete set null, reviewed_at timestamptz,
  payout_reference text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists wallet_transactions_user_created_idx on public.wallet_transactions(user_id,created_at desc);
create index if not exists refund_requests_status_created_idx on public.refund_requests(status,created_at);
drop trigger if exists wallets_updated_at on public.wallets;
create trigger wallets_updated_at before update on public.wallets for each row execute procedure public.set_updated_at();
drop trigger if exists refund_requests_updated_at on public.refund_requests;
create trigger refund_requests_updated_at before update on public.refund_requests for each row execute procedure public.set_updated_at();
insert into public.wallets (user_id) select id from public.profiles on conflict (user_id) do nothing;

create or replace function public.ensure_customer_wallet() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.wallets(user_id) values(new.id) on conflict(user_id) do nothing; return new; end; $$;
drop trigger if exists profile_wallet_created on public.profiles;
create trigger profile_wallet_created after insert on public.profiles for each row execute procedure public.ensure_customer_wallet();

create or replace function public.post_wallet_transaction(p_user_id uuid,p_kind text,p_direction text,p_amount_paise bigint,p_description text,p_reference_type text default null,p_reference_id text default null,p_metadata jsonb default '{}'::jsonb,p_created_by uuid default null)
returns public.wallet_transactions language plpgsql security definer set search_path=public as $$
declare current_wallet public.wallets; new_balance bigint; ledger_row public.wallet_transactions;
begin
  if p_amount_paise<=0 then raise exception 'Amount must be positive'; end if;
  if p_direction not in ('credit','debit') then raise exception 'Invalid direction'; end if;
  insert into public.wallets(user_id) values(p_user_id) on conflict(user_id) do nothing;
  select * into current_wallet from public.wallets where user_id=p_user_id for update;
  new_balance:=current_wallet.balance_paise+case when p_direction='credit' then p_amount_paise else -p_amount_paise end;
  if new_balance<current_wallet.held_paise then raise exception 'Insufficient available wallet balance'; end if;
  update public.wallets set balance_paise=new_balance where user_id=p_user_id;
  insert into public.wallet_transactions(user_id,kind,direction,amount_paise,balance_after_paise,reference_type,reference_id,description,metadata,created_by)
  values(p_user_id,p_kind,p_direction,p_amount_paise,new_balance,p_reference_type,p_reference_id,p_description,coalesce(p_metadata,'{}'::jsonb),p_created_by)
  returning * into ledger_row; return ledger_row;
end; $$;
revoke all on function public.post_wallet_transaction(uuid,text,text,bigint,text,text,text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.post_wallet_transaction(uuid,text,text,bigint,text,text,text,jsonb,uuid) to service_role;

create or replace function public.request_wallet_refund(p_amount_paise bigint,p_reason text) returns public.refund_requests
language plpgsql security definer set search_path=public as $$
declare customer_id uuid:=auth.uid(); current_wallet public.wallets; request_row public.refund_requests;
begin
  if customer_id is null then raise exception 'Authentication required'; end if;
  if p_amount_paise<=0 then raise exception 'Amount must be positive'; end if;
  if char_length(trim(p_reason)) not between 5 and 500 then raise exception 'Reason must be 5 to 500 characters'; end if;
  select * into current_wallet from public.wallets where user_id=customer_id for update;
  if not found or current_wallet.balance_paise-current_wallet.held_paise<p_amount_paise then raise exception 'Insufficient available wallet balance'; end if;
  update public.wallets set held_paise=held_paise+p_amount_paise where user_id=customer_id;
  insert into public.refund_requests(user_id,amount_paise,reason) values(customer_id,p_amount_paise,trim(p_reason)) returning * into request_row;
  return request_row;
end; $$;
revoke all on function public.request_wallet_refund(bigint,text) from public,anon;
grant execute on function public.request_wallet_refund(bigint,text) to authenticated;

create or replace function public.prevent_wallet_ledger_mutation() returns trigger language plpgsql as $$
begin raise exception 'Wallet ledger entries are immutable'; end; $$;
drop trigger if exists wallet_transactions_immutable on public.wallet_transactions;
create trigger wallet_transactions_immutable before update or delete on public.wallet_transactions for each row execute procedure public.prevent_wallet_ledger_mutation();
alter table public.wallets enable row level security; alter table public.wallet_transactions enable row level security; alter table public.refund_requests enable row level security;
create policy "wallets_select_own_or_admin" on public.wallets for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy "wallet_transactions_select_own_or_admin" on public.wallet_transactions for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy "refund_requests_select_own_or_admin" on public.refund_requests for select to authenticated using(user_id=auth.uid() or public.is_admin());
-- No direct write policies: financial writes only pass through controlled functions.
