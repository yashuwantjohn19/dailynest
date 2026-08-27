-- Allow a paid subscription to be cancelled before its first delivery date.
-- The end date must never precede the subscription start date.

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
    end_date=case when p_status='cancelled' then greatest(current_date,current_subscription.start_date) else end_date end,
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
