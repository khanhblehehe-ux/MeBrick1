"use client";

import {
  FiSquare,
  FiArrowLeft,
  FiArrowRight,
  FiUpload,
  FiCheck,
  FiDownload,
  FiShoppingCart,
} from "react-icons/fi";

export default function RightPanel(props) {
  const {
    step,
    STEPS,
    setStep,

    selectedSize,
    canvasSize,
    selectedBackground,
    SIZE_OPTIONS,
    BACKGROUND_OPTIONS,
    handleSelectSize,
    handleSelectBackground,

    quantity,
    setQuantity,
    calculateTotal,
    handleExportImage,
    handleOrder,
  } = props;

  return (
    <div className="right-panel">
      <div className="panel-card">
        <div className="panel-title">
          <FiSquare />
          {step === STEPS.FRAME
            ? "Chọn kích thước khung"
            : step === STEPS.BG
              ? "Chọn nền cho khung"
              : "Thông tin"}
        </div>

        {/* ================= STEP 1: FRAME ================= */}
        {step === STEPS.FRAME && (
          <div className="panel-step">
            <div className="step-title" style={{ marginBottom: 12 }}>
              Bước 1: Chọn kích thước khung
            </div>

            <div className="option-list">
              {SIZE_OPTIONS.map((size) => {
                const active = selectedSize === size.id;
                return (
                  <div
                    key={size.id}
                    className={`option-card ${active ? "is-active" : ""}`}
                    onClick={() => handleSelectSize(size.id)}
                    role="button"
                    tabIndex={0}>
                    {active && <div className="option-check">✓</div>}

                    <div className="option-row">
                      <div className="option-name">{size.name}</div>
                      <div className="option-price">{size.price}đ</div>
                    </div>

                    <div className="option-sub">{size.dimensions}</div>
                  </div>
                );
              })}
            </div>

            {selectedSize && (
              <button
                className="btn-primary btn-success"
                onClick={() => setStep(STEPS.BG)}>
                Tiếp tục chọn nền <FiArrowRight />
              </button>
            )}
          </div>
        )}

        {/* ================= STEP 2: BACKGROUND ================= */}
        {step === STEPS.BG && (
          <div className="panel-step">
            <div className="step-head">
              <div className="step-title">Bước 2: Chọn nền cho khung</div>
              <button className="btn-mini" onClick={() => setStep(STEPS.FRAME)}>
                <FiArrowLeft /> Đổi khung
              </button>
            </div>

            <div className="panel-info">
              <div className="info-title">
                Đã chọn khung:{" "}
                {SIZE_OPTIONS.find((s) => s.id === selectedSize)?.name}
              </div>

              {selectedBackground && (
                <div className="info-ok">
                  <FiCheck /> Đang dùng nền: {selectedBackground.name}
                </div>
              )}
            </div>

            {/* Tabs (giữ nguyên UI của bạn) */}
            <div className="tab-row">
              {[
                "Tất cả",
                "Graduation",
                "Happy Birthday",
                "Happy Anniversary",
                "Football",
                "Merry Christmas",
              ].map((tab) => (
                <button
                  key={tab}
                  className={`tab-chip ${tab === "Tất cả" ? "is-active" : ""}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Upload custom background */}
            <div
              className="upload-card"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
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
              }}>
              <FiUpload className="upload-ico" />
              <div className="upload-title">+ Upload nền từ máy tính</div>
              <div className="upload-sub">JPG, PNG • Tối đa 5MB</div>
            </div>

            <button
              className="btn-primary btn-success"
              onClick={() => setStep(STEPS.LEGO)}
              disabled={!selectedBackground}>
              Tiếp theo → LEGO & Sticker <FiArrowRight />
            </button>

            <div className="panel-note">Bạn có thể đổi nền lại sau</div>
          </div>
        )}

        {/* ================= COMMON: Quantity + Total ================= */}
        <div className="panel-divider">
          <div className="step-title" style={{ marginBottom: 10 }}>
            Số lượng
          </div>

          <div className="qty-row">
            <button
              className="qty-btn"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
              -
            </button>
            <div className="qty-value">{quantity}</div>
            <button
              className="qty-btn"
              onClick={() => setQuantity((prev) => prev + 1)}>
              +
            </button>
          </div>

          <div className="total-row">
            <span className="total-label">Tổng cộng:</span>
            <span className="total-value">{calculateTotal()}đ</span>
          </div>

          <button
            className="btn-primary btn-success"
            onClick={handleExportImage}
            disabled={!selectedSize}>
            <FiDownload /> Xuất hình ảnh
          </button>

          <div style={{ height: 10 }} />

          <button
            className="btn-primary"
            disabled={!selectedSize}
            onClick={handleOrder}>
            <FiShoppingCart /> Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}
