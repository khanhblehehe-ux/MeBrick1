const db = require("../db");

exports.getStats = async (req, res) => {
  try {
    // ===== KPI =====
    // totalOrders
    const { count: totalOrders, error: e1 } = await db
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (e1) {
      console.error(e1);
      return res.status(500).json({ message: "Get admin stats failed" });
    }

    // pendingOrders
    const { count: pendingOrders, error: e2 } = await db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (e2) {
      console.error(e2);
      return res.status(500).json({ message: "Get admin stats failed" });
    }

    // revenue = sum(total_amount) chỉ những đơn đã xác nhận thanh toán
    const { data: revenueRows, error: e3 } = await db
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid");

    if (e3) {
      console.error(e3);
      return res.status(500).json({ message: "Get admin stats failed" });
    }

    const revenue = (revenueRows || []).reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);

    // totalProducts
    const { count: totalProducts, error: e4 } = await db
      .from("products")
      .select("*", { count: "exact", head: true });

    if (e4) {
      console.error(e4);
      return res.status(500).json({ message: "Get admin stats failed" });
    }

    // ===== Latest orders =====
    const { data: latestOrders, error: e5 } = await db
      .from("orders")
      .select("id, customer_name, total_amount, status, created_at")
      .order("id", { ascending: false })
      .limit(5);

    if (e5) {
      console.error(e5);
      return res.status(500).json({ message: "Get admin stats failed" });
    }

    // Giữ format response giống bản MySQL (total_amount -> total)
    const latest = (latestOrders || []).map((o) => ({
      id: o.id,
      customer_name: o.customer_name,
      total: o.total_amount,
      status: o.status,
      created_at: o.created_at,
    }));

    res.json({
      revenue,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalProducts: totalProducts || 0,
      latestOrders: latest,
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Get admin stats failed" });
  }
};
