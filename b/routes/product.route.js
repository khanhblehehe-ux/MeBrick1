const express = require("express");
const auth = require("../middlewares/auth");
const productController = require("../controllers/product.controller");

const router = express.Router();

// public
router.get("/", productController.getAll);

// ✅ NEW: public get product by id
router.get("/:id", productController.getById);

// protected by JWT
router.post("/", auth, productController.create);
router.put("/:id", auth, productController.update);
router.delete("/:id", auth, productController.remove);

module.exports = router;
