# 🔧 Hướng Dẫn Khôi Phục QR Code Functionality

## 📋 Vấn đề
Chức năng tạo QR code để xem thiết kế sản phẩm trên trang **tra cứu đơn hàng** bị mất vì cột `design_preview_url` không tồn tại hoặc bị xóa từ bảng `order_items`.

## 🎯 Giải Pháp

### **Bước 1: Thêm cột vào Bảng Dữ Liệu**

#### **Sử dụng Supabase Dashboard:**
1. Đăng nhập Supabase → Chọn Project
2. Vào **SQL Editor** → **New Query**
3. Copy & Paste đoạn SQL từ file: `b/migrations/001_add_design_preview_url_to_order_items.sql`
4. Nhấn **Run**

#### **Hoặc dùng SQL CLI:**
```bash
# Từ thư mục b/
psql postgres://[YOUR_SUPABASE_CONNECTION_STRING] < migrations/001_add_design_preview_url_to_order_items.sql
```

### **Bước 2: Cập Nhật RPC Function (QUAN TRỌNG)**

Bảng `order_items` cần được điền dữ liệu từ RPC function `create_order_with_items`. 

**Kiểm tra & cập nhật RPC:**

```sql
-- Xem RPC function hiện tại
SELECT prosrc FROM pg_proc 
WHERE proname = 'create_order_with_items';

-- Nếu RPC chưa lưu design_preview_url, cần alterfunction để thêm logic:
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_customer_name VARCHAR,
    p_phone VARCHAR,
    p_note TEXT,
    p_status VARCHAR,
    p_address TEXT,
    p_email VARCHAR,
    p_shipping_fee DECIMAL,
    p_deposit_percent INT,
    p_payment_method VARCHAR,
    p_payment_provider VARCHAR,
    p_payment_status VARCHAR,
    p_items JSONB
)
RETURNS INT AS $$
DECLARE
    v_order_id INT;
    v_item JSONB;
BEGIN
    -- Tạo order mới
    INSERT INTO orders (
        customer_name, phone, note, status, address, email,
        shipping_fee, deposit_percent, payment_method, 
        payment_provider, payment_status, created_at
    )
    VALUES (
        p_customer_name, p_phone, p_note, p_status, p_address, p_email,
        p_shipping_fee, p_deposit_percent, p_payment_method,
        p_payment_provider, p_payment_status, NOW()
    )
    RETURNING id INTO v_order_id;

    -- Lưu items vào bảng order_items
    -- ⭐ ĐẢM BẢO BỎQ LƯUI design_preview_url
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, design_preview_url, design_data)
    SELECT 
        v_order_id,
        (item->>'product_id')::INT,
        (item->>'quantity')::INT,
        (item->>'unit_price')::DECIMAL,
        item->>'design_preview_url',  -- ⭐ Quan trọng!
        item->'design_data'
    FROM jsonb_array_elements(p_items) AS item;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;
```

### **Bước 3: Kiểm Tra Backend Code**

Đảm bảo `order.controller.js` đang gửi `design_preview_url` trong payload:

✅ Kiểm tra file: `b/controllers/order.controller.js`
- Hàm `create()` → Chuẩn bị `normalized` items với `design_preview_url`
- Gửi đến RPC với dữ liệu đúng

### **Bước 4: Test**

1. **Tạo đơn hàng mới** từ Frontend
2. **Tra cứu đơn hàng** bằng SDT
3. **Kiểm tra QR code** có hiện không

## ✅ Checklist

- [ ] Thêm cột `design_preview_url` vào `order_items`
- [ ] Kiểm tra/cập nhật RPC function `create_order_with_items`
- [ ] Test tạo đơn hàng & tra cứu

## 🐛 Debug

Nếu vẫn không hoạt động:

```sql
-- Kiểm tra cột có tồn tại không
SELECT * FROM order_items LIMIT 1;

-- Kiểm tra dữ liệu có được lưu không
SELECT order_id, design_preview_url FROM order_items LIMIT 5;

-- Kiểm tra RPC function
SELECT prosrc FROM pg_proc WHERE proname = 'create_order_with_items' \gset
\echo :proname
```

Nếu `design_preview_url` là NULL, issue là ở RPC function không lưu dữ liệu.

---

**📌 Liên hệ:** Nếu cần hỗ trợ cập nhật RPC function, vui lòng cung cấp SQL function hiện tại.
