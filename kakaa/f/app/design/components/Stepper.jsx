"use client";

export default function Stepper({
  step,
  goStep,
  canGoFrame,
  canGoBg,
  canGoLego,
  canGoCheckout,
  calculateTotal,
  selectedSize,
  onReset,
}) {
  return (
    <div className="lego-header__steps">
      <button
        className={`lego-step ${step === 1 ? "active" : step > 1 ? "done" : ""}`}
        onClick={() => goStep(1)}>
        <span className="dot">{step > 1 ? "✓" : "1"}</span>
        <span>Chọn khung</span>
      </button>

      <div className="lego-step-line" />

      <button
        className={`lego-step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}
        onClick={() => goStep(2)}
        disabled={!canGoBg}>
        <span className="dot">{step > 2 ? "✓" : "2"}</span>
        <span>Chọn nền</span>
      </button>

      <div className="lego-step-line" />

      <button
        className={`lego-step ${step === 3 ? "active" : step > 3 ? "done" : ""}`}
        onClick={() => goStep(3)}
        disabled={!canGoLego}>
        <span className="dot">{step > 3 ? "✓" : "3"}</span>
        <span>Nhân vật LEGO</span>
      </button>

      <div className="lego-step-line" />

      <button
        className={`lego-step ${step === 4 ? "active" : ""}`}
        onClick={() => goStep(4)}
        disabled={!canGoCheckout}>
        <span className="dot">4</span>
        <span>Thanh toán</span>
      </button>

      <div className="lego-step-total">
        <div className="muted">Giá tạm tính</div>
        <div className="price">
          {selectedSize ? `${calculateTotal()}đ` : "—"}
        </div>
      </div>

      {onReset && (
        <button
          onClick={onReset}
          title="Bắt đầu lại"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "999px",
            border: "1px solid #0B2D72",
            background: "#0B2D72",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ↺ Reset
        </button>
      )}
    </div>
  );
}
