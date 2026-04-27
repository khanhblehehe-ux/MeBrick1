"use client";

import { useEffect, useState } from "react";
import DataTable from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

import { getToken, setToken, clearToken } from "../../../lib/admin/token";
import {
  getProducts,
  updateProduct,
  deleteProduct,
  createProduct,
} from "../../../lib/api/products";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminProductsPage() {
  const token = getToken();

  // ================= LOGIN =================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ================= DATA =================
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const [currentSection, setCurrentSection] = useState("collection");

  // ================= CUSTOMER IMAGES =================
  const [customerImages, setCustomerImages] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerUploadName, setCustomerUploadName] = useState("");

  // ================= CREATE =================
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newSection, setNewSection] = useState("collection");

  const [uploading, setUploading] = useState(false);

  // ================= EDIT =================
  const [editing, setEditing] = useState(null);

  // ================= LOAD =================
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
      if (currentSection === "customer-images") {
        loadCustomerImages();
      } else {
        load();
      }
    }
  }, [token, currentSection]);

  // ================= LOAD CUSTOMER IMAGES =================
  const loadCustomerImages = async () => {
    try {
      setCustomerLoading(true);
      const res = await fetch(`${API_BASE}/api/uploads/customer-images`, {
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

  // ================= UPLOAD CUSTOMER IMAGE =================
  const uploadCustomerImage = async (file) => {
    if (!token) return null;

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("customerName", customerUploadName || "Guest");

      const res = await fetch(`${API_BASE}/api/uploads/customer-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      setCustomerUploadName("");
      loadCustomerImages();
      alert("Upload thành công");
      return data.url;
    } catch {
      alert("Upload ảnh thất bại");
      return null;
    }
  };

  // ================= DELETE CUSTOMER IMAGE =================
  const deleteCustomerImage = async (id) => {
    if (!token || !window.confirm("Xoá ảnh này?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/uploads/customer-images/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        loadCustomerImages();
        alert("Xoá thành công");
      } else {
        alert("Xoá thất bại");
      }
    } catch {
      alert("Xoá thất bại");
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      setLoginLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data?.message || "Login failed");

      setToken(data.token);
      window.location.reload();
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    window.location.reload();
  };

  // ================= UPLOAD =================
  const uploadProductImage = async (file) => {
    if (!token) return null;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API_BASE}/api/uploads/product-image`, {
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
    } finally {
      setUploading(false);
    }
  };

  // ================= CREATE =================
  const onCreate = async () => {
    if (!newName.trim()) return alert("Nhập tên sản phẩm");

    await createProduct(
      {
        name: newName.trim(),
        price: Number(newPrice) || 0,
        image: newImageUrl || null,
        section: newSection,
      },
      token,
    );

    setNewName("");
    setNewPrice("");
    setNewImageUrl("");
    setNewSection(currentSection);

    load();
  };

  // ================= EDIT =================
  const onSaveEdit = async () => {
    if (!editing) return;

    await updateProduct(
      editing.id,
      {
        name: editing.name,
        price: Number(editing.price) || 0,
        image: editing.image || null,
        section: editing.section,
      },
      token,
    );

    setEditing(null);
    load();
  };

  // ================= DELETE =================
  const onDelete = async () => {
    await deleteProduct(confirm.id, token);
    setConfirm({ open: false, id: null });
    load();
  };

  // ================= LOGIN UI =================
  if (!token) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>
            {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p>{loading ? "Đang tải..." : `${rows.length} sản phẩm`}</p>
        </div>
        <div>
          <button onClick={load}>Refresh</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* SECTION FILTER */}
      <div style={{ marginBottom: 20 }}>
        <button
          className={currentSection === "home" ? "primary" : ""}
          onClick={() => setCurrentSection("home")}>
          Trang chủ
        </button>
        <button
          className={currentSection === "collection" ? "primary" : ""}
          onClick={() => setCurrentSection("collection")}>
          Collection
        </button>
        <button
          className={currentSection === "customer-images" ? "primary" : ""}
          onClick={() => setCurrentSection("customer-images")}>
          Ảnh thiết kế khách
        </button>
      </div>

      {/* CUSTOMER IMAGES SECTION */}
      {currentSection === "customer-images" && (
        <div className="admin-card">
          <h3>Upload Ảnh Thiết Kế Khách</h3>

          <input
            placeholder="Tên khách (tuỳ chọn)"
            value={customerUploadName}
            onChange={(e) => setCustomerUploadName(e.target.value)}
          />

          <label className="upload-btn">
            {uploading ? "Đang upload..." : "Chọn ảnh"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCustomerImage(file);
              }}
            />
          </label>

          <h3 style={{ marginTop: 30 }}>
            Ảnh đã upload ({customerImages.length})
          </h3>
          {customerLoading ? (
            <p>Đang tải...</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 15,
              }}>
              {customerImages.map((img) => (
                <div
                  key={img.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}>
                  <img
                    src={img.url}
                    alt={img.customer_name}
                    style={{ width: "100%", height: 200, objectFit: "cover" }}
                  />
                  <div style={{ padding: 10 }}>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                      {img.customer_name}
                    </p>
                    <p style={{ margin: "5px 0", fontSize: 11, color: "#666" }}>
                      {img.created_at
                        ? new Date(img.created_at).toLocaleDateString("vi-VN")
                        : "-"}
                    </p>
                    <button
                      onClick={() => deleteCustomerImage(img.id)}
                      style={{
                        width: "100%",
                        padding: 8,
                        backgroundColor: "#EF4444",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}>
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE */}
      {currentSection !== "customer-images" && (
        <div className="admin-card">
          <h3>Thêm sản phẩm</h3>

          <input
            placeholder="Tên"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <input
            placeholder="Giá"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />

          <select
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}>
            <option value="collection">Collection</option>
            <option value="home">Trang chủ</option>
          </select>

          <label className="upload-btn">
            {uploading ? "Đang upload..." : "Chọn ảnh"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const url = await uploadProductImage(file);
                if (url) setNewImageUrl(url);
              }}
            />
          </label>

          {newImageUrl && (
            <div className="image-preview">
              <img src={newImageUrl} alt="preview" />
            </div>
          )}

          <button onClick={onCreate}>+ Tạo</button>
        </div>
      )}

      {/* TABLE */}
      {currentSection !== "customer-images" && (
        <div className="admin-card">
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Tên" },
              { key: "price", label: "Giá" },
              { key: "section", label: "Section" },
            ]}
            rows={rows}
            rowKey={(r) => r.id}
            actions={(r) => (
              <>
                <button onClick={() => setEditing(r)}>Sửa</button>
                <button onClick={() => setConfirm({ open: true, id: r.id })}>
                  Xoá
                </button>
              </>
            )}
          />
        </div>
      )}

      {/* EDIT MODAL */}
      {currentSection !== "customer-images" && editing && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h3>Sửa sản phẩm</h3>

            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />

            <input
              value={editing.price}
              onChange={(e) =>
                setEditing({ ...editing, price: e.target.value })
              }
            />

            <select
              value={editing.section}
              onChange={(e) =>
                setEditing({ ...editing, section: e.target.value })
              }>
              <option value="collection">Collection</option>
              <option value="home">Trang chủ</option>
            </select>

            <label className="upload-btn">
              {uploading ? "Đang upload..." : "Đổi ảnh"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const url = await uploadProductImage(file);
                  if (url) setEditing({ ...editing, image: url });
                }}
              />
            </label>

            {editing.image && (
              <div className="image-preview">
                <img src={editing.image} alt="preview" />
              </div>
            )}

            <button onClick={onSaveEdit}>Lưu</button>
            <button onClick={() => setEditing(null)}>Huỷ</button>
          </div>
        </div>
      )}

      {currentSection !== "customer-images" && (
        <ConfirmDialog
          open={confirm.open}
          title="Xoá sản phẩm?"
          message={`Bạn chắc chắn muốn xoá product #${confirm.id}?`}
          onCancel={() => setConfirm({ open: false, id: null })}
          onConfirm={onDelete}
        />
      )}
    </div>
  );
}
