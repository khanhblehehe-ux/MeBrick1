"use client";

import { useState } from "react";
import Link from "next/link";
import { FiStar } from "react-icons/fi";

export default function ProductCardCollection({ product }) {
  const getProductImage = (imageIndex) => {
    const imageNumber = (imageIndex % 8) + 1;
    return `/images/hero/products/product${imageNumber}.jpg`;
  };

  const getFallbackImage = (index) => {
    const fallbackImages = [
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1587654780298-8c6d6b2c8b2a?w=400&h=300&fit=crop",
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={getProductImage(product.imageIndex)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = getFallbackImage(product.imageIndex);
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.badges.map((badge, badgeIndex) => (
            <span
              key={badgeIndex}
              className={`px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full ${
                badge === "Premium"
                  ? "text-blue-800"
                  : badge === "Mới"
                    ? "text-green-600"
                    : badge === "Bán chạy"
                      ? "text-orange-600"
                      : "text-gray-800"
              }`}>
              {badge}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <FiStar className="text-yellow-400 fill-current" />
          <span className="text-xs font-semibold">{product.rating}</span>
          <span className="text-xs text-gray-500 ml-1">
            ({product.reviewCount})
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
          {product.name}
        </h3>

        {/* Designer */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">TL</span>
          </div>
          <span className="text-sm text-gray-600">{product.designer}</span>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={`/design?product=${product.id}`}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
            Thiết kế ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
