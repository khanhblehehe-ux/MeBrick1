// lib/api/orders.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL.replace(/\/$/, "")}/api/orders`;

async function handle(res, hint) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(String(res.status));
    err.status = res.status;
    err.body = text;
    err.hint = hint || "Request failed";
    throw err;
  }
  return res.json();
}

// Admin: list orders (JWT)
export async function getOrders(token) {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handle(res, "Failed to fetch orders");
}

// Public: polling
export async function getOrderById(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    cache: "no-store",
  });
  return handle(res, "Failed to fetch order");
}

// Public: create order
export async function createOrder(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res, "Create order failed");
}

// Admin: update status
export async function updateOrderStatus(id, status, token) {
  const res = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return handle(res, "Update status failed");
}

// Admin: delete
export async function deleteOrder(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res, "Delete order failed");
}

// Public: VietQR info (amount + memo)
export async function getVietQRInfo(orderId) {
  const res = await fetch(`${API_URL}/${orderId}/vietqr`, {
    cache: "no-store",
  });
  return handle(res, "Failed to fetch VietQR info");
}

// Public: user bấm "Tôi đã chuyển khoản"
// ✅ giữ nguyên endpoint theo code backend hiện tại của bạn: POST /:id/mark-transferred
export async function markTransferred(orderId) {
  const res = await fetch(`${API_URL}/${orderId}/mark-transferred`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handle(res, "Failed to mark transferred");
}

// Admin: mark paid (JWT)
export async function markOrderPaid(id, token, status = "confirmed") {
  const res = await fetch(`${API_URL}/${id}/mark-paid`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return handle(res, "Mark paid failed");
}
