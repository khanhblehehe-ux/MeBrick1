import html2canvas from "html2canvas";

export async function exportImage(designAreaEl) {
  if (!designAreaEl) return null;

  // Lấy canvas thật bên trong (lego-canvas) để tránh bị ảnh hưởng bởi scale transform
  const legoCanvas = designAreaEl.querySelector(".lego-canvas") || designAreaEl;

  // Lưu lại style cũ
  const oldTransform = legoCanvas.style.transform;
  const oldPosition = legoCanvas.style.position;
  const oldLeft = legoCanvas.style.left;
  const oldTop = legoCanvas.style.top;

  // Kích thước logic gốc (không bị scale)
  const logicalWidth = parseInt(legoCanvas.style.width) || legoCanvas.offsetWidth;
  const logicalHeight = parseInt(legoCanvas.style.height) || legoCanvas.offsetHeight;

  // Tắt transform để html2canvas render đúng kích thước logic
  legoCanvas.style.transform = "scale(1)";
  legoCanvas.style.transformOrigin = "top left";

  const canvas = await html2canvas(legoCanvas, {
    backgroundColor: "#ffffff",
    scale: 6,
    useCORS: true,
    allowTaint: false,
    logging: false,
    width: logicalWidth,
    height: logicalHeight,
  });

  // Trả lại trạng thái ban đầu
  legoCanvas.style.transform = oldTransform;
  legoCanvas.style.position = oldPosition;
  legoCanvas.style.left = oldLeft;
  legoCanvas.style.top = oldTop;

  return canvas.toDataURL("image/png");
}