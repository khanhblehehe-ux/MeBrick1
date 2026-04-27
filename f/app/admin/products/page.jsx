"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

import { getToken, setToken, clearToken } from "../../../lib/admin/token";
import {
  getProducts,
  updateProduct,
  deleteProduct,
  createProduct,
} from "../../../lib/api/products";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function AdminProductsPage() {
  const token = getToken();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [currentSection, setCurrentSection] = useState("collection");
  const [search, setSearch] = useState("");

  const [customerImages, setCustomerImages] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerUploadName, setCustomerUploadName] = useState("");

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("0");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newSection, setNewSection] = useState("collection");
  const [uploading, setUploading] = useState(false);

  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProducts(currentSection);
      const list = Array.isArray(data) ? data : data?.products || [];
      setRows(list);
    } catch {
      alert("Không tải được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (currentSection === "customer-images") loadCustomerImages();
      else load();
    }
  }, [token, currentSection]);

  const loadCustomerImages = async () => {
    try {
      setCustomerLoading(true);
      const res = await fetch(`/api/uploads/customer-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomerImages(Array.isArray(data) ? data : []);
    } catch {
      alert("Không tải được ảnh khách");
    } finally {
      setCustomerLoading(false);
    }
  };

  const uploadCustomerImage = async (file) => {
    if (!token) return null;
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("customerName", customerUploadName || "Guest");
      const res = await fetch(`/api/uploads/customer-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setCustomerUploadName("");
      loadCustomerImages();
      return data.url;
    } catch {
      alert("Upload ảnh thất bại");
      return null;
    }
  };

  const deleteCustomerImage = async (id) => {
    if (!token || !window.confirm("Xoá ảnh này?")) return;
    try {
      const res = await fetch(`/api/uploads/customer-images/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) loadCustomerImages();
      else alert("Xoá thất bại");
    } catch { alert("Xoá thất bại"); }
  };

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.message || "Login failed");
      setToken(data.token);
      window.location.reload();
    } finally { setLoginLoading(false); }
  };

  const handleLogout = () => { clearToken(); window.location.reload(); };

  const uploadProductImage = async (file) => {
    if (!token) return null;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/uploads/product-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      return data.url;
    } catch {
      alert("Upload ảnh thất bại");
      return null;
    } finally { setUploading(false); }
  };

  const onCreate = async () => {
    if (!newName.trim()) return alert("Nhập tên sản phẩm");
    await createProduct({ name: newName.trim(), price: Number(newPrice) || 0, image: newImageUrl || null, section: newSection }, token);
    setNewName(""); setNewPrice("0"); setNewImageUrl(""); setNewSection("collection");
    load();
  };

  const onSaveEdit = async () => {
    if (!editing) return;
    await updateProduct(editing.id, { name: editing.name, price: Number(editing.price) || 0, image: editing.image || null, section: editing.section }, token);
    setEditing(null);
    load();
  };

  const onDelete = async () => {
    await deleteProduct(confirm.id, token);
    setConfirm({ open: false, id: null });
    load();
  };

  const filteredRows = rows.filter(r => !search.trim() || String(r.name || "").toLowerCase().includes(search.trim().toLowerCase()));

  // LOGIN
  if (!token) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 32, width: 360, display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Admin Login</h2>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={s.input} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={s.input} />
          <button onClick={handleLogin} style={s.btnPrimary}>{loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F5F5", minHeight: "100vh", padding: 28 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Quản lý sản phẩm</h1>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>
            {loading ? "Đang tải..." : `${rows.length} sản phẩm`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={currentSection === "customer-images" ? loadCustomerImages : load} style={s.btnOutline}>⟳ Refresh</button>
          <button onClick={handleLogout} style={s.btnOutline}>↩ Logout</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[["home", "Trang chủ"], ["collection", "Collection"], ["customer-images", "Ảnh thiết kế khách"]].map(([val, label]) => (
          <button key={val} onClick={() => setCurrentSection(val)}
            style={{ ...s.tab, ...(currentSection === val ? s.tabActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {/* CUSTOMER IMAGES */}
      {currentSection === "customer-images" && (
        <div style={s.card}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Upload Ảnh Thiết Kế Khách</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
            <input placeholder="Tên khách (tuỳ chọn)" value={customerUploadName} onChange={e => setCustomerUploadName(e.target.value)} style={{ ...s.input, width: 220 }} />
            <label style={s.btnPrimary}>
              {uploading ? "Đang upload..." : "Chọn ảnh"}
              <input type="file" hidden accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCustomerImage(f); }} />
            </label>
          </div>
          <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>Ảnh đã upload ({customerImages.length})</h4>
          {customerLoading ? <p>Đang tải...</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {customerImages.map(img => (
                <div key={img.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                  <img src={img.url} alt={img.customer_name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                  <div style={{ padding: 10 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600 }}>{img.customer_name}</p>
                    <p style={{ margin: "0 0 8px", fontSize: 11, color: "#888" }}>{img.created_at ? new Date(img.created_at).toLocaleDateString("vi-VN") : "-"}</p>
                    <button onClick={() => deleteCustomerImage(img.id)} style={{ ...s.btnDanger, width: "100%", justifyContent: "center" }}>Xoá</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD FORM */}
      {currentSection !== "customer-images" && (
        <div style={s.card}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Thêm sản phẩm</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 10, alignItems: "center" }}>
            <div>
              <div style={s.colLabel}>Tên</div>
              <input placeholder="Tên sản phẩm" value={newName} onChange={e => setNewName(e.target.value)} style={s.input} />
            </div>
            <div>
              <div style={s.colLabel}>Giá</div>
              <input type="number" placeholder="0" value={newPrice} onChange={e => setNewPrice(e.target.value)} style={{ ...s.input, width: 80 }} />
            </div>
            <div>
              <div style={s.colLabel}>Collection</div>
              <select value={newSection} onChange={e => setNewSection(e.target.value)} style={{ ...s.input, width: 130 }}>
                <option value="collection">Collection</option>
                <option value="home">Trang chủ</option>
              </select>
            </div>
            <div>
              <div style={s.colLabel}>Chọn ảnh</div>
              <label style={{ ...s.btnOutline, display: "flex", alignItems: "center", cursor: "pointer", whiteSpace: "nowrap" }}>
                {uploading ? "Uploading..." : newImageUrl ? "✓ Đã chọn" : "Chọn ảnh"}
                <input type="file" hidden accept="image/*" onChange={async e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadProductImage(f);
                  if (url) setNewImageUrl(url);
                }} />
              </label>
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button onClick={onCreate} style={s.btnPrimary}>+ Tạo</button>
            </div>
          </div>
          {newImageUrl && <img src={newImageUrl} alt="preview" style={{ marginTop: 12, width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />}
        </div>
      )}

      {/* SEARCH */}
      {currentSection !== "customer-images" && (
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            style={{ ...s.input, width: "100%", paddingLeft: 36, boxSizing: "border-box" }}
          />
        </div>
      )}

      {/* TABLE */}
      {currentSection !== "customer-images" && (
        <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={s.th}>ID</th>
                <th style={s.th}>Tên</th>
                <th style={s.th}>Giá</th>
                <th style={s.th}>Section</th>
                <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={s.td}>{r.id}</td>
                  <td style={{ ...s.td, color: "#1D4ED8", fontWeight: 600 }}>{r.name}</td>
                  <td style={s.td}>{r.price ?? 0}</td>
                  <td style={s.td}>
                    <span style={{ padding: "3px 10px", borderRadius: 999, border: "1px solid #e5e7eb", fontSize: 12, background: "#f9f9f9" }}>
                      {r.section || "collection"}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
                      <button onClick={() => setEditing(r)} style={s.btnEdit}>✏ Sửa</button>
                      <button onClick={() => setConfirm({ open: true, id: r.id })} style={s.btnDanger}>🗑 Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: "#888" }}>Không có sản phẩm</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 480, maxWidth: "95%", display: "grid", gap: 14 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Sửa sản phẩm</h3>
            <div>
              <div style={s.colLabel}>Tên</div>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} style={s.input} />
            </div>
            <div>
              <div style={s.colLabel}>Giá</div>
              <input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} style={s.input} />
            </div>
            <div>
              <div style={s.colLabel}>Section</div>
              <select value={editing.section} onChange={e => setEditing({ ...editing, section: e.target.value })} style={s.input}>
                <option value="collection">Collection</option>
                <option value="home">Trang chủ</option>
              </select>
            </div>
            <div>
              <div style={s.colLabel}>Ảnh</div>
              <label style={{ ...s.btnOutline, display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                {uploading ? "Uploading..." : "Đổi ảnh"}
                <input type="file" hidden accept="image/*" onChange={async e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadProductImage(f);
                  if (url) setEditing({ ...editing, image: url });
                }} />
              </label>
              {editing.image && <img src={editing.image} alt="preview" style={{ marginTop: 10, width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button onClick={() => setEditing(null)} style={s.btnOutline}>Huỷ</button>
              <button onClick={onSaveEdit} style={s.btnPrimary}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Xoá sản phẩm?"
        message={`Bạn chắc chắn muốn xoá product #${confirm.id}?`}
        onCancel={() => setConfirm({ open: false, id: null })}
        onConfirm={onDelete}
      />
    </div>
  );
}

const s = {
  input: {
    height: 38,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 13,
    outline: "none",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  btnPrimary: {
    height: 38,
    padding: "0 18px",
    borderRadius: 8,
    border: "none",
    background: "#1D4ED8",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnOutline: {
    height: 38,
    padding: "0 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnEdit: {
    background: "none",
    border: "none",
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  btnDanger: {
    background: "none",
    border: "none",
    color: "#EF4444",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  tab: {
    padding: "6px 16px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  tabActive: {
    background: "#e8edf7",
    borderColor: "#c7d2fe",
    fontWeight: 700,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    background: "#fafafa",
  },
  td: {
    padding: "12px 16px",
    fontSize: 13,
    color: "#111",
  },
  colLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6B7280",
    marginBottom: 4,
  },
};
