"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "../../../lib/admin/token";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setMounted(true);
    setToken(getToken()); // chỉ chạy ở client sau khi mount
  }, []);

  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
  ];

  const logout = () => {
    clearToken();
    setToken(null); // cập nhật UI luôn
    router.replace("/admin-khanh-2026/login"); // nên về login cho sạch
  };

  return (
    <div style={styles.wrap}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>ADMIN</div>

        <nav style={{ display: "grid", gap: 8 }}>
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  ...styles.link,
                  background: active ? "#eef2ff" : "transparent",
                  borderColor: active ? "#c7d2fe" : "transparent",
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#000" }}>
            {/* ✅ chặn render trước khi mount để tránh mismatch */}
            {!mounted ? null : token ? "✅ Logged in" : "🔒 Not logged in"}
          </div>

          <button onClick={logout} style={styles.logout}>
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    background: "#f6f7fb",
  },
  sidebar: {
    padding: 16,
    background: "#fff",
    borderRight: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  brand: { fontWeight: 800, letterSpacing: 0.5 },
  link: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid transparent",
    color: "#000",
    textDecoration: "none",
  },
  logout: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #eee",
    background: "#fff",
    cursor: "pointer",
  },
  main: { padding: 22 },
};
