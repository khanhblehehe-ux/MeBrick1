"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./cart.css";
import Header from "../components/Header";

import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  cartTotalQty,
} from "../../lib/cart";

import { getProducts } from "../../lib/api/products";

/* =========================
   Helpers
========================= */

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
  return (
    it?.design_preview_url ||
    it?.designPreviewUrl ||
    it?.design_data?.design_preview_url ||
    pickDesign(it)?.design_preview_url ||
    null
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));
}

/* =========================
   Component
========================= */

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [] });
  const [productMap, setProductMap] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const sync = () => setCart(getCart());
    sync();

    const onUpdated = () => sync();
    window.addEventListener("mebrick_cart_updated", onUpdated);
    return () => window.removeEventListener("mebrick_cart_updated", onUpdated);
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingProducts(true);
        const data = await getProducts();
        const products = Array.isArray(data) ? data : data?.items || [];

        const map = {};
        products.forEach((p) => {
          map[Number(p.id)] = p;
        });

        if (alive) setProductMap(map);
      } catch {
        if (alive) setProductMap({});
      } finally {
        if (alive) setLoadingProducts(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const totalQty = useMemo(() => cartTotalQty(cart), [cart]);

  const inc = (idx) => {
    const it = cart.items[idx];
    const next = updateCartItem(idx, {
      quantity: (it.quantity || 1) + 1,
    });
    setCart(next);
  };

  const dec = (idx) => {
    const it = cart.items[idx];
    const q = Math.max(1, (it.quantity || 1) - 1);
    const next = updateCartItem(idx, { quantity: q });
    setCart(next);
  };

  const remove = (idx) => {
    const next = removeCartItem(idx);
    setCart(next);
  };

  const onClear = () => {
    clearCart();
    setCart({ items: [] });
  };

  const getUnitPrice = (it) => {
    if (it?.unit_price != null) return Number(it.unit_price || 0);
    const p = productMap[Number(it.product_id)];
    return Number(p?.price || 0);
  };

  const getProductName = (it) => {
    if (it?.product_name) return it.product_name;
    const p = productMap[Number(it.product_id)];
    return p?.name || `Sản phẩm #${it.product_id}`;
  };

  const getProductImage = (it) => {
    if (it?.image) return it.image;
    const p = productMap[Number(it.product_id)];
    return p?.image || null;
  };

  const subTotal = useMemo(() => {
    return cart.items.reduce((sum, it) => {
      return sum + getUnitPrice(it) * Number(it.quantity || 0);
    }, 0);
  }, [cart, productMap]);

  const goCheckout = () => {
    if (!cart.items.length) return;
    router.push("/checkout");
  };

  return (
    <>
      <Header />
      <div className="cart-wrapper" style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Giỏ hàng</h1>
          <div style={styles.subtitle}>
            Tổng số lượng: <b>{totalQty}</b> • {cart.items.length} sản phẩm
          </div>
          {loadingProducts && (
            <div style={styles.loadingText}>Đang tải thông tin sản phẩm…</div>
          )}
        </div>

        {cart.items.length > 0 && (
          <button onClick={onClear} style={styles.clearBtn}>
            Xóa toàn bộ
          </button>
        )}
      </div>

      {/* CART CARD */}
      <div style={styles.card}>
        {!cart.items.length ? (
          <div style={styles.empty}>Giỏ hàng của bạn đang trống.</div>
        ) : (
          cart.items.map((it, idx) => {
            const preview = pickPreviewUrl(it);
            const name = getProductName(it);
            const unitPrice = getUnitPrice(it);
            const image = getProductImage(it);
            const lineTotal = unitPrice * Number(it.quantity || 0);

            return (
              <div key={idx} style={styles.row}>
                {/* IMAGE */}
                <div style={styles.thumb}>
                  {preview || image ? (
                    <img
                      src={preview || image}
                      alt={name}
                      style={styles.thumbImg}
                    />
                  ) : (
                    <div style={styles.noImg}>No image</div>
                  )}
                </div>

                {/* INFO */}
                <div style={styles.info}>
                  <div style={styles.productTitle}>{name}</div>

                  <div style={styles.meta}>
                    <span>
                      Giá: <b>{formatPrice(unitPrice)}</b>
                    </span>
                    <span>•</span>
                    <span>
                      Tạm tính: <b>{formatPrice(lineTotal)}</b>
                    </span>
                  </div>
                </div>

                {/* EDIT */}
                <button
                  onClick={() => {
                    // Lưu cart item index vào sessionStorage để design page có thể load
                    if (it.design_data) {
                      sessionStorage.setItem(
                        "editCartItemIndex",
                        JSON.stringify(idx),
                      );
                    }
                    router.push(
                      `/design?product=${it.product_id}&name=${encodeURIComponent(it.product_name || "")}`,
                    );
                  }}
                  className="cart-edit-btn"
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#2563eb",
                    fontSize: "14px",
                    fontWeight: 600,
                    padding: 0,
                  }}
                  title="Sửa sản phẩm">
                  ✏️ Sửa
                </button>

                <button
                  onClick={() => remove(idx)}
                  className="cart-remove-btn"
                  style={styles.removeBtn}
                  title="Xóa sản phẩm">
                  🗑
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* SUMMARY */}
      {cart.items.length > 0 && (
        <>
          <div className="cart-summary-box" style={styles.summary}>
            <div style={styles.summaryLabel}>Tạm tính</div>
            <div style={styles.summaryTotal}>{formatPrice(subTotal)}</div>
          </div>

          <div className="cart-actions" style={styles.actions}>
            <button onClick={goCheckout} className="cart-checkout-btn" style={styles.checkoutBtn}>
              Thanh toán
            </button>

            <button onClick={() => router.push("/")} className="cart-continue-btn" style={styles.continueBtn}>
              Tiếp tục mua
            </button>
          </div>
        </>
      )}
    </div>
    </>
  );
}

/* =========================
   Styles – High Fidelity
========================= */

const styles = {
  wrapper: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "32px 24px",
    background: "#f8fafc",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },

  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
  },

  loadingText: {
    marginTop: 4,
    fontSize: 12,
    color: "#94a3b8",
  },

  clearBtn: {
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#b91c1c",
    padding: "8px 14px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },

  card: {
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
    overflow: "hidden",
  },

  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "18px 20px",
    borderBottom: "1px solid #f1f5f9",
  },

  thumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    background: "#f1f5f9",
    flexShrink: 0,
  },

  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  noImg: {
    display: "grid",
    placeItems: "center",
    height: "100%",
    color: "#94a3b8",
    fontWeight: 600,
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  productTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: "#0f172a",
  },

  meta: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  qtyGroup: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
  },

  qtyBtn: {
    width: 34,
    height: 34,
    border: "none",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
  },

  qtyValue: {
    width: 40,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 13,
  },

  removeBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 17,
    color: "#94a3b8",
  },

  summary: {
    marginTop: 20,
    padding: "18px 20px",
    borderRadius: 16,
    background: "#ffffff",
    boxShadow: "0 4px 20px rgba(15,23,42,0.07)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
  },

  summaryTotal: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },

  actions: {
    marginTop: 18,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  checkoutBtn: {
    height: 46,
    padding: "0 28px",
    borderRadius: 12,
    border: "none",
    background: "#0b2d72",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(11,45,114,0.25)",
    fontFamily: "'Poppins', sans-serif",
  },

  continueBtn: {
    height: 46,
    padding: "0 20px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },

  empty: {
    padding: 36,
    textAlign: "center",
    color: "#64748b",
  },
};
