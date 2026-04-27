import { useState } from "react";
import { SIZE_OPTIONS, FRAME_TYPES } from "../config/size.config";

const FRAME_COLORS = [
  { id: "white", label: "Khung trắng" },
  { id: "wood",  label: "Khung gỗ" },
];

export default function FrameSelector({ selectedFrame, setSelectedFrame }) {
  const frame = { id: 1, name: "Khung ảnh", price: 0 };
  const fixedSize = SIZE_OPTIONS[0]; // 23x23cm
  const [selectedColor, setSelectedColor] = useState(null);

  const handleSelectColor = (colorId) => {
    setSelectedColor(colorId);
    if (selectedFrame?.frameType) {
      setSelectedFrame({ ...selectedFrame, frameColor: colorId });
    }
  };

  const handleSelectFrameType = (frameType) => {
    setSelectedFrame({
      frameId: frame.id,
      frameName: frame.name,
      framePrice: frame.price,
      frameType: frameType.id,
      frameTypeName: frameType.name,
      frameTypePrice: frameType.price,
      frameTypeDescription: frameType.description,
      frameColor: selectedColor,
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
              <div className="frame-type-content">
                <div className="frame-type-name">{frameType.name}</div>
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
              </div>
              <div className="frame-type-radio" />
            </button>
          );
        })}
      </div>

      {/* FRAME COLOR OPTIONS */}
      <div className="frame-color-options">
        {FRAME_COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            className={`frame-color-btn ${selectedColor === color.id ? "is-selected" : ""}`}
            onClick={() => handleSelectColor(color.id)}>
            {color.label}
          </button>
        ))}
      </div>

      {/* BASE PRICE INCLUDES */}
      <div className="base-includes">
        <p className="base-includes-title">Giá cơ bản đã bao gồm:</p>
        <ul className="base-includes-list">
          <li>1 khung ảnh 23x23 cm – thiết kế sang trọng, trưng bày ấn tượng</li>
          <li>1 background tuỳ chọn – mẫu có sẵn hoặc sử dụng ảnh của bạn</li>
          <li>Miễn phí 1 nhân vật (tuỳ chỉnh mặt và kiểu tóc theo yêu cầu)</li>
          <li>Hộp quà kèm thiệp viết tay – nội dung cá nhân hoá</li>
        </ul>
      </div>
    </div>
  );
}
