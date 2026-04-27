import { SIZE_OPTIONS, FRAME_TYPES } from "../config/size.config";

export default function FrameSelector({ selectedFrame, setSelectedFrame }) {
  const frame = { id: 1, name: "Khung ảnh", price: 0 };
  const fixedSize = SIZE_OPTIONS[0]; // 23x23cm

  const handleSelectFrameType = (frameType) => {
    setSelectedFrame({
      frameId: frame.id,
      frameName: frame.name,
      framePrice: frame.price,
      frameType: frameType.id,
      frameTypeName: frameType.name,
      frameTypePrice: frameType.price,
      frameTypeDescription: frameType.description,
      size: {
        id: fixedSize.id,
        name: fixedSize.name,
        dimensions: fixedSize.dimensions,
        price: fixedSize.price,
      },
    });
  };

  return (
    <div className="frame-section">
      <h3 className="section-title">Chọn loại khung (23x23cm)</h3>

      {/* FRAME TYPE OPTIONS */}
      <div
        className={`frame-types ${selectedFrame?.frameType ? "has-selection" : ""}`}>
        {(FRAME_TYPES || []).map((frameType) => {
          const isSelected = selectedFrame?.frameType === frameType.id;

          return (
            <button
              key={frameType.id}
              type="button"
              className={`frame-type-btn ${isSelected ? "is-selected" : ""}`}
              onClick={() => handleSelectFrameType(frameType)}>
              <div className="frame-type-name">{frameType.name}</div>
              <div className="frame-type-desc">{frameType.description}</div>
              <div className="frame-type-features">
                {frameType.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    {feature}
                  </div>
                ))}
              </div>
              <div className="frame-type-price">
                {frameType.price?.toLocaleString("vi-VN")}đ
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
