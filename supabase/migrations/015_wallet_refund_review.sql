-- Customer refund requests, automatic Razorpay eligibility, and admin review.

alter table public.refund_requests
  add column if not exists payment_order_id uuid references public.payment_orders(id) on delete set null,
  add column if not exists auto_eligible boolean not null default false;

create unique index if not exists refund_requests_active_payment_idx
  on public.refund_requests(payment_order_id)
  where payment_order_id is not null and status not in ('rejected','failed');

create or replace function public.request_wallet_refund(p_amount_paise bigint,p_reason text)
returns public.refund_requests language plpgsql security definer set search_path=public as $$
declare
  customer_id uuid:=auth.uid(); current_wallet public.wallets; request_row public.refund_requests;
  eligible_order uuid;
begin
  if customer_id is null then raise exception 'Authentication required'; end if;
  if p_amount_paise<100 then raise exception 'Refund amount must be at least one rupee'; end if;
  if char_length(trim(p_reason)) not between 5 and 500 then raise exception 'Reason must be 5 to 500 characters'; end if;
  select * into current_wallet from public.wallets where user_id=customer_id for update;
  if not found or current_wallet.balance_paise-current_wallet.held_paise<p_amount_paise then
    raise exception 'Insufficient available wallet balance';
  end if;

  select po.id into eligible_order
  from public.payment_orders po
  where po.user_id=customer_id and po.purpose='wallet_topup' and po.status='captured'
    and po.razorpay_payment_id is not null and po.amount_paise>=p_amount_paise
    and not exists (
      select 1 from public.refund_requests rr where rr.payment_order_id=po.id
        and rr.status not in ('rejected','failed')
    )
  order by po.captured_at desc nulls last limit 1;

  update public.wallets set held_paise=held_paise+p_amount_paise where user_id=customer_id;
  insert into public.refund_requests(user_id,amount_paise,reason,payment_order_id,auto_eligible)
  values(customer_id,p_amount_paise,trim(p_reason),eligible_order,eligible_order is not null)
  returning * into request_row;
  return request_row;
end; $$;
revoke all on function public.request_wallet_refund(bigint,text) from public,anon;
grant execute on function public.request_wallet_refund(bigint,text) to authenticated;

create or replace function public.review_wallet_refund(p_request_id uuid,p_decision text,p_review_note text default null)
returns public.refund_requests language plpgsql security definer set search_path=public as $$
declare request_row public.refund_requests;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_decision not in ('approve','reject') then raise exception 'Invalid review decision'; end if;
  select * into request_row from public.refund_requests where id=p_request_id for update;
  if not found then raise exception 'Refund request not found'; end if;
  if request_row.status<>'pending' then raise exception 'Refund request was already reviewed'; end if;
  if p_decision='approve' and (not request_row.auto_eligible or request_row.payment_order_id is null) then
    raise exception 'This request requires a manual payout review';
  end if;
  if p_decision='reject' then
    update public.wallets set held_paise=held_paise-request_row.amount_paise where user_id=request_row.user_id;
  end if;
  update public.refund_requests set
    status=case when p_decision='approve' then 'processing' else 'rejected' end,
    review_note=nullif(trim(p_review_note),''),reviewed_by=auth.uid(),reviewed_at=now()
  where id=p_request_id returning * into request_row;
  return request_row;
end; $$;
revoke all on function public.review_wallet_refund(uuid,text,text) from public,anon;
grant execute on function public.review_wallet_refund(uuid,text,text) to authenticated;

create or replace function public.complete_wallet_refund(p_request_id uuid,p_success boolean,p_payout_reference text,p_failure_note text default null)
returns public.refund_requests language plpgsql security definer set search_path=public as $$
declare request_row public.refund_requests;
begin
  select * into request_row from public.refund_requests where id=p_request_id for update;
  if not found then raise exception 'Refund request not found'; end if;
  if request_row.status<>'processing' then return request_row; end if;
  update public.wallets set held_paise=held_paise-request_row.amount_paise where user_id=request_row.user_id;
  if p_success then
    perform public.post_wallet_transaction(request_row.user_id,'withdrawal','debit',request_row.amount_paise,
      'Refund paid to original payment method','refund_request',request_row.id::text,
      jsonb_build_object('payout_reference',p_payout_reference),request_row.reviewed_by);
    update public.refund_requests set status='paid',payout_reference=p_payout_reference
      where id=p_request_id returning * into request_row;
  else
    update public.refund_requests set status='failed',review_note=concat_ws(' · ',review_note,nullif(trim(p_failure_note),''))
      where id=p_request_id returning * into request_row;
  end if;
  return request_row;
end; $$;
revoke all on function public.complete_wallet_refund(uuid,boolean,text,text) from public,anon,authenticated;
grant execute on function public.complete_wallet_refund(uuid,boolean,text,text) to service_role;
