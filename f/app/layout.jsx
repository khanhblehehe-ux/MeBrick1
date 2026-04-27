import "./global.css";
import {
  Be_Vietnam_Pro,
  Inter,
  Poppins,
  Open_Sans,
  Montserrat,
  Playfair_Display,
  Antonio,
  Cinzel,
} from "next/font/google";

const beVN = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-main",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const antonio = Antonio({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-antonio",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata = {
  title: "Mê Bricks - Bộ sưu tập",
  description: "Bộ sưu tập LEGO độc đáo từ Mê Bricks",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body
        className={`${beVN.variable} ${inter.variable} ${poppins.variable} ${openSans.variable} ${montserrat.variable} ${playfair.variable} ${antonio.variable} ${cinzel.variable}`}>
        {children}
      </body>
    </html>
  );
}


