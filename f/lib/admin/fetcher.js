import { getToken, clearToken } from "./token";

export async function fetchAuth(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, { ...options, headers });

  // Auto logout nếu token hỏng/hết hạn
  if (res.status === 401) {
    clearToken();
    throw new Error("401");
  }

  return res;
}
