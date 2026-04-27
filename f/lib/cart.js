// lib/cart.js
const CART_KEY = "mebrick_cart";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return JSON.stringify({ items: [] });
  }
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function normInt(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}

function clampInt(v, min, max) {
  const n = normInt(v, min);
  return Math.max(min, Math.min(max, n));
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mebrick_cart_updated"));
  }
}

/**
 * Cart item shape
 * {
 *   product_id: number,
 *   quantity: number,
 *   product_name?: string,
 *   unit_price?: number,
 *   image?: string,
 *   design_data?: object|null,
 *   design_preview_url?: string|null,
 *   variant_label?: string|null,
 *   custom_note?: string|null
 * }
 */

export function getCart() {
  if (!isBrowser()) return { items: [] };
  const raw = localStorage.getItem(CART_KEY);
  const cart = raw ? safeParse(raw, { items: [] }) : { items: [] };

  if (!cart || !Array.isArray(cart.items)) return { items: [] };

  cart.items = cart.items
    .map((it) => ({
      product_id: normInt(it.product_id ?? it.id ?? it.productId) || 0,
      quantity: clampInt(it.quantity ?? it.qty ?? it.count, 1, 999),

      // ✅ keep product display info
      product_name: typeof it.product_name === "string" ? it.product_name : (typeof it.name === "string" ? it.name : ""),
      unit_price: clampInt(it.unit_price ?? it.price, 0, 1_000_000_000),
      image: typeof it.image === "string" ? it.image : null,

      // ✅ custom design info
      design_data: it.design_data ?? it.designData ?? null,
      design_preview_url: typeof it.design_preview_url === "string"
        ? it.design_preview_url
        : (typeof it.designPreviewUrl === "string" ? it.designPreviewUrl : null),

      variant_label: typeof it.variant_label === "string" ? it.variant_label : null,
      custom_note: typeof it.custom_note === "string" ? it.custom_note : null,
    }))
    .filter((it) => it.product_id);

  return cart;
}

export function setCart(cart) {
  if (!isBrowser()) return;
  const normalized = {
    items: Array.isArray(cart?.items) ? cart.items : [],
  };
  localStorage.setItem(CART_KEY, safeStringify(normalized));
}

export function clearCart() {
  if (!isBrowser()) return;
  localStorage.removeItem(CART_KEY);
  notify();
}

/**
 * Add item to cart.
 * If same product_id AND same design signature => merge quantity
 *
 * @param {{
 *   product_id: number|string,
 *   quantity?: number,
 *   product_name?: string,
 *   unit_price?: number,
 *   image?: string|null,
 *   design_data?: any|null,
 *   design_preview_url?: string|null,
 *   variant_label?: string|null,
 *   custom_note?: string|null
 * }} payload
 */
export function addToCart(payload) {
  const pid = normInt(payload?.product_id) || 0;
  if (!pid) return;

  const qty = clampInt(payload?.quantity ?? 1, 1, 999);

  const cart = getCart();

  // ✅ signature để merge: design_data + design_preview_url + variant_label
  const sig1 = safeStringify({
    d: payload?.design_data ?? null,
    p: payload?.design_preview_url ?? null,
    v: payload?.variant_label ?? null,
  });

  const idx = cart.items.findIndex((it) => {
    if (normInt(it.product_id) !== pid) return false;

    const sig2 = safeStringify({
      d: it.design_data ?? null,
      p: it.design_preview_url ?? null,
      v: it.variant_label ?? null,
    });

    return sig1 === sig2;
  });

  const base = {
    product_id: pid,
    quantity: qty,

    product_name: typeof payload?.product_name === "string" ? payload.product_name : "",
    unit_price: clampInt(payload?.unit_price ?? 0, 0, 1_000_000_000),
    image: typeof payload?.image === "string" ? payload.image : null,

    design_data: payload?.design_data ?? null,
    design_preview_url: typeof payload?.design_preview_url === "string" ? payload.design_preview_url : null,

    variant_label: typeof payload?.variant_label === "string" ? payload.variant_label : null,
    custom_note: typeof payload?.custom_note === "string" ? payload.custom_note : null,
  };

  if (idx >= 0) {
    // merge qty
    cart.items[idx].quantity = clampInt(cart.items[idx].quantity + qty, 1, 999);

    // optional: cập nhật metadata nếu trước đó thiếu
    cart.items[idx].product_name = cart.items[idx].product_name || base.product_name;
    cart.items[idx].unit_price = cart.items[idx].unit_price || base.unit_price;
    cart.items[idx].image = cart.items[idx].image || base.image;
    cart.items[idx].design_preview_url = cart.items[idx].design_preview_url || base.design_preview_url;
    cart.items[idx].custom_note = cart.items[idx].custom_note || base.custom_note;
  } else {
    cart.items.push(base);
  }

  setCart(cart);
  notify();
  return cart;
}

export function updateCartItem(index, patch) {
  const cart = getCart();
  if (index < 0 || index >= cart.items.length) return cart;

  const it = cart.items[index];
  const next = { ...it, ...patch };

  next.product_id = normInt(next.product_id) || 0;
  next.quantity = clampInt(next.quantity, 1, 999);

  // normalize
  next.product_name = typeof next.product_name === "string" ? next.product_name : "";
  next.unit_price = clampInt(next.unit_price ?? 0, 0, 1_000_000_000);
  next.image = typeof next.image === "string" ? next.image : null;

  next.design_preview_url =
    typeof next.design_preview_url === "string" ? next.design_preview_url : null;

  cart.items[index] = next;
  setCart(cart);
  notify();
  return cart;
}

export function removeCartItem(index) {
  const cart = getCart();
  if (index < 0 || index >= cart.items.length) return cart;
  cart.items.splice(index, 1);
  setCart(cart);
  notify();
  return cart;
}

export function cartTotalQty(cart = null) {
  const c = cart?.items ? cart : getCart();
  return (c.items || []).reduce((sum, it) => sum + (normInt(it.quantity) || 0), 0);
}

export function cartKey() {
  return CART_KEY;
}
