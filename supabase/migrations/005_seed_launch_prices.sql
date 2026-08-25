-- DailyNest approved launch prices, stored in paise with effective dating.
do $$
declare
  price_now timestamptz := now();
begin
  update public.product_prices pp
  set valid_until = price_now
  from public.products p
  where pp.product_id = p.id
    and pp.valid_until is null
    and pp.amount_paise <> case p.code
      when 'basic' then 9900
      when 'standard' then 17900
      when 'family' then 25900
    end;

  insert into public.product_prices (product_id, amount_paise, currency, valid_from)
  select
    p.id,
    case p.code
      when 'basic' then 9900
      when 'standard' then 17900
      when 'family' then 25900
    end,
    'INR',
    price_now
  from public.products p
  where p.code in ('basic', 'standard', 'family')
    and not exists (
      select 1
      from public.product_prices current_price
      where current_price.product_id = p.id
        and current_price.valid_until is null
    );
end;
$$;
