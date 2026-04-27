// app/collections/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getProducts } from "../../lib/api/products";
import { FiSearch } from "react-icons/fi";

export default function CollectionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI controls
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest"); // newest | price-asc | price-desc | name-asc

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getProducts("collection");
        const list = Array.isArray(data) ? data : data?.products || [];
        if (alive) setProducts(list);
      } catch (e) {
        console.error("❌ Load collections failed:", e);
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    let list = products.filter((p) => {
      if (!keyword) return true;
      const name = String(p?.name || "").toLowerCase();
      return name.includes(keyword);
    });

    switch (sort) {
      case "price-asc":
        list = list
          .slice()
          .sort((a, b) => toPriceNumber(a?.price) - toPriceNumber(b?.price));
        break;
      case "price-desc":
        list = list
          .slice()
          .sort((a, b) => toPriceNumber(b?.price) - toPriceNumber(a?.price));
        break;
      case "name-asc":
        list = list
          .slice()
          .sort((a, b) =>
            String(a?.name || "").localeCompare(String(b?.name || "")),
          );
        break;
      case "newest":
      default:
        // Nếu backend đã ORDER BY mới nhất thì giữ nguyên
        // Nếu chưa, bạn có thể sort theo createdAt hoặc id:
        // list = list.slice().sort((a,b)=> (Number(b.id)||0)-(Number(a.id)||0))
        break;
    }

    return list;
  }, [products, q, sort]);

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Header />

      <section style={{ padding: "40px 20px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            border: "1px solid #eee",
          }}>
          {/* Header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}>
            <div>
              <h1 style={{ margin: 0, color: "#0B2D72" }}>Bộ sưu tập</h1>
              <p style={{ marginTop: 8, color: "#666" }}>
                {loading ? "Đang tải..." : `Có ${filtered.length} sản phẩm`}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}>
              <div style={{ position: "relative" }}>
                <FiSearch
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#999",
                  }}
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo tên..."
                  style={{ ...styles.input, paddingLeft: 38 }}
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={styles.select}>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A → Z</option>
              </select>

              <Link
                href={
                  filtered?.[0]
                    ? `/design?product=${filtered[0].id}&name=${encodeURIComponent(
                        filtered[0].name || "",
                      )}&price=${toPriceNumber(filtered[0].price)}&image=${encodeURIComponent(
                        getImg(filtered[0]),
                      )}`
                    : "/collections"
                }
                style={{ textDecoration: "none" }}>
                <button style={styles.primaryBtn} disabled={!filtered?.length}>
                  Thiết kế ngay
                </button>
              </Link>
            </div>
          </div>

          {/* States */}
          {loading && (
            <div style={{ marginTop: 20 }}>
              <div style={styles.grid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={styles.card}>
                    <div style={{ ...styles.imageWrap, background: "#eee" }} />
                    <div style={{ padding: 14 }}>
                      <div style={styles.skeletonLine} />
                      <div style={{ ...styles.skeletonLine, width: "55%" }} />
                      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                        <div style={{ ...styles.skeletonBtn, flex: 1 }} />
                        <div style={styles.skeletonBtn} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: 20, color: "#666" }}>
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div style={styles.grid}>
              {filtered.map((p) => {
                const imgSrc = getImg(p);
                const priceNumber = toPriceNumber(p?.price);

                return (
                  <div
                    key={p?.id ?? `${p?.name}-${imgSrc}`}
                    style={styles.card}>
                    <div style={styles.imageWrap}>
                      <img
                        src={imgSrc}
                        alt={p?.name || "product"}
                        style={styles.img}
                        onError={(e) => {
                          e.currentTarget.src =
                            "/images/hero/products/product1.png";
                        }}
                      />
                    </div>

                    <div style={{ padding: 14 }}>
                      <div style={{ fontWeight: 800, color: "#0B2D72" }}>
                        {p?.name || "Sản phẩm"}
                      </div>

                      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                        <Link
                          href={`/design?product=${p?.id}&name=${encodeURIComponent(
                            p?.name || "",
                          )}&price=${toPriceNumber(p?.price)}&image=${encodeURIComponent(getImg(p))}`}
                          style={{ textDecoration: "none", flex: 1 }}>
                          <button style={styles.outlineBtn}>Tùy chỉnh</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/** Helpers */
function toPriceNumber(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (!v) return 0;

  // support: "1,200,000" | "1.200.000" | "1200000" | "1200000₫"
  const cleaned = String(v).replace(/[^\d]/g, "");
  const n = Number(cleaned || 0);
  return Number.isFinite(n) ? n : 0;
}

function getImg(p) {
  return (
    p?.image ||
    p?.imageUrl ||
    p?.thumbnail ||
    p?.thumb ||
    (Array.isArray(p?.images) ? p.images[0] : null) ||
    "/images/hero/products/product1.png"
  );
}

const styles = {
  input: {
    height: 40,
    padding: "0 12px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    outline: "none",
    minWidth: 240,
    background: "#fff",
  },
  select: {
    height: 40,
    padding: "0 10px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "#fff",
    cursor: "pointer",
  },
  primaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #0B2D72",
    background: "#fff",
    color: "#0B2D72",
    fontWeight: 700,
    cursor: "pointer",
  },
  grid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0,0,0,0.04)",
  },
  imageWrap: {
    height: 190,
    background: "#f5f5f5",
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  outlineBtn: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    border: "2px solid #0B2D72",
    background: "transparent",
    color: "#0B2D72",
    fontWeight: 700,
    cursor: "pointer",
  },
  ghostBtn: {
    height: 40,
    padding: "0 12px",
    borderRadius: 10,
    border: "1px solid #eee",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  skeletonLine: {
    height: 14,
    width: "75%",
    borderRadius: 999,
    background: "#eee",
  },
  skeletonBtn: {
    height: 40,
    width: 80,
    borderRadius: 10,
    background: "#eee",
  },
};
