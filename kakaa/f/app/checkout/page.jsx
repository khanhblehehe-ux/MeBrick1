"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./checkout.css";
import Header from "../components/Header";

import { getCart, clearCart } from "../../lib/cart";
import { createOrder } from "../../lib/api/orders";

function safeParseJson(v) {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function pickDesign(it) {
  return safeParseJson(it?.design_data) || null;
}

function pickPreviewUrl(it) {
  const d = pickDesign(it);
  return it?.design_preview_url || d?.design_preview_url || null;
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));
}

function clampInt(v, min, max) {
  const n = Number(v);
  const x = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.max(min, Math.min(max, x));
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState(() => getCart());
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    shipping_fee: 25000,
    payment_method: "bank_qr",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadCart = () => setCart(getCart());

  useEffect(() => {
    loadCart();

    const onFocus = () => loadCart();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const items = cart?.items || [];

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.unit_price || it.price || 0) * Number(it.quantity || 1), 0);
  }, [items]);

  const shipFee = useMemo(() => clampInt(form.shipping_fee ?? 0, 0, 1_000_000), [form.shipping_fee]);

  const paymentMethod = String(form.payment_method || "bank_qr").toLowerCase();

  const totalAmount = subtotal + shipFee;

  const onChangeText = (k) => (e) => {
    setForm((s) => ({ ...s, [k]: e.target.value }));
  };

  const onChangeNumber = (k) => (e) => {
    setForm((s) => ({ ...s, [k]: clampInt(e.target.value, 0, 1_000_000) }));
  };

  const handlePay = async () => {
    try {
      setErr("");
      setLoading(true);

      const latestCart = getCart();
      if (!latestCart.items.length) {
        setErr("Giỏ hàng đang trống.");
        return;
      }
      
      const name = form.customer_name.trim();
      const phone = form.phone.trim();
      
      if (!name || !phone) {
        setErr("Vui lòng nhập Họ tên và SĐT.");
        return;
      }
      
      // Validate phone format (basic check for Vietnamese phone)
      const phoneRegex = /^(0|\+84)[0-9\s\-]{7,}$/;
      if (!phoneRegex.test(phone)) {
        setErr("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam.");
        return;
      }

      // Validate items have product_id
      const items = latestCart.items.map((it) => {
        const product_id = Number(it.product_id ?? it.id ?? it.productId);
        if (!product_id || !Number.isFinite(product_id)) {
          throw new Error(`Sản phẩm thiếu ID: ${it.product_name || 'Unknown'}`);
        }
        
        const design = pickDesign(it);
        const preview = pickPreviewUrl(it);
        const quantity = Number(it.quantity || 1);
        
        if (quantity < 1) {
          throw new Error(`Số lượng không hợp lệ: ${quantity}`);
        }

        return {
          product_id,
          quantity,
          design_data: design ?? null,
          design_preview_url: preview || null,
        };
      });

      if (items.length === 0) {
        setErr("Giỏ hàng không có sản phẩm hợp lệ.");
        return;
      }

      const payload = {
        customer_name: name,
        phone,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        note: form.note.trim() || null,
        shipping_fee: shipFee,
        payment_method: paymentMethod === "cod" ? "cod" : "bank_qr",
        items,
      };

      const order = await createOrder(payload);
      const orderId = order?.id;
      if (!orderId) throw new Error("Tạo đơn thất bại (thiếu id).");

      clearCart();

      if (paymentMethod === "cod") {
        router.push(`/order/${encodeURIComponent(orderId)}`);
      } else {
        router.push(`/pay/${encodeURIComponent(orderId)}`);
      }
    } catch (e) {
      const bodyText = typeof e?.body === "string" ? e.body : "";
      const msg = e?.message || "Tạo đơn thất bại";
      const errMsg = bodyText || msg;

      // Tự động xóa sản phẩm không tồn tại khỏi giỏ hàng
      const missingMatch = errMsg.match(/Các sản phẩm không tồn tại:\s*([\d,\s]+)/);
      if (missingMatch) {
        const missingIds = missingMatch[1].split(",").map((s) => Number(s.trim())).filter(Boolean);
        if (missingIds.length > 0) {
          const { getCart, setCart } = await import("../../lib/cart");
          const currentCart = getCart();
          currentCart.items = currentCart.items.filter(
            (it) => !missingIds.includes(Number(it.product_id))
          );
          setCart(currentCart);
          loadCart();
          setErr(
            `Một số sản phẩm trong giỏ hàng không còn tồn tại (ID: ${missingIds.join(", ")}) và đã được xóa khỏi giỏ. Vui lòng kiểm tra lại giỏ hàng.`
          );
          return;
        }
      }

      setErr(errMsg);
      console.error("Order creation error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 className="checkout-title" style={{ margin: "8px 0 12px", fontSize: 22, fontWeight: 900 }}>
        Thanh toán
      </h1>

      {err ? (
        <div className="checkout-error" style={{ padding: 12, borderRadius: 12, border: "1px solid #ffd0d0", background: "#fff7f7", marginBottom: 12 }}>
          {String(err)}
        </div>
      ) : null}

      <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 14 }}>
        <div className="checkout-card" style={styles.card}>
          <h2 className="checkout-card-title" style={styles.cardTitle}>Thông tin khách hàng</h2>

          <div className="checkout-form-grid" style={styles.grid}>
            <div className="checkout-field" style={styles.field}>
              <label className="checkout-label" style={styles.label}>Họ tên *</label>
              <input className="checkout-input" value={form.customer_name} onChange={onChangeText("customer_name")} style={styles.input} />
            </div>

            <div className="checkout-field" style={styles.field}>
              <label className="checkout-label" style={styles.label}>Số điện thoại *</label>
              <input className="checkout-input" value={form.phone} onChange={onChangeText("phone")} style={styles.input} />
            </div>

            <div className="checkout-field" style={styles.field}>
              <label className="checkout-label" style={styles.label}>Email</label>
              <input className="checkout-input" value={form.email} onChange={onChangeText("email")} style={styles.input} />
            </div>

            <div className="checkout-field" style={styles.field}>
              <label className="checkout-label" style={styles.label}>Phí ship</label>
              <input className="checkout-input" type="number" value={25000} readOnly style={{...styles.input, background: "#f1f5f9", cursor: "not-allowed"}} />
            </div>

            <div className="checkout-field" style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label className="checkout-label" style={styles.label}>Địa chỉ</label>
              <input className="checkout-input" value={form.address} onChange={onChangeText("address")} style={styles.input} />
            </div>

            <div className="checkout-field" style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label className="checkout-label" style={styles.label}>Ghi chú</label>
              <textarea className="checkout-textarea" value={form.note} onChange={onChangeText("note")} rows={3} style={styles.textarea} />
            </div>

            <div className="checkout-field" style={styles.field}>
              <label className="checkout-label" style={styles.label}>Phương thức thanh toán</label>

              <div style={{ display: "grid", gap: 8 }}>
                <label className="checkout-radio" style={styles.radioRow}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_qr"
                    checked={(form.payment_method || "bank_qr") === "bank_qr"}
                    onChange={onChangeText("payment_method")}
                  />
                  <span>Chuyển khoản (VietQR)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="checkout-button-group" style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              className="checkout-button"
              onClick={() => router.back()}
              style={{ height: 42, padding: "0 14px", borderRadius: 12, border: "1px solid #eee", background: "#fff", cursor: "pointer", fontWeight: 900 }}
            >
              Quay lại
            </button>

            <button
              className="checkout-button"
              onClick={handlePay}
              disabled={loading}
              style={{ height: 42, padding: "0 14px", borderRadius: 12, border: "1px solid #0b2d72", background: "#0b2d72", color: "#fff", cursor: "pointer", fontWeight: 900, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Đang xử lý..." : "Tạo đơn"}
            </button>
          </div>
        </div>

        <div className="checkout-card" style={styles.card}>
          <h2 className="checkout-card-title" style={styles.cardTitle}>Tóm tắt đơn hàng</h2>

          <div className="checkout-summary-grid" style={{ display: "grid", gap: 10 }}>
            {items.length === 0 ? (
              <div style={{ color: "#666" }}>Giỏ hàng trống.</div>
            ) : (
              items.map((it, idx) => (
                <div key={idx} className="checkout-product-item" style={{ display: "flex", gap: 10, border: "1px solid #f0f0f0", borderRadius: 12, padding: 10 }}>
                  <div className="checkout-product-thumb" style={{ width: 62, height: 62, borderRadius: 12, border: "1px solid #eee", overflow: "hidden", background: "#fafafa", flex: "0 0 auto" }}>
                    {/* ưu tiên preview */}
                    <img
                      src={pickPreviewUrl(it) || it.image_url || it.image || "/placeholder.png"}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div className="checkout-product-name" style={{ fontWeight: 900, marginBottom: 4 }}>
                      {it.name || it.product_name || "Sản phẩm"}
                    </div>
                    <div className="checkout-product-meta" style={{ display: "flex", justifyContent: "space-between", color: "#444", fontSize: 13 }}>
                      <span>Số lượng: {it.quantity || 1}</span>
                      <span>{formatPrice(it.unit_price || it.price || 0)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div style={{ borderTop: "1px dashed #eee", marginTop: 6, paddingTop: 10, display: "grid", gap: 6 }}>
              <div className="checkout-row" style={styles.row}>
                <span>Tạm tính</span>
                <b>{formatPrice(subtotal)}</b>
              </div>
              <div className="checkout-row" style={styles.row}>
                <span>Phí ship</span>
                <b>{formatPrice(shipFee)}</b>
              </div>
              <div className="checkout-row-big" style={styles.rowBig}>
                <span>Tổng cộng</span>
                <b>{formatPrice(totalAmount)}</b>
              </div>

              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Bạn sẽ được chuyển tới trang VietQR để thanh toán chuyển khoản.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

const styles = {
  card: { background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 14 },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 900, marginBottom: 12 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 12, fontWeight: 800, color: "#444" },
  radioRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid #e6e6e6", borderRadius: 10, background: "#fff", color: "#000" },
  input: { height: 40, padding: "0 12px", borderRadius: 10, border: "1px solid #e6e6e6", outline: "none", background: "#fff" },
  textarea: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e6e6e6", outline: "none", background: "#fff" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  rowBig: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16 },
};
