# 🚀 Hướng Dẫn Sửa Lỗi QR Code - 4 Bước

## 📋 Tóm Tắt
3 file SQL để sửa:
1. **STEP_1_CHECK_STATUS.sql** - Kiểm tra hiện trạng
2. **STEP_2_CREATE_TABLES.sql** - Tạo/cập nhật bảng + RLS
3. **STEP_3_FIX_RPC.sql** - Fix RPC function (QUAN TRỌNG)
4. **STEP_4_ADD_TEST_DATA.sql** - Thêm dữ liệu test

---

## ✅ Cách Làm

### Bước 1: Kiểm Tra Trạng Thái
```
Supabase Dashboard → SQL Editor → New Query
↓
Mở file: STEP_1_CHECK_STATUS.sql
↓
Copy toàn bộ → Paste vào editor → Execute
↓
Xem kết quả (báo cho tôi kết quả)
```

### Bước 2: Tạo/Cập Nhật Bảng
```
Supabase Dashboard → SQL Editor → New Query
↓
Mở file: STEP_2_CREATE_TABLES.sql
↓
Copy toàn bộ → Paste → Execute
```

### Bước 3: FIX RPC Function (CHÍNH)
```
Supabase Dashboard → SQL Editor → New Query
↓
Mở file: STEP_3_FIX_RPC.sql
↓
Copy toàn bộ → Paste → Execute
```
⚠️ **ĐÂY LÀ BƯỚC QUAN TRỌNG NHẤT** - Fix lỗi join với bảng `products`

### Bước 4: Thêm Dữ Liệu Test
```
Supabase Dashboard → SQL Editor → New Query
↓
Mở file: STEP_4_ADD_TEST_DATA.sql
↓
Copy toàn bộ → Paste → Execute
```

---

## 🧪 Test Sau Khi Sửa

### Test 1: Kiểm tra API Products
```powershell
curl -X GET http://localhost:5000/api/products
```
✅ Phải trả về JSON array các sản phẩm

### Test 2: Tạo Đơn Hàng
1. Frontend: http://localhost:3000/checkout
2. Thêm sản phẩm vào giỏ
3. Điền thông tin và bấm "Tạo đơn"
4. ✅ Nếu thành công → chuyển sang trang `/pay/[orderId]`

### Test 3: Kiểm tra QR Code
1. Vào http://localhost:3000/pay/1 (thay 1 bằng order ID)
2. ✅ Phải thấy QR code thanh toán

---

## 🎯 Điều Cần Lưu Ý

### Thứ Tự Chạy
- ⚠️ **PHẢI CHẠY THEO THỨ TỰ**: Step 1 → 2 → 3 → 4
- Không chạy bước 3 trước bước 2

### File Chính
- `STEP_3_FIX_RPC.sql` = RPC function sửa (join với `products` chứ không phải `image`)

### Backend
- Sau khi sửa database, **restart backend**: 
  ```bash
  cd b
  npm start
  ```

---

## 🐛 Nếu Vẫn Có Lỗi

### Error: "relation public.image does not exist"
→ Lỗi RPC chưa update → Chạy lại `STEP_3_FIX_RPC.sql`

### Error: "Load products failed"
→ Bảng products không có dữ liệu → Chạy `STEP_4_ADD_TEST_DATA.sql`

### Error: "items empty"
→ Frontend không gửi items → Check cart có sản phẩm không

---

## 📞 Cần Giúp?

Copy error message từ backend logs (terminal mở `npm start`) rồi gửi cho tôi!

Ví dụ:
```
RPC error: relation "public.image" does not exist
```
