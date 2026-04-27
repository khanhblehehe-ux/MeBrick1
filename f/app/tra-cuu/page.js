"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function normalizePhoneVN(phone) {
  if (!phone) return null;

  let p = String(phone).replace(/\D/g, "");

  if (p.startsWith("0")) {
    p = "84" + p.slice(1);
  }

  if (!p.startsWith("84")) {
    return null;
  }

  return p;
}

function isValidVietnamPhone(phone) {
  return /^84\d{9}$/.test(phone);
}

export default function TraCuuPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setError(null);

    const cleanPhone = normalizePhoneVN(phone);

    if (!isValidVietnamPhone(cleanPhone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/orders/search/by-phone?phone=${encodeURIComponent(cleanPhone)}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi tra cứu");
      }

      setOrders(data);
    } catch (err) {
      setOrders([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div style={{ maxWidth: 950, margin: "40px auto", padding: 20 }}>
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>
          Tra cứu đơn hàng
        </h1>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              flex: 1,
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 6,
            }}
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {loading ? "Đang tìm..." : "Tra cứu"}
          </button>
        </div>

        {error && (
          <p style={{ color: "red", marginTop: 15 }}>{error}</p>
        )}

        {orders && (
          <div style={{ marginTop: 30 }}>
            {orders.length === 0 && (
              <p>Không tìm thấy đơn hàng</p>
            )}

            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: "1px solid #eee",
                  padding: 20,
                  marginBottom: 20,
                  borderRadius: 12,
                  background: "#fff",
                }}
              >
                <p><strong>Mã đơn:</strong> #{order.id}</p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {order.total_amount?.toLocaleString()}đ
                </p>
                <p><strong>Trạng thái:</strong> {order.status}</p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>

                {order.order_items && (
                  <div style={{ marginTop: 20 }}>
                    <strong>Sản phẩm:</strong>

                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: 25,
                          alignItems: "center",
                          marginTop: 15,
                          padding: 15,
                          border: "1px solid #f0f0f0",
                          borderRadius: 12,
                          background: "#fafafa",
                        }}
                      >
                        {/* Ảnh thiết kế */}
                        {item.design_preview_url && (
                          <img
                            src={item.design_preview_url}
                            alt="Design preview"
                            style={{
                              width: 120,
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid #ddd",
                            }}
                          />
                        )}

                        {/* Thông tin */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 16 }}>
                            {item.product_name}
                          </div>

                          <div style={{ marginTop: 6, color: "#6b7280" }}>
                            Số lượng: {item.quantity}
                          </div>

                          {item.unit_price && (
                            <div style={{ marginTop: 4, color: "#6b7280" }}>
                              Giá: {item.unit_price.toLocaleString()}đ
                            </div>
                          )}
                        </div>

                        {/* QR Code */}
                        {item.design_preview_url && (
                          <div style={{ textAlign: "center" }}>
                            <QRCodeCanvas
                              value={item.design_preview_url}
                              size={120}
                            />
                            <div
                              style={{
                                fontSize: 12,
                                marginTop: 8,
                                color: "#6b7280",
                              }}
                            >
                              Quét để xem thiết kế
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
