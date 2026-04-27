# 🔧 Hướng Dẫn Khôi Phục Lỗi Tạo QR Code Thanh Toán

## 🎯 Tóm Tắt Vấn Đề
Lỗi "Order creation error" với status 500 xảy ra khi khách hàng tạo đơn hàng. Nguyên nhân chính là **RPC function trong Supabase sử dụng bảng sai**.

### Root Cause
RPC function `create_order_with_items` đang tìm sản phẩm trong bảng `public.image` nhưng sản phẩm thực tế lưu trong bảng `public.products`.

```sql
-- ❌ Sai (gây lỗi)
join public.image img on img.id = (it->>'product_id')::bigint;

-- ✅ Đúng
left join public.products prod on prod.id = (it->>'product_id')::bigint;
```

---

## ✅ Hướng Dẫn Sửa Lỗi

### **Bước 1: Cập Nhật RPC Function trong Supabase**

1. Đăng nhập vào **Supabase Dashboard**
2. Chọn project của bạn
3. Vào **SQL Editor** → Click **New Query**
4. Copy đoạn SQL dưới đây và paste vào editor:

```sql
-- Fixed RPC Function: create_order_with_items
-- Sử dụng bảng 'products' thay vì 'image'

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
```

5. Nhấn nút **Execute** (hoặc Ctrl+Enter) để chạy lệnh SQL
6. Chờ kết quả success

---

### **Bước 2: Kiểm Tra Backend**

Các file đã được cập nhật:
- ✅ `b/controllers/order.controller.js` - Sửa response của `getVietQRInfo` để trả về `memo` thay vì `description`
- ✅ `b/migrations/002_fix_create_order_with_items_rpc.sql` - Đã cập nhật để join với bảng `products` đúng

---

### **Bước 3: Restart Backend Server**

Nếu backend đang chạy:
1. Bấm Ctrl+C để dừng server
2. Chạy lại: `npm start` hoặc `npm run dev` (tùy theo config)

---

### **Bước 4: Test Tạo Đơn Hàng**

1. Trên frontend, thêm sản phẩm vào giỏ
2. Vào trang checkout và điền thông tin
3. Bấm "Tạo đơn" để submit form
4. Nếu thành công → sẽ chuyển sang trang thanh toán QR

#### Các URL để test:
- **Trang checkout**: http://localhost:3000/checkout
- **Trang thanh toán**: http://localhost:3000/pay/[orderId]
- **Trang chi tiết đơn**: http://localhost:3000/order/[orderId]

---

## 🔍 Nếu Vẫn Gặp Lỗi

### 1. Kiểm tra Product ID
Đảm bảo rằng có ít nhất 1 sản phẩm trong bảng `products`:

```sql
select id, name, price from public.products limit 10;
```

Nếu không có, thêm sản phẩm qua API:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 100000,
    "image": null,
    "section": "collection"
  }'
```

### 2. Kiểm tra bảng order_items

```sql
select * from public.order_items limit 10;
```

Nếu bảng không tồn tại, tạo nó:

```sql
create table public.order_items (
  id bigint primary key generated always as identity,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint,
  product_name text,
  unit_price integer default 0,
  quantity integer default 1,
  design_data jsonb,
  design_preview_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### 3. Kiểm tra logs từ backend

Mở terminal chạy backend và xem lỗi chi tiết:

```bash
cd b
npm start
```

Lỗi sẽ hiển thị ở console, ví dụ:
```
RPC error: relation "public.image" does not exist
```

---

## 📋 Checklist Sau Khi Sửa

- [ ] Cập nhật RPC function trong Supabase
- [ ] Kiểm tra backend logs không có lỗi
- [ ] Test tạo đơn hàng từ frontend
- [ ] Kiểm tra QR code hiển thị đúng tại trang `/pay/[orderId]`
- [ ] Kiểm tra đơn hàng được lưu trong bảng `orders` và `order_items`

---

## 📞 Support

Nếu vẫn gặp vấn đề:
1. Kiểm tra giá trị `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` trong file `.env` của thư mục `b/`
2. Xem logs chi tiết từ backend: `npm start`
3. Kiểm tra Supabase RLS policies không chặn INSERT vào bảng `orders` và `order_items`

