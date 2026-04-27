"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  FiType,
  FiPlus,
  FiCheck,
  FiTrash2,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
} from "react-icons/fi";

export default function TextEditorPanel({
  selectedText,
  onAddText,
  onChange,
  onDelete,
  onClose,
  disabled = false,
}) {
  const textareaRef = useRef(null);

  const FONT_OPTIONS = useMemo(() => [], []);

  useEffect(() => {
    if (!selectedText) return;
    const t = setTimeout(() => {
      textareaRef.current?.focus?.();
      const el = textareaRef.current;
      if (el && typeof el.selectionStart === "number") {
        const len = el.value?.length || 0;
        el.selectionStart = el.selectionEnd = len;
      }
    }, 0);
    return () => clearTimeout(t);
  }, [selectedText?.id]);

  const isEmpty = !selectedText;

  const content = selectedText?.content ?? "";
  const color = selectedText?.color ?? "#111111";
  const fontFamily = selectedText?.fontFamily ?? "Inter";
  const fontSize = clamp(Number(selectedText?.fontSize ?? 26), 8, 120);
  const align = selectedText?.align ?? "center";

  const setHex = (v) => {
    // chấp nhận #RGB / #RRGGBB
    const s = String(v || "").trim();
    if (!s) return;
    const ok = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
    if (ok) onChange?.({ color: s });
  };

  return (
    <div className="tp-card">
      {/* Top title (nhẹ nhàng, giống form step) */}
      <div className="tp-step">
        <div className="tp-step__title">
          <FiType /> Chỉnh sửa chữ
        </div>

        <div className="tp-step__actions">
          <button
            className="tp-btn tp-btn--soft"
            onClick={onAddText}
            disabled={disabled}
            type="button"
            title="Thêm chữ">
            <FiPlus /> Thêm chữ
          </button>

          <button
            className="tp-btn tp-btn--primary"
            onClick={onClose}
            type="button"
            title="Xong">
            <FiCheck /> Xong
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="tp-empty">
          <div className="tp-empty__box">
            <div className="tp-empty__headline">Chưa có layer chữ nào</div>
            <div className="tp-empty__desc">
              Bấm <b>Thêm chữ</b> để tạo chữ hoặc chọn layer chữ trên khung để
              chỉnh sửa.
            </div>
          </div>
        </div>
      ) : (
        <div className="tp-body">
          {/* Nội dung */}
          <div className="tp-field">
            <div className="tp-label">Nội dung</div>
            <textarea
              ref={textareaRef}
              className="tp-textarea"
              value={content}
              placeholder="Nhập chữ..."
              onChange={(e) => onChange?.({ content: e.target.value })}
              disabled={disabled}
              rows={4}
              style={{ fontFamily }}
            />
            <div className="tp-hint">Tip: Enter để xuống dòng.</div>
          </div>

          {/* Màu */}
          <div className="tp-field">
            <div className="tp-label">Màu chữ</div>
            <div className="tp-colorRow">
              <input
                className="tp-color"
                type="color"
                value={color}
                onChange={(e) => onChange?.({ color: e.target.value })}
                disabled={disabled}
                aria-label="Chọn màu"
              />
              <input
                className="tp-hex"
                value={color}
                onChange={(e) => setHex(e.target.value)}
                disabled={disabled}
                placeholder="#111111"
                aria-label="Mã màu"
              />
            </div>
          </div>

          {/* Size */}
          <div className="tp-field">
            <div className="tp-rowBetween">
              <div className="tp-label">Cỡ chữ</div>
              <div className="tp-badge">{fontSize}px</div>
            </div>

            <div className="tp-sizeRow">
              <input
                className="tp-range"
                type="range"
                min={8}
                max={120}
                value={fontSize}
                onChange={(e) =>
                  onChange?.({
                    fontSize: clamp(Number(e.target.value), 8, 120),
                  })
                }
                disabled={disabled}
              />
              <input
                className="tp-number"
                type="number"
                min={8}
                max={120}
                value={fontSize}
                onChange={(e) =>
                  onChange?.({
                    fontSize: clamp(Number(e.target.value || 26), 8, 120),
                  })
                }
                disabled={disabled}
              />
            </div>
          </div>

          {/* Căn lề */}
          <div className="tp-field">
            <div className="tp-label">Căn lề</div>
            <div className="tp-seg">
              <button
                type="button"
                className={`tp-segBtn ${align === "left" ? "is-active" : ""}`}
                onClick={() => onChange?.({ align: "left" })}
                disabled={disabled}
                title="Căn trái">
                <FiAlignLeft />
              </button>
              <button
                type="button"
                className={`tp-segBtn ${align === "center" ? "is-active" : ""}`}
                onClick={() => onChange?.({ align: "center" })}
                disabled={disabled}
                title="Căn giữa">
                <FiAlignCenter />
              </button>
              <button
                type="button"
                className={`tp-segBtn ${align === "right" ? "is-active" : ""}`}
                onClick={() => onChange?.({ align: "right" })}
                disabled={disabled}
                title="Căn phải">
                <FiAlignRight />
              </button>
            </div>
          </div>

          {/* Danger */}
          <div className="tp-danger">
            <button
              type="button"
              className="tp-btn tp-btn--danger"
              onClick={onDelete}
              disabled={disabled}
              title="Xoá chữ">
              <FiTrash2 /> Xoá chữ
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .tp-card {
          background: #fff;
          border: 1px solid #eef2f7;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 10px 28px rgba(16, 24, 40, 0.06);
          display: grid;
          gap: 6px;
        }

        .tp-step {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
        }

        .tp-step__title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 900;
          color: #0f172a;
          font-size: 13px;
        }

        .tp-step__actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tp-btn {
          border: 1px solid transparent;
          border-radius: 10px;
          padding: 7px 10px;
          font-weight: 800;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition:
            transform 0.05s ease,
            box-shadow 0.15s ease,
            opacity 0.15s ease,
            background 0.15s ease,
            border-color 0.15s ease;
          user-select: none;
          white-space: nowrap;
        }
        .tp-btn:active {
          transform: scale(0.98);
        }
        .tp-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .tp-btn--primary {
          background: #22c55e;
          color: #fff;
          box-shadow: 0 10px 18px rgba(34, 197, 94, 0.22);
        }

        .tp-btn--soft {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #0f172a;
        }

        .tp-btn--danger {
          background: #fff;
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.25);
        }

        .tp-body {
          display: grid;
          gap: 6px;
        }

        .tp-field {
          display: grid;
          gap: 4px;
        }

        .tp-label {
          font-size: 11px;
          font-weight: 900;
          color: #64748b;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .tp-textarea {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 8px 10px;
          font-size: 12px;
          outline: none;
          transition:
            box-shadow 0.15s ease,
            border-color 0.15s ease;
          resize: vertical;
          min-height: 60px;
        }
        .tp-textarea:focus {
          border-color: rgba(59, 130, 246, 0.55);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.16);
        }

        .tp-hint {
          font-size: 11px;
          color: #94a3b8;
        }

        .tp-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        @media (max-width: 520px) {
          .tp-grid2 {
            grid-template-columns: 1fr;
          }
        }

        .tp-colorRow {
          display: grid;
          grid-template-columns: 38px 1fr;
          gap: 8px;
          align-items: center;
        }

        .tp-color {
          width: 38px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 0;
          background: #fff;
          cursor: pointer;
        }

        .tp-hex {
          height: 34px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 0 10px;
          outline: none;
          transition:
            box-shadow 0.15s ease,
            border-color 0.15s ease;
          font-weight: 800;
          color: #0f172a;
          font-size: 12px;
        }
        .tp-hex:focus {
          border-color: rgba(59, 130, 246, 0.55);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.16);
        }

        .tp-selectWrap {
          position: relative;
        }

        .tp-select {
          width: 100%;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 0 36px 0 10px;
          font-size: 12px;
          outline: none;
          transition:
            box-shadow 0.15s ease,
            border-color 0.15s ease;
          background: #fff;
          appearance: none;
          font-weight: 700;
          color: #0f172a;
        }
        .tp-select:focus {
          border-color: rgba(59, 130, 246, 0.55);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.16);
        }

        .tp-selectIcon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #64748b;
          font-size: 14px;
        }

        .tp-preview {
          font-size: 11px;
          color: #475569;
          padding: 6px 8px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px dashed #e2e8f0;
        }

        .tp-rowBetween {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .tp-badge {
          font-size: 11px;
          font-weight: 900;
          color: #0f172a;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 3px 8px;
          border-radius: 999px;
        }

        .tp-sizeRow {
          display: grid;
          grid-template-columns: 1fr 70px;
          gap: 8px;
          align-items: center;
        }

        .tp-range {
          width: 100%;
          height: 34px;
        }

        .tp-number {
          width: 100%;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 0 10px;
          outline: none;
          font-weight: 800;
          color: #0f172a;
          font-size: 12px;
          transition:
            box-shadow 0.15s ease,
            border-color 0.15s ease;
        }
        .tp-number:focus {
          border-color: rgba(59, 130, 246, 0.55);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.16);
        }

        .tp-seg {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 4px;
          border-radius: 10px;
          gap: 4px;
        }

        .tp-segBtn {
          height: 34px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            background 0.15s ease,
            box-shadow 0.15s ease,
            color 0.15s ease;
          font-size: 12px;
        }

        .tp-segBtn.is-active {
          background: #fff;
          box-shadow: 0 10px 18px rgba(2, 6, 23, 0.08);
          color: #0f172a;
        }

        .tp-danger {
          padding-top: 6px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .tp-empty {
          padding: 4px 0 2px;
        }
        .tp-empty__box {
          background: #f8fafc;
          border: 1px dashed #e2e8f0;
          border-radius: 10px;
          padding: 10px;
        }
        .tp-empty__headline {
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 4px;
          font-size: 12px;
        }
        .tp-empty__desc {
          font-size: 11px;
          color: #64748b;
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
}

function clamp(n, min, max) {
  const x = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, x));
}
