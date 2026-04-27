// routes/upload.route.js
const express = require("express");
const multer = require("multer");
const router = express.Router();

const controller = require("../controllers/upload.controller");
const auth = require("../middlewares/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Admin upload ảnh sản phẩm (form-data file) => cần auth
router.post(
  "/product-image",
  auth,
  upload.single("file"),
  controller.uploadProductImage,
);

// ✅ PUBLIC: user upload preview base64 (json: { dataUrl })
router.post("/base64", controller.uploadBase64Preview);

// ✅ PUBLIC: customer tự upload ảnh trong trang thiết kế (không cần đăng nhập)
router.post(
  "/customer-image-public",
  upload.single("file"),
  controller.uploadCustomerImagePublic,
);

// ✅ ADMIN: upload customer design image
router.post(
  "/customer-image",
  auth,
  upload.single("file"),
  controller.uploadCustomerImage,
);

// ✅ ADMIN: get all customer images
router.get("/customer-images", auth, controller.getCustomerImages);

// ✅ ADMIN: delete customer image
router.delete("/customer-images/:id", auth, controller.deleteCustomerImage);

module.exports = router;
