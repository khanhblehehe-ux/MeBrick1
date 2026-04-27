const API_URL = "/api/products";

// Public: fetch products for shop pages
export async function getProducts(section) {
  let url = API_URL;

  if (section) {
    url += `?section=${section}`;
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");

  return res.json();
}

// Admin helpers (JWT)
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createProduct(data, token) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create product failed");
  return res.json();
}

export async function updateProduct(id, data, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update product failed");
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Delete product failed");
  return res.json();
}
