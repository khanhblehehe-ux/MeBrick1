"use client";

import { useState } from "react";
import { FiX, FiInfo } from "react-icons/fi";

// Ảnh mẫu tham khảo — thư mục /mau/ (tách riêng với /samples/ dùng làm ảnh nền)
const SAMPLE_IMAGES = Array.from({ length: 59 }, (_, i) => `/mau/${i + 1}.png`);

export default function SampleGallery({
  selectedProductImage = null,
  productName = "",
  onSelectImage = null,
  isOpen = false,
  onClose = () => {},
}) {
  const handleImageClick = (imageSrc) => {
    if (onSelectImage) {
      onSelectImage(imageSrc);
    }
    onClose(); // Close drawer after selection
  };

  return (
    <div className={`sample-drawer ${isOpen ? "is-open" : ""}`}>
      <div className="sample-drawer-header">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0A2540", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiInfo /> Cảm hứng thiết kế
        </h2>
        <button className="sample-drawer-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="sample-drawer-body">
        {selectedProductImage && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#64748b", marginBottom: "8px" }}>Sản phẩm hiện tại:</p>
            <button
              className="sample-thumb is-product-image"
              onClick={() => handleImageClick(selectedProductImage)}
              title={productName}
              style={{ width: "100%", border: "2px solid #3B82F6", borderRadius: "12px", overflow: "hidden" }}>
              <img src={selectedProductImage} style={{ width: "100%", display: "block" }} />
              <span className="sample-thumb__badge">Đang chọn</span>
            </button>
          </div>
        )}

        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#64748b", marginBottom: "12px" }}>Các mẫu gợi ý:</p>
        <div className="sample-list" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {SAMPLE_IMAGES.map((src, i) => (
            <button
              key={i}
              className="sample-thumb"
              onClick={() => handleImageClick(src)}
              style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)" }}>
              <img src={src} style={{ width: "100%", display: "block" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
