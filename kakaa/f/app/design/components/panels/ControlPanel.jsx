"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiDownload,
  FiShoppingCart,
  FiLayers,
  FiFilter,
  FiPlus,
  FiTrash2,
  FiType,
  FiImage,
  FiUpload,
} from "react-icons/fi";

import TextEditorPanel from "./TextEditorPanel";
import FrameSelector from "../FrameSelector";

const formatVnd = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(n || 0),
  );

export default function ControlPanel(props) {
  const {
    step,
    STEPS,
    setStep,

    selectedFrame,
    setSelectedFrame,
    canGoBg,
    canGoLego,
    selectedSize,
    canvasSize,
    selectedBackground,
    SIZE_OPTIONS,
    BACKGROUND_OPTIONS,
    handleSelectSize,
    handleSelectBackground,

    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    getFilteredLayers,
    addLegoLayer,

    legoCharacters,
    selectedCharacterId,
    addCompleteLegoCharacter,
    handleDeleteCharacter,

    handleAddText,
    handleImageUpload,
    fileInputRef,

    quantity,
    setQuantity,
    calculateTotal,
    pricing,
    handleExportImage,
    handleOrder,
    isEditing = false,

    activePanel,
    setActivePanel,
    selectedId,
    setSelectedId,
    stickers,
    handleUpdateSticker,
    handleDeleteSticker,
    isSaving = false,

    onSaveImage,
  } = props;

  const p = pricing || {
    basePrice: 0,
    legoPrice: 0,
    stickerPrice: 0,
    unitTotal: 0,
    total: 0,
  };

  const layerTabs = useMemo(
    () => [
      { key: "lego-colors", label: "Màu áo" },
      { key: "lego-pants", label: "Màu quần" },
      { key: "faces", label: "Mặt" },
      { key: "faces-female", label: "Mặt nữ" },
      { key: "hairs-nam", label: "Tóc Nam" },
      { key: "hairs-nu", label: "Tóc Nữ" },
      { key: "stickers", label: "Sticker" },
    ],
    [],
  );

  // ✅ State cho background categories
  const [selectedBgTab, setSelectedBgTab] = useState("Tất cả");
  const bgTabs = [
    "Tất cả",
    "Graduation",
    "Happy Birthday",
    "Happy Anniversary",
    "Special Day",
    "Love",
    "Football",
  ];

  const selectedLayer = useMemo(() => {
    if (!selectedId) return null;
    return (stickers || []).find((s) => s.id === selectedId) || null;
  }, [selectedId, stickers]);

  const selectedText =
    selectedLayer && selectedLayer.type === "text" ? selectedLayer : null;

  useEffect(() => {
    if (activePanel === "text" && !selectedText) setActivePanel?.(null);
  }, [activePanel, selectedText?.id, setActivePanel]);

  const onAddTextClick = () => {
    handleAddText?.();
    setActivePanel?.("text");
  };

  const onAddImageClick = () => {
    fileInputRef?.current?.click?.();
    setActivePanel?.("image");
  };

  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [step]);

  return (
    <aside className="mb-panel">
      {/* Header */}
      <div className={`mb-panel__head ${step === STEPS.BG ? "is-accent" : ""}`}>
        <div className="mb-panel__title">
          <FiLayers />
          <span>
            {step === STEPS.FRAME
              ? "Bước 1: Chọn khung"
              : step === STEPS.BG
                ? "Bước 2: Chọn nền"
                : step === STEPS.LEGO
                  ? "Bước 3: Chỉnh LEGO / Sticker"
                  : "Bước 4: Thanh toán"}
          </span>
        </div>
      </div>

      {/* ✅ BODY full height, cho phép scroll nội bộ */}
      <div key={animKey} className="mb-panel__body mb-panel__body--full mb-panel__body--animated">
        {/* ===================== STEP 1 (FRAME) ===================== */}
        {step === STEPS.FRAME && (
          <section className="mb-block mb-block--fill">
            {/* FRAME SELECTOR - với size options bên trong */}
            <FrameSelector
              selectedFrame={selectedFrame}
              setSelectedFrame={setSelectedFrame}
            />

            <button
              type="button"
              className="mb-btn mb-btn--primary mb-btn--lg mb-wfull"
              disabled={!selectedFrame}
              onClick={() => setStep(STEPS.BG)}>
              Tiếp theo → Chọn nền <FiArrowRight />
            </button>
          </section>
        )}
        {/* ===================== STEP 2 (BACKGROUND) ===================== */}
        {step === STEPS.BG && (
          <section className="mb-block mb-block--fill mb-block--bg">
            <div className="mb-row mb-row--between">
              <button
                type="button"
                className="mb-btn mb-btn--outline"
                onClick={() => setStep(STEPS.FRAME)}>
                <FiArrowLeft /> Quay lại
              </button>
              <div className="mb-dim">
                {canvasSize?.width || 0}×{canvasSize?.height || 0}px
              </div>
            </div>

            {/* ✅ Scroll area chỉ cho phần list nền */}
            <div className="mb-row mb-row--gap">
              {bgTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`mb-tab ${selectedBgTab === tab ? "is-active" : ""}`}
                  onClick={() => setSelectedBgTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>

            <div
              className="mb-bgbox mb-scroll-area"
              style={{ marginTop: "8px" }}>
              <div className="mb-bggrid">
                {(BACKGROUND_OPTIONS || [])
                  .filter((bg) => {
                    return (
                      selectedBgTab === "Tất cả" ||
                      bg.category === selectedBgTab ||
                      bg.name.includes(selectedBgTab)
                    );
                  })
                  .map((bg) => {
                    const active = selectedBackground?.id === bg.id;

                    const previewStyle =
                      bg.type === "color"
                        ? { backgroundColor: bg.value }
                        : bg.type === "gradient"
                          ? { background: bg.value }
                          : bg.thumbnail
                            ? {
                                backgroundImage: `url(${bg.thumbnail})`,
                                backgroundSize: bg.backgroundSize || "cover",
                                backgroundPosition: "center",
                              }
                            : { backgroundColor: "#f0f0f0" };

                    return (
                      <button
                        key={bg.id}
                        type="button"
                        className={`mb-bgcard ${active ? "is-active" : ""}`}
                        onClick={() => handleSelectBackground(bg)}>
                        <div
                          className="mb-bgcard__thumb"
                          style={previewStyle}
                        />
                        <div className="mb-bgcard__name">{bg.name}</div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* ✅ Upload button riêng - dưới danh sách ảnh nền */}
            <button
              type="button"
              className="mb-btn mb-btn--outline mb-wfull"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onSaveImage?.(file);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    handleSelectBackground({
                      id: "bg-custom-" + Date.now(),
                      name: "Nền tùy chỉnh",
                      type: "custom",
                      value: `url(${event.target.result})`,
                      thumbnail: event.target.result,
                    });
                  };
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              title="Upload nền"
              style={{ marginBottom: "10px" }}>
              <FiUpload /> Upload nền tùy chỉnh
            </button>

            {/* ✅ footer luôn nằm dưới */}
            <div className="mb-footer">
              <button
                type="button"
                className="mb-btn mb-btn--primary mb-btn--lg mb-wfull"
                disabled={!selectedBackground}
                onClick={() => setStep(STEPS.LEGO)}>
                Tiếp theo → Chỉnh LEGO <FiArrowRight />
              </button>

              {selectedBackground && (
                <div className="mb-using">
                  <FiCheck /> ✓ Đang dùng: {selectedBackground.name}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== STEP 3 (LEGO) ===================== */}
        {step === STEPS.LEGO && (
          <section className="mb-block">
            <div className="mb-row mb-row--between" style={{ marginBottom: "12px" }}>
              <button
                type="button"
                className="mb-btn mb-btn--outline"
                onClick={() => setStep(STEPS.BG)}>
                <FiArrowLeft /> Quay lại
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "12px",
              }}>
              <button
                type="button"
                className="mb-btn mb-btn--outline"
                onClick={onAddTextClick}>
                <FiType /> T+ Thêm chữ
              </button>

              <button
                type="button"
                className="mb-btn mb-btn--outline"
                onClick={onAddImageClick}>
                <FiImage /> Ảnh
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleImageUpload(file);
                onSaveImage?.(file);
                e.target.value = "";
              }}
              style={{ display: "none" }}
            />

            {!!selectedText && (
              <TextEditorPanel
                selectedText={selectedText}
                onAddText={onAddTextClick}
                onChange={(partial) =>
                  selectedId && handleUpdateSticker?.(selectedId, partial)
                }
                onDelete={() => {
                  if (!selectedId) return;
                  handleDeleteSticker?.(selectedId);
                  setSelectedId?.(null);
                  setActivePanel?.(null);
                }}
                onClose={() => {
                  setSelectedId?.(null);
                  setActivePanel?.(null);
                }}
                disabled={isSaving}
              />
            )}

            {!selectedText && (
              <>
                <div className="mb-tabs">
                  {layerTabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`mb-tab ${
                        selectedCategory === t.key ? "is-active" : ""
                      }`}
                      onClick={() => setSelectedCategory(t.key)}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="mb-btn mb-btn--primary mb-btn--lg mb-wfull"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePanel?.(null);
                    setSelectedId?.(null);
                    addCompleteLegoCharacter?.();
                  }}>
                  <FiPlus />{" "}
                  {legoCharacters.length > 0
                    ? "Thêm nhân vật khác"
                    : "Thêm nhân vật LEGO"}
                </button>

                <div className="mb-layergrid">
                  {(getFilteredLayers?.() || []).map((layer) => (
                    <button
                      key={layer.id}
                      type="button"
                      className={`mb-layercard${layer.layerType === "sticker" ? " mb-layercard--sticker" : ""}`}
                      onClick={() => {
                        setActivePanel?.(null);

                        if (
                          layer.layerType === "character" ||
                          layer.layerType === "sticker"
                        ) {
                          addLegoLayer(layer);
                          return;
                        }
                        if (!selectedCharacterId) {
                          alert(
                            "Vui lòng click chọn 1 nhân vật LEGO trong khung trước!",
                          );
                          return;
                        }
                        addLegoLayer(layer);
                      }}>
                      <div
                        className="mb-layercard__thumb"
                        style={{
                          backgroundImage:
                            layer.layerType !== "character" &&
                            (layer.thumbnail || layer.src)
                              ? `url(${layer.thumbnail || layer.src})`
                              : "none",
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}>
                        {layer.layerType === "character" ? (
                          <span className="mb-layercard__avatar">👤</span>
                        ) : null}
                      </div>

                      <div className="mb-layercard__name">{layer.name}</div>
                      <div className="mb-layercard__price">
                        {layer.price > 0
                          ? `${layer.price.toLocaleString("vi-VN")}đ`
                          : "Miễn phí"}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedCharacterId && (
                  <button
                    type="button"
                    className="mb-btn mb-btn--danger mb-btn--lg mb-wfull"
                    onClick={() => {
                      setActivePanel?.(null);
                      handleDeleteCharacter(selectedCharacterId);
                    }}>
                    <FiTrash2 /> Xóa nhân vật đang chọn
                  </button>
                )}

                <button
                  type="button"
                  className="mb-btn mb-btn--primary mb-btn--lg mb-wfull"
                  onClick={() => setStep(STEPS.CHECKOUT)}
                  disabled={!selectedSize}>
                  Tiếp theo → Thanh toán <FiArrowRight />
                </button>
              </>
            )}
          </section>
        )}

        {/* ===================== STEP 4 (CHECKOUT) ===================== */}
        {step === STEPS.CHECKOUT && (
          <section className="mb-block">
            <div className="mb-row mb-row--between">
              <button
                type="button"
                className="mb-btn mb-btn--outline"
                onClick={() => setStep(STEPS.LEGO)}>
                <FiArrowLeft /> Quay lại chỉnh LEGO
              </button>

              {!!selectedSize && (
                <div className="mb-dim">
                  {canvasSize?.width || 0}×{canvasSize?.height || 0}px
                </div>
              )}
            </div>

            <div className="mb-bill">
              <div className="mb-bill__title">Chi tiết thanh toán</div>

              <div className="mb-bill__row">
                <span>Giá khung</span>
                <b>{formatVnd(p.basePrice)}</b>
              </div>
              <div className="mb-bill__row">
                <span>Sticker</span>
                <b>{formatVnd(p.stickerPrice)}</b>
              </div>
              {p.extraCharacterPrice > 0 && (
                <div className="mb-bill__row">
                  <span>Nhân vật thêm</span>
                  <b>+{formatVnd(p.extraCharacterPrice)}</b>
                </div>
              )}

              <div className="mb-bill__sep" />

              <div className="mb-bill__row">
                <span>Đơn giá</span>
                <b>{formatVnd(p.unitTotal)}</b>
              </div>
            </div>

            <div className="mb-block__label">Số lượng</div>

            <div className="mb-qty">
              <button
                type="button"
                className="mb-qty__btn"
                onClick={() => setQuantity((q) => Math.max(1, (q || 1) - 1))}>
                −
              </button>
              <div className="mb-qty__val">{quantity || 1}</div>
              <button
                type="button"
                className="mb-qty__btn"
                onClick={() => setQuantity((q) => (q || 1) + 1)}>
                +
              </button>
            </div>

            <div className="mb-row mb-row--between mb-total">
              <div className="mb-total__label">Tổng cộng</div>
              <div className="mb-total__value">{formatVnd(p.total)}</div>
            </div>

            <button
              type="button"
              className="mb-btn mb-btn--soft mb-btn--lg mb-wfull"
              onClick={handleExportImage}
              disabled={!selectedSize}>
              <FiDownload /> Xuất hình ảnh
            </button>

            <button
              type="button"
              className="mb-btn mb-btn--primary mb-btn--lg mb-wfull"
              onClick={handleOrder}
              disabled={!selectedSize || isSaving}>
              <FiShoppingCart />{" "}
              {isSaving
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật sản phẩm"
                  : "Thêm vào giỏ hàng"}
            </button>
          </section>
        )}
      </div>
    </aside>
  );
}
