"use client";

import { useRef } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function ImageTransformLayer({
  selectedImage,
  setStickers,
  setSelectedId,
}) {
  const resizingRef = useRef(null);
  const rotatingRef = useRef(null);
  const resizingHRef = useRef(null);

  if (!selectedImage) return null;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // =========================
  // RESIZE (chỉ dành cho ảnh, không cho LEGO parts, không cho stickers)
  // =========================
  const isLegoPart = !!selectedImage.characterId;
  const isSticker = selectedImage.layerType === "sticker";

  const startResize = (e) => {
    e.stopPropagation();
    e.preventDefault();

    resizingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: selectedImage.width,
      startHeight: selectedImage.height,
      startXPos: selectedImage.x,
      startYPos: selectedImage.y,
      isCircle: selectedImage.isCircle,
      type: selectedImage.type,
      fontSize: selectedImage.fontSize,
    };

    window.addEventListener("pointermove", handleResize);
    window.addEventListener("pointerup", stopResize);
  };

  const handleResize = (e) => {
    const r = resizingRef.current;
    if (!r) return;

    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;

    let newW = r.startWidth + dx * 2;
    let newH = r.startHeight + dy * 2;

    if (r.isCircle) {
      const size = clamp(Math.max(newW, newH), 40, 2000);
      newW = size;
      newH = size;
    } else {
      newW = clamp(newW, 40, 2000);
      newH = clamp(newH, 40, 2000);
    }

    const isText = r.type === "text";
    const updates = {
      width: newW,
      height: newH,
      x: r.startXPos + (r.startWidth - newW) / 2,
      y: r.startYPos + (r.startHeight - newH) / 2,
    };

    // Nếu là text, tính fontSize mới dựa trên tỷ lệ thay đổi
    if (isText && r.fontSize) {
      const ratio = Math.sqrt((newW * newH) / (r.startWidth * r.startHeight));
      updates.fontSize = Math.round(r.fontSize * ratio);
    }

    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedImage.id
          ? {
              ...s,
              ...updates,
            }
          : s,
      ),
    );
  };

  const stopResize = () => {
    resizingRef.current = null;
    window.removeEventListener("pointermove", handleResize);
    window.removeEventListener("pointerup", stopResize);
  };

  // =========================
  // RESIZE HORIZONTAL ONLY (text width)
  // =========================
  const startResizeH = (e) => {
    e.stopPropagation();
    e.preventDefault();

    resizingHRef.current = {
      startX: e.clientX,
      startWidth: selectedImage.width,
    };

    window.addEventListener("pointermove", handleResizeH);
    window.addEventListener("pointerup", stopResizeH);
  };

  const handleResizeH = (e) => {
    const r = resizingHRef.current;
    if (!r) return;
    const dx = e.clientX - r.startX;
    const newW = clamp(r.startWidth + dx, 40, 2000);
    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedImage.id ? { ...s, width: newW } : s,
      ),
    );
  };

  const stopResizeH = () => {
    resizingHRef.current = null;
    window.removeEventListener("pointermove", handleResizeH);
    window.removeEventListener("pointerup", stopResizeH);
  };

  // =========================
  // ROTATE – HOLD & DRAG 360°
  // =========================
  const startRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const studio = document.querySelector(".photo-frame-studio");
    const rect = studio?.getBoundingClientRect();

    const centerX =
      selectedImage.x + selectedImage.width / 2 + (rect?.left || 0);

    const centerY =
      selectedImage.y + selectedImage.height / 2 + (rect?.top || 0);

    rotatingRef.current = { centerX, centerY };

    document.body.style.cursor = "grabbing";

    window.addEventListener("pointermove", handleRotate);
    window.addEventListener("pointerup", stopRotate);
  };

  const handleRotate = (e) => {
    const r = rotatingRef.current;
    if (!r) return;

    const angle =
      (Math.atan2(e.clientY - r.centerY, e.clientX - r.centerX) * 180) /
      Math.PI;

    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedImage.id ? { ...s, rotation: angle } : s,
      ),
    );
  };

  const stopRotate = () => {
    rotatingRef.current = null;
    document.body.style.cursor = "default";

    window.removeEventListener("pointermove", handleRotate);
    window.removeEventListener("pointerup", stopRotate);
  };

  // =========================
  // TOGGLE CIRCLE
  // =========================
  const toggleCircle = (e) => {
    e.stopPropagation();

    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedImage.id
          ? {
              ...s,
              isCircle: !s.isCircle,
              width: !s.isCircle ? Math.max(s.width, s.height) : s.width,
              height: !s.isCircle ? Math.max(s.width, s.height) : s.height,
            }
          : s,
      ),
    );
  };

  // =========================
  // DELETE
  // =========================
  const deleteImage = (e) => {
    e.stopPropagation();

    setStickers((prev) => prev.filter((s) => s.id !== selectedImage.id));

    setSelectedId?.(null);
  };

  const centerX = selectedImage.x + selectedImage.width / 2;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999999,
      }}>
      {/* Selection Border - viền bao quanh để hiển thị khu vực resize */}
      <div
        style={{
          position: "absolute",
          left: selectedImage.x,
          top: selectedImage.y,
          width: selectedImage.width,
          height: selectedImage.height,
          border: "2px dashed #06b6d4",
          borderRadius: 4,
          pointerEvents: "none",
          background: "transparent",
          boxShadow: "none",
          outline: "none",
        }}
      />

      {/* Resize Handle - chỉ cho ảnh, không cho LEGO parts, không cho stickers */}
      {!isLegoPart && !isSticker && (
        <div
          style={{
            position: "absolute",
            left: selectedImage.x + selectedImage.width - 8,
            top: selectedImage.y + selectedImage.height - 8,
            width: 18,
            height: 18,
            background: "#6c8cff",
            border: "2px solid #fff",
            borderRadius: "50%",
            cursor: "nwse-resize",
            pointerEvents: "auto",
            boxShadow: "0 2px 6px rgba(108, 140, 255, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "bold",
            color: "#fff",
          }}
          onPointerDown={startResize}>
          ↗
        </div>
      )}

      {/* Horizontal Width Handle - chỉ cho text */}
      {selectedImage.type === "text" && (
        <div
          style={{
            position: "absolute",
            left: selectedImage.x + selectedImage.width - 6,
            top: selectedImage.y + selectedImage.height / 2 - 12,
            width: 12,
            height: 24,
            background: "#06b6d4",
            border: "2px solid #fff",
            borderRadius: 6,
            cursor: "ew-resize",
            pointerEvents: "auto",
            boxShadow: "0 2px 6px rgba(6, 182, 212, 0.5)",
          }}
          onPointerDown={startResizeH}
        />
      )}

      {/* Rotation Connector */}
      {selectedImage.type === "image" && !isSticker && (
        <div
          style={{
            position: "absolute",
            left: centerX - 1,
            top: selectedImage.y + selectedImage.height + 2,
            width: 2,
            height: 24,
            background: "#6c8cff",
          }}
        />
      )}

      {/* Rotation Handle */}
      {selectedImage.type === "image" && !isSticker && (
        <div
          onPointerDown={startRotate}
          style={{
            position: "absolute",
            left: centerX - 16,
            top: selectedImage.y + selectedImage.height + 26,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#fff",
            border: "2px solid #6c8cff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            pointerEvents: "auto",
          }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#6c8cff",
              userSelect: "none",
            }}>
            ↻
          </span>
        </div>
      )}

      {/* Trash icon - góc phải trên của sticker khi được chọn */}
      {selectedImage.type === "image" && (
        <button
          onClick={deleteImage}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: selectedImage.x + selectedImage.width - 10,
            top: selectedImage.y - 10,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#ff4d4f",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
            zIndex: 9999,
            padding: 0,
          }}>
          <FiTrash2 size={8} color="#fff" />
        </button>
      )}
    </div>
  );
}

const btnStyle = {
  background: "#6c8cff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  color: "#fff",
};
