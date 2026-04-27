/**
 * Login admin
 * @param {{ email: string, password: string }} data
 * @returns { token, admin }
 */
export async function loginAdmin(data) {
  const res = await fetch("/api/auth/login", {
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
