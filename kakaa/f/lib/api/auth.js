const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL.replace(/\/$/, "")}/api/auth/login`;

/**
 * Login admin
 * @param {{ email: string, password: string }} data
 * @returns { token, admin }
 */
export async function loginAdmin(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Login failed");
  }

  return res.json();
}
