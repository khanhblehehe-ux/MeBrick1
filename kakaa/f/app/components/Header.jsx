"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { FiShoppingCart, FiFacebook } from "react-icons/fi";
import { PiMusicNoteFill, PiSpeakerSlashFill } from "react-icons/pi";
import { getCart, cartTotalQty } from "../../lib/cart";
import { SOCIAL_LINKS } from "../../lib/social-links";
import styles from "./header.module.css";

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [designHref, setDesignHref] = useState("/collections");
  const audioRef = useRef(null);

  // Lấy sản phẩm đầu tiên từ API để tạo link thiết kế đúng
  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${BASE_URL}/api/products?limit=1`)
      .then((r) => r.json())
      .then((data) => {
        const first = Array.isArray(data) ? data[0] : data?.data?.[0];
        if (first?.id) {
          const name = encodeURIComponent(first.name || "");
          const img = encodeURIComponent(first.image_url || first.image || "");
          setDesignHref(`/design?product=${first.id}&name=${name}&image=${img}`);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Thiết kế", href: designHref },
    { name: "Bộ sưu tập", href: "/collections" },
    { name: "Doanh nghiệp", href: "#" },
    { name: "Tra cứu", href: "/tra-cuu" },
  ];

  useEffect(() => {
    const sync = () => setCartCount(cartTotalQty(getCart()));
    sync();
    window.addEventListener("mebrick_cart_updated", sync);
    return () => window.removeEventListener("mebrick_cart_updated", sync);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [musicOn]);

  return (
    <header
      style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #f0f0f0",
        padding: "10px 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      }}>
      {/* Background music */}
      <audio ref={audioRef} src="/music/background.mp3" loop preload="none" />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
        }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/images/logo1.png"
            alt="BRICKS MÊ"
            width={80}
            height={50}
            priority
            style={{ display: "block" }}
          />
        </Link>

        {/* Navigation – desktop only */}
        <nav className={styles.desktopNav} style={{ display: "flex", gap: "24px" }}>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              style={{
                color: "#333",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 0",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#0B2D72")}
              onMouseLeave={(e) => (e.target.style.color = "#333")}>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* Facebook */}
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLinks}
            style={{ color: "#1877f2", display: "flex", alignItems: "center" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            <FiFacebook style={{ fontSize: "18px" }} />
          </a>

          {/* Music toggle */}
          <button
            onClick={() => setMusicOn((prev) => !prev)}
            title={musicOn ? "Tắt nhạc" : "Bật nhạc"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: musicOn ? "#0B2D72" : "#aaa",
              fontSize: "18px",
              padding: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            {musicOn
              ? <PiMusicNoteFill style={{ fontSize: "18px" }} />
              : <PiSpeakerSlashFill style={{ fontSize: "18px" }} />}
          </button>

          {/* Cart */}
          <Link href="/cart" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <FiShoppingCart style={{ fontSize: "18px", cursor: "pointer" }} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  backgroundColor: "#ff4757",
                  color: "#fff",
                  fontSize: "11px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger – mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      <nav className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={styles.mobileNavLink}
            onClick={() => setMenuOpen(false)}>
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}

