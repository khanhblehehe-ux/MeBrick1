"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../lib/admin/token";


export default function AdminGuard({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin-khanh-2026/login");
      return;
    }
    setOk(true);
  }, [router]);

  if (!ok) return null;
  return children;
}
