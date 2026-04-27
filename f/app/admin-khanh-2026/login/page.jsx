"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken } from "../../../lib/admin/token";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (getToken()) {
      router.replace("/admin/products");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      // Save token and redirect
      setToken(data.token);
      router.replace("/admin/products");
    } catch (err) {
      console.error("Login error:", err);
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Admin Login</h1>
        
        <div style={styles.debug}>
          🔌 API: same-origin proxy
        </div>

        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#f5f5f5",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 40,
    width: 360,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  title: {
    margin: "0 0 24px",
    fontSize: 24,
    fontWeight: 700,
    color: "#000",
  },
  debug: {
    background: "#f3f4f6",
    padding: 8,
    borderRadius: 6,
    fontSize: 12,
    color: "#374151",
    marginBottom: 12,
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  form: {
    display: "grid",
    gap: 12,
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "10px 12px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    marginTop: 8,
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
};
