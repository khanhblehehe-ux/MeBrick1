"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import DesignArea from "../DesignArea";
import ImageTransformLayer from "../ImageTransformLayer";
export default function Stage({
  designAreaRef,
  canvasSize,
  selectedSize,
  selectedBackground,

  stickers, // gồm: free stickers + lego parts có characterId
  legoCharacters,
  LEGO_CONFIG,

  selectedCharacterId,
  setSelectedCharacterId,

  selectedId, // selected layer id (free sticker/text/image)
  setSelectedId,

  setStickers,
  moveLegoCharacter,

  handleDesignAreaClick, // clear selection
  // ✅ STEP PROPS
  Stepper,
  step,
  goStep,
  canGoBg,
  canGoLego,
  canGoCheckout,
  calculateTotal,
  onReset,
  // ✅ OUTFIT SELECTOR
  updateCharacterOutfit,
  showOutfitSelector,
  setShowOutfitSelector,
  outfitSelectorCharId,
  setOutfitSelectorCharId,
  // ✅ PANTS SELECTOR
  updateCharacterPants,
  showPantsSelector,
  setShowPantsSelector,
  pantsSelectorCharId,
  setPantsSelectorCharId,
  // ✅ SLOT IMAGES
  slotImages,
  onSetSlotImage,
  onClearSlotImage,
  bgTextValues,
  onSetBgTextValue,
}) {
  // Auto show outfit selector khi user thêm nhân vật — đã chuyển sang hook
  const prevLegoCountRef = useRef(null);

  // ====== Drag engine (ONE) ======
  const draggingRef = useRef(null); // { kind: "char"|"sticker", id, startX, startY }
  const pointerDownRef = useRef(false); // chống click trống khi vừa drag xong

  // ====== Layout Edit Mode (URL param ?layoutEdit=1) ======
  const [layoutEditMode] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("layoutEdit") === "1"
  );
  const [tfPositions, setTfPositions] = useState({}); // { "bgId_tfId": {x,y,w,h} }
  const [draggingTf, setDraggingTf] = useState(null); // { key, startX, startY, origX, origY }
  const [showCopied, setShowCopied] = useState(false);

  const getEffectiveTf = useCallback((bgId, tf) => {
    const key = `${bgId}_${tf.id}`;
    return tfPositions[key] ? { ...tf, ...tfPositions[key] } : tf;
  }, [tfPositions]);

  const handleTfPointerDown = useCallback((e, bgId, tf) => {
    if (!layoutEditMode) return;
    e.stopPropagation();
    e.preventDefault();
    const key = `${bgId}_${tf.id}`;
    const cur = tfPositions[key] ?? { x: tf.x, y: tf.y };
    setDraggingTf({ key, startX: e.clientX, startY: e.clientY, origX: cur.x, origY: cur.y });
  }, [layoutEditMode, tfPositions]);

  useEffect(() => {
    if (!draggingTf) return;
    const onMove = (e) => {
      const dx = e.clientX - draggingTf.startX;
      const dy = e.clientY - draggingTf.startY;
      setTfPositions((prev) => ({
        ...prev,
        [draggingTf.key]: {
          ...(prev[draggingTf.key] ?? {}),
          x: Math.round(draggingTf.origX + dx),
          y: Math.round(draggingTf.origY + dy),
        },
      }));
    };
    const onUp = () => setDraggingTf(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [draggingTf]);

  const handleCopyConfig = useCallback(() => {
    if (!selectedBackground) return;
    const fields = (selectedBackground.textFields ?? []).map((tf) => {
      const key = `${selectedBackground.id}_${tf.id}`;
      const pos = tfPositions[key];
      const merged = pos ? { ...tf, ...pos } : tf;
      return `  { id: "${merged.id}", x: ${merged.x}, y: ${merged.y}, w: ${merged.w}, h: ${merged.h}, placeholder: "${merged.placeholder}"${merged.multiline ? ", multiline: true" : ""} }`;
    });
    const text = `${selectedBackground.id}: [\n${fields.join(",\n")},\n]`;
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  }, [selectedBackground, tfPositions]);

  // ====== Slot image handling ======
  const slotFileInputRef = useRef(null);
  const pendingSlotRef = useRef(null); // { slotId } khi đang chờ user chọn file
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [inlineEditingTextId, setInlineEditingTextId] = useState(null);
  const [canvasAnimKey, setCanvasAnimKey] = useState(0);
  useEffect(() => {
    if (selectedSize) setCanvasAnimKey((k) => k + 1);
  }, [selectedSize]);

  const openSlotFilePicker = (slotId) => {
    pendingSlotRef.current = { slotId };
    slotFileInputRef.current?.click();
  };

  const handleSlotFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingSlotRef.current || !selectedBackground) return;
    const slotId = pendingSlotRef.current.slotId;
    const bgId = selectedBackground.id;
    pendingSlotRef.current = null;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSetSlotImage?.(bgId, slotId, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSlotDrop = (e, slotId) => {
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith("image/") || !selectedBackground) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSetSlotImage?.(selectedBackground.id, slotId, ev.target.result);
    };
    reader.readAsDataURL(file);
  };
  useEffect(() => {
    if (!inlineEditingTextId) return;
    const current = (stickers || []).find((s) => s.id === inlineEditingTextId);
    if (!current || current.type !== "text" || selectedId !== inlineEditingTextId) {
      setInlineEditingTextId(null);
    }
  }, [inlineEditingTextId, selectedId, stickers]);
  const PAD = 1;
  const getCanvasPoint = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    // Chia cho canvasScale vì canvas được scale bằng transform
    return { x: (e.clientX - rect.left) / canvasScale, y: (e.clientY - rect.top) / canvasScale };
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // ====== Helpers: dimensions ======
  const charW = LEGO_CONFIG?.partConfig?.totalWidth || 200;
  const charH = LEGO_CONFIG?.partConfig?.totalHeight || 260;

  const getStickerRect = (s) => {
    const w = Number(s.width) || 120;
    const h = Number(s.height) || 60;
    const x = Number(s.x) || 0;
    const y = Number(s.y) || 0;
    return { x, y, w, h };
  };

  // ====== Build "free layers" ======
  // free layers: sticker/text/image => s.characterId is falsy
  const freeLayers = (stickers || []).filter((s) => !s.characterId);
  const selectedImage =
    selectedId &&
    stickers.find((s) => s.id === selectedId && s.type === "image");

  // ====== Selected sticker (text hoặc image) ======
  const selectedSticker =
    selectedId &&
    stickers.find(
      (s) =>
        s.id === selectedId &&
        !s.characterId &&
        (s.type === "text" || s.type === "image"),
    );

  // ====== Hit test ALL layers (character + free layers) ======
  const hitTestAll = (pt) => {
    const hits = [];

    // 1) free layers
    freeLayers.forEach((s, idx) => {
      const { x, y, w, h } = getStickerRect(s);
      const z = Number(s.zIndex ?? 0);
      if (pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h) {
        hits.push({
          kind: "sticker",
          id: s.id,
          z: z,
          order: 1000 + idx, // fallback
        });
      }
    });

    // 2) characters
    legoCharacters.forEach((c, idx) => {
      const x = Number(c.x) || 0;
      const y = Number(c.y) || 0;
      // z: theo thứ tự render, nhân vật sau nằm "trên"
      const z = 100000 + idx;
      if (pt.x >= x && pt.x <= x + charW && pt.y >= y && pt.y <= y + charH) {
        hits.push({
          kind: "char",
          id: c.id,
          z,
          order: 2000 + idx,
        });
      }
    });

    // sort để “trên cùng” nằm cuối
    hits.sort((a, b) => a.z - b.z || a.order - b.order);
    return hits;
  };

  // ====== Cycle pick when overlap ======
  const getCurrentSelectedKey = () => {
    if (selectedCharacterId) return `char:${selectedCharacterId}`;
    if (selectedId) return `sticker:${selectedId}`;
    return null;
  };

  const pickFromHits = (hits) => {
    if (!hits.length) return null;
    if (hits.length === 1) return hits[0];

    const curKey = getCurrentSelectedKey();
    const keys = hits.map((h) => `${h.kind}:${h.id}`);
    const curIndex = curKey ? keys.indexOf(curKey) : -1;

    if (curIndex >= 0) {
      return hits[(curIndex + 1) % hits.length];
    }
    // default: chọn top-most (cuối danh sách)
    return hits[hits.length - 1];
  };

  // ====== Selection ======
  const selectHit = (hit) => {
    if (!hit) return;

    if (hit.kind === "char") {
      setSelectedCharacterId(hit.id);
      setSelectedId(null);
      setInlineEditingTextId(null);
      // clear sticker selected state
      setStickers((prev) => prev.map((s) => ({ ...s, isSelected: false })));
      return;
    }

    if (hit.kind === "sticker") {
      const hitSticker = (stickers || []).find((s) => s.id === hit.id);
      setSelectedCharacterId(null);
      setSelectedId(hit.id);
      setInlineEditingTextId(hitSticker?.type === "text" ? hit.id : null);
      setStickers((prev) =>
        prev.map((s) => ({ ...s, isSelected: s.id === hit.id })),
      );
      return;
    }
  };

  // ====== Drag start/move/end ======
  const startDrag = (e, hit) => {
    pointerDownRef.current = true;

    draggingRef.current = {
      kind: hit.kind,
      id: hit.id,
      startX: e.clientX,
      startY: e.clientY,
    };

    // select first
    selectHit(hit);

    // capture pointer
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const moveDrag = (e) => {
    const drag = draggingRef.current;
    if (!drag) return;

    const dx = (e.clientX - drag.startX) / canvasScale;
    const dy = (e.clientY - drag.startY) / canvasScale;

    if (drag.kind === "char") {
      moveLegoCharacter(drag.id, dx, dy);
    } else {
      setStickers((prev) =>
        prev.map((s) => {
          if (s.id !== drag.id) return s;

          const { x, y, w, h } = getStickerRect(s);
          const nx = clamp(x + dx, 0, canvasSize.width - w);
          const ny = clamp(y + dy, 0, canvasSize.height - h);

          return { ...s, x: nx, y: ny };
        }),
      );
    }

    drag.startX = e.clientX;
    drag.startY = e.clientY;
  };

  const endDrag = () => {
    draggingRef.current = null;
    setTimeout(() => {
      pointerDownRef.current = false;
    }, 0);
  };

  // ====== Canvas pointerdown ======
  const handleCanvasPointerDown = (e) => {
    if (!selectedSize) return;

    const pt = getCanvasPoint(e);
    const hits = hitTestAll(pt);
    const picked = pickFromHits(hits);

    if (!picked) {
      pointerDownRef.current = false;
      handleDesignAreaClick?.(); // clear
      setInlineEditingTextId(null);

      // Kiểm tra click có trúng slot-zone không (sticker đã được ưu tiên trước)
      if (selectedBackground) {
        const slots = selectedBackground.slots || [];
        const hitSlot = slots.find((slot) => {
          // Slot không rotate → check thẳng; nếu có rotate bỏ qua (xấp xỉ)
          return (
            pt.x >= slot.x && pt.x <= slot.x + slot.w &&
            pt.y >= slot.y && pt.y <= slot.y + slot.h
          );
        });
        if (hitSlot) {
          const key = `${selectedBackground.id}_${hitSlot.id}`;
          const imgSrc = slotImages?.[key];
          e.preventDefault();
          if (!imgSrc) openSlotFilePicker(hitSlot.id);
          else setSelectedSlotId(selectedSlotId === hitSlot.id ? null : hitSlot.id);
          return;
        }
      }

      setSelectedSlotId(null);
      return;
    }

    if (picked.kind === "sticker") {
      const pickedSticker = (stickers || []).find((s) => s.id === picked.id);
      if (pickedSticker?.type === "text") {
        e.preventDefault();
        e.stopPropagation();
        selectHit(picked);
        return;
      }
    }

    e.preventDefault();
    e.stopPropagation();
    startDrag(e, picked);
  };

  // ====== Render free layer (sticker/text/image) ======
  const renderFreeLayer = (s, idx) => {
    const { x, y, w, h } = getStickerRect(s);
    const lines = Array.isArray(s.lines) ? s.lines : null;

    const isSel = !!selectedId && s.id === selectedId;
    const isInlineEditingText = s.type === "text" && inlineEditingTextId === s.id;

    // zIndex: selected nổi lên
    const z = isSel ? 99999 : Number(s.zIndex ?? 100 + idx);

    // text fields
    const content = s.content ?? s.text ?? "";
    const color = s.color ?? "#111";
    const fontFamily = s.fontFamily ?? "Inter";

    const fontSize = Number(s.fontSize ?? 22);
    const align = s.align ?? "center";

    // image fields
    const src = s.src;

    return (
      <div
        key={s.id}
        className={`free-layer ${s.type === "text" ? "text-layer" : "image-layer"} ${isSel ? "is-selected" : ""}`}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          zIndex: z,
          pointerEvents: isInlineEditingText ? "auto" : "none",
          borderRadius: s.type === "image" ? 0 : 12,
          overflow: s.type === "image" ? "visible" : "hidden",
          border: isInlineEditingText ? "1.5px dashed rgba(15,23,42,0.45)" : "none",
        }}>
        {/* Selection outline - REMOVED */}

        {s.type === "text" ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent:
                align === "left"
                  ? "flex-start"
                  : align === "right"
                    ? "flex-end"
                    : "center",
              textAlign: align,
              fontFamily,
              fontSize,
              fontWeight: Number(s.fontWeight ?? 800),
              lineHeight: Number(s.lineHeight ?? 1.1),
              padding: 2,
              userSelect: isInlineEditingText ? "text" : "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
            {isInlineEditingText ? (
              <textarea
                autoFocus
                value={content}
                onChange={(e) => {
                  const nextContent = e.target.value;
                  setStickers((prev) =>
                    prev.map((item) =>
                      item.id === s.id
                        ? { ...item, content: nextContent, lines: undefined }
                        : item,
                    ),
                  );
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  color,
                  fontFamily,
                  fontSize,
                  fontWeight: Number(s.fontWeight ?? 800),
                  lineHeight: Number(s.lineHeight ?? 1.1),
                  textAlign: align,
                  padding: 2,
                }}
              />
            ) : Array.isArray(s.lines) && s.lines.length > 0 ? (
              <div>
                {s.lines.map((l, i) => (
                  <div key={i} style={{ color: l.color ?? color }}>
                    {l.text}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color }}>{content || "Nhập chữ..."}</div>
            )}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: src ? `url(${src})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",

              borderRadius: s.isCircle ? "50%" : 12,
              overflow: "hidden",
              userSelect: "none",

              // ✅ QUAN TRỌNG NHẤT
              transform: `rotate(${s.rotation || 0}deg)`,
              transformOrigin: "center center",
            }}
          />
        )}
      </div>
    );
  };

  // ====== Responsive canvas scale ======
  const stageWrapRef = useRef(null);
  const stageWorkspaceRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const mobileCanvasScaleRef = useRef(null);

  useEffect(() => {
    if (!canvasSize?.width) return;
    mobileCanvasScaleRef.current = null;
    const compute = () => {
      const isMobileViewport = window.innerWidth < 1024;
      if (isMobileViewport && mobileCanvasScaleRef.current !== null) {
        setCanvasScale(mobileCanvasScaleRef.current);
        return;
      }

      const workspaceRect = stageWorkspaceRef.current?.getBoundingClientRect();
      const containerW = workspaceRect?.width ?? window.innerWidth;
      const containerH = workspaceRect?.height ?? window.innerHeight;
      const availableW = Math.max(0, containerW - 48);
      const availableH = Math.max(0, containerH - 48);
      const widthScale = availableW > 0 ? availableW / canvasSize.width : 1;
      const heightScale = availableH > 0 ? availableH / canvasSize.height : 1;
      const nextScale = Math.min(1, widthScale, heightScale);

      if (isMobileViewport && mobileCanvasScaleRef.current === null) {
        mobileCanvasScaleRef.current = nextScale;
      }

      setCanvasScale(nextScale);
    };
    const raf = requestAnimationFrame(compute);
    window.addEventListener("resize", compute);
    const ro = stageWorkspaceRef.current ? new ResizeObserver(compute) : null;
    if (ro && stageWorkspaceRef.current) ro.observe(stageWorkspaceRef.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", compute);
      ro?.disconnect();
    };
  }, [canvasSize?.width, canvasSize?.height]);

  return (
    <div className="stage-wrap" ref={stageWrapRef}>
      <div className="stage-card">
        {/* Header */}
        <div className="stage-head">
          <div className="stage-head__left">
            <div className="stage-steps">
              <Stepper
                step={step}
                goStep={goStep}
                canGoFrame={true}
                canGoBg={canGoBg}
                canGoLego={canGoLego}
                canGoCheckout={canGoCheckout}
                calculateTotal={calculateTotal}
                selectedSize={selectedSize}
                onReset={onReset}
              />
            </div>
          </div>
        </div>

        {/* Workspace */}
<div className="stage-workspace" ref={stageWorkspaceRef}>
  {!selectedSize ? (
    <div className="stage-empty flex items-center justify-center text-center h-full">
      <div>
        <h3 className="text-lg font-semibold">Chưa chọn khung</h3>
        <p>
          Vui lòng chọn kích thước khung từ bảng bên phải để bắt đầu thiết kế
        </p>
      </div>
    </div>
  ) : (
            // ✅ GIỮ NGUYÊN ref của bạn, chỉ thêm wrapper khung UI
            <div
              key={canvasAnimKey}
              className="photo-frame-studio mb-panel__body--animated"
              ref={designAreaRef}
              style={{ position: "relative" }}>
              <DesignArea
                id="design-area"
                onClick={undefined}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                canvasSize={canvasSize}
                canvasScale={canvasScale}
                selectedBackground={selectedBackground}>
                {/* Character highlight border - REMOVED */}

                {legoCharacters.map((char, idx) => (
                  <div
                    key={char.id}
                    className="lego-wrapper"
                    style={{
                      left: char.x,
                      top: char.y,
                      width: charW,
                      height: charH,
                      position: "absolute",
                      zIndex:
                        100000 +
                        idx +
                        (char.id === selectedCharacterId ? 2 : 0),
                      pointerEvents: "none",
                    }}>
                    {(stickers || [])
                      .filter((s) => s.characterId === char.id)
                      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                      .map((part) => {
                        const isOutfit =
                          part.part === "torso" && part.isBasePart;
                        return (
                          <div
                            key={part.id}
                            className="lego-part"
                            onClick={
                              isOutfit
                                ? (e) => {
                                    e.stopPropagation();
                                    setOutfitSelectorCharId(char.id);
                                    setShowOutfitSelector(true);
                                  }
                                : undefined
                            }
                            style={{
                              left: (part.x || 0) - (char.x || 0),
                              top: (part.y || 0) - (char.y || 0),
                              width: part.width,
                              height: part.height,
                              backgroundImage: part.src
                                ? `url(${part.src})`
                                : "none",
                              backgroundSize: "contain",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                              position: "absolute",
                              zIndex: Number(part.zIndex ?? 0),
                              pointerEvents: isOutfit ? "auto" : "none",
                              cursor: isOutfit ? "pointer" : "default",
                            }}
                          />
                        );
                      })}
                  </div>
                ))}

                {/* Slot zones - ô ảnh trong background mẫu, ẩn trên mobile */}
                {selectedBackground && step > 1 && (selectedBackground.slots || []).map((slot) => {
                  const key = `${selectedBackground.id}_${slot.id}`;
                  const imgSrc = slotImages?.[key];
                  return (
                    <div
                      key={slot.id}
                      className="slot-zone"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSlotDrop(e, slot.id);
                      }}
                      style={{
                        position: "absolute",
                        left: slot.x,
                        top: slot.y,
                        width: slot.w,
                        height: slot.h,
                        zIndex: 50,
                        overflow: "hidden",
                        borderRadius: 4,
                        cursor: imgSrc ? "default" : "pointer",
                        border: imgSrc ? "none" : "2px dashed rgba(255,255,255,0.85)",
                        background: imgSrc ? "transparent" : "rgba(0,0,0,0.22)",
                        transform: `rotate(${slot.rotate || 0}deg)`,
                        transformOrigin: "center center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none", // sticker luôn ưu tiên, click xử lý qua handleCanvasPointerDown
                      }}>
                      {imgSrc ? (
                        <>
                          <img
                            src={imgSrc}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            draggable={false}
                          />
                          {selectedSlotId === slot.id && (
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearSlotImage?.(selectedBackground.id, slot.id);
                              setSelectedSlotId(null);
                            }}
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: "rgba(0,0,0,0.55)",
                              border: "none",
                              color: "#fff",
                              fontSize: 9,
                              lineHeight: "14px",
                              textAlign: "center",
                              cursor: "pointer",
                              padding: 0,
                              pointerEvents: "auto",
                            }}>
                            ×
                          </button>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: 24, color: "rgba(255,255,255,0.9)", pointerEvents: "none", fontWeight: "bold", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>+</span>
                      )}
                    </div>
                  );
                })}

                {/* Free layers: sticker/text/image */}
                {freeLayers.map(renderFreeLayer)}

                {/* Background text fields */}
                {selectedBackground?.textFields?.length > 0 && step > 1 &&
                  selectedBackground.textFields.map((tfRaw) => {
                    const tf = getEffectiveTf(selectedBackground.id, tfRaw);
                    const key = `${selectedBackground.id}_${tfRaw.id}`;
                    const val = bgTextValues?.[key] ?? "";
                    const isEditMode = layoutEditMode;
                    const commonStyle = {
                      position: "absolute",
                      left: tf.x,
                      top: tf.y,
                      width: tf.w,
                      height: tf.h,
                      zIndex: 200,
                      background: isEditMode ? "rgba(59,130,246,0.08)" : "transparent",
                      border: isEditMode ? "1.5px dashed #3B82F6" : "none",
                      borderBottom: !isEditMode && !tf.multiline ? "1.5px solid rgba(0,0,0,0.25)" : (!isEditMode ? "none" : undefined),
                      fontSize: tf.fontSize ?? 13,
                      fontFamily: "inherit",
                      fontWeight: 500,
                      color: "#111",
                      outline: "none",
                      padding: tf.multiline ? "4px" : "0 4px",
                      boxSizing: "border-box",
                      pointerEvents: "auto",
                      resize: "none",
                      overflowY: tf.multiline ? "auto" : "hidden",
                      lineHeight: "1.4",
                      cursor: isEditMode ? "move" : "text",
                    };
                    const editLabel = isEditMode ? (
                      <div key={`label-${tfRaw.id}`} style={{
                        position: "absolute", left: tf.x, top: tf.y - 14,
                        zIndex: 201, fontSize: 9, color: "#3B82F6", background: "rgba(255,255,255,0.85)",
                        padding: "1px 3px", borderRadius: 2, pointerEvents: "none", whiteSpace: "nowrap",
                      }}>
                        {tfRaw.id} ({tf.x},{tf.y})
                      </div>
                    ) : null;
                    const dragProps = isEditMode ? {
                      onPointerDown: (e) => handleTfPointerDown(e, selectedBackground.id, tf),
                    } : {
                      onPointerDown: (e) => e.stopPropagation(),
                      onClick: (e) => e.stopPropagation(),
                    };
                    const inputEl = tf.multiline
                      ? <textarea key={tfRaw.id} className="bg-text-field" value={val} placeholder={tf.placeholder}
                          onChange={(e) => !isEditMode && onSetBgTextValue?.(selectedBackground.id, tfRaw.id, e.target.value)}
                          readOnly={isEditMode} style={commonStyle} {...dragProps} />
                      : <input key={tfRaw.id} type="text" className="bg-text-field" value={val} placeholder={tf.placeholder}
                          onChange={(e) => !isEditMode && onSetBgTextValue?.(selectedBackground.id, tfRaw.id, e.target.value)}
                          readOnly={isEditMode} style={commonStyle} {...dragProps} />;
                    return isEditMode ? [editLabel, inputEl] : inputEl;
                  })
                }

                {/* Layout Edit Mode — Copy Config button */}
                {layoutEditMode && selectedBackground && step > 1 && (
                  <div style={{
                    position: "absolute", bottom: 4, right: 4, zIndex: 300,
                    display: "flex", gap: 6, alignItems: "center",
                  }}>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={handleCopyConfig}
                      style={{
                        background: showCopied ? "#16a34a" : "#3B82F6", color: "#fff",
                        border: "none", borderRadius: 6, padding: "4px 10px",
                        fontSize: 11, cursor: "pointer", fontWeight: 600,
                      }}>
                      {showCopied ? "✓ Đã copy!" : "📋 Copy Config"}
                    </button>
                  </div>
                )}

                {step !== 4 && selectedSticker && (
                  <ImageTransformLayer
                    selectedImage={selectedSticker}
                    setStickers={setStickers}
                    setSelectedId={setSelectedId}
                  />
                )}
              </DesignArea>
            </div>
          )}

          {/* Hidden file input for slot image selection */}
          <input
            ref={slotFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleSlotFileChange}
          />

          {/* Outfit Selector Modal */}
          {showOutfitSelector && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 999999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setShowOutfitSelector(false)}>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  maxWidth: "500px",
                  width: "90%",
                  maxHeight: "80vh",
                  overflow: "auto",
                }}
                onClick={(e) => e.stopPropagation()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
                    Chọn màu áo
                  </h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        // Random outfit
                        const outfits = LEGO_CONFIG.legoColors || [];
                        if (outfits.length > 0) {
                          const randomOutfit =
                            outfits[Math.floor(Math.random() * outfits.length)];
                          updateCharacterOutfit(
                            randomOutfit.src,
                            outfitSelectorCharId,
                            randomOutfit.price,
                          );
                        }
                        // Random pants
                        const pantsList = LEGO_CONFIG.legoPantsColors || [];
                        if (pantsList.length > 0) {
                          const randomPants =
                            pantsList[
                              Math.floor(Math.random() * pantsList.length)
                            ];
                          updateCharacterPants(
                            randomPants.src,
                            outfitSelectorCharId,
                            randomPants.price,
                          );
                        }
                        setShowOutfitSelector(false);
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#10B981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#059669";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#10B981";
                      }}>
                      🎲 Ngẫu nhiên
                    </button>
                    <button
                      onClick={() => setShowOutfitSelector(false)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "24px",
                        cursor: "pointer",
                        padding: "0",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      ×
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: "12px",
                  }}>
                  {(LEGO_CONFIG.legoColors || []).map((outfit) => (
                    <button
                      key={outfit.id}
                      onClick={() => {
                        updateCharacterOutfit(
                          outfit.src,
                          outfitSelectorCharId,
                          outfit.price,
                        );
                        setShowOutfitSelector(false);
                        // Chuyển sang chọn quần
                        setPantsSelectorCharId(outfitSelectorCharId);
                        setShowPantsSelector(true);
                      }}
                      style={{
                        border: "2px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "8px",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.transform = "scale(1)";
                      }}>
                      <img
                        src={outfit.thumbnail}
                        alt={outfit.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "contain",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          textAlign: "center",
                          color: "#374151",
                        }}>
                        {outfit.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pants Selector Modal */}
          {showPantsSelector && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 999999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setShowPantsSelector(false)}>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  maxWidth: "500px",
                  width: "90%",
                  maxHeight: "80vh",
                  overflow: "auto",
                }}
                onClick={(e) => e.stopPropagation()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
                    Chọn màu quần
                  </h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        // Random pants only
                        const pantsList = LEGO_CONFIG.legoPantsColors || [];
                        if (pantsList.length > 0) {
                          const randomPants =
                            pantsList[
                              Math.floor(Math.random() * pantsList.length)
                            ];
                          updateCharacterPants(
                            randomPants.src,
                            pantsSelectorCharId,
                            randomPants.price,
                          );
                        }
                        setShowPantsSelector(false);
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#10B981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#059669";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#10B981";
                      }}>
                      🎲 Ngẫu nhiên
                    </button>
                    <button
                      onClick={() => setShowPantsSelector(false)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "24px",
                        cursor: "pointer",
                        padding: "0",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      ×
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: "12px",
                  }}>
                  {(LEGO_CONFIG.legoPantsColors || []).map((pants) => (
                    <button
                      key={pants.id}
                      onClick={() => {
                        updateCharacterPants(
                          pants.src,
                          pantsSelectorCharId,
                          pants.price,
                        );
                        setShowPantsSelector(false);
                      }}
                      style={{
                        border: "2px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "8px",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.transform = "scale(1)";
                      }}>
                      <img
                        src={pants.thumbnail}
                        alt={pants.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "contain",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          textAlign: "center",
                          color: "#374151",
                        }}>
                        {pants.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
