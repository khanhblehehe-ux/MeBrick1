// Canvas size configuration - Separated for Desktop and Mobile
export const CANVAS_SIZE_CONFIG = {
  // Desktop (≥1024px)
  desktop: {
    width: 700,
    height: 700,
    breakpoint: 1024,
  },
  
  // Mobile (<1024px)
  mobile: {
    width: 360,
    height: 360,
    breakpoint: 1023,
  },
};

// Fixed frame size: 23x23cm
export const SIZE_OPTIONS = [
  {
    id: "23x23",
    name: "Khung 23x23cm",
    dimensions: "23x23cm",
    price: "0",
    basePrice: 0,
    canvasWidth: 550,
    canvasHeight: 550,
  },
];

// Frame types with different prices
export const FRAME_TYPES = [
  {
    id: "frame-1",
    name: "Khung 1",
    description: "Khung ảnh 1 LEGO + Thiệp chúc mừng + Hộp quà",
    price: 230000,
    basePrice: 230000,
    features: ["🎨 Khung ảnh LEGO", "💝 Thiệp chúc mừng", "📦 Hộp quà"],
    icon: "🖼️",
  },
  {
    id: "frame-2",
    name: "Khung 2",
    description: "Khung ảnh 2 LEGO + Thiệp chúc mừng + Hộp quà",
    price: 250000,
    basePrice: 250000,
    features: ["🎨 Khung ảnh LEGO", "💝 Thiệp chúc mừng", "📦 Hộp quà"],
    icon: "🖼️",
  },
  {
    id: "frame-led",
    name: "Khung LED",
    description: "Khung 2 LEGO có đèn LED + Thiệp chúc mừng + Hộp quà",
    price: 320000,
    basePrice: 320000,
    features: [
      "💡 Đèn LED",
      "🎨 Khung ảnh LEGO",
      "💝 Thiệp chúc mừng",
      "📦 Hộp quà",
    ],
    icon: "💡",
  },
];
