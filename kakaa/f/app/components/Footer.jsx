"use client";

import {
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { SOCIAL_LINKS } from "../../lib/social-links";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#ffffff",
        color: "#001279",
        padding: "60px 20px 30px",
      }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}>
        <div>
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}>
            MeBrick
          </h3>
          <p
            style={{
              color: "#999",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}>
            Thương hiệu quà tặng tinh tế từ những mảnh ghép LEGO độc đáo.
          </p>
          <div style={{ display: "flex", gap: "15px" }}>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer">
              <FiFacebook
                style={{
                  fontSize: "20px",
                  color: "#999",
                  cursor: "pointer",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#999")}
              />
            </a>
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
            }}>
            Liên hệ
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FiMapPin style={{ color: "#666", flexShrink: 0 }} />
              <span style={{ color: "#999", fontSize: "14px" }}>
                FPT Hòa Lạc
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FiPhone style={{ color: "#666", flexShrink: 0 }} />
              <span style={{ color: "#999", fontSize: "14px" }}>1900 1001</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FiMail style={{ color: "#666", flexShrink: 0 }} />
              <span style={{ color: "#999", fontSize: "14px" }}>
                Mebrick.com
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
            }}>
            Đăng ký nhận tin
          </h4>
          <p
            style={{
              color: "#999",
              fontSize: "14px",
              marginBottom: "20px",
              lineHeight: "1.6",
            }}>
            Nhận thông tin mới nhất về sản phẩm và khuyến mãi.
          </p>
          <div style={{ display: "flex" }}>
            <input
              type="email"
              placeholder="Email của bạn"
              style={{
                flex: 1,
                padding: "12px 15px",
                backgroundColor: "#222",
                border: "1px solid #333",
                color: "#fff",
                fontSize: "14px",
                borderRight: "none",
                borderTopLeftRadius: "6px",
                borderBottomLeftRadius: "6px",
              }}
            />
            <button
              style={{
                padding: "12px 20px",
                backgroundColor: "#333",
                color: "#fff",
                border: "1px solid #333",
                borderTopRightRadius: "6px",
                borderBottomRightRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#444")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#333")}>
              Gửi
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          paddingTop: "30px",
          borderTop: "1px solid #333",
          color: "#666",
          fontSize: "14px",
        }}>
        <p>© 2024 MeBrick. Tất cả các quyền được bảo lưu.</p>
        <p style={{ marginTop: "10px" }}>
          Được thiết kế với ❤️ cho những khoảnh khắc đặc biệt
        </p>
      </div>
    </footer>
  );
}
