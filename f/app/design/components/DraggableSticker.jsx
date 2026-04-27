export default function DraggableSticker({
  sticker,
  onDelete,
  onSelect,
  setRef,
  onPointerDown,
}) {
  const isLegoPart = !!sticker.characterId;

  // ✅ Mobile: Scale LEGO characters by 0.667 (1/1.5)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
  const legoScale = isLegoPart && isMobile ? 0.667 : 1;

  return (
    <div
      ref={setRef}
      className={isLegoPart ? "draggable-sticker draggable-sticker--lego" : "draggable-sticker"}
      style={{
        position: "absolute",
        left: sticker.x,
        top: sticker.y,
        width: sticker.width * legoScale,
        height: sticker.height * legoScale,
        transform: `rotate(${sticker.rotation || 0}deg)`,
        cursor: "move",
        zIndex: sticker.zIndex || 1,
        userSelect: "none",
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect?.(sticker.id);
        onPointerDown?.(e);
      }}>
      {/* IMAGE (lego + sticker ảnh) */}
      {sticker.type === "image" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: sticker.src ? `url(${sticker.src})` : "none",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* TEXT */}
      {sticker.type === "text" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: sticker.fontSize || 24,
            fontWeight: 700,
            color: sticker.color || "#000",
            fontFamily: sticker.fontFamily || "Inter",
          }}>
          {sticker.content}
        </div>
      )}

      {/* DELETE */}
      {sticker.isSelected && !isLegoPart && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sticker.id);
          }}
          style={{
            position: "absolute",
            top: "-10px",
            left: "-10px",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            border: "none",
            background: "#dc3545",
            color: "#fff",
            cursor: "pointer",
          }}>
          ✕
        </button>
      )}
    </div>
  );
}
