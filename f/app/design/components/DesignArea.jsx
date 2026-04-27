"use client";
import { useDroppable } from "@dnd-kit/core";
import { useRef, useState, useEffect } from "react";

export default function DesignArea({
  id,
  children,
  onClick,
  canvasSize,
  selectedBackground,
  canvasScale = 1,
  ...rest
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // ====== Pinch-to-zoom background ======
  const [bgZoom, setBgZoom] = useState(1);
  const pinchRef = useRef(null); // { startDist, startZoom }

  // Reset zoom khi đổi nền
  useEffect(() => { setBgZoom(1); }, [selectedBackground?.id]);

  const getPinchDist = (e) => {
    const [a, b] = [e.touches[0], e.touches[1]];
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { startDist: getPinchDist(e), startZoom: bgZoom };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = getPinchDist(e);
      const ratio = dist / pinchRef.current.startDist;
      const newZoom = Math.min(3, Math.max(0.5, pinchRef.current.startZoom * ratio));
      setBgZoom(newZoom);
    }
  };

  const handleTouchEnd = () => { pinchRef.current = null; };

  const getBackgroundStyle = () => {
    if (!selectedBackground) return { backgroundColor: "#ffffff" };

    const style = {};

    if (selectedBackground.type === "color") {
      style.backgroundColor = selectedBackground.value;
    } else if (selectedBackground.type === "gradient") {
      style.background = selectedBackground.value;
    } else if (
      selectedBackground.type === "pattern" ||
      selectedBackground.type === "custom"
    ) {
      const bgValue = selectedBackground.value;
      style.backgroundImage = bgValue?.startsWith("url")
        ? bgValue
        : `url(${bgValue})`;
      const baseSize = selectedBackground.backgroundSize || "contain";
      // Nếu bgZoom khác 1, chuyển sang % để scale được
      style.backgroundSize = bgZoom !== 1 ? `${bgZoom * 100}%` : baseSize;
      style.backgroundPosition = "center";
      style.backgroundRepeat = "no-repeat";
      style.backgroundColor = "transparent";
    }

    return style;
  };

  return (
    // ✅ WRAPPER = kích thước visual sau scale, overflow visible để slot-zones và background không bị cắt
    <div
      style={{
        width: `${canvasSize.width * canvasScale}px`,
        height: `${canvasSize.height * canvasScale}px`,
        position: "relative",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "visible",
        flexShrink: 0,
      }}
    >
      {/* 🔹 CANVAS GỐC – kích thước logic giữ nguyên, scale từ top-left để visual khớp wrapper */}
      <div
        ref={setNodeRef}
        onClick={onClick}
        className={`lego-canvas ${isOver ? "is-over" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          transform: `scale(${canvasScale})`,
          transformOrigin: "top left",
          // Allow vertical page scrolling on mobile while keeping canvas interactive
          touchAction: "pan-y",
          ...getBackgroundStyle(),
        }}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}