"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById } from "../../../lib/api/orders";

function formatVnd(n) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(n || 0));
}

function pickPreviewUrl(item) {
  return (
    item?.design_preview_url ||
    item?.designPreviewUrl ||
    item?.design_data?.design_preview_url ||
    item?.design_data?.preview_url ||
    item?.designData?.design_preview_url ||
    item?.preview_url ||
    item?.previewUrl ||
    null
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setErr("");
        setLoading(true);
        const o = await getOrderById(orderId);
        if (!alive) return;
        setOrder(o);
      } catch {
        setErr("Không tải được đơn hàng. Vui lòng thử lại.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (orderId) load();
    return () => { alive = false; };
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Chi tiết đơn hàng</h1>
      {err && <div style={{ color: "#c00", marginBottom: 16 }}>{err}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : order ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px #eee", marginBottom: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <b>Mã đơn:</b> #{order.id}
            <span style={{ marginLeft: 18 }}><b>Ngày tạo:</b> {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Khách hàng:</b> {order.customer_name || "—"} | <b>SĐT:</b> {order.phone || "—"}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Địa chỉ:</b> {order.address || "—"}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Ghi chú:</b> {order.note || "—"}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Phương thức thanh toán:</b> {order.payment_method || "—"}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Trạng thái thanh toán:</b> {order.payment_status || "—"}
            {order.payment_status === "paid" && (
              <span style={{ color: "#219653", background: "#eafaf1", border: "1px solid #b7e4c7", borderRadius: 8, padding: "4px 12px", marginLeft: 12, fontWeight: 700 }}>
                Đã xác nhận thanh toán
              </span>
            )}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Trạng thái đơn:</b> {order.status || "—"}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Tổng tiền:</b> <span style={{ color: "#d97706", fontWeight: 900 }}>{formatVnd(order.total_amount)}</span>
          </div>

          {/* Sản phẩm */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Sản phẩm</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
              {(order.order_items || order.items || []).map((item, idx) => (
                <div key={idx} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fafafa" }}>
                  {pickPreviewUrl(item) && (
                    <img src={pickPreviewUrl(item)} alt="preview" style={{ width: "100%", borderRadius: 10, marginBottom: 10 }} />
                  )}
                  <div style={{ fontWeight: 700 }}>{item.product_name || `Product #${item.product_id || "?"}`}</div>
                  <div style={{ fontSize: 13 }}>Số lượng: {item.quantity}</div>
                  <div style={{ fontWeight: 600 }}>{formatVnd(item.unit_price)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <button onClick={() => router.push("/")} style={{ marginTop: 18, padding: "10px 24px", borderRadius: 10, border: "1px solid #eee", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Về trang chủ</button>
    </div>
  );
}
