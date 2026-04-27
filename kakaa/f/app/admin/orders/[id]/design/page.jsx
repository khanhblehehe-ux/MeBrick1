"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiExternalLink, FiDownload } from "react-icons/fi";

function downloadFile(url, filename = "design.png") {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function AdminOrderDesignsPage() {
  const router = useRouter();
  const params = useParams();

  const orderId = useMemo(() => {
    const v = params?.id;
    return Array.isArray(v) ? v[0] : v;
  }, [params]);

  const baseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    []
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    let alive = true;

    (async () => {
      try {
        setErr("");
        setLoading(true);

        const res = await fetch(
          `${baseUrl}/api/orders/${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Không tải được đơn hàng");
        }

        const data = await res.json();
        if (!alive) return;
        setOrder(data || null);
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setErr(e?.message || "Không tải được đơn hàng");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [baseUrl, orderId]);

  /* =========================
     PICK PREVIEW (FALLBACK)
  ========================== */

  function pickPreviewUrl(item) {
    return (
      item?.design_preview_url ||
      item?.designPreviewUrl ||
      item?.design_data?.design_preview_url ||
      item?.design_data?.preview_url ||
      item?.designData?.design_preview_url ||
      item?.preview_url ||
      item?.previewUrl ||
      null
    );
  }

  /* =========================
     🔥 PICK UPLOADED IMAGES
  ========================== */

  function pickUploadedImages(item) {
    if (Array.isArray(item?.uploaded_images) && item.uploaded_images.length > 0) {
      return item.uploaded_images;
    }

    // Check inside design_data (saved by new backend logic)
    if (Array.isArray(item?.design_data?.uploaded_images) && item.design_data.uploaded_images.length > 0) {
      return item.design_data.uploaded_images;
    }

    // fallback bóc từ design_data (cho dữ liệu cũ) - chỉ lấy URL thật, không lấy base64
    if (Array.isArray(item?.design_data?.stickers)) {
      return item.design_data.stickers
        .filter(
          (s) =>
            s.layerType === "image" &&
            (s.original_url || s.src) &&
            !String(s.original_url || s.src || "").startsWith("data:")
        )
        .map((s) => s.original_url || s.src);
    }

    return [];
  }

  /* =========================
     BUILD IMAGE LISTS
  ========================== */

  const { previewList, uploadedList } = useMemo(() => {
    const items = order?.order_items || order?.items || [];
    const previews = [];
    const uploads = [];

    items.forEach((it) => {
      const preview = pickPreviewUrl(it);
      if (preview) {
        const url = typeof preview === "string" && preview.startsWith("/")
          ? `${baseUrl}${preview}`
          : preview;
        previews.push(url);
      }

      const uploaded = pickUploadedImages(it);
      uploaded.forEach((u) => {
        const url = typeof u === "string" && u.startsWith("/")
          ? `${baseUrl}${u}`
          : u;
        uploads.push(url);
      });
    });

    return {
      previewList: Array.from(new Set(previews.filter(Boolean))),
      uploadedList: Array.from(new Set(uploads.filter(Boolean))),
    };
  }, [order, baseUrl]);

  if (!orderId) return <div style={{ padding: 24 }}>Missing order id…</div>;
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  const totalImages = previewList.length + uploadedList.length;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 900,
            }}
          >
            <FiArrowLeft /> Back
          </button>

          <h2 style={{ margin: 0 }}>
            Ảnh in ấn - Đơn #{orderId}
          </h2>
        </div>
      </div>

      {err && (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(176,0,32,.25)",
            background: "rgba(176,0,32,.06)",
            color: "#b00020",
            fontWeight: 800,
          }}
        >
          {err}
        </div>
      )}

      {!err && totalImages === 0 && (
        <div style={{ marginTop: 14, color: "#666" }}>
          Đơn này chưa có ảnh in ấn.
        </div>
      )}

      {/* ===== PREVIEW THIẾT KẾ ===== */}
      {previewList.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#333" }}>
            Preview thiết kế ({previewList.length})
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {previewList.map((url, idx) => (
              <ImageCard
                key={url}
                url={url}
                label={`preview-${idx + 1}`}
                orderId={orderId}
                index={idx + 1}
                downloadFile={downloadFile}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== ẢNH KHÁCH HÀNG UPLOAD ===== */}
      {uploadedList.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#333" }}>
            Ảnh khách upload ({uploadedList.length})
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {uploadedList.map((url, idx) => (
              <ImageCard
                key={url}
                url={url}
                label={`upload-${idx + 1}`}
                orderId={orderId}
                index={idx + 1}
                downloadFile={downloadFile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageCard({ url, orderId, index, downloadFile }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 10px 28px rgba(0,0,0,.06)",
      }}
    >
      <img
        src={url}
        alt={`img-${index}`}
        style={{
          width: "100%",
          height: 260,
          objectFit: "cover",
          background: "#f3f4f6",
          display: "block",
        }}
      />
      <div
        style={{
          padding: 10,
          display: "flex",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            textDecoration: "none",
            color: "#111",
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "#fff",
          }}
        >
          <FiExternalLink /> Mở
        </a>
        <button
          onClick={() =>
            downloadFile(url, `order-${orderId}-img-${index}.png`)
          }
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "none",
            background: "#111827",
            color: "#fff",
            fontWeight: 950,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <FiDownload /> Tải
        </button>
      </div>
    </div>
  );
}