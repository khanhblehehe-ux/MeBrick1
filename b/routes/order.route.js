// routes/order.route.js

const express = require("express");
const router = express.Router();

// ✅ SỬA ĐÚNG TÊN FILE
const controller = require("../controllers/order.controller");

const auth = require("../middlewares/auth");

/* =========================
   PUBLIC ROUTES
========================= */

// Tạo đơn
router.post("/", controller.create);

// 🔥 PHẢI đặt route cụ thể TRƯỚC dynamic :id
router.get("/search/by-phone", controller.searchByPhone);

// Lấy thông tin VietQR
router.get("/:id/vietqr", controller.getVietQRInfo);

// User bấm "Tôi đã chuyển khoản"
router.post("/:id/mark-transferred", controller.markTransferred);

// Lấy chi tiết đơn
router.get("/:id", controller.getById);

/* =========================
   ADMIN ROUTES (JWT)
========================= */

// Lấy toàn bộ đơn
router.get("/", auth, controller.getAll);

// Cập nhật trạng thái
router.patch("/:id/status", auth, controller.updateStatus);

// Đánh dấu đã thanh toán
router.patch("/:id/mark-paid", auth, controller.markPaid);

// Xóa đơn
router.delete("/:id", auth, controller.remove);

module.exports = router;