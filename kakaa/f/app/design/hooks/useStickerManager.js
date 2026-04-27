"use client";

export function useStickerManager({
  LEGO_CONFIG,
  stickers,
  setStickers,
  canvasSize,
  legoCharacters,
  selectedCharacterId,
  updateCharacterOutfit,
  handleDeleteCharacter,
  setSelectedCharacterId,
  setSelectedId,
}) {
  // ====================
  // ADD GENERIC STICKER
  // ====================
  const addSticker = (stickerData) => {
    const newSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...stickerData,

      x:
        stickerData.x ??
        Math.max(0, 40 + Math.random() * (canvasSize.width - 120)),

      y:
        stickerData.y ??
        Math.max(0, 40 + Math.random() * (canvasSize.height - 120)),

      width: stickerData.width || 50,
      height: stickerData.height || 50,
      rotation: stickerData.rotation || 0,
      zIndex: stickerData.zIndex || Date.now(),
      isSelected: true,
      layerType: stickerData.layerType || "sticker",
    };

    const cleared = stickers.map((s) => ({ ...s, isSelected: false }));
    setStickers([...cleared, newSticker]);
    setSelectedId(newSticker.id);
  };

  // ====================
  // UPDATE STICKER
  // ====================
  const handleUpdateSticker = (id, partial) => {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...partial, isSelected: true }
          : { ...s, isSelected: false },
      ),
    );
  };

  // ====================
  // DELETE STICKER / CHARACTER
  // ====================
  const handleDeleteSticker = (stickerId) => {
    const stickerToDelete = stickers.find((s) => s.id === stickerId);

    if (stickerToDelete && stickerToDelete.characterId) {
      const cid = stickerToDelete.characterId;

      if (stickerToDelete.layerType === "outfit") {
        updateCharacterOutfit(null, cid);
        return;
      }

      if (
        stickerToDelete.layerType === "base" &&
        stickerToDelete.isBasePart &&
        stickerToDelete.part === "torso"
      ) {
        updateCharacterOutfit(null, cid);
        return;
      }

      if (stickerToDelete.layerType === "base" && stickerToDelete.isBasePart) {
        handleDeleteCharacter(cid);
        return;
      }
    }

    setStickers((prev) => prev.filter((s) => s.id !== stickerId));
    setSelectedId(null);
  };

  // ====================
  // CLEAR SELECTION
  // ====================
  const handleDesignAreaClick = () => {
    setStickers((prev) => prev.map((s) => ({ ...s, isSelected: false })));
    setSelectedCharacterId(null);
    setSelectedId(null);
  };

  // ====================
  // ADD TEXT
  // ====================
  const handleAddText = () => {
    addSticker({
      type: "text",
      content: "Nhập chữ...",
      color: "#111111",
      fontFamily: "Inter",
      fontSize: 14,
      align: "center",
      width: 110,
      height: 30,
      layerType: "text",
      zIndex: Date.now(),
    });
  };

  // ====================
  // ADD IMAGE (FIXED - HIGH QUALITY)
  // ====================
  const handleImageUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        // Scale vừa canvas nhưng không giảm chất lượng
        const maxWidth = canvasSize.width * 0.4;

        let finalWidth = naturalWidth;
        let finalHeight = naturalHeight;

        if (naturalWidth > maxWidth) {
          const ratio = maxWidth / naturalWidth;
          finalWidth = naturalWidth * ratio;
          finalHeight = naturalHeight * ratio;
        }

        addSticker({
          type: "image",
          src: e.target.result,
          name: file.name || "Ảnh upload",
          width: finalWidth,
          height: finalHeight,
          layerType: "image",
          zIndex: Date.now(),
        });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  // ====================
  // EXPORT METHODS
  // ====================
  return {
    addSticker,
    handleUpdateSticker,
    handleDeleteSticker,
    handleDesignAreaClick,
    handleAddText,
    handleImageUpload,
  };
}
