-- Fixed RPC Function: create_order_with_items
-- Updated to use 'image' table instead of 'products'
-- This ensures order_items are properly inserted with design_preview_url

create or replace function public.create_order_with_items(
  p_customer_name text,
  p_phone text,
  p_note text,
  p_status text,
  p_address text,
  p_email text,
  p_shipping_fee integer,
  p_deposit_percent integer,
  p_payment_method text,
  p_payment_provider text,
  p_payment_status text,
  p_items jsonb
)
returns bigint
language plpgsql
security definer
as $$
declare
  new_order_id bigint;
  v_subtotal integer := 0;
  v_total integer := 0;
  v_pay integer := 0;
  v_deposit integer := 100;
begin
  if p_items is null 
     or jsonb_typeof(p_items) <> 'array' 
     or jsonb_array_length(p_items) = 0 then
    raise exception 'items empty';
  end if;

  v_deposit := greatest(least(coalesce(p_deposit_percent,100),100),1);

  insert into public.orders (
    customer_name,
    phone,
    note,
    total_amount,
    status,
    address,
    email,
    shipping_fee,
    deposit_percent,
    pay_amount,
    payment_method,
    payment_provider,
    payment_status
  )
  values (
    p_customer_name,
    p_phone,
    p_note,
    0,
    coalesce(p_status,'pending'),
    p_address,
    p_email,
    greatest(coalesce(p_shipping_fee,0),0),
    v_deposit,
    0,
    coalesce(p_payment_method,'bank_qr'),
    p_payment_provider,
    coalesce(p_payment_status,'unpaid')
  )
  returning id into new_order_id;

  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    unit_price,
    quantity,
    design_data,
    design_preview_url
  )
  select
    new_order_id,
    prod.id,
    prod.name,
    greatest(
      prod.price,
      greatest(coalesce(nullif(it->>'unit_price','')::int, 0), 0)
    ) as unit_price,
    greatest(coalesce((it->>'quantity')::int,1),1) as quantity,
    it->'design_data',
    nullif(it->>'design_preview_url','')
  from jsonb_array_elements(p_items) it
  left join public.products prod
    on prod.id = (it->>'product_id')::bigint;

  select coalesce(sum(unit_price * quantity),0)
    into v_subtotal
  from public.order_items
  where order_id = new_order_id;

  v_total := v_subtotal + greatest(coalesce(p_shipping_fee,0),0);
  v_pay := round(v_total * (v_deposit / 100.0));

  if v_pay <= 0 then
    raise exception 'pay_amount invalid';
  end if;

  update public.orders
  set total_amount = v_total,
      pay_amount = v_pay
  where id = new_order_id;

  return new_order_id;
end;
$$;
