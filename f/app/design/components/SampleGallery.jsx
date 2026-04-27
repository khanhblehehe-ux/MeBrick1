"use client";

import { useState } from "react";

// Ảnh mẫu tham khảo — thư mục /mau/ (tách riêng với /samples/ dùng làm ảnh nền)
const SAMPLE_IMAGES = Array.from({ length: 59 }, (_, i) => `/mau/${i + 1}.png`);

export default function SampleGallery({
  selectedProductImage = null,
  productName = "",
  onSelectImage = null,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const handleImageClick = (imageSrc) => {
    setActive(imageSrc);
    if (onSelectImage) {
      onSelectImage(imageSrc);
    }
  };

  return (
    <div className="sample-sidebar">
      {/* ===== ẢNH SẢN PHẨM TỪ TRANG CHỦ ===== */}
      {selectedProductImage && (
        <div className="selected-product-section">
          <button
            className="selected-product-thumb"
            onClick={() => handleImageClick(selectedProductImage)}
            title={productName}>
            <img src={selectedProductImage} draggable={false} onContextMenu={(e) => e.preventDefault()} />
          </button>
        </div>
      )}

      {/* ===== THANH ẢNH MẪU ===== */}
      <aside className={`sample-gallery ${open ? "is-open" : "is-closed"}`}>
        <button
          type="button"
          className="sample-toggle ui-button"
          onClick={() => setOpen((v) => !v)}>
          <span>Ảnh mẫu</span>
          <span className="sample-toggle__icon">{open ? "✕" : "›"}</span>
        </button>

        {open && (
          <div className="sample-panel">
            <div className="sample-list">
              {SAMPLE_IMAGES.map((src, i) => (
                <button
                  key={i}
                  className="sample-thumb"
                  onClick={() => handleImageClick(src)}>
                  <img src={src} draggable={false} onContextMenu={(e) => e.preventDefault()} />
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
