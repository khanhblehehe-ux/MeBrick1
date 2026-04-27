const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL.replace(/\/$/, "")}/api/admin/stats`;

export async function getAdminStats(token) {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Fetch stats failed");
  return res.json();
}
    