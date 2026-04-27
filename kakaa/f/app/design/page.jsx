"use client";

import "./design.css";
import ControlPanel from "./components/panels/ControlPanel";
import { useRouter, useSearchParams } from "next/navigation";
import { addToCart, getCart, updateCartItem } from "../../lib/cart";
import Stepper from "./components/Stepper";
// ✅ Site header/footer (giống trang chủ)
import Header from "../components/Header";
import Footer from "../components/Footer";
import SampleGallery from "./components/SampleGallery";

import { useState, useRef, useEffect, Suspense } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { FiLayers, FiSquare } from "react-icons/fi";

import { LEGO_CONFIG } from "./config/lego.config";
import { STICKER_CONFIG } from "./config/sticker.config";
import { SIZE_OPTIONS, CANVAS_SIZE_CONFIG } from "./config/size.config";
import { BACKGROUND_OPTIONS } from "./config/background.config";

import Stage from "./components/panels/Stage";

import { useLegoCharacter } from "./hooks/useLegoCharacter";
import { useStickerManager } from "./hooks/useStickerManager";
import { exportImage } from "./utils/exportImage";

async function uploadPreviewToBackend(dataUrl) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${baseUrl}/api/uploads/base64`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Upload preview failed");
  }
  return res.json(); // { url: "/uploads/previews/xxx.png" }
}

export default function DesignPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <DesignPageInner />
    </Suspense>
  );
}

function DesignPageInner() {

  // ====================
  // STATE
  // ====================
  // ...existing code...

  const [stickers, setStickers] = useState([]);
  const [activeSticker, setActiveSticker] = useState(null);
  const [showSamples, setShowSamples] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("characters");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFrame, setSelectedFrame] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);

  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  // ...existing code...

  const [quantity, setQuantity] = useState(1);
  const [selectedBackground, setSelectedBackground] = useState(null);

  const designAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  // ====== RESPONSIVE CANVAS SIZE (from config) ======
  useEffect(() => {
    const updateCanvasSize = () => {
      // ✅ Nếu user đã chọn khung, đừng reset size
      if (selectedSize) return;

      const width = window.innerWidth;
      let newSize;

      if (width >= CANVAS_SIZE_CONFIG.desktop.breakpoint) {
        // Desktop
        newSize = { 
          width: CANVAS_SIZE_CONFIG.desktop.width, 
          height: CANVAS_SIZE_CONFIG.desktop.height 
        };
      } else {
        // Mobile — dùng cùng kích thước desktop, canvasScale trong Stage tự co lại đúng tỉ lệ
        newSize = { 
          width: CANVAS_SIZE_CONFIG.desktop.width, 
          height: CANVAS_SIZE_CONFIG.desktop.height 
        };
      }

      setCanvasSize(newSize);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [selectedSize]);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract product image and name from URL
  const initialProductImage = searchParams.get("image")
    ? decodeURIComponent(searchParams.get("image"))
    : null;
  const productName = searchParams.get("name")
    ? decodeURIComponent(searchParams.get("name"))
    : "";

  // State to allow changing the selected product image
  const [selectedProductImage, setSelectedProductImage] =
    useState(initialProductImage);

  // Update state when URL changes
  useEffect(() => {
    setSelectedProductImage(initialProductImage);
  }, [initialProductImage]);

  // Auto-set selectedSize when selectedFrame is chosen (only 1 fixed size 23x23)
  useEffect(() => {
    if (selectedFrame && !selectedSize) {
      const fixedSize = SIZE_OPTIONS[0];
      setSelectedSize(fixedSize.id);
      setCanvasSize({ width: fixedSize.canvasWidth, height: fixedSize.canvasHeight });
    }
  }, [selectedFrame]);

  // Debug: log values
  useEffect(() => {
    console.log("🎨 Design Page - selectedProductImage:", selectedProductImage);
    console.log("🎨 Design Page - productName:", productName);
  }, [selectedProductImage, productName]);

  // ===== GLOBAL WHEEL PRIORITY HANDLING =====
  // Prioritize scrolling .mb-layergrid over page scroll
  useEffect(() => {
    const handleGlobalWheel = (e) => {
      try {
        const layerGrid = document.querySelector(".mb-layergrid");
        if (!layerGrid) return;

        const { scrollHeight, clientHeight, scrollTop } = layerGrid;
        const canScroll = scrollHeight > clientHeight;

        if (!canScroll) {
          return; // Can't scroll, allow page scroll
        }

        const isScrollingDown = e.deltaY > 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        const isAtTop = scrollTop <= 0;

        // If can scroll in the direction, prevent page scroll
        if ((isScrollingDown && !isAtBottom) || (!isScrollingDown && !isAtTop)) {
          layerGrid.scrollTop += e.deltaY;
          e.preventDefault();
        }
      } catch (err) {
        console.warn("Global wheel handler error:", err);
      }
    };

    document.addEventListener("wheel", handleGlobalWheel, { passive: false, capture: true });

    return () => {
      document.removeEventListener("wheel", handleGlobalWheel, { capture: true });
    };
  }, []);

  function pickPositiveInt(...vals) {
    for (const v of vals) {
      const n = Number(v);
      if (Number.isInteger(n) && n > 0) return n;
    }
    return null;
  }

  // ✅ FIX: hỗ trợ mọi key: product / productId / product_id / id
  const productId = pickPositiveInt(
    searchParams.get("product"),
    searchParams.get("productId"),
    searchParams.get("product_id"),
    searchParams.get("id"),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedImages, setSavedImages] = useState([]);

  // ✅ Edit cart item mode
  const [editCartItemIndex, setEditCartItemIndex] = useState(null);

  // ✅ Load design_data từ cart nếu edit mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedIndex = sessionStorage.getItem("editCartItemIndex");
    if (savedIndex !== null) {
      const idx = JSON.parse(savedIndex);
      setEditCartItemIndex(idx);

      const cart = getCart();
      const cartItem = cart.items[idx];

      if (cartItem?.design_data) {
        const dd =
          typeof cartItem.design_data === "string"
            ? JSON.parse(cartItem.design_data)
            : cartItem.design_data;

        // Load lại dữ liệu thiết kế
        if (dd.selectedFrame) setSelectedFrame(dd.selectedFrame);
        if (dd.selectedSize) setSelectedSize(dd.selectedSize);
        if (dd.selectedBackground) setSelectedBackground(dd.selectedBackground);
        if (dd.stickers) setStickers(dd.stickers);
        if (dd.legoCharacters) setLegoCharacters(dd.legoCharacters);
        if (dd.quantity) setQuantity(dd.quantity);

        // Clear sessionStorage
        sessionStorage.removeItem("editCartItemIndex");
      }
    }
  }, []);

  // ✅ RightPanel sub-panel (Luvin style)
  const [activePanel, setActivePanel] = useState(null); // "text" | "image" | null

  // ...existing code...

  const canGoFrame = true;
  const canGoBg = !!selectedFrame;
  const canGoLego = !!selectedBackground;
  const canGoCheckout = true;

  const goStep = (to) => {
    if (to === STEPS.FRAME) return setStep(STEPS.FRAME);
    if (to === STEPS.BG) return canGoBg ? setStep(STEPS.BG) : null;
    if (to === STEPS.LEGO) return canGoLego ? setStep(STEPS.LEGO) : null;
    if (to === STEPS.CHECKOUT)
      return canGoCheckout ? setStep(STEPS.CHECKOUT) : null;
  };

  const handleReset = () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ thiết kế và bắt đầu lại?")) return;
    setStickers([]);
    setLegoCharacters([]);
    setSelectedFrame(null);
    setSelectedBackground(null);
    setSelectedSize(null);
    setSlotImages({});
    setSavedImages([]);
    setStep(STEPS.FRAME);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  };

  // LEGO CHARACTERS
  const [legoCharacters, setLegoCharacters] = useState([]);
  const legoCharactersRef = useRef([]);
  useEffect(() => {
    legoCharactersRef.current = legoCharacters;
  }, [legoCharacters]);

  const [selectedCharacterId, setSelectedCharacterId] = useState(null);

  // Selected free layer id (text/image/sticker)
  const [selectedId, setSelectedId] = useState(null);

  // Outfit selector
  const [showOutfitSelector, setShowOutfitSelector] = useState(false);
  const [outfitSelectorCharId, setOutfitSelectorCharId] = useState(null);

  // Pants selector
  const [showPantsSelector, setShowPantsSelector] = useState(false);
  const [pantsSelectorCharId, setPantsSelectorCharId] = useState(null);

  // Slot images (ảnh trong các ô slot của background mẫu)
  const [slotImages, setSlotImages] = useState({}); // { "bgId_slotId": dataSrc }
  const handleSetSlotImage = (bgId, slotId, src) =>
    setSlotImages((prev) => ({ ...prev, [`${bgId}_${slotId}`]: src }));
  const handleClearSlotImage = (bgId, slotId) =>
    setSlotImages((prev) => {
      const next = { ...prev };
      delete next[`${bgId}_${slotId}`];
      return next;
    });

  // STEPPER
  const STEPS = { FRAME: 1, BG: 2, LEGO: 3, CHECKOUT: 4 };
  const [step, setStep] = useState(STEPS.FRAME);

  // ✅ Auto-save / auto-restore draft
  const DRAFT_KEY = "mebrick_design_draft";

  // Restore từ draft khi mở trang (chỉ khi không phải edit mode)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("editCartItemIndex") !== null) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      // Hết hạn sau 24 giờ
      if (Date.now() - (draft.savedAt || 0) > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      if (draft.selectedFrame) setSelectedFrame(draft.selectedFrame);
      if (draft.selectedBackground) setSelectedBackground(draft.selectedBackground);
      if (draft.stickers?.length) setStickers(draft.stickers);
      if (draft.legoCharacters?.length) setLegoCharacters(draft.legoCharacters);
      if (draft.quantity) setQuantity(draft.quantity);
      if (draft.savedImages?.length) setSavedImages(draft.savedImages);
      if (draft.slotImages && Object.keys(draft.slotImages).length) setSlotImages(draft.slotImages);
      if (draft.step) setStep(draft.step);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tự động lưu draft 500ms sau mỗi khi state thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draft = {
          stickers,
          legoCharacters,
          selectedFrame,
          selectedBackground,
          savedImages,
          slotImages,
          quantity,
          step,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // QuotaExceededError: thử lại không lưu base64 để tiết kiệm dung lượng
        try {
          const draft = {
            stickers: stickers.map((s) =>
              typeof s.src === "string" && s.src.startsWith("data:")
                ? { ...s, src: "" }
                : s
            ),
            legoCharacters,
            selectedFrame,
            selectedBackground,
            savedImages,
            slotImages,
            quantity,
            step,
            savedAt: Date.now(),
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch { /* ignore */ }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [stickers, legoCharacters, selectedFrame, selectedBackground, savedImages, slotImages, quantity, step]);

  // ✅ auto open text panel when click text layer
  useEffect(() => {
    if (!selectedId) return;
    const sticker = stickers.find((s) => s.id === selectedId);
    if (sticker?.layerType === "text") {
      setActivePanel("text");
    }
  }, [selectedId, stickers]);

  // (Giữ lại refs map nếu code bạn còn dùng ở nơi khác)
  const stickerRefs = useRef(new Map());
  const setStickerRef = (id) => (el) => {
    if (el) stickerRefs.current.set(id, el);
    else stickerRefs.current.delete(id);
  };

  const characterRefs = useRef(new Map());
  const setCharacterRef = (id) => (el) => {
    if (el) characterRefs.current.set(id, el);
    else characterRefs.current.delete(id);
  };

  // ====================
  // UPDATE CANVAS SIZE WHEN CHOOSE SIZE
  // ====================
  useEffect(() => {
    if (selectedSize) {
      const selectedOption = SIZE_OPTIONS.find((o) => o.id === selectedSize);
      if (selectedOption) {
        setCanvasSize({
          width: selectedOption.canvasWidth,
          height: selectedOption.canvasHeight,
        });
      }
    }
  }, [selectedSize]);

  // ====================
  // LEGO LOGIC HOOK
  // ====================
  const {
    addCompleteLegoCharacter,
    moveLegoCharacter,
    updateCharacterOutfit,
    updateCharacterPants,
    updateCharacterFace,
    updateCharacterHair,
    handleDeleteCharacter,
  } = useLegoCharacter({
    LEGO_CONFIG,
    canvasSize,
    stickers,
    setStickers,
    legoCharacters,
    setLegoCharacters,
    selectedCharacterId,
    setSelectedCharacterId,
    legoCharactersRef,

    // ✅ NEW: giúp hook tự clear selection/panel
    setSelectedId,
    setActivePanel,

    setShowOutfitSelector,
    setOutfitSelectorCharId,
  });

  // ✅ WRAPPER: luôn clear selection/panel trước khi add character
  const addCompleteLegoCharacterSafe = () => {
    setActivePanel(null);
    setSelectedId(null);
    addCompleteLegoCharacter();
  };

  // ====================
  // STICKER LOGIC HOOK
  // ====================
  const {
    addSticker,
    handleUpdateSticker,
    handleDeleteSticker,
    handleAddText,
    handleImageUpload,
    handleDesignAreaClick,
  } = useStickerManager({
    LEGO_CONFIG,
    stickers,
    setStickers,
    canvasSize,
    legoCharacters,
    selectedCharacterId,
    updateCharacterOutfit,
    handleDeleteCharacter,
    setSelectedCharacterId,
    setSelectedId,
  });

  // ====================
  // DND SENSORS + HANDLERS
  // ====================
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const stickerData = active.data.current?.sticker;
    if (stickerData) setActiveSticker(stickerData);
  };

  const handleDragEnd = (event) => {
    const { over } = event;
    setActiveSticker(null);

    if (!over || over.id !== "design-area") return;

    const stickerData = event.active.data.current?.sticker;
    if (!stickerData) return;

    const wrapper = designAreaRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const clientX = event.activatorEvent?.clientX ?? 0;
    const clientY = event.activatorEvent?.clientY ?? 0;

    const w = stickerData.width || 50;
    const h = stickerData.height || 50;

    addSticker({
      ...stickerData,
      x: clientX - rect.left - w / 2,
      y: clientY - rect.top - h / 2,
      width: w,
      height: h,
      layerType: stickerData.layerType || "sticker",
    });
  };

  // ====================
  // LAYER PICK LOGIC (addLegoLayer)
  // ====================
  const addLegoLayer = (layer) => {
    if (!layer || !layer.layerType) return;

    // Helper: xác định nhân vật mục tiêu
    const getTargetCharacterId = () => {
      // đã chọn rồi thì dùng luôn
      if (selectedCharacterId) return selectedCharacterId;

      // chỉ có 1 nhân vật thì auto chọn
      if ((legoCharacters || []).length === 1) return legoCharacters[0].id;

      // >= 2 mà chưa chọn -> bắt user chọn
      return null;
    };

    if (layer.layerType === "character") {
      addCompleteLegoCharacterSafe();
      return;
    }

    // ===== Outfit / Face / Hair phải có target character =====
    if (layer.layerType === "outfit") {
      const targetId = getTargetCharacterId();
      if (!targetId) {
        alert(
          "Bạn đang có nhiều nhân vật. Vui lòng click chọn 1 nhân vật trước khi đổi trang phục.",
        );
        return;
      }
      // đảm bảo UI highlight đúng nhân vật mục tiêu
      setSelectedCharacterId(targetId);

      updateCharacterOutfit(layer.src, targetId, layer.price || 0);
      return;
    }

    if (layer.layerType === "pant") {
      const targetId = getTargetCharacterId();
      if (!targetId) {
        alert(
          "Bạn đang có nhiều nhân vật. Vui lòng click chọn 1 nhân vật trước khi đổi quần.",
        );
        return;
      }
      setSelectedCharacterId(targetId);

      updateCharacterPants(layer.src, targetId, layer.price || 0);
      return;
    }

    if (layer.layerType === "face") {
      const targetId = getTargetCharacterId();
      if (!targetId) {
        alert(
          "Bạn đang có nhiều nhân vật. Vui lòng click chọn 1 nhân vật trước khi đổi khuôn mặt.",
        );
        return;
      }
      setSelectedCharacterId(targetId);

      // hook hiện tại của bạn đang không nhận targetId, nên setSelectedCharacterId trước là đủ
      updateCharacterFace(layer.src, layer.price || 0);
      return;
    }

    if (layer.layerType === "hair") {
      const targetId = getTargetCharacterId();
      if (!targetId) {
        alert(
          "Bạn đang có nhiều nhân vật. Vui lòng click chọn 1 nhân vật trước khi đổi tóc.",
        );
        return;
      }
      setSelectedCharacterId(targetId);

      updateCharacterHair(layer.src, layer.price || 0);
      return;
    }
    if (layer.layerType === "text") {
      addSticker({
        type: "text",
        layerType: "text",

        // ✅ QUAN TRỌNG
        lines: layer.lines,

        // fallback nếu không có lines
        content: layer.content || "",

        fontFamily: layer.fontFamily || "Inter",
        fontSize: layer.fontSize || 64,
        fontWeight: layer.fontWeight || 900,
        lineHeight: layer.lineHeight || 0.9,
        align: layer.align || "left",

        width: layer.width || 360,
        height: layer.height || 240,
        zIndex: Date.now(),
      });
      return;
    }

    // ===== Sticker =====
    if (layer.layerType === "sticker") {
      addSticker({
        type: "image",
        src: layer.src,
        name: layer.name,
        price: layer.price || 0,
        width: 60,
        height: 60,
        layerType: "sticker",
      });
      return;
    }
  };

  // ====================
  // FILTER LAYERS
  // ====================
  const getFilteredLayers = () => {
    let layers = [];
    switch (selectedCategory) {
      case "characters":
        layers = LEGO_CONFIG.characters;
        break;
      case "outfits":
        layers = LEGO_CONFIG.outfits;
        break;
      case "lego-colors":
        layers = LEGO_CONFIG.legoColors;
        break;
      case "lego-pants":
        layers = LEGO_CONFIG.legoPantsColors;
        break;
      case "faces":
        layers = LEGO_CONFIG.faces;
        break;
      case "faces-female":
        layers = LEGO_CONFIG.facesFemale;
        break;
      case "hairs-nam":
        layers = LEGO_CONFIG.hairs.filter((h) => h.gender === "nam");
        break;
      case "hairs-nu":
        layers = LEGO_CONFIG.hairs.filter((h) => h.gender === "nu");
        break;
      case "stickers":
        layers = STICKER_CONFIG;
        break;
      default:
        layers = [];
    }
    if (!searchQuery.trim()) return layers;
    return layers.filter((layer) =>
      layer.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  // ====================
  // SIZE / BG SELECT
  // ====================
  const handleSelectSize = (sizeId) => {
    setSelectedSize(sizeId);

    const selectedOption = SIZE_OPTIONS.find((o) => o.id === sizeId);
    if (selectedOption) {
      setCanvasSize({
        width: selectedOption.canvasWidth,
        height: selectedOption.canvasHeight,
      });
    }
  };

  const handleSelectBackground = (background) => {
    const formattedBackground = {
      ...background,
      value:
        background.type === "pattern" || background.type === "custom"
          ? background.value?.startsWith("url")
            ? background.value
            : `url(${background.value})`
          : background.value,
    };

    setSelectedBackground(formattedBackground);
  };

  // ====================
  // EXPORT + TOTAL + ORDER
  // ====================
  // ===== PRICING (đặt trong DesignPage, không lồng function) =====
  const calcPricing = () => {
    if (!selectedFrame || !selectedFrame.frameTypePrice) {
      return {
        basePrice: 0,
        legoPrice: 0,
        stickerPrice: 0,
        extraCharacterPrice: 0,
        unitTotal: 0,
        total: 0,
      };
    }

    // Get base price from selected frame type
    const basePrice = Number(selectedFrame.frameTypePrice || 0);

    // lego parts = sticker có characterId (outfit/face/hair)
    const legoPrice = (stickers || []).reduce((t, s) => {
      if (s?.characterId) return t + Number(s?.price || 0);
      return t;
    }, 0);

    // sticker thường = không có characterId
    const stickerPrice = (stickers || []).reduce((t, s) => {
      if (!s?.characterId) return t + Number(s?.price || 0);
      return t;
    }, 0);

    // Khung 1: quá 1 nhân vật → cộng 20.000/nhân vật thêm
    // Khung 2 & LED: quá 2 nhân vật → cộng 20.000/nhân vật thêm
    const extraCharacterPrice = (() => {
      const ft = selectedFrame.frameType;
      if (ft === "frame-1" && legoCharacters.length > 1)
        return (legoCharacters.length - 1) * 20000;
      if ((ft === "frame-2" || ft === "frame-led") && legoCharacters.length > 2)
        return (legoCharacters.length - 2) * 20000;
      return 0;
    })();

    const unitTotal = basePrice + legoPrice + stickerPrice + extraCharacterPrice;
    const total = unitTotal * Number(quantity || 1);

    return { basePrice, legoPrice, stickerPrice, extraCharacterPrice, unitTotal, total };
  };

  const calculateTotal = () => {
    const pricing = calcPricing();
    return pricing.total;
  };

  // ===== LƯU ẢNH KHÁCH HÀNG UPLOAD (không cần đăng nhập) =====
  const handleSaveCustomerImage = async (file) => {
    if (!file) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${baseUrl}/api/uploads/customer-image-public`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.url) {
        setSavedImages((prev) => [
          { id: data.id || `local-${Date.now()}`, url: data.url, name: file.name },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Save customer image failed:", err);
    }
  };

  // ===== EXPORT PNG (để ControlPanel gọi) =====
  const handleExportImage = async () => {
    if (!designAreaRef.current) {
      alert("Không tìm thấy vùng thiết kế để export.");
      return;
    }
    try {
      const dataUrl = await exportImage(designAreaRef.current);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `lego-design-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert("❌ Có lỗi xảy ra khi xuất hình ảnh");
    }
  };

  // ===== HANDLE ORDER (đảm bảo design_preview_url + design_data vào cart) =====
  const handleOrder = async () => {
    if (isSaving) return;

    if (stickers.length === 0 && legoCharacters.length === 0) {
      alert(
        "Vui lòng thêm ít nhất một sticker hoặc nhân vật LEGO vào thiết kế!",
      );
      return;
    }
    if (!selectedFrame) {
      alert("Vui lòng chọn loại khung trước!");
      return;
    }
    if (!productId) {
      alert(
        "Thiếu productId. Hãy chọn 1 sản phẩm trước (vào Collections) hoặc mở /design?product=ID",
      );
      return;
    }
    if (!designAreaRef.current) {
      alert("Không tìm thấy vùng thiết kế để tạo preview.");
      return;
    }

    try {
      setIsSaving(true);

      // 1) pricing
      const pricing = calcPricing();

      // 2) export preview
      const dataUrl = await exportImage(designAreaRef.current);

      const product_name =
        searchParams.get("name") ||
        searchParams.get("product_name") ||
        `Product #${productId}`;

      const image =
        searchParams.get("image") || searchParams.get("img") || null;

      // upload preview (nếu fail -> dùng base64)
      let previewUrl = dataUrl;
      try {
        const up = await uploadPreviewToBackend(dataUrl);
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        if (up?.url)
          previewUrl = up.url.startsWith("http")
            ? up.url
            : `${baseUrl}${up.url}`;
      } catch (err) {
        console.warn("Upload preview failed -> fallback base64 preview:", err);
      }

      // upload slot images (ảnh khách thêm vào ô slot của background)
      const baseUrlForSlot = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const uploadedSlotImages = {};
      await Promise.all(
        Object.entries(slotImages).map(async ([key, src]) => {
          if (typeof src === "string" && src.startsWith("data:")) {
            try {
              const up = await uploadPreviewToBackend(src);
              uploadedSlotImages[key] = up?.url
                ? (up.url.startsWith("http") ? up.url : `${baseUrlForSlot}${up.url}`)
                : src;
            } catch {
              uploadedSlotImages[key] = src;
            }
          } else {
            uploadedSlotImages[key] = src;
          }
        })
      );

      // 3) design_data
      const design_data = {
        product_id: Number(productId),
        selectedFrame,
        frameType: selectedFrame.frameType,
        frameTypeName: selectedFrame.frameTypeName,
        frameTypePrice: selectedFrame.frameTypePrice,
        sizeLabel: selectedFrame.size?.dimensions || "23x23cm",
        canvasSize,
        selectedBackground,
        quantity,
        pricing: {
          basePrice: pricing.basePrice,
          legoPrice: pricing.legoPrice,
          stickerPrice: pricing.stickerPrice,
          unitTotal: pricing.unitTotal,
          total: pricing.total,
        },
        legoCharacters,
        stickers,
        createdAt: Date.now(),
        design_preview_url: previewUrl,
        slot_images: uploadedSlotImages,
        uploaded_images: [
          ...savedImages.map((i) => i.url),
          ...Object.values(uploadedSlotImages).filter((u) => typeof u === "string" && !u.startsWith("data:")),
        ],
      };

      // 4) add to cart or update existing item
      if (editCartItemIndex !== null) {
        // Update existing cart item
        updateCartItem(editCartItemIndex, {
          product_id: Number(productId),
          quantity: Number(quantity) || 1,
          product_name,
          unit_price: pricing.unitTotal,
          image,
          design_preview_url: previewUrl,
          design_data,
        });
      } else {
        // Add new cart item
        addToCart({
          product_id: Number(productId),
          quantity: Number(quantity) || 1,
          product_name,
          unit_price: pricing.unitTotal,
          image,
          design_preview_url: previewUrl,
          design_data,
        });
      }

      // Xóa draft sau khi đã thêm vào giỏ thành công
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }

      router.push("/cart");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Không thể lưu thiết kế. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // ====================
  // RENDER
  // ====================
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}>
      {/* SITE HEADER */}
      <Header />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        {/* ===== GRADIENT BACKGROUND WRAPPER ===== */}
        <div className="min-h-screen w-full relative overflow-hidden">
          {/* Radial gradient background */}
          <div className="absolute inset-0 z-0 bg-white" />
          {/* Overlay nhẹ để dễ đọc chữ */}
          <div className="absolute inset-0 z-[1] bg-black/5" />

          {/* ===== CODE GỐC CỦA BẠN ===== */}
          <div className="lego-customizer relative z-10">
            <main
              className={`design-layout ${showSamples ? "samples-open" : "samples-closed"}`}>
              <SampleGallery
                selectedProductImage={selectedProductImage}
                productName={productName}
                onSelectImage={setSelectedProductImage}
              />
              <div className="stage-workspace">
                <Stage
                  designAreaRef={designAreaRef}
                  canvasSize={canvasSize}
                  selectedSize={selectedSize}
                  selectedBackground={selectedBackground}
                  stickers={stickers}
                  legoCharacters={legoCharacters}
                  LEGO_CONFIG={LEGO_CONFIG}
                  selectedCharacterId={selectedCharacterId}
                  setSelectedCharacterId={setSelectedCharacterId}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  setStickers={setStickers}
                  moveLegoCharacter={moveLegoCharacter}
                  stickerRefs={stickerRefs}
                  setStickerRef={setStickerRef}
                  characterRefs={characterRefs}
                  setCharacterRef={setCharacterRef}
                  handleDeleteSticker={handleDeleteSticker}
                  handleDesignAreaClick={handleDesignAreaClick}
                  Stepper={Stepper}
                  step={step}
                  goStep={goStep}
                  canGoBg={canGoBg}
                  canGoLego={canGoLego}
                  canGoCheckout={canGoCheckout}
                  calculateTotal={calculateTotal}
                  onReset={handleReset}
                  updateCharacterOutfit={updateCharacterOutfit}
                  showOutfitSelector={showOutfitSelector}
                  setShowOutfitSelector={setShowOutfitSelector}
                  outfitSelectorCharId={outfitSelectorCharId}
                  setOutfitSelectorCharId={setOutfitSelectorCharId}
                  updateCharacterPants={updateCharacterPants}
                  showPantsSelector={showPantsSelector}
                  setShowPantsSelector={setShowPantsSelector}
                  pantsSelectorCharId={pantsSelectorCharId}
                  setPantsSelectorCharId={setPantsSelectorCharId}
                  slotImages={slotImages}
                  onSetSlotImage={handleSetSlotImage}
                  onClearSlotImage={handleClearSlotImage}
                />
              </div>

              <ControlPanel
                step={step}
                STEPS={STEPS}
                setStep={setStep}
                goStep={goStep}
                selectedFrame={selectedFrame}
                setSelectedFrame={setSelectedFrame}
                canGoBg={canGoBg}
                canGoLego={canGoLego}
                selectedSize={selectedSize}
                canvasSize={canvasSize}
                selectedBackground={selectedBackground}
                SIZE_OPTIONS={SIZE_OPTIONS}
                BACKGROUND_OPTIONS={BACKGROUND_OPTIONS}
                handleSelectSize={handleSelectSize}
                handleSelectBackground={handleSelectBackground}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                getFilteredLayers={getFilteredLayers}
                addLegoLayer={addLegoLayer}
                legoCharacters={legoCharacters}
                selectedCharacterId={selectedCharacterId}
                addCompleteLegoCharacter={addCompleteLegoCharacterSafe}
                handleDeleteCharacter={handleDeleteCharacter}
                handleAddText={handleAddText}
                handleImageUpload={handleImageUpload}
                fileInputRef={fileInputRef}
                quantity={quantity}
                setQuantity={setQuantity}
                calculateTotal={calculateTotal}
                pricing={calcPricing()}
                handleExportImage={handleExportImage}
                handleOrder={handleOrder}
                isSaving={isSaving}
                isEditing={editCartItemIndex !== null}
                activePanel={activePanel}
                setActivePanel={setActivePanel}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                stickers={stickers}
                handleUpdateSticker={handleUpdateSticker}
                handleDeleteSticker={handleDeleteSticker}
                onSaveImage={handleSaveCustomerImage}
              />
            </main>

            <DragOverlay></DragOverlay>
          </div>
        </div>
      </DndContext>

      {/* SITE FOOTER */}
      <Footer />
    </div>
  );
}
