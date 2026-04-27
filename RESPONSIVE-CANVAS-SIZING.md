# 📐 Responsive Canvas Sizing - Tỉ Lệ Khung Hình Theo Màn Hình

## ✅ Vấn Đề Đã Giải Quyết

Trước đây, giao diện **giống nhau** trên màn hình 15 inch và 24 inch. Giờ đây:
- **15" → Canvas 750x750px** (phù hợp với màn hình nhỏ)
- **24" → Canvas 1200x1200px** (phù hợp với màn hình lớn)

Tỉ lệ: **15/24 = 750/1200** ✅

---

## 📋 Các Thay Đổi Chi Tiết

### 1️⃣ **File: `f/app/design/config/size.config.js`**

**Trước:**
```javascript
export const CANVAS_SIZE_CONFIG = {
  desktop: { width: 700, height: 700, breakpoint: 1024 },
  mobile: { width: 500, height: 500, breakpoint: 1023 }
};
```

**Sau:** ✅ Thêm 5 breakpoint riêng biệt
```javascript
export const CANVAS_SIZE_CONFIG = {
  // Small desktop / Laptop 15" (1024px - 1365px)
  desktop_small: { width: 750, height: 750, breakpoint: 1024, maxWidth: 1365 },
  
  // Medium desktop / 17-19" (1366px - 1679px)
  desktop_medium: { width: 900, height: 900, breakpoint: 1366, maxWidth: 1679 },
  
  // Large desktop / 24" (1680px+)
  desktop_large: { width: 1200, height: 1200, breakpoint: 1680 },
  
  // Tablet (768px - 1023px)
  tablet: { width: 600, height: 600, breakpoint: 768, maxWidth: 1023 },
  
  // Mobile (<768px)
  mobile: { width: 500, height: 500, breakpoint: 0, maxWidth: 767 }
};
```

### 2️⃣ **File: `f/app/design/page.jsx`**

**Logic cập nhật canvas size (dòng 82-110):**

Thay vì chỉ có 2 trường hợp (desktop / mobile), giờ có **5 trường hợp**:

```javascript
if (width >= 1680) {
  // 24" → 1200x1200px
} else if (width >= 1366) {
  // 17-19" → 900x900px
} else if (width >= 1024) {
  // 15" → 750x750px
} else if (width >= 768) {
  // Tablet → 600x600px
} else {
  // Mobile → 500x500px
}
```

### 3️⃣ **File: `f/app/design/design.css`**

**Media queries được thêm:**
- `@media (min-width: 1024px) and (max-width: 1365px)` - Desktop nhỏ (15")
- `@media (min-width: 1366px) and (max-width: 1679px)` - Desktop trung (17-19")
- `@media (min-width: 1680px)` - Desktop lớn (24")

**Grid layout thay đổi theo kích thước:**

| Kích Thước | Breakpoint | Canvas | Grid Cols | Gap |
|-----------|-----------|--------|----------|-----|
| 15" | 1024-1365px | 750×750 | 1fr / 320-360px | `var(--space-md)` |
| 17-19" | 1366-1679px | 900×900 | 1fr / 380-420px | `var(--space-lg)` |
| 24" | 1680px+ | 1200×1200 | 1fr / 420-480px | `var(--space-xl)` |

---

## 🧪 Cách Kiểm Tra

### Phương pháp 1: DevTools (Chrome/Firefox)

1. Mở **DevTools** (F12)
2. Click **Toggle Device Toolbar** 📱
3. Test các kích thước:
   - **1024px** → Canvas 750×750
   - **1366px** → Canvas 900×900
   - **1680px** → Canvas 1200×1200

### Phương pháp 2: Resize Browser Window

1. Mở trang `/design`
2. Kéo rộng/hẹp cửa sổ trình duyệt
3. Quan sát canvas size thay đổi tự động
4. Kiểm tra console xem size hiện tại

---

## 📊 So Sánh Canvas Sizes

```
Mobile (< 768px)
┌──────────────┐
│   500×500    │ ← Nhỏ nhất, phù hợp điện thoại
└──────────────┘

Tablet (768-1023px)
┌──────────────┐
│   600×600    │ ← Vừa phải
└──────────────┘

Laptop 15" (1024-1365px)
┌──────────────────┐
│     750×750      │ ← Phù hợp 15"
└──────────────────┘

Desktop 17-19" (1366-1679px)
┌────────────────────────┐
│       900×900          │ ← Phù hợp 17-19"
└────────────────────────┘

Desktop 24" (1680px+)
┌──────────────────────────────┐
│         1200×1200            │ ← Lớn nhất, phù hợp 24"
└──────────────────────────────┘
```

---

## 🎯 Lợi Ích

✅ **Canvas size tối ưu** cho từng kích thước màn hình  
✅ **Tính toán tỉ lệ chính xác**: 15/24 = 750/1200  
✅ **Giao diện thích ứng động** khi resize cửa sổ  
✅ **Không phải reload trang**, tự động cập nhật  
✅ **5 breakpoint rõ ràng** cho mọi loại thiết bị  

---

## 🔄 Cách Điều Chỉnh Nếu Cần

### Thay Đổi Canvas Size

**File:** `f/app/design/config/size.config.js`

```javascript
desktop_large: {
  width: 1200,   // ← Thay đổi kích thước
  height: 1200,  // ← Thay đổi kích thước
  breakpoint: 1680,
},
```

### Thay Đổi Breakpoint

**File:** `f/app/design/config/size.config.js` và `f/app/design/design.css`

**Ví dụ:** Muốn 24" bắt đầu từ 1600px thay vì 1680px?

```javascript
// size.config.js
desktop_large: {
  breakpoint: 1600,  // ← Đổi từ 1680 sang 1600
}

// design.css
@media (min-width: 1600px) {  // ← Đổi từ 1680px sang 1600px
  .lego-layout { ... }
}
```

---

## 📝 Files Đã Sửa

- ✅ `f/app/design/config/size.config.js` - Config 5 breakpoint
- ✅ `f/app/design/page.jsx` - Logic lựa chọn canvas size (dòng 82-130)
- ✅ `f/app/design/design.css` - Media query mới (dòng 155-185)

---

## 🚀 Kết Quả

**Trước:** Giao diện giống nhau trên 15" và 24"  
**Sau:** ✅ Giao diện tối ưu riêng biệt cho từng kích thước màn hình

Canvas sizes tự động thay đổi:
- `750×750` → `900×900` → `1200×1200` khi resize

---

**Cập nhật:** 2026-04-22  
**Status:** ✅ Production Ready
