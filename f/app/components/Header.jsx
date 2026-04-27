"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { FiShoppingCart, FiFacebook } from "react-icons/fi";
import { SiTiktok } from "react-icons/si";
import { PiMusicNoteFill, PiSpeakerSlashFill } from "react-icons/pi";
import { getCart, cartTotalQty } from "../../lib/cart";
import { SOCIAL_LINKS } from "../../lib/social-links";
import styles from "./header.module.css";

export default function Header({ overlay = false }) {
  const [cartCount, setCartCount] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [designHref, setDesignHref] = useState("/collections");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);
  const audioRef = useRef(null);

  // Lấy sản phẩm đầu tiên từ API để tạo link thiết kế đúng
  useEffect(() => {
    fetch(`/api/products?limit=1`)
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

  const isTransparent = overlay && !scrolled;

  return (
    <header
      style={{
        backgroundColor: isTransparent ? "transparent" : "#fff",
        borderBottom: isTransparent ? "none" : "1px solid #f0f0f0",
        padding: "10px 0",
        position: overlay ? "fixed" : "sticky",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 100,
        boxShadow: isTransparent ? "none" : "0 2px 6px rgba(0,0,0,0.04)",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
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
                color: isTransparent ? "#fff" : "#333",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 0",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = isTransparent ? "#f0c060" : "#0B2D72")}
              onMouseLeave={(e) => (e.target.style.color = isTransparent ? "#fff" : "#333")}>
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
            style={{ color: isTransparent ? "#fff" : "#1877f2", display: "flex", alignItems: "center" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            <FiFacebook style={{ fontSize: "18px" }} />
          </a>

          {/* TikTok */}
          <a
            href={SOCIAL_LINKS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLinks}
            style={{ color: isTransparent ? "#fff" : "#000", display: "flex", alignItems: "center" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            <SiTiktok style={{ fontSize: "16px" }} />
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
              color: isTransparent ? "#fff" : (musicOn ? "#0B2D72" : "#aaa"),
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
          <Link href="/cart" style={{ position: "relative", display: "flex", alignItems: "center", color: isTransparent ? "#fff" : "inherit" }}>
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

          {/* Thiết kế ngay button – overlay mode only */}
          {overlay && (
            <Link
              href="/collections"
              className={styles.desktopNav}
              style={{
                border: "1px solid #fff",
                color: "#fff",
                padding: "7px 16px",
                borderRadius: "2px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.2s, color 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#333"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}>
              Thiết kế ngay
            </Link>
          )}

          {/* Hamburger – mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            style={{ filter: isTransparent ? "invert(1)" : "none" }}>
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

