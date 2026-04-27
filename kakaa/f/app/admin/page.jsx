"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "../../lib/admin/token";
import { getAdminStats } from "../../lib/api/admin";

export default function AdminDashboard() {
  const token = getToken();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await getAdminStats(token);
        setData(res);
      } catch (e) {
        console.error(e);
        alert("Không tải được dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Bạn cần đăng nhập để xem Dashboard</h2>
        <Link href="/admin/products">→ Đến trang đăng nhập</Link>
      </div>
    );
  }

  if (loading) return <p>⏳ Đang tải dashboard...</p>;
  if (!data) return <p>❌ Không có dữ liệu dashboard</p>;

  const kpis = [
    { label: "Doanh thu", value: formatMoney(data.revenue) },
    { label: "Tổng đơn", value: data.totalOrders ?? 0 },
    { label: "Đơn chờ xử lý", value: data.pendingOrders ?? 0 },
    { label: "Sản phẩm", value: data.totalProducts ?? 0 },
  ];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>📊 Dashboard</h1>

      {/* KPI */}
      <div style={grid}>
        {kpis.map((k) => (
          <div key={k.label} style={card}>
            <div style={{ fontSize: 14, color: "#000" }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Latest orders */}
      <div style={{ marginTop: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>🧾 Đơn hàng mới nhất</h2>
          <Link href="/admin/orders">Xem tất cả →</Link>
        </div>

        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Khách</th>
                <th style={th}>Tổng</th>
                <th style={th}>Trạng thái</th>
                <th style={th}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {(data.latestOrders || []).map((o) => (
                <tr key={o.id}>
                  <td style={td}>#{o.id}</td>
                  <td style={td}>{o.customer_name || "-"}</td>
                  <td style={td}>{formatMoney(o.total)}</td>
                  <td style={td}>
                    <b>{o.status || "pending"}</b>
                  </td>
                  <td style={td}>{o.created_at ? String(o.created_at).slice(0, 10) : "-"}</td>
                </tr>
              ))}
              {(!data.latestOrders || data.latestOrders.length === 0) && (
                <tr>
                  <td style={td} colSpan={5}>
                    Chưa có đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatMoney(v) {
  const n = Number(v || 0);
  return n.toLocaleString("vi-VN") + " ₫";
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 12,
};

const card = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 16,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 12,
};

const th = {
  textAlign: "left",
  padding: "12px 12px",
  borderBottom: "1px solid #eee",
  fontSize: 13,
  color: "#000",
  background: "#fafafa",
};

const td = {
  textAlign: "left",
  padding: "12px 12px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: 13,
};
