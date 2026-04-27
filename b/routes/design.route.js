const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middlewares/auth");

// Admin: lấy thiết kế theo orderId
router.get("/:orderId", auth, async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    if (!orderId) return res.status(400).send("orderId không hợp lệ");

    // (Tuỳ chọn) chỉ cho xem khi paid
    // const { data: order, error: oErr } = await db.from("orders").select("id,payment_status").eq("id", orderId).single();
    // if (oErr) return res.status(404).send("Order not found");
    // if (order.payment_status !== "paid") return res.status(403).send("Order chưa paid");

    const { data: items, error } = await db
      .from("order_items")
      .select("id, order_id, product_id, product_name, quantity, unit_price, design_data, design_preview_url")
      .eq("order_id", orderId)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).send("Fetch design failed");
    }

    if (!items || items.length === 0) {
      return res.status(404).send("Không có thiết kế cho đơn này");
    }

    // trả item đầu + toàn bộ list
    return res.json({
      order_id: orderId,
      first: items[0],
      items,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Fetch design failed");
  }
});

module.exports = router;
