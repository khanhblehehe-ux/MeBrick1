const db = require("../db");

exports.getByOrderId = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    if (!orderId) return res.status(400).json({ message: "orderId invalid" });

    const { data: items, error } = await db
      .from("order_items")
      .select("id, order_id, product_id, design_preview_url")
      .eq("order_id", orderId)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Fetch preview failed" });
    }

    if (!items || items.length === 0) {
      return res.status(404).json({ message: "No items for this order" });
    }

    const previews = items
      .map((it) => it.design_preview_url)
      .filter(Boolean);

    // trả 1 ảnh chính + danh sách (nếu order có nhiều item)
    return res.json({
      order_id: orderId,
      preview_url: previews[0] || null,
      previews,
      items: items.map((it) => ({
        id: it.id,
        product_id: it.product_id,
        preview_url: it.design_preview_url || null,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Fetch preview failed" });
  }
};
