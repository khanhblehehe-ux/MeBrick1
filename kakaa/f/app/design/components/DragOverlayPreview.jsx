"use client";
import { DragOverlay } from "@dnd-kit/core";

export default function DragOverlayPreview({ activeSticker }) {
  return (
    <DragOverlay>
      {activeSticker && (
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundImage:
              activeSticker.type === "image" && activeSticker.src
                ? `url(${activeSticker.src})`
                : activeSticker.type === "lego" && activeSticker.src
                ? `url(${activeSticker.src})`
                : "none",
            backgroundColor: "#f8f9fa",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: "8px",
            border: "2px solid #007bff",
            opacity: 0.8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {activeSticker.type === "text" && activeSticker.content}
          {activeSticker.type === "lego" && !activeSticker.src && "🧱"}
        </div>
      )}
    </DragOverlay>
  );
}
