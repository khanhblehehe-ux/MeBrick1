"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./orders.css";
// ===== Simple Toast Notification =====
function showToast(message, duration = 3000) {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "32px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#222";
    toast.style.color = "#fff";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "1rem";
    toast.style.zIndex = 9999;
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    toast.style.opacity = 0;
    toast.style.transition = "opacity 0.3s";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = 1;
  setTimeout(() => {
    toast.style.opacity = 0;
  }, duration);
}
import DataTable from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import Pagination from "../../components/admin/Pagination";

import { getToken, clearToken } from "../../../lib/admin/token";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  markOrderPaid,
} from "../../../lib/api/orders";

import { exportOrdersToCSV, safeJsonParse, toMoneyVND } from "../../../lib/admin/ordersTools";

const STATUS = ["all", "pending", "awaiting_confirm", "confirmed", "shipping", "done", "cancelled"];
const SORT = ["newest", "oldest", "total-desc", "total-asc"];
const POLL_MS = 4000;

const payText = (o) =>
  o?.payment_status ??
  o?.paymentStatus ??
  o?.pay_status ??
  o?.payment?.status ??
  "—";

// ===== helpers =====
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

// 🔥 Lấy ảnh khách upload
function pickUploadedImages(item) {
  if (Array.isArray(item?.uploaded_images) && item.uploaded_images.length > 0) {
    return item.uploaded_images;
  }
  // Check inside design_data (saved by new backend logic)
  if (Array.isArray(item?.design_data?.uploaded_images) && item.design_data.uploaded_images.length > 0) {
    return item.design_data.uploaded_images;
  }
  // Fallback: bóc từ design_data.stickers (cho dữ liệu cũ) - chỉ lấy URL thật, không lấy base64
  if (Array.isArray(item?.design_data?.stickers)) {
    return item.design_data.stickers
      .filter(
        (s) =>
          s.layerType === "image" &&
          (s.original_url || s.src) &&
          !String(s.original_url || s.src || "").startsWith("data:")
      )
      .map((s) => s.original_url || s.src);
  }
  return [];
}

function downloadByUrl(url, filename) {
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "";
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// 🔥 Hàm mở ảnh - xử lý data URLs + normal URLs
function openImageModal(url, title = "Image") {
  if (!url) return;
  const isDataUrl = typeof url === "string" && url.startsWith("data:");

  if (isDataUrl) {
    // Data URL: hiển thị trong modal (vì window.open không hoạt động tốt với data URL trên một số browser)
    return { open: true, url, title };
  } else {
    // URL thường: mở trong tab mới
    window.open(url, "_blank");
    return null;
  }
}

export default function AdminOrders() {
  const [raw, setRaw] = useState([]);
  const [detail, setDetail] = useState(null);

  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 🔥 Modal để hiển thị ảnh full size
  const [imageModal, setImageModal] = useState({ open: false, url: "", title: "" });

  // ✅ MULTI SELECT
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("confirmed");
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const pollRef = useRef(null);

  // ===== LOAD =====
  const load = async ({ silent = false } = {}) => {
    const token = getToken();
    if (!token) return;

    try {
      if (!silent) setLoading(true);
      const list = await getOrders(token);
      setRaw(Array.isArray(list) ? list : []);
    } catch (e) {
      const code = e?.status || Number(e?.message);
      if (code === 401) {
        clearToken();
        window.location.href = "/admin-khanh-2026/login";
        return;
      }
      if (!silent) alert("Không tải được đơn hàng");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load({ silent: true }), POLL_MS);
    return () => pollRef.current && clearInterval(pollRef.current);
    // eslint-disable-next-line
  }, []);

  // ===== FILTER =====
  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    let list = raw.filter((o) => {
      if (status !== "all" && (o.status || "pending") !== status) return false;
      if (!keyword) return true;

      const hay = [o.id, o.customer_name, o.phone, o.address, o.status, payText(o)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(keyword);
    });

    switch (sort) {
      case "oldest":
        list.sort((a, b) => a.id - b.id);
        break;
      case "total-desc":
        list.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
        break;
      case "total-asc":
        list.sort((a, b) => (a.total_amount || 0) - (b.total_amount || 0));
        break;
      default:
        list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [raw, q, status, sort]);

  useEffect(() => setPage(1), [q, status, sort, pageSize]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // ===== DETAIL =====
  const openDetail = async (o) => {
    try {
      const data = await getOrderById(o.id);
      setDetail(data);
    } catch {
      alert("Không tải được chi tiết đơn");
    }
  };

  // ===== ADMIN ACTIONS =====
  const changeStatus = async (o, nextStatus) => {
    try {
      const token = getToken();
      await updateOrderStatus(o.id, nextStatus, token);
      await load();
      if (detail?.id === o.id) setDetail({ ...detail, status: nextStatus });
    } catch {
      alert("Đổi trạng thái thất bại");
    }
  };

  const markPaid = async (o) => {
    try {
      const token = getToken();
      const updated = await markOrderPaid(o.id, token, "confirmed");
      await load();
      if (detail?.id === o.id) setDetail({ ...detail, ...updated });
      showToast("✅ Đã xác nhận thanh toán");
    } catch {
      showToast("Xác nhận thanh toán thất bại");
    }
  };

  const askDelete = (o) => setConfirm({ open: true, id: o.id });

  const onDelete = async () => {
    try {
      const token = getToken();
      await deleteOrder(confirm.id, token);
      setConfirm({ open: false, id: null });
      if (detail?.id === confirm.id) setDetail(null);
      await load();
      alert("🗑️ Đã xoá đơn");
    } catch {
      alert("Xoá đơn thất bại");
    }
  };

  // ✅ BULK ACTIONS
  const allPageIds = pageRows.map((r) => r.id);
  const allSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allPageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allPageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    try {
      const token = getToken();
      await Promise.all([...selectedIds].map((id) => deleteOrder(id, token)));
      setSelectedIds(new Set());
      setConfirmBulkDelete(false);
      await load();
      showToast(`🗑️ Đã xoá ${selectedIds.size} đơn hàng`);
    } catch {
      showToast("Xoá hàng loạt thất bại");
    }
  };

  const bulkChangeStatus = async () => {
    try {
      const token = getToken();
      await Promise.all([...selectedIds].map((id) => updateOrderStatus(id, bulkStatus, token)));
      setSelectedIds(new Set());
      await load();
      showToast(`✅ Đã cập nhật ${selectedIds.size} đơn → ${bulkStatus}`);
    } catch {
      showToast("Cập nhật hàng loạt thất bại");
    }
  };

  const detailItems = useMemo(() => {
    if (Array.isArray(detail?.items)) return detail.items;
    if (Array.isArray(detail?.order_items)) return detail.order_items;
    const parsed = safeJsonParse(detail?.items);
    return Array.isArray(parsed) ? parsed : [];
  }, [detail]);

  // ✅ gom tất cả preview của order thành gallery
  const detailPreviews = useMemo(() => {
    const urls = detailItems
      .map((it) => pickPreviewUrl(it))
      .filter(Boolean);

    // unique
    return Array.from(new Set(urls));
  }, [detailItems]);

  // ===== UI =====
  return (
    <div className="ao-page">
      {/* MAIN */}
      <main className="ao-main">
        <h1 className="ao-main__title">🛒 Quản lý đơn hàng</h1>

        {/* STATS */}
        <div className="ao-stats">
          <div className="ao-stat-card">
            <div className="ao-stat-icon">📋</div>
            <div className="ao-stat-value">{raw.length}</div>
            <div className="ao-stat-label">Tổng đơn</div>
          </div>
          <div className="ao-stat-card">
            <div className="ao-stat-icon">⏳</div>
            <div className="ao-stat-value">{raw.filter(o => (o.status || "pending") === "pending").length}</div>
            <div className="ao-stat-label">Chờ xử lý</div>
          </div>
          <div className="ao-stat-card">
            <div className="ao-stat-icon">✅</div>
            <div className="ao-stat-value">{raw.filter(o => payText(o) === "transferred" || payText(o) === "paid").length}</div>
            <div className="ao-stat-label">Đã thanh toán</div>
          </div>
          <div className="ao-stat-card">
            <div className="ao-stat-icon">💰</div>
            <div className="ao-stat-value">{toMoneyVND(raw.reduce((s, o) => s + (o.total_amount || 0), 0))}</div>
            <div className="ao-stat-label">Doanh thu</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="ao-filters">
          <input
            className="ao-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Tìm kiếm đơn hàng..."
          />
          <select className="ao-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="ao-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            className="ao-btn ao-btn--outline"
            onClick={() => {
              try { exportOrdersToCSV(filtered); } catch { alert("Export CSV thất bại"); }
            }}
          >
            📥 Export CSV
          </button>
          {loading && <span style={{ color: "#64748b", fontSize: 13 }}>⏳ Loading…</span>}
        </div>

        {/* BULK BAR */}
        {selectedIds.size > 0 && (
          <div className="ao-bulk-bar">
            <span style={{ fontWeight: 700 }}>Đã chọn {selectedIds.size} đơn</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              {STATUS.filter((s) => s !== "all").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="ao-btn ao-btn--primary ao-btn--sm" onClick={bulkChangeStatus}>
              Cập nhật trạng thái
            </button>
            <button className="ao-btn ao-btn--danger ao-btn--sm" onClick={() => setConfirmBulkDelete(true)}>
              Xoá {selectedIds.size} đơn
            </button>
            <button className="ao-btn ao-btn--ghost ao-btn--sm" onClick={() => setSelectedIds(new Set())}>
              Bỏ chọn
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="ao-table-wrap">
          <table className="ao-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    title="Chọn tất cả trang này"
                  />
                </th>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} onClick={() => openDetail(r)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td>#{r.id}</td>
                  <td>{r.customer_name}</td>
                  <td>{r.phone}</td>
                  <td><b>{toMoneyVND(r.total_amount)}</b></td>
                  <td>
                    <span className={`ao-badge ao-badge--${r.status || "pending"}`}>
                      {r.status || "pending"}
                    </span>
                  </td>
                  <td>
                    <span className={`ao-pay-badge ao-pay-badge--${payText(r)}`}>
                      {payText(r)}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="ao-actions">
                      <button className="ao-btn ao-btn--primary ao-btn--sm" onClick={() => openDetail(r)}>
                        Chi tiết
                      </button>
                      <button
                        className="ao-btn ao-btn--success ao-btn--sm"
                        onClick={() => markPaid(r)}
                        disabled={payText(r) === "paid"}
                      >
                        Mark Paid
                      </button>
                      <select
                        value={r.status}
                        onChange={(e) => changeStatus(r, e.target.value)}
                      >
                        {STATUS.filter((s) => s !== "all").map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="ao-btn ao-btn--danger ao-btn--sm" onClick={() => askDelete(r)}>
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="ao-pagination-bar">
          <div className="ao-page-size-wrap">
            <span>Hiển thị</span>
            <select
              className="ao-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>/ {filtered.length} đơn</span>
          </div>
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>

      </main>

      {/* ===== SLIDE OVER DETAIL ===== */}
{detail && (
  <div className="order-drawer-overlay" onClick={() => setDetail(null)}>
    <div
      className="order-drawer"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="drawer-header">
        <div>
          <h3>Order #{detail.id}</h3>
          <div className="drawer-sub">
            {detail.customer_name} • {detail.phone}
          </div>
        </div>

        <button className="drawer-close" onClick={() => setDetail(null)}>
          ✕
        </button>
      </div>

      <div className="drawer-body">
        {/* CUSTOMER INFO */}
        <div className="drawer-section">
          <h4>Thông tin khách hàng</h4>
          <div className="drawer-grid">
            <div><b>Họ tên:</b> {detail.customer_name || "—"}</div>
            <div><b>SĐT:</b> {detail.phone || "—"}</div>
            <div><b>Email:</b> {detail.email || "—"}</div>
            <div><b>Thanh toán:</b> {payText(detail)}</div>
            <div className="full">
              <b>Địa chỉ:</b> {detail.address || "—"}
            </div>
            <div className="full">
              <b>Ghi chú:</b> {detail.note || "—"}
            </div>
            <div>
              <b>Tổng tiền:</b>{" "}
              <span className="money">
                {toMoneyVND(detail.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* PREVIEW GALLERY */}
        <div className="drawer-section">
          <h4>Ảnh thiết kế</h4>

          {detailPreviews.length === 0 ? (
            <div className="muted">Không có preview</div>
          ) : (
            <div className="preview-grid">
              {detailPreviews.map((url, i) => (
                <img
                  key={url}
                  src={url}
                  alt={`preview-${i}`}
                  onClick={() => {
                    const result = openImageModal(url, `Preview ${i + 1}`);
                    if (result) setImageModal(result);
                  }}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ITEMS */}
        <div className="drawer-section">
          <h4>Items</h4>

          {detailItems.map((it, idx) => {
            const preview = pickPreviewUrl(it);
            const uploadedImages = pickUploadedImages(it);

            return (
              <div key={idx} className="drawer-item">
                {/* Ảnh thiết kế (canvas export) */}
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    onClick={() => {
                      const result = openImageModal(preview, `Thiết kế ${idx + 1}`);
                      if (result) setImageModal(result);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <div className="no-preview">No preview</div>
                )}

                <div className="item-info">
                  <div className="item-title">
                    {it?.product_name || `Product #${it?.product_id || "?"}`}
                  </div>

                  <div className="item-meta">
                    SL: {it?.quantity ?? 1} •{" "}
                    {toMoneyVND(it?.unit_price ?? 0)}
                  </div>

                  {/* Loại khung & màu khung */}
                  {(it?.design_data?.frameTypeName || it?.design_data?.frameColor) && (
                    <div className="item-frame-info">
                      {it?.design_data?.frameTypeName && (
                        <span>Loại khung: <strong>{it.design_data.frameTypeName}</strong></span>
                      )}
                      {it?.design_data?.frameColor && (
                        <span>Màu khung: <strong>{it.design_data.frameColor === "white" ? "Khung trắng" : "Khung gỗ"}</strong></span>
                      )}
                    </div>
                  )}

                  {/* Ghi chú thiết kế */}
                  {it?.design_data?.designer_note && (
                    <div style={{ marginTop: 6, fontSize: "0.85rem", background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 6, padding: "5px 8px" }}>
                      <b>📝 Ghi chú:</b> {it.design_data.designer_note}
                    </div>
                  )}

                  {/* Thông tin in ấn */}
                  {((it?.design_data && it.design_data.print_info) || it.print_info) && (
                    <div style={{ marginTop: 8, fontSize: "0.9rem", background: "#f6f9ff", border: "1px solid #e6f0ff", borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Thông tin in ấn</div>
                      <div><strong>Tên:</strong> {(it.design_data && it.design_data.print_info?.name) || it.print_info?.name || "-"}</div>
                      <div><strong>Tiêu đề:</strong> {(it.design_data && it.design_data.print_info?.title) || it.print_info?.title || "-"}</div>
                      <div><strong>Ngành / Lời chúc:</strong> {(it.design_data && it.design_data.print_info?.message) || it.print_info?.message || "-"}</div>
                      <div><strong>Ngày:</strong> {(it.design_data && it.design_data.print_info?.date) || it.print_info?.date || "-"}</div>
                    </div>
                  )}

                  {/* Ảnh khách upload */}
                  {uploadedImages.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: "0.85rem", color: "#000", marginBottom: 4 }}>
                        Ảnh khách upload ({uploadedImages.length}):
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                        {uploadedImages.map((url, i) => (
                          <img
                            key={url}
                            src={url}
                            alt={`uploaded-${i}`}
                            style={{
                              width: "100%",
                              height: "90px",
                              objectFit: "cover",
                              borderRadius: 6,
                              cursor: "pointer",
                              border: "1px solid #eee"
                            }}
                            onClick={() => {
                              const result = openImageModal(url, `Ảnh khách upload ${i + 1}`);
                              if (result) setImageModal(result);
                            }}
                            title="Click to view full size"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
)}

      <ConfirmDialog
        open={confirm.open}
        title="Xoá đơn hàng?"
        message={`Bạn chắc chắn muốn xoá order #${confirm.id}?`}
        onCancel={() => setConfirm({ open: false, id: null })}
        onConfirm={onDelete}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title="Xoá hàng loạt?"
        message={`Bạn chắc chắn muốn xoá ${selectedIds.size} đơn hàng đã chọn?`}
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={bulkDelete}
      />

      {/* 🔥 IMAGE MODAL - Hiển thị ảnh full size */}
      {imageModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
          onClick={() => setImageModal({ open: false, url: "", title: "" })}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImageModal({ open: false, url: "", title: "" })}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "#f0f0f0",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                fontSize: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>

            {imageModal.title && (
              <h3 style={{ margin: "0 0 12px", paddingRight: 40 }}>
                {imageModal.title}
              </h3>
            )}

            <img
              src={imageModal.url}
              alt={imageModal.title}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                display: "block"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
