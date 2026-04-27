import html2canvas from "html2canvas";

/**
 * Export design theo kích thước in chuẩn 300 DPI
 * @param {HTMLElement} designAreaEl
 * @param {Object} options
 * @param {number} options.printWidthCm  - chiều rộng in (cm)
 * @param {number} options.printHeightCm - chiều cao in (cm)
 * @param {number} options.dpi - mặc định 300
 */
export async function exportPrintImage(
  designAreaEl,
  { printWidthCm, printHeightCm, dpi = 300 }
) {
  if (!designAreaEl) return null;

  // === TÍNH KÍCH THƯỚC PIXEL THEO 300 DPI ===
  const inchWidth = printWidthCm / 2.54;
  const inchHeight = printHeightCm / 2.54;

  const targetPixelWidth = Math.round(inchWidth * dpi);
  const targetPixelHeight = Math.round(inchHeight * dpi);

  const currentWidth = designAreaEl.offsetWidth;
  const currentHeight = designAreaEl.offsetHeight;

  // Scale chính xác để đạt pixel in thật
  const scaleX = targetPixelWidth / currentWidth;
  const scaleY = targetPixelHeight / currentHeight;

  const scale = Math.max(scaleX, scaleY);

  const oldTransform = designAreaEl.style.transform;

  designAreaEl.style.transform = "scale(1)";

  const canvas = await html2canvas(designAreaEl, {
    backgroundColor: "#ffffff",
    scale: scale,
    useCORS: true,
    allowTaint: false,
  });

  designAreaEl.style.transform = oldTransform;

  return canvas.toDataURL("image/png");
}