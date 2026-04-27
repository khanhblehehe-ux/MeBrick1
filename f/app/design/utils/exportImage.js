import html2canvas from "html2canvas";

/**
 * Export design as PNG.
 * Strategy:
 *  1. Draw background directly (avoids html2canvas CORS issues with background-image)
 *  2. Draw slot images directly at full quality
 *  3. Draw all image stickers + lego parts directly at full quality (avoids html2canvas downscale)
 *  4. Hide drawn elements in DOM
 *  5. Use html2canvas to capture text layers only with transparent bg
 *  6. Composite text on top
 */
/**
 * Draw one image layer directly onto ctx.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} src
 * @param {number} x  - logical x
 * @param {number} y  - logical y
 * @param {number} w  - logical width
 * @param {number} h  - logical height
 * @param {number} rotation - degrees
 * @param {string} fit  - "cover" | "contain"
 * @param {boolean} isCircle
 * @param {number} scale - SCALE factor
 */
async function drawImageLayer(ctx, src, x, y, w, h, rotation, fit = "cover", isCircle = false, scale = 2) {
  await new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.save();
      const cx = (x + w / 2) * scale;
      const cy = (y + h / 2) * scale;
      const dw = w * scale;
      const dh = h * scale;
      ctx.translate(cx, cy);
      if (rotation) ctx.rotate((rotation * Math.PI) / 180);
      ctx.beginPath();
      if (isCircle) {
        ctx.arc(0, 0, Math.min(dw, dh) / 2, 0, Math.PI * 2);
      } else {
        ctx.rect(-dw / 2, -dh / 2, dw, dh);
      }
      ctx.clip();
      if (fit === "contain") {
        const s = Math.min(dw / img.width, dh / img.height);
        const sw = img.width * s;
        const sh = img.height * s;
        ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
      } else {
        const s = Math.max(dw / img.width, dh / img.height);
        const sw = img.width * s;
        const sh = img.height * s;
        ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
      }
      ctx.restore();
      resolve();
    };
    img.onerror = resolve;
    img.src = src;
  });
}

export async function exportImage(designAreaEl, selectedBackground, slotImages, stickers = [], bgTextValues = {}) {
  if (!designAreaEl) return null;

  const legoCanvas = designAreaEl.querySelector(".lego-canvas") || designAreaEl;

  const logicalWidth = parseInt(legoCanvas.style.width) || legoCanvas.offsetWidth;
  const logicalHeight = parseInt(legoCanvas.style.height) || legoCanvas.offsetHeight;

  const SCALE = 2; // 2x → 1100×1100px

  // === Step 1: Create output canvas ===
  const output = document.createElement("canvas");
  output.width = logicalWidth * SCALE;
  output.height = logicalHeight * SCALE;
  const ctx = output.getContext("2d");

  // === Step 2: Draw background directly onto canvas ===
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, output.width, output.height);

  if (selectedBackground) {
    const { type, value, backgroundSize = "cover" } = selectedBackground;

    if (type === "color") {
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, output.width, output.height);

    } else if (type === "gradient") {
      const tmp = document.createElement("div");
      tmp.style.cssText = `position:fixed;left:-9999px;top:0;width:${logicalWidth}px;height:${logicalHeight}px;background:${value};`;
      document.body.appendChild(tmp);
      try {
        const gradCanvas = await html2canvas(tmp, {
          backgroundColor: null, scale: SCALE, logging: false,
          width: logicalWidth, height: logicalHeight,
        });
        ctx.drawImage(gradCanvas, 0, 0);
      } catch { /* fallback: white */ }
      document.body.removeChild(tmp);

    } else {
      // pattern or custom: draw image directly
      const bgUrl = (value || "").replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
      if (bgUrl) {
        await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            if (backgroundSize === "cover") {
              const scale = Math.max(output.width / img.width, output.height / img.height);
              const w = img.width * scale;
              const h = img.height * scale;
              const x = (output.width - w) / 2;
              const y = (output.height - h) / 2;
              ctx.drawImage(img, x, y, w, h);
            } else {
              ctx.drawImage(img, 0, 0, output.width, output.height);
            }
            resolve();
          };
          img.onerror = resolve;
          img.src = bgUrl;
        });
      }
    }

    // === Step 3: Draw slot images directly at full quality ===
    if (slotImages && selectedBackground.slots?.length) {
      for (const slot of selectedBackground.slots) {
        const key = `${selectedBackground.id}_${slot.id}`;
        const src = slotImages[key];
        if (!src) continue;

        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.save();
            // Translate to slot center, rotate, draw
            const cx = (slot.x + slot.w / 2) * SCALE;
            const cy = (slot.y + slot.h / 2) * SCALE;
            const dw = slot.w * SCALE;
            const dh = slot.h * SCALE;
            ctx.translate(cx, cy);
            ctx.rotate(((slot.rotate || 0) * Math.PI) / 180);
            // cover fit
            const scale = Math.max(dw / img.width, dh / img.height);
            const sw = img.width * scale;
            const sh = img.height * scale;
            ctx.rect(-dw / 2, -dh / 2, dw, dh);
            ctx.clip();
            ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
            ctx.restore();
            resolve();
          };
          img.onerror = resolve;
          img.src = src;
        });
      }
    }
    // === Step 3b: Draw background text field values ===
    if (bgTextValues && selectedBackground?.textFields?.length) {
      for (const tf of selectedBackground.textFields) {
        const key = `${selectedBackground.id}_${tf.id}`;
        const text = bgTextValues[key];
        if (!text) continue;
        ctx.save();
        ctx.font = `500 ${13 * SCALE}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = "#111111";
        ctx.textBaseline = "middle";
        const textX = tf.x * SCALE + 4 * SCALE;
        const textY = (tf.y + tf.h / 2) * SCALE;
        ctx.fillText(text, textX, textY, (tf.w - 8) * SCALE);
        ctx.restore();
      }
    }
  }
  // Sort by zIndex so layering is correct
  const imageLayers = stickers
    .filter((s) => s.src && s.type !== "text")
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const s of imageLayers) {
    const x = Number(s.x) || 0;
    const y = Number(s.y) || 0;
    const w = Number(s.width) || 120;
    const h = Number(s.height) || 60;
    const rotation = Number(s.rotation || s.rotate || 0);
    const fit = s.characterId ? "contain" : (s.isCircle ? "cover" : "cover");
    await drawImageLayer(ctx, s.src, x, y, w, h, rotation, fit, !!s.isCircle, SCALE);
  }

  // === Step 5: Hide image layers + slot-zone imgs so html2canvas doesn't double-draw them ===
  const slotZoneImgs = legoCanvas.querySelectorAll(".slot-zone img");
  slotZoneImgs.forEach((el) => (el.style.visibility = "hidden"));

  // Hide all image-type free-layers and lego parts (keep text layers visible for html2canvas)
  const imageLayerDivs = legoCanvas.querySelectorAll(".lego-wrapper, .lego-part, .free-layer:not(.text-layer)");
  imageLayerDivs.forEach((el) => (el.style.visibility = "hidden"));

  // Hide bg-text-fields (already drawn directly on canvas)
  const bgTextInputs = legoCanvas.querySelectorAll(".bg-text-field");
  bgTextInputs.forEach((el) => (el.style.visibility = "hidden"));

  const saved = {
    backgroundImage: legoCanvas.style.backgroundImage,
    backgroundColor: legoCanvas.style.backgroundColor,
    backgroundSize: legoCanvas.style.backgroundSize,
    backgroundPosition: legoCanvas.style.backgroundPosition,
    backgroundRepeat: legoCanvas.style.backgroundRepeat,
    transform: legoCanvas.style.transform,
    transformOrigin: legoCanvas.style.transformOrigin,
  };

  legoCanvas.style.backgroundImage = "none";
  legoCanvas.style.backgroundColor = "transparent";
  legoCanvas.style.transform = "scale(1)";
  legoCanvas.style.transformOrigin = "top left";

  const domCanvas = await html2canvas(legoCanvas, {
    backgroundColor: null,
    scale: SCALE,
    useCORS: true,
    allowTaint: false,
    logging: false,
    width: logicalWidth,
    height: logicalHeight,
  });

  // Restore
  Object.assign(legoCanvas.style, saved);
  slotZoneImgs.forEach((el) => (el.style.visibility = ""));
  imageLayerDivs.forEach((el) => (el.style.visibility = ""));
  bgTextInputs.forEach((el) => (el.style.visibility = ""));

  // === Step 6: Composite text/DOM layers on top ===
  ctx.drawImage(domCanvas, 0, 0);

  return output.toDataURL("image/png");
}
