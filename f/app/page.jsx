"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";

import Header from "./components/Header";
import Footer from "./components/Footer";
import FeedbackSection from "./components/FeedbackSection";
import BubbleButton from "./components/BubbleButton";
import { getProducts } from "../lib/api/products";
import styles from "./page.module.css";

export default function MeBrickPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [heroReady, setHeroReady] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // ====== SCROLL ANIMATION ======
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  // ====== DATA FROM BE ======
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // ====================
  // DỮ LIỆU ẢNH
  // ====================
  const heroImages = [
    "/images/hero/hero1.jpg",
    "/images/hero/hero2.png",
    "/images/hero/hero3.jpg",
    "/images/hero/hero4.png",
    "/images/hero/hero5.jpg",
  ];

  const possibleProductImages = [
    "/images/hero/products/product1.png",
    "/images/hero/products/product2.png",
    "/images/hero/products/product3.png",
    "/images/hero/products/product4.png",
    "/images/hero/products/product5.png",
    "/images/hero/products/product6.png",
    "/images/hero/products/product7.png",
    "/images/hero/products/product8.png",
  ];

  const features = [
    {
      icon: "🧩",
      title: "Concept theo câu chuyện",
      description: "Một món decor nhỏ để giữ lại những khoảnh khắc đáng nhớ",
      image: "/images/hero/concept-story.png",
    },
    {
      icon: "🎨",
      title: "Thiết kế riêng",
      description: "Biến ý tưởng và kỷ niệm thành một món quà thật riêng",
      image: "/images/hero/hero2.png",
    },
    {
      icon: "🎁",
      title: "Quà tặng ý nghĩa",
      description: "Đóng gói sang trọng, phù hợp làm quà tặng",
      image: "/images/hero/gift-feature.jpg",
    },
    {
      icon: "🚚",
      title: "Giao hàng toàn quốc",
      description: "Miễn phí vận chuyển cho đơn từ 1 triệu",
      image: "/images/hero/hero4.png",
    },
  ];

  // Ảnh fallback khi không tìm thấy
  const getFallbackImage = () => possibleProductImages[0];

  // Hàm lấy ảnh sản phẩm với fallback (ảnh local)
  const getProductImage = (imageIndex) => {
    const imageUrl = possibleProductImages[imageIndex];
    if (imageErrors[imageUrl]) return getFallbackImage();
    return imageUrl;
  };

  // Hàm xử lý lỗi ảnh
  const handleImageError = (imageUrl) => {
    setImageErrors((prev) => ({
      ...prev,
      [imageUrl]: true,
    }));
  };

  // ====== LOAD PRODUCTS FROM API ======
  useEffect(() => {
    (async () => {
      try {
        setProductsLoading(true);

        const data = await getProducts("home");
        const list = Array.isArray(data) ? data : data?.products || [];

        // Lấy 8 sp đầu tiên (tuỳ bạn)
        const top = list.slice(0, 8).map((p, idx) => ({
          id: p.id,
          name: p.name,
          description: p.description || "Thiết kế độc bản theo ý bạn",
          image: p.image || null, // nếu DB có URL ảnh
          imageIndex: idx % possibleProductImages.length, // fallback nếu chưa có image URL
          orders: p.orders || Math.floor(Math.random() * 50) + 10, // tạm nếu DB chưa có
          badge: "✨ Thiết kế",
          price: p.price || 0,
        }));

        setFeaturedProducts(top);
      } catch (e) {
        console.error("❌ Load products failed:", e);
        setFeaturedProducts([]);
      } finally {
        setProductsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== HERO ANIMATION ON EVERY MOUNT ======
  useEffect(() => {
    setHeroReady(false);
    const t = setTimeout(() => setHeroReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ✅ lấy product đầu tiên để HERO bấm "Bắt đầu thiết kế"
  const firstProductId = featuredProducts?.[0]?.id;

  // Tự động chuyển ảnh hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Kiểm tra ảnh khi component mount
  useEffect(() => {
    heroImages.forEach((img, index) => {
      const image = new window.Image();
      image.src = img;
      image.onload = () => console.log(`✅ Ảnh ${index + 1} loaded: ${img}`);
      image.onerror = () =>
        console.error(`❌ Lỗi tải ảnh ${index + 1}: ${img}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== SCROLL ANIMATION OBSERVER ======
  useEffect(() => {
    const createObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => ({
                ...prev,
                [entry.target.dataset.section]: true,
              }));
            } else {
              setVisibleSections((prev) => ({
                ...prev,
                [entry.target.dataset.section]: false,
              }));
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px",
        },
      );

      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref);
      });

      return observer;
    };

    let observer = createObserver();

    // Fix bfcache: khi trình duyệt restore trang từ back/forward cache,
    // useEffect không chạy lại nên observer bị mất → reconnect tại đây
    const handlePageShow = (e) => {
      if (e.persisted) {
        observer.disconnect();
        observer = createObserver();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      observer.disconnect();
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
      }}>
      {/* HEADER */}
      <Header overlay />

      {/* HERO SECTION */}
      <section
        style={{
          position: "relative",
          height: "100svh",
          minHeight: "100svh",
          backgroundColor: "#8893fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 20px",
          overflow: "hidden",
        }}>
        {/* Background Images */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundColor: "#0a1628",
              opacity: index === currentImage ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))}

        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "800px",
            color: "#fff",
          }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              marginBottom: "20px",
              lineHeight: "1.1",
              fontFamily: "'Antonio', sans-serif",
              textTransform: "uppercase",
              textShadow: "4px 6px 12px rgba(0,0,0,0.25)",
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(28px)",
              transition: "opacity 1s ease 0.2s, transform 1s ease 0.2s",
            }}>
            Unique for
            <br />
            <span style={{ color: "#0058ca " }}>
              every moment
            </span>
          </h1>

          <p
            style={{
              fontSize: "18px",
              marginBottom: "30px",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6",
              opacity: heroReady ? 0.9 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(28px)",
              transition: "opacity 1s ease 0.55s, transform 1s ease 0.55s",
            }}>
            Tạo nên món quà độc bản từ những mảnh ghép LEGO. Lưu giữ kỷ niệm
            theo cách riêng của bạn, tinh tế và đầy cảm xúc.
          </p>

          {/* ✅ FIX: không dùng product?.id (không tồn tại). Dùng product đầu tiên. */}
          <div style={{
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 1s ease 0.9s, transform 1s ease 0.9s",
          }}>
          <Link
            href={
              firstProductId
                ? `/design?product=${firstProductId}`
                : "/collections"
            }
            style={{ textDecoration: "none" }}>
            <BubbleButton style={{ padding: "12px 26px", fontSize: "15px", backgroundColor: "#ffffff", color: "#0B2D72" }}>Bắt đầu thiết kế</BubbleButton>
          </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() =>
            setCurrentImage(
              (prev) => (prev - 1 + heroImages.length) % heroImages.length,
            )
          }
          style={{
            position: "absolute",
            left: "30px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "none",
            color: "#fff",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            cursor: "pointer",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
            opacity: 0.8,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.25)";
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.15)";
            e.target.style.opacity = "0.8";
            e.target.style.transform = "translateY(-50%) scale(1)";
          }}>
          <FiChevronLeft size={24} />
        </button>

        <button
          onClick={() =>
            setCurrentImage((prev) => (prev + 1) % heroImages.length)
          }
          style={{
            position: "absolute",
            right: "30px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "none",
            color: "#fff",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            cursor: "pointer",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
            opacity: 0.8,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.25)";
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.15)";
            e.target.style.opacity = "0.8";
            e.target.style.transform = "translateY(-50%) scale(1)";
          }}>
          <FiChevronRight size={24} />
        </button>
      </section>

      {/* PRODUCT VERSIONS SHOWCASE */}
      <section style={{ padding: "80px 20px", background: "#f8f9ff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#0050b8",
                fontFamily: "'Antonio', sans-serif",
                textTransform: "uppercase",
                textShadow: "2px 3px 8px rgba(0,80,184,0.15)",
                marginBottom: "10px",
              }}>
              Mê Bricks có 3 phiên bản
            </h2>
            <p style={{ fontSize: "16px", color: "#555" }}>
              Mỗi phiên bản đều đi kèm thiệp viết tay &amp; box quà xinh xắn
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}>
            {[
              {
                img: "/images/frames/frame1.png",
                price: "230.000đ",
                desc: "Khung 1 lego + thiệp viết tay + box quà",
              },
              {
                img: "/images/frames/frame2.png",
                price: "250.000đ",
                desc: "Khung 2 lego + thiệp viết tay + box quà",
              },
              {
                img: "/images/frames/frame3.png",
                price: "320.000đ",
                desc: "Khung lego có đèn led + thiệp viết tay + box quà",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  boxShadow: "0 4px 24px rgba(0,80,184,0.10)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}>
                <img
                  src={item.img}
                  alt={item.desc}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                  }}
                />
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      color: "#0050b8",
                      fontFamily: "'Antonio', sans-serif",
                      marginBottom: "8px",
                    }}>
                    {item.price}
                  </div>
                  <p style={{ fontSize: "15px", color: "#444", margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section
        ref={(el) => (sectionRefs.current.featured = el)}
        data-section="featured"
        style={{
          padding: "80px 20px",
          opacity: visibleSections.featured ? 1 : 0,
          transform: visibleSections.featured
            ? "translateY(0)"
            : "translateY(50px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: "#0050b8",
                marginBottom: "10px",
                fontFamily: "'Antonio', sans-serif",
                textTransform: "uppercase",
                textShadow: "3px 4px 10px rgba(0,80,184,0.18)",
              }}>
              Bộ sưu tập nổi bật
            </h2>
            <p style={{ fontSize: "16px", color: "#666" }}>
              {productsLoading ? (
                "Đang tải dữ liệu..."
              ) : (
                <>
                  Đã có hơn <strong>153</strong> lượt đặt hàng trên toàn hệ
                  thống
                </>
              )}
            </p>
          </div>

          {productsLoading && (
            <p style={{ textAlign: "center" }}>⏳ Đang tải sản phẩm...</p>
          )}

          <div className={styles.featuredProductsGrid}>
            {featuredProducts.map((product, productIdx) => {
              const productImage = product.image
                ? product.image
                : getProductImage(product.imageIndex);

              return (
                <div
                  key={product.id}
                  data-product-image={encodeURIComponent(productImage)}
                  className={styles.productCard}
                  style={{
                    opacity: visibleSections.featured ? 1 : 0,
                    transform: visibleSections.featured
                      ? "translateY(0)"
                      : "translateY(30px)",
                    transitionDelay: visibleSections.featured
                      ? `${productIdx * 0.15}s`
                      : "0s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow =
                      "0 15px 30px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 5px 15px rgba(0,0,0,0.05)";
                  }}>
                  {/* Product Image */}
                  <div className={styles.productImageWrap}>
                    <img
                      src={productImage}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transition: "transform 0.3s ease",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.target.src = getFallbackImage();
                        handleImageError(
                          possibleProductImages[product.imageIndex],
                        );
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    />

                    {imageErrors[possibleProductImages[product.imageIndex]] && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                          color: "#999",
                        }}>
                        <FiHeart size={48} />
                        <p style={{ marginTop: "10px", fontSize: "14px" }}>
                          Ảnh sản phẩm
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    <div className={styles.productMeta}>
                      <span style={{ fontSize: "14px", color: "#999" }}>
                        {product.orders} đơn
                      </span>
                    </div>

                    <h3 className={styles.productName}>
                      {product.name}
                    </h3>

                    <p className={styles.productDescription}>
                      {product.description}
                    </p>

                    <div className={styles.productFooter} style={{ justifyContent: "center" }}>
                      <BubbleButton
                        style={{ padding: "10px 66px" }}
                        onClick={() => {
                          const defaultBgIds = [
                            "bg-light-gray",   // mẫu 1 → Happy Birthday
                            "bg-sample-5",     // mẫu 2 → Special Day ver 1
                            "bg-sample-7",     // mẫu 3 → Special Day ver 3
                            "bg-sample-17",    // mẫu 4 → Happy Birthday ver 3
                            "bg-sample-7",     // mẫu 5 → Special Day ver 3
                            "bg-sample-10",    // mẫu 6 → Love ver 2
                            "bg-sample-7",     // mẫu 7 → Special Day ver 3
                            "bg-sample-12",    // mẫu 8 → Love ver 4
                          ];
                          const bgParam = defaultBgIds[productIdx] ? `&bg=${defaultBgIds[productIdx]}` : "";
                          window.location.href =
                            `/design?productId=${product.id}` +
                            `&name=${encodeURIComponent(product.name)}` +
                            `&price=${encodeURIComponent(product.price)}` +
                            `&image=${encodeURIComponent(productImage)}` +
                            bgParam;
                        }}>
                        Thiết kế
                      </BubbleButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link href="/collections" style={{ textDecoration: "none" }}>
              <BubbleButton>Xem tất cả sản phẩm</BubbleButton>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        ref={(el) => (sectionRefs.current.features = el)}
        data-section="features"
        style={{
          backgroundColor: "#ffffff",
          overflow: "hidden",
          opacity: visibleSections.features ? 1 : 0,
          transform: visibleSections.features
            ? "translateY(0)"
            : "translateY(50px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}>
        <div>
        <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              textAlign: "center",
              padding: "60px 20px 50px",
              fontFamily: "'Antonio', sans-serif",
              textTransform: "uppercase",
              textShadow: "3px 4px 10px rgba(0,0,0,0.3)",
              color: "#0B2D72",
            }}>
            Vì sao chọn Mê Bricks?
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {features.map((feature, index) => {
              const isTextLeft = index % 2 === 0;
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: isTextLeft ? "row" : "row-reverse",
                    minHeight: "360px",
                    borderBottom: index < features.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                    opacity: visibleSections.features ? 1 : 0,
                    transform: visibleSections.features ? "translateY(0)" : "translateY(30px)",
                    transition: `opacity 1s ease ${index * 0.2}s, transform 1s ease ${index * 0.2}s`,
                  }}>
                  {/* Text side */}
                  <div
                    style={{
                      flex: "0 0 50%",
                      width: "50%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      padding: "50px 60px",
                      backgroundColor: index % 2 === 0 ? "#f8f9ff" : "#ffffff",
                      textAlign: "left",
                      boxSizing: "border-box",
                    }}>
                    <h3 style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#0B2D72",
                      marginBottom: "16px",
                      fontFamily: "'Antonio', sans-serif",
                      textTransform: "uppercase",
                    }}>{feature.title}</h3>
                    <p style={{
                      fontSize: "16px",
                      color: "rgba(11,45,114,0.8)",
                      lineHeight: "1.8",
                      maxWidth: "420px",
                      marginLeft: 0,
                    }}>{feature.description}</p>
                  </div>
                  {/* Image side */}
                  <div
                    style={{
                      flex: "0 0 50%",
                      width: "50%",
                      backgroundImage: `url(${feature.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      minHeight: "360px",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section style={{ padding: "80px 20px", backgroundColor: "#f2f2f2" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "36px",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "48px",
            fontFamily: "'Antonio', sans-serif",
            textTransform: "uppercase",
            color: "#0B2D72",
            textShadow: "3px 4px 10px rgba(0,0,0,0.1)",
          }}>Bộ sưu tập mẫu</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "10px",
            height: "620px",
          }}>
            {[
              { src: "/samples/gallery1.png",       gridRow: "1", gridColumn: "1" },
              { src: "/samples/gallery2.png",       gridRow: "2", gridColumn: "1" },
              { src: "/samples/gallery-center.png", gridRow: "1 / 3", gridColumn: "2" },
              { src: "/samples/gallery3.png",       gridRow: "1", gridColumn: "3" },
              { src: "/samples/gallery4.png",       gridRow: "2", gridColumn: "3" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  gridRow: item.gridRow,
                  gridColumn: item.gridColumn,
                  overflow: "hidden",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.querySelector("img").style.transform = "scale(1.08)"}
                onMouseLeave={e => e.currentTarget.querySelector("img").style.transform = "scale(1)"}
                onClick={() => setLightboxSrc(item.src)}
              >
                <img
                  src={item.src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, cursor: "zoom-out",
          }}
        >
          <img
            src={lightboxSrc}
            alt=""
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "12px", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}

      <div
        ref={(el) => (sectionRefs.current.feedback = el)}
        data-section="feedback"
        style={{
          opacity: visibleSections.feedback ? 1 : 0,
          transform: visibleSections.feedback
            ? "translateY(0)"
            : "translateY(50px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}>
        <FeedbackSection />
      </div>

      {/* CTA SECTION */}
      <section
        ref={(el) => (sectionRefs.current.cta = el)}
        data-section="cta"
        style={{
          padding: "80px 20px",
          backgroundColor: "#0B2D72",
          color: "#0066c5",
          textAlign: "center",
          opacity: visibleSections.cta ? 1 : 0,
          transform: visibleSections.cta ? "translateY(0)" : "translateY(50px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "20px",
              fontFamily: "'Antonio', sans-serif",
              textTransform: "uppercase",
              textShadow: "3px 4px 10px rgba(0,0,0,0.15)",
              color: "#ffffff",
            }}>
            Sẵn sàng tạo nên món quà đặc biệt?
          </h2>

          <p
            style={{
              fontSize: "18px",
              marginBottom: "40px",
              opacity: 0.9,
              lineHeight: "1.6",
              color: "#ffffff",
            }}>
            Chỉ mất 5 phút để thiết kế một khung tranh LEGO độc đáo. Gửi gắm
            thông điệp của bạn ngay hôm nay.
          </p>

          <Link href="/design" style={{ textDecoration: "none" }}>
            <BubbleButton style={{ backgroundColor: "#ffffff", color: "#0B2D72", fontSize: "15px" }}>Bắt đầu thiết kế ngay</BubbleButton>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}


