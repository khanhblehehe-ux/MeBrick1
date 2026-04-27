/**
 * Layout Configuration
 * Centralized configuration for responsive design breakpoints and dimensions
 * Used across design page CSS and JavaScript for consistent sizing
 */

// ===== BREAKPOINTS =====
export const BREAKPOINTS = {
  extraSmall: 360,   // Extra small phones
  small: 480,        // Small phones
  mobile: 768,       // Tablets (small)
  tablet: 1024,      // Tablets (large)
  desktop: 1024,     // Desktop
  largeDesktop: 1440, // Large desktop
};

// ===== CANVAS SIZE =====
export const CANVAS_CONFIG = {
  // Desktop (≥1024px)
  desktop: {
    width: 600,
    height: 600,
    breakpoint: BREAKPOINTS.desktop,
  },
  
  // Mobile (<1024px)
  mobile: {
    width: 300,
    height: 300,
    breakpoint: BREAKPOINTS.mobile,
  },
};

// ===== SPACING (padding, margins, gaps) =====
export const SPACING = {
  // Extra small phones (360px - 480px)
  extraSmall: {
    headerPadding: "8px 12px",
    layoutPadding: "0 10px",
    containerGap: "8px",
    cardPadding: "8px",
    sampleGalleryHeight: "100px",
    stageWorkspacePadding: "6px 4px",
    stageCardPadding: "8px",
    panelMaxHeight: "35vh",
  },

  // Small phones (481px - 768px)
  small: {
    headerPadding: "10px 16px",
    layoutPadding: "0 12px",
    containerGap: "12px",
    cardPadding: "12px",
    sampleGalleryHeight: "140px",
    stageWorkspacePadding: "8px",
    stageCardPadding: "12px",
    panelMaxHeight: "45vh",
  },

  // Tablet (769px - 1023px)
  tablet: {
    headerPadding: "10px 16px",
    layoutPadding: "0 16px",
    containerGap: "12px",
    cardPadding: "12px",
    sampleGalleryHeight: "160px",
    stageWorkspacePadding: "8px",
    stageCardPadding: "16px",
    panelMaxHeight: "45vh",
  },

  // Desktop (1024px+)
  desktop: {
    headerPadding: "12px 24px",
    layoutPadding: "0 15px",
    containerGap: "16px",
    cardPadding: "40px",
    sampleGalleryMaxHeight: "none",
    stageWorkspaceHeight: "100%",
    panelHeight: "100%",
  },

  // Large desktop (1440px+)
  largeDesktop: {
    headerPadding: "12px 24px",
    layoutPadding: "0 15px",
    containerGap: "16px",
    cardPadding: "40px",
    headerMaxWidth: "1700px",
    layoutMaxWidth: "1700px",
  },
};

// ===== TYPOGRAPHY SIZING =====
export const TYPOGRAPHY = {
  // Fluid typography for mobile-first
  mobile: {
    headerFontSize: "clamp(1rem, 3vw, 1.125rem)",
    titleFontSize: "clamp(1.125rem, 3.5vw, 1.375rem)",
    baseFontSize: "clamp(1rem, 3vw, 1.125rem)",
    smallFontSize: "clamp(0.875rem, 2.5vw, 1rem)",
    xsFontSize: "clamp(0.75rem, 2vw, 0.875rem)",
  },

  // Desktop - hardcoded sizes
  desktop: {
    headerFontSize: "12px",
    stepFontSize: "12px",
    titleFontSize: "20px",
    baseFontSize: "14px",
    smallFontSize: "13px",
    xsFontSize: "12px",
  },
};

// ===== LAYOUT GRID CONFIGURATION =====
export const LAYOUT_GRID = {
  // Mobile: 1 column (stack vertically)
  mobile: {
    display: "flex",
    flexDirection: "column",
    gridTemplateColumns: "none",
  },

  // Tablet: 2 columns with custom ratio
  tablet: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: "1rem",
  },

  // Desktop: 2 columns with fixed sidebar
  desktop: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 360px)",
    gap: "16px",
    height: "calc(100vh - 120px)",
  },
};

// ===== PANEL DIMENSIONS =====
export const PANEL_CONFIG = {
  // Mobile stacking order
  mobileOrder: {
    gallery: 1,
    stage: 2,
    controls: 3,
  },

  // Desktop layout
  desktop: {
    galleryFlex: 1,
    stageFlex: 5,
    controlsFlex: 3,
  },

  // Background image sizing
  backgroundSize: {
    mobile: "80%",
    desktop: "80%",
  },
};

// ===== ANIMATION & TRANSITION =====
export const ANIMATIONS = {
  duration: {
    fast: "0.12s",
    medium: "0.2s",
    slow: "0.25s",
  },
  easing: {
    default: "ease",
    easeInOut: "ease-in-out",
  },
};

// ===== Z-INDEX LAYERS =====
export const Z_INDEX = {
  base: 1,
  sticky: 10,
  dropdown: 20,
  modal: 30,
  tooltip: 40,
  canvas: 50,
  dragOverlay: 60,
};
