const db = require("../db");
const {
  normalizePhoneVN,
  isValidVietnamPhone,
} = require("../utils/phone");

/* =========================
   Helpers
========================= */
function safeInt(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}

function clampInt(v, min, max) {
  const n = safeInt(v, min);
  return Math.max(min, Math.min(max, n));
}

function safeParseJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/* =========================
   Upload helpers (base64 → Supabase Storage)
========================= */
const UPLOAD_BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET || "products";

function _parseDataUrl(dataUrl) {
  if (typeof dataUrl !== "string") return null;
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return null;
  try {
    return { mimeType: m[1], buffer: Buffer.from(m[2], "base64") };
  } catch {
    return null;
  }
}

function _mimeToExt(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

async function uploadBase64ToStorage(dataUrl) {
  const parsed = _parseDataUrl(dataUrl);
  if (!parsed) return null;
  const { mimeType, buffer } = parsed;
  const ext = _mimeToExt(mimeType);
  const filePath = `customer-designs/${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.${ext}`;
  const { error } = await db.storage.from(UPLOAD_BUCKET).upload(filePath, buffer, {
    contentType: mimeType,
    upsert: false,
    cacheControl: "31536000",
  });
  if (error) {
    console.warn("uploadBase64ToStorage failed:", error.message);
    return null;
  }
  const { data } = db.storage.from(UPLOAD_BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || null;
}

/* =========================
   CREATE ORDER (giữ nguyên, nhưng lưu ý tên bảng sản phẩm có thể là image)
========================= */
exports.create = async (req, res) => {
  try {
    const body = req.body || {};

    const {
      customer_name,
      phone,
      note,
      status: status_in,
      address,
      email,
      shipping_fee,
      payment_method: payment_method_in,
      items,
    } = body;

    if (!customer_name || !phone) {
      return res.status(400).json({
        message: "customer_name và phone là bắt buộc",
      });
    }

    const cleanPhone = normalizePhoneVN(phone);
    if (!isValidVietnamPhone(cleanPhone)) {
      return res.status(400).json({
        message: "Số điện thoại không hợp lệ",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "items empty",
      });
    }

    const shipFee = clampInt(shipping_fee ?? 0, 0, 1_000_000);
    const payment_method =
      String(payment_method_in || "bank_qr").toLowerCase() === "cod"
        ? "cod"
        : "bank_qr";
    const payment_provider =
      payment_method === "bank_qr" ? "vietqr" : null;
    const deposit_percent = 100;

    /* =========================
       LOAD PRODUCTS (từ bảng image)
    ========================== */
    const productIds = [
      ...new Set(
        items
          .map((i) =>
            safeInt(i.product_id ?? i.productId ?? i.id)
          )
          .filter(Boolean)
      ),
    ];

    if (productIds.length === 0) {
      return res.status(400).json({
        message: "Thiếu product_id",
      });
    }

    const { data: products, error: pErr } = await db
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (pErr) {
      console.error(pErr);
      return res.status(500).json({
        message: "Load products failed",
      });
    }

    const mapProd = new Map(
      (products || []).map((p) => [Number(p.id), p])
    );

    // Check if any products are missing
    const missingIds = [];
    items.forEach((it) => {
      const product_id = safeInt(
        it.product_id ?? it.productId ?? it.id
      );
      if (product_id && !mapProd.has(product_id)) {
        missingIds.push(product_id);
      }
    });

    if (missingIds.length > 0) {
      return res.status(400).json({
        message: `Các sản phẩm không tồn tại: ${missingIds.join(", ")}`,
      });
    }

    /* =========================
       NORMALIZE ITEMS
    ========================== */
    const normalized = (
      await Promise.all(
        items.map(async (it) => {
          const product_id = safeInt(
            it.product_id ?? it.productId ?? it.id
          );
          const quantity = clampInt(
            it.quantity ?? 1,
            1,
            999
          );
          const p = mapProd.get(product_id);
          if (!p) return null;

          let design_data =
            typeof it.design_data === "string"
              ? safeParseJson(it.design_data)
              : it.design_data;

          let unit_price = safeInt(p.price ?? 0, 0);
          const unitTotal = safeInt(
            design_data?.pricing?.unitTotal ?? null,
            0
          );
          if (unitTotal > 0) {
            unit_price = unitTotal;
          }

          // Upload base64 sticker images to Supabase Storage
          let uploaded_images = [];
          if (Array.isArray(it.uploaded_images) && it.uploaded_images.length > 0) {
            uploaded_images = it.uploaded_images;
          } else if (Array.isArray(design_data?.stickers)) {
            const uploadedStickers = await Promise.all(
              design_data.stickers.map(async (s) => {
                if (
                  s.layerType === "image" &&
                  typeof s.src === "string" &&
                  s.src.startsWith("data:")
                ) {
                  const url = await uploadBase64ToStorage(s.src);
                  if (url) return { ...s, src: url, original_url: url };
                }
                return s;
              })
            );
            design_data = { ...design_data, stickers: uploadedStickers };
            uploaded_images = uploadedStickers
              .filter(
                (s) =>
                  s.layerType === "image" &&
                  (s.original_url || s.src) &&
                  !String(s.src || "").startsWith("data:")
              )
              .map((s) => s.original_url || s.src);
          }

          // Embed uploaded_images inside design_data so the RPC persists them
          if (uploaded_images.length > 0 && design_data) {
            design_data = { ...design_data, uploaded_images };
          }

          return {
            product_id,
            quantity,
            unit_price,
            design_data: design_data ?? null,
            design_preview_url:
              it.design_preview_url ??
              design_data?.design_preview_url ??
              null,
            uploaded_images,
          };
        })
      )
    ).filter(Boolean);

    if (normalized.length === 0) {
      return res.status(400).json({
        message: "No valid items",
      });
    }

    /* =========================
       CALCULATE TOTAL
    ========================== */
    const subtotal = normalized.reduce(
      (sum, it) => sum + it.unit_price * it.quantity,
      0
    );
    const total_amount = subtotal + shipFee;
    const pay_amount = total_amount;
    const order_status = status_in || "pending";
    const payment_status = "unpaid";

    /* =========================
       CALL RPC
    ========================== */
    const { data: newId, error: cErr } = await db.rpc(
      "create_order_with_items",
      {
        p_customer_name: String(customer_name).trim(),
        p_phone: cleanPhone,
        p_note: note ?? null,
        p_status: order_status,
        p_address: address ?? null,
        p_email: email ?? null,
        p_shipping_fee: shipFee,
        p_deposit_percent: deposit_percent,
        p_payment_method: payment_method,
        p_payment_provider: payment_provider,
        p_payment_status: payment_status,
        p_items: normalized,
      }
    );

    if (cErr) {
      console.error("RPC error:", cErr);
      // Return more detailed error message
      const errorMsg = cErr?.message || "Create order failed";
      return res.status(500).json({
        message: errorMsg,
        details: process.env.NODE_ENV === "development" ? cErr : undefined,
      });
    }

    const orderId = Number(newId);
    const { error: updateErr } = await db
      .from("orders")
      .update({ items_data: normalized })
      .eq("id", orderId);

    if (updateErr) {
      console.warn("Failed to save items_data:", updateErr);
    }

    return res.json({
      id: orderId,
      total_amount,
      pay_amount,
      status: order_status,
      payment_method,
      payment_status,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Create order failed",
    });
  }
};

/* =========================
   SEARCH BY PHONE (ĐÃ SỬA - dùng bảng image)
========================= */
exports.searchByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const cleanPhone = normalizePhoneVN(phone);
    if (!isValidVietnamPhone(cleanPhone)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    // Lấy orders kèm order_items (product_name đã được lưu trong order_items)
    const { data, error } = await db
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          design_preview_url,
          product_name
        )
      `)
      .eq("phone", cleanPhone)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Lỗi truy vấn orders:", error);
      return res.status(500).json({ message: "Lỗi tra cứu đơn hàng" });
    }

    // Chuyển đổi dữ liệu về cấu trúc frontend mong đợi
    const ordersWithItems = (data || []).map(order => {
      const items = (order.order_items || []).map(item => ({
        id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_name: item.product_name || "Không xác định",
        design_preview_url: item.design_preview_url,
      }));
      return {
        ...order,
        order_items: items,
      };
    });

    return res.json(ordersWithItems);
  } catch (e) {
    console.error("Lỗi searchByPhone:", e);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* =========================
   GET BY ID (ĐÃ SỬA)
========================= */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await db
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          design_preview_url,
          product_name,
          design_data
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return res.status(404).json({ message: "Order not found" });
    }

    const items = (data.order_items || []).map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_name: item.product_name || "Không xác định",
      design_preview_url: item.design_preview_url,
      design_data: item.design_data,
    }));

    return res.json({
      ...data,
      items,
      order_items: items,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Get order failed" });
  }
};

/* =========================
   GET VIETQR INFO (giữ nguyên)
========================= */
exports.getVietQRInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error: err } = await db
      .from("orders")
      .select("id, total_amount, customer_name, payment_status")
      .eq("id", id)
      .single();

    if (err) {
      console.error(err);
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      orderId: data.id,
      amount: data.total_amount,
      memo: `Thanh toan don ${data.id} - ${data.customer_name}`,
      paymentStatus: data.payment_status,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Get VietQR info failed",
    });
  }
};

/* =========================
   MARK TRANSFERRED (giữ nguyên)
========================= */
exports.markTransferred = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error: err } = await db
      .from("orders")
      .update({ payment_status: "transferred" })
      .eq("id", id)
      .select();

    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Mark transferred failed",
      });
    }

    return res.json(data?.[0] || { id, payment_status: "transferred" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Mark transferred failed",
    });
  }
};

/* =========================
   GET ALL (ADMIN) (ĐÃ SỬA)
========================= */
exports.getAll = async (req, res) => {
  try {
    const { data: orders, error } = await db
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          design_preview_url,
          product_name,
          design_data
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Get orders failed" });
    }

    const result = orders.map(order => {
      const items = (order.order_items || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_name: item.product_name || "Không xác định",
        design_preview_url: item.design_preview_url,
        design_data: item.design_data,
      }));
      return {
        ...order,
        items,
        order_items: items,
      };
    });

    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Get orders failed" });
  }
};

/* =========================
   UPDATE STATUS (ADMIN) (giữ nguyên)
========================= */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const { data, error: err } = await db
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select();

    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Update status failed",
      });
    }

    return res.json(data?.[0] || { id, status });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Update status failed",
    });
  }
};

/* =========================
   MARK PAID (ADMIN) (giữ nguyên)
========================= */
exports.markPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error: err } = await db
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", id)
      .select();

    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Mark paid failed",
      });
    }

    return res.json(data?.[0] || { id, payment_status: "paid" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Mark paid failed",
    });
  }
};

/* =========================
   REMOVE (ADMIN) (giữ nguyên)
========================= */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error: err } = await db
      .from("orders")
      .delete()
      .eq("id", id)
      .select();

    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Delete order failed",
      });
    }

    return res.json({ success: true, id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Delete order failed",
    });
  }
};