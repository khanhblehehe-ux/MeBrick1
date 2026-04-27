"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiShoppingCart,
  FiLayers,
  FiFilter,
  FiPlus,
  FiTrash2,
  FiType,
  FiImage,
  FiUpload,
  FiChevronDown,
  FiChevronUp,
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
    designerNote = "",
    setDesignerNote,

    // print info (from DesignPage)
    printName = "",
    setPrintName = () => {},
    printTitle = "",
    setPrintTitle = () => {},
    printMessage = "",
    setPrintMessage = () => {},
    printDate = "",
    setPrintDate = () => {},
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
  // ✅ State cho toggle print info form
  const [showPrintInfo, setShowPrintInfo] = useState(false);
  // ✅ State cho confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const bgTabs = [
    "Tất cả",
    "Happy Birthday",
    "Special Day",
    "Love",
    "Happy Anniversary",
    "Happy Together",
    "Graduation",
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

            {/* Step title */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              marginBottom: "16px",
              padding: "8px 12px",
              background: "#EBF3FF",
              borderRadius: "8px"
            }}>
              <span style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#4285F4",
                color: "white",
                fontWeight: "600",
                fontSize: "14px",
                flexShrink: 0
              }}>1</span>
              <span style={{ 
                fontSize: "15px", 
                fontWeight: "600", 
                color: "#1a1a1a" 
              }}>Thiết kế nhân vật</span>
            </div>

            {/* 3 buttons in one row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
                marginBottom: "12px",
              }}>
              <button
                type="button"
                className="mb-btn mb-btn--primary"
                style={{ fontSize: "13px", padding: "8px 10px" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActivePanel?.(null);
                  setSelectedId?.(null);
                  addCompleteLegoCharacter?.();
                }}>
                <FiPlus />{" "}
                {legoCharacters.length > 0
                  ? "Thêm NV"
                  : "Nhân vật"}
              </button>

              <button
                type="button"
                className="mb-btn mb-btn--outline"
                style={{ fontSize: "13px", padding: "8px 10px" }}
                onClick={onAddTextClick}>
                <FiType /> Chữ
              </button>

              <button
                type="button"
                className="mb-btn mb-btn--outline"
                style={{ fontSize: "13px", padding: "8px 10px" }}
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
                      onClick={() => {
                        setSelectedId?.(null);
                        setActivePanel?.(null);
                        setSelectedCategory(t.key);
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>

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

                  {/* Ghi chú nhờ designer chỉnh sửa */}
                  <div style={{ margin: "10px 0 4px", color: "#555", fontSize: "12px", fontWeight: 600 }}>
                    📝 Yêu cầu thêm cho designer (khi bạn không thể tự thiết kế) sau đó Designer sẽ liên hệ cho b để b check:
                  </div>
                  <textarea
                    value={designerNote}
                    onChange={(e) => setDesignerNote?.(e.target.value)}
                    placeholder="VD: Thêm chữ tên ở góc phải, đổi màu nền sang hồng, thêm trái tim..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      resize: "vertical",
                      fontFamily: "inherit",
                      color: "#333",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* ===== Print information form (Step 3) ===== */}
                  <div style={{ marginTop: 24, marginBottom: 20 }}>
                    {/* Step title - matching style with "1 Thiết kế nhân vật" */}
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px", 
                      marginBottom: "16px",
                      padding: "8px 12px",
                      background: "#EBF3FF",
                      borderRadius: "8px"
                    }}>
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "#4285F4",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "14px",
                        flexShrink: 0
                      }}>2</span>
                      <span style={{ 
                        fontSize: "15px", 
                        fontWeight: "600", 
                        color: "#1a1a1a" 
                      }}>Nhập Thông Tin</span>
                    </div>

                    <div style={{
                      background: "#fff",
                      padding: 24,
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                    }}>
                      {/* TÊN Field */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ 
                          display: "block", 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: "#111", 
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          TÊN <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={printName}
                          onChange={(e) => setPrintName?.(e.target.value)}
                          placeholder="Nhập tên"
                          style={{ 
                            width: "100%",
                            padding: 12,
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            fontSize: 14,
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                            outline: "none",
                            transition: "border-color 0.2s"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        />
                      </div>

                      {/* NGÀY Field */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ 
                          display: "block", 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: "#111", 
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          NGÀY
                        </label>
                        <input
                          type="date"
                          value={printDate}
                          onChange={(e) => setPrintDate?.(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          style={{ 
                            width: "100%",
                            padding: 12,
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            fontSize: 14,
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                            outline: "none",
                            transition: "border-color 0.2s",
                            cursor: "pointer"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        />
                      </div>

                      {/* TIÊU ĐỀ Field */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ 
                          display: "block", 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: "#111", 
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          TIÊU ĐỀ
                        </label>
                        <input
                          type="text"
                          value={printTitle}
                          onChange={(e) => setPrintTitle?.(e.target.value)}
                          placeholder="Nhập tiêu đề"
                          style={{ 
                            width: "100%",
                            padding: 12,
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            fontSize: 14,
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                            outline: "none",
                            transition: "border-color 0.2s"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        />
                      </div>

                      {/* NGÀNH / TIÊU ĐỀ / LỰA CHỌN Field */}
                      <div style={{ marginBottom: 24 }}>
                        <label style={{ 
                          display: "block", 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: "#111", 
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          NGÀNH / TIÊU ĐỀ / LỰA CHỌN
                        </label>
                        <textarea
                          value={printMessage}
                          onChange={(e) => setPrintMessage?.(e.target.value)}
                          placeholder="Nhập nội dung"
                          rows={5}
                          style={{ 
                            width: "100%",
                            padding: 12,
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            fontSize: 14,
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                            outline: "none",
                            transition: "border-color 0.2s",
                            resize: "vertical"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!printName || !printTitle || !printMessage || !printDate) {
                              alert("Vui lòng điền đầy đủ thông tin (Tên, Tiêu đề, Lời nhắn, Ngày)");
                              return;
                            }
                            setShowConfirmation(true);
                          }}
                          style={{
                            padding: "12px 24px",
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            transition: "background-color 0.2s",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = "#1d4ed8"}
                          onMouseLeave={(e) => e.target.style.backgroundColor = "#2563eb"}
                        >
                          GỬI THÔNG TIN
                          <span style={{ fontSize: 16 }}>→</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPrintName?.("");
                            setPrintTitle?.("");
                            setPrintMessage?.("");
                            setPrintDate?.("");
                          }}
                          style={{
                            padding: "12px 24px",
                            backgroundColor: "#f3f4f6",
                            color: "#1f2937",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#e5e7eb";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#f3f4f6";
                          }}
                        >
                          XÓA
                        </button>
                      </div>
                    </div>
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
          <>
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

            {/* MẸO: ĐẶT LỊCH SỚM */}
            <div className="checkout-tip">
              <div className="checkout-tip__header">
                <span className="checkout-tip__icon">🚚</span>
                <span className="checkout-tip__title">Thời gian sản xuất &amp; giao hàng</span>
              </div>
              <p>Sản phẩm của Mê Bricks được làm thủ công nên cần khoảng <strong>1 ngày</strong> để hoàn thiện trước khi gửi đi.</p>
              <p>Sau khi hoàn thành, đơn hàng sẽ được đóng gói cẩn thận và vận chuyển trong khoảng <strong>2–4 ngày</strong> tuỳ khu vực.</p>
              <p>Để đảm bảo nhận quà đúng dịp, bạn nên <strong>đặt trước vài ngày</strong> so với ngày cần tặng.</p>
            </div>

            {/* HỖ TRỢ TRƯỚC KHI GỬI HÀNG */}
            <div className="checkout-antam">
              <div className="checkout-antam__header">
                <span className="checkout-antam__icon">💬</span>
                <span className="checkout-antam__title">HỖ TRỢ TRƯỚC KHI GỬI HÀNG</span>
              </div>
              <p>Nếu bạn muốn xem kỹ hơn về sản phẩm hoặc chỉnh sửa thêm chi tiết, hãy liên hệ trực tiếp qua <strong>Zalo: 0976 924 958</strong> để Mê Bricks hỗ trợ nhanh nhất.</p>
              <p>Trường hợp muốn thêm frame hoặc điều chỉnh lại thiết kế, bạn cũng có thể nhắn Zalo trước khi đơn hàng được hoàn thiện và gửi đi.</p>
            </div>

            <div className="mb-row mb-row--between mb-total">
              <div className="mb-total__label">Tổng cộng</div>
              <div className="mb-total__value">{formatVnd(p.total)}</div>
            </div>

          </section>

          <div className="mb-panel__actions">
            <div className="mb-panel__actions-inner">
              <div className="mb-panel__actions-btns">
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
              </div>

              <div className="mb-panel__actions-qty">
                <div className="mb-qty__label">SL</div>
                <div className="mb-qty mb-qty--compact">
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
              </div>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
          onClick={() => setShowConfirmation(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#111",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              ✅ Thông tin đã được gửi thành công
            </h2>

            {/* Info Summary */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                  Tên:{" "}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                  {printName}
                </span>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                  Tiêu đề:{" "}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                  {printTitle}
                </span>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                  Lời nhắn:{" "}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                  {printMessage}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                  Ngày:{" "}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                  {printDate}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowConfirmation(false)}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
