"use client";

import { useState, useEffect } from "react";
import ProductCardCollection from "./ProductCardCollection";

// Mock data - sẽ thay bằng API call thực tế
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Happy Birthday 1",
    category: "birthday",
    price: "1,200,000",
    imageIndex: 0,
    badges: ["TIN DỤNG", "Đăng hot"],
    rating: 4.8,
    reviewCount: 45
  },
  {
    id: 2,
    name: "Merry Christmas",
    category: "christmas",
    price: "1,500,000",
    imageIndex: 1,
    badges: ["TIN DỤNG", "Đăng hot"],
    rating: 4.5,
    reviewCount: 32
  },
  {
    id: 3,
    name: "Merry Christmas 2",
    category: "christmas",
    price: "1,800,000",
    imageIndex: 2,
    badges: ["TIN DỤNG", "Đăng hot"],
    rating: 4.7,
    reviewCount: 28
  },
  {
    id: 4,
    name: "Ronaldo",
    category: "sport",
    price: "2,000,000",
    imageIndex: 3,
    badges: ["TIN DỤNG", "Đăng hot"],
    rating: 4.9,
    reviewCount: 51
  },
  {
    id: 5,
    name: "With you are protection, I'll keep taking and never give up",
    category: "graduation",
    price: "1,600,000",
    imageIndex: 4,
    badges: ["TIN DỤNG", "Đăng hot"],
    rating: 4.6,
    reviewCount: 18
  },
  {
    id: 6,
    name: "My world doesn't stop in this starting",
    category: "farewell",
    price: "1,400,000",
    imageIndex: 5,
    badges: ["TIN DỤNG", "Đăng hot"],
    rating: 4.4,
    reviewCount: 22
  },
  {
    id: 7,
    name: "Anniversary Love",
    category: "anniversary",
    price: "1,900,000",
    imageIndex: 6,
    badges: ["TIN DỤNG", "Đăng hot"],
    rating: 4.8,
    reviewCount: 37
  },
  {
    id: 8,
    name: "Wedding Bliss",
    category: "wedding",
    price: "2,500,000",
    imageIndex: 7,
    badges: ["TIN DỤNG", "Đăng hot"],
    rating: 4.9,
    reviewCount: 29
  }
];

export default function ProductsGrid({ activeCategory, searchQuery, sortBy }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let filteredProducts = MOCK_PRODUCTS;
      
      // Filter by category
      if (activeCategory !== "all") {
        filteredProducts = filteredProducts.filter(
          product => product.category === activeCategory
        );
      }
      
      // Filter by search query
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(
          product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.designer.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Sort products
      switch(sortBy) {
        case "newest":
          filteredProducts.sort((a, b) => b.id - a.id);
          break;
        case "price-low":
          filteredProducts.sort((a, b) => 
            parseInt(a.price.replace(/,/g, '')) - parseInt(b.price.replace(/,/g, ''))
          );
          break;
        case "price-high":
          filteredProducts.sort((a, b) => 
            parseInt(b.price.replace(/,/g, '')) - parseInt(a.price.replace(/,/g, ''))
          );
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        default: // popular
          filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
      }
      
      setProducts(filteredProducts);
      setLoading(false);
    }, 500);
  }, [activeCategory, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Không tìm thấy sản phẩm
        </h3>
        <p className="text-gray-500">
          Hãy thử tìm kiếm với từ khóa khác hoặc danh mục khác
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-sm text-gray-600">
        Hiển thị <span className="font-semibold">{products.length}</span> sản phẩm
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCardCollection
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* Pagination (optional) */}
      {products.length >= 8 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Trước
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
            <span className="px-2">...</span>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">10</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      )}
    </>
  );
}