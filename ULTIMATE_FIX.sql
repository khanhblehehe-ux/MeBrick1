-- 🔥 DROP ALL VERSIONS - SPECIFY EACH SIGNATURE

-- Liệt kê tất cả versions
SELECT proname, pg_get_function_identity_arguments(oid) as signature
FROM pg_proc 
WHERE proname = 'create_order_with_items'
ORDER BY proname, signature;

-- Drop từng version cụ thể
DROP FUNCTION IF EXISTS public.create_order_with_items(text, text, text, text, text, text, int, int, text, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.create_order_with_items(text, text, text, text, text, text, integer, integer, text, text, text, jsonb) CASCADE;

-- Xóa bất kỳ version nào khác
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc 
    WHERE proname = 'create_order_with_items'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS public.create_order_with_items(' || r.args || ') CASCADE';
  END LOOP;
END $$;

-- Verify function đã được xóa
SELECT COUNT(*) as remaining_functions 
FROM pg_proc 
WHERE proname = 'create_order_with_items';

-- Tạo lại version ĐÚNG
CREATE FUNCTION public.create_order_with_items(
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
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_id bigint;
  v_subtotal integer := 0;
  v_total integer := 0;
  v_pay integer := 0;
  v_deposit integer := 100;
BEGIN
  IF p_items IS NULL 
     OR jsonb_typeof(p_items) <> 'array' 
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'items empty';
  END IF;

  v_deposit := GREATEST(LEAST(COALESCE(p_deposit_percent, 100), 100), 1);

  INSERT INTO public.orders (
    customer_name, phone, note, total_amount, status, address, email,
    shipping_fee, deposit_percent, pay_amount, payment_method,
    payment_provider, payment_status
  )
  VALUES (
    p_customer_name, p_phone, p_note, 0, COALESCE(p_status, 'pending'),
    p_address, p_email, GREATEST(COALESCE(p_shipping_fee, 0), 0),
    v_deposit, 0, COALESCE(p_payment_method, 'bank_qr'),
    p_payment_provider, COALESCE(p_payment_status, 'unpaid')
  )
  RETURNING id INTO new_order_id;

  INSERT INTO public.order_items (
    order_id, product_id, product_name, unit_price, quantity,
    design_data, design_preview_url
  )
  SELECT
    new_order_id,
    (it->>'product_id')::bigint,
    COALESCE(prod.name, 'Unknown'),
    GREATEST(COALESCE(prod.price, 0), GREATEST(COALESCE(NULLIF(it->>'unit_price', '')::int, 0), 0)),
    GREATEST(COALESCE((it->>'quantity')::int, 1), 1),
    it->'design_data',
    NULLIF(it->>'design_preview_url', '')
  FROM jsonb_array_elements(p_items) it
  LEFT JOIN public.products prod ON prod.id = (it->>'product_id')::bigint;

  SELECT COALESCE(SUM(unit_price * quantity), 0)
    INTO v_subtotal
  FROM public.order_items
  WHERE order_id = new_order_id;

  v_total := v_subtotal + GREATEST(COALESCE(p_shipping_fee, 0), 0);
  v_pay := ROUND(v_total * (v_deposit / 100.0));

  IF v_pay <= 0 THEN
    RAISE EXCEPTION 'pay_amount invalid';
  END IF;

  UPDATE public.orders
  SET total_amount = v_total, pay_amount = v_pay
  WHERE id = new_order_id;

  RETURN new_order_id;
END;
$$;

-- Final verify
SELECT 
  proname as func_name,
  pg_get_function_identity_arguments(oid) as signature,
  prosrc LIKE '%public.products%' as has_products_ref,
  prosrc LIKE '%public.image%' as has_image_ref
FROM pg_proc 
WHERE proname = 'create_order_with_items';
