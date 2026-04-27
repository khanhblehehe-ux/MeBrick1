// Canvas size configuration - Responsive based on screen width
export const CANVAS_SIZE_CONFIG = {
  // Small desktop / Laptop 15" (1024px - 1365px)
  desktop_small: {
    width: 700,
    height: 700,
    breakpoint: 1024,
    maxWidth: 1440,
  },
  
  // Medium desktop / 17-19" (1366px - 1679px)
  desktop_medium: {
    width: 900,
    height: 900,
    breakpoint: 1441,
    maxWidth: 1679,
  },
  
  // Large desktop / 24" (1680px+)
  desktop_large: {
    width: 1200,
    height: 1200,
    breakpoint: 1680,
  },
  
  // Tablet (768px - 1023px)
  tablet: {
    width: 600,
    height: 600,
    breakpoint: 768,
    maxWidth: 1023,
  },
  
  // Mobile (<768px)
  mobile: {
    width: 360,
    height: 360,
    breakpoint: 0,
    maxWidth: 767,
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
    name: "Khung 1 lego + thiệp viết tay + box quà",
    description: "",
    price: 230000,
    basePrice: 230000,
    features: ["Khung 1 lego", "Thiệp viết tay", "Box quà"],
    icon: "🖼️",
  },
  {
    id: "frame-2",
    name: "Khung 2 lego + thiệp viết tay + box quà",
    description: "",
    price: 250000,
    basePrice: 250000,
    features: ["Khung 2 lego", "Thiệp viết tay", "Box quà"],
    icon: "🖼️",
  },
  {
    id: "frame-led",
    name: "Khung lego có đèn led + thiệp viết tay + box quà",
    description: "",
    price: 320000,
    basePrice: 320000,
    features: ["Đèn LED", "Khung 2 lego", "Thiệp viết tay", "Box quà"],
    icon: "💡",
  },
];
