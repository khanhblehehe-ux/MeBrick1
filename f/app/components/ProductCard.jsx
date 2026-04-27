// components/ProductCard.jsx - PHIÊN BẢN CAO CẤP
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiStar, FiShoppingCart } from "react-icons/fi";

import { addToCart } from "../../lib/cart";

export default function ProductCard({ product, showAdminControls = false }) {
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product.oldPrice || product.oldPrice <= product.price) return 0;
    return Math.round(
      ((product.oldPrice - product.price) / product.oldPrice) * 100,
    );
  };

  // ✅ NEW: add to cart handler
  const handleAddCart = () => {
    addToCart({
      product_id: product.id,
      quantity: quantity || 1,
      design_data: null,
    });
  };

  // ✅ NEW: buy now handler
  const handleBuyNow = () => {
    handleAddCart();
    router.push("/checkout");
  };

  const styles = {
    card: {
      backgroundColor: "white",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    cardHovered: {
      transform: "translateY(-8px)",
      boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      backgroundColor: "#f9f9f9",
    },
    image: {
      width: "100%",
      height: "auto",
      display: "block",
      objectFit: "contain",
      transition: "transform 0.3s ease",
    },
    imageHovered: {
      transform: "scale(1.05)",
    },
    badges: {
      position: "absolute",
      top: "12px",
      left: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      zIndex: 2,
    },
    badge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "white",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    discountBadge: {
      backgroundColor: "#EF4444",
    },
    featuredBadge: {
      backgroundColor: "#8B5CF6",
    },
    content: {
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },
    name: {
      fontSize: "1.1rem",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "0.5rem",
      lineHeight: "1.4",
    },
    description: {
      fontSize: "0.9rem",
      color: "#6B7280",
      marginBottom: "1rem",
      lineHeight: "1.5",
      flex: 1,
    },
    priceContainer: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "1rem",
    },
    price: {
      fontSize: "1.25rem",
      fontWeight: "800",
      color: "#3B82F6",
    },
    oldPrice: {
      fontSize: "1rem",
      color: "#9CA3AF",
      textDecoration: "line-through",
    },
    rating: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      marginBottom: "1rem",
    },
    star: {
      color: "#F59E0B",
      fontSize: "0.9rem",
    },
    ratingText: {
      fontSize: "0.85rem",
      color: "#6B7280",
      marginLeft: "0.5rem",
    },
    actionButtons: {
      display: "flex",
      gap: "0.75rem",
      marginTop: "auto",
    },
    addToCartButton: {
      flex: 1,
      padding: "0.75rem",
      backgroundColor: "#3B82F6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.95rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      transition: "background-color 0.2s",
    },
    buyNowButton: {
      flex: 1,
      padding: "0.75rem",
      backgroundColor: "#10B981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.95rem",
      transition: "background-color 0.2s",
    },
  };

  const discount = calculateDiscount();

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHovered : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Image Container */}
      <div style={styles.imageContainer}>
        <img
          src={product.image}
          alt={product.name}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            ...styles.image,
            ...(isHovered ? styles.imageHovered : {}),
          }}
        />

        {/* Badges */}
        <div style={styles.badges}>
          {discount > 0 && (
            <span style={{ ...styles.badge, ...styles.discountBadge }}>
              -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span style={{ ...styles.badge, ...styles.featuredBadge }}>
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h3 style={styles.name}>{product.name}</h3>
        {product.description ? (
          <p style={styles.description}>{product.description}</p>
        ) : null}

        {/* Rating */}
        <div style={styles.rating}>
          <FiStar style={styles.star} />
          <FiStar style={styles.star} />
          <FiStar style={styles.star} />
          <FiStar style={styles.star} />
          <FiStar style={styles.star} />
          <span style={styles.ratingText}>(5.0)</span>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button
            style={styles.addToCartButton}
            onClick={(e) => {
              e.stopPropagation();
              handleAddCart();
            }}>
            <FiShoppingCart />
            Thêm giỏ
          </button>

          <button
            style={styles.buyNowButton}
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow();
            }}>
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}
