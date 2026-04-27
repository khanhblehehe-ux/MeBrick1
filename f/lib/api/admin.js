const API_URL = "/api/admin/stats";

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
    
