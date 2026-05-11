export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  // Force desktop-like viewport size on Vercel
  deviceScaleFactor: 1,
};

export default function DesignLayout({ children }) {
  return children;
}
