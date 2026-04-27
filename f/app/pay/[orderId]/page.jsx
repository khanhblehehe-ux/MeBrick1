"use client";

import { useEffect, useMemo, useState } from "react";
// ===== Simple Toast Notification =====
function showToast(message, duration = 3000) {
  let toast = document.getElementById("pay-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "pay-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "32px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#0b2d72";
    toast.style.color = "#fff";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "1rem";
    toast.style.zIndex = 9999;
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    toast.style.opacity = 0;
    toast.style.transition = "opacity 0.3s";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = 1;
  setTimeout(() => {
    toast.style.opacity = 0;
  }, duration);
}
import { useParams, useRouter } from "next/navigation";

import { getOrderById, getVietQRInfo, markTransferred } from "../../../lib/api/orders";

function formatVnd(n) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(n || 0)
  );
}

function buildVietQrImageUrl({ bankCode, accountNumber, accountName, amount, memo }) {
  // Bạn có thể đang dùng service tạo ảnh QR khác trong project.
  // Đây là cách phổ biến với VietQR image API:
  // - bankId: mã ngân hàng (TPB, VCB...)
  // - accountNo: số TK
  // - template: compact/print/...
  // - amount: số tiền
  // - addInfo: nội dung CK
  // - accountName: tên
  const params = new URLSearchParams();
  params.set("bankId", bankCode);
  params.set("accountNo", accountNumber);
  params.set("template", "compact");
  params.set("amount", String(Number(amount || 0)));
  if (memo) params.set("addInfo", memo);
  if (accountName) params.set("accountName", accountName);

  // VietQR image endpoint thường gặp:
  // https://img.vietqr.io/image/{bank}-{acc}-compact.png?amount=...&addInfo=...&accountName=...
  // Nếu project bạn đang có endpoint khác, chỉ cần thay URL này cho đúng service bạn dùng.
  return `https://img.vietqr.io/image/${encodeURIComponent(bankCode)}-${encodeURIComponent(
    accountNumber
  )}-compact.png?${params.toString()}`;
}

export default function PayPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId;

  const [order, setOrder] = useState(null);
  const [qrInfo, setQrInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");

  // ✅ cấu hình VietQR từ ENV (match cách bạn đã dùng trước đó)
  const bankCode = process.env.NEXT_PUBLIC_VIETQR_BANK_CODE || "MB";
  const accountNumber = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NUMBER || "00709200458";
  const accountName = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || "PHAM THI HONG NHUNG";

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr("");
        setLoading(true);

        // Load order trước để biết payment_method
        const o = await getOrderById(orderId);

        if (!alive) return;

        setOrder(o);

        // ✅ Nếu là COD thì không vào trang QR
        if (String(o?.payment_method || "").toLowerCase() === "cod") {
          router.replace(`/order/${encodeURIComponent(orderId)}`);
          return;
        }

        // bank_qr => lấy amount + memo từ backend
        const info = await getVietQRInfo(orderId);

        if (!alive) return;

        setQrInfo(info);
      } catch (e) {
        if (!alive) return;
        setErr("Không tải được thông tin thanh toán. Vui lòng thử lại.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (orderId) load();

    return () => {
      alive = false;
    };
  }, [orderId, router]);

  // Polling kiểm tra trạng thái thanh toán mỗi 5 giây (khi chưa paid)
  useEffect(() => {
    if (!orderId || !order || order?.payment_status === "paid") return;

    const interval = setInterval(async () => {
      try {
        const o = await getOrderById(orderId);
        if (o?.payment_status === "paid") {
          setOrder(o);
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, order?.payment_status]);

  const amount = useMemo(() => Number(qrInfo?.amount || 0), [qrInfo]);
  const memo = useMemo(() => String(qrInfo?.memo || ""), [qrInfo]);

  const qrImageUrl = useMemo(() => {
    if (!amount) return "";
    return buildVietQrImageUrl({
      bankCode,
      accountNumber,
      accountName,
      amount,
      memo,
    });
  }, [bankCode, accountNumber, accountName, amount, memo]);

  const handleMarkTransferred = async () => {
    try {
      setPaying(true);
      await markTransferred(orderId);
      // reload order / info
      const o = await getOrderById(orderId);
      setOrder(o);
      showToast("✅ Đã xác nhận chuyển khoản! Shop sẽ kiểm tra và xác nhận đơn hàng.");
    } catch {
      setErr("Không cập nhật được trạng thái chuyển khoản. Vui lòng thử lại.");
    } finally {
      setPaying(false);
    }
  };

  if (!orderId) return null;

  // ✅ Màn hình thanh toán thành công
  if (order?.payment_status === "paid") {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          maxWidth: 480,
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "0 8px 40px rgba(0,80,184,0.10)",
          border: "1px solid #e0eaff",
        }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <h2 style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#0B2D72",
            fontFamily: "'Antonio', sans-serif",
            textTransform: "uppercase",
            marginBottom: 12,
          }}>Thanh toán thành công!</h2>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 8 }}>
            Shop đã xác nhận thanh toán cho đơn hàng <strong>#{order?.id}</strong>.
          </p>
          <p style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>
            Cảm ơn bạn đã tin tưởng và ủng hộ <strong style={{ color: "#0B2D72" }}>Mê Bricks</strong>! 💛
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => router.push(`/order/${encodeURIComponent(orderId)}`)}
              style={{
                height: 44,
                padding: "0 24px",
                borderRadius: 12,
                border: "1px solid #0b2d72",
                background: "#0b2d72",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 15,
                fontFamily: "inherit",
              }}
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => router.push("/")}
              style={{
                height: 44,
                padding: "0 24px",
                borderRadius: 12,
                border: "1px solid #eee",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 15,
                fontFamily: "inherit",
              }}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Thanh toán VietQR</h1>
        <button
          onClick={() => router.push("/")}
          style={{
            height: 36,
            padding: "0 12px",
            borderRadius: 10,
            border: "1px solid #eee",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 800,
            fontFamily: "inherit",
          }}
        >
          Về trang chủ
        </button>
      </div>

      {err ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid #ffd0d0", background: "#fff7f7" }}>
          {String(err)}
        </div>
      ) : null}

      {loading ? (
        <div style={card}>Đang tải...</div>
      ) : !qrInfo ? (
        <div style={card}>Không có dữ liệu VietQR.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
          <div style={card}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Thông tin đơn</div>
            <div style={{ display: "grid", gap: 6, color: "#333" }}>
              <div>
                <b>Mã đơn:</b> #{order?.id}
              </div>
              <div>
                <b>Số tiền cần chuyển:</b> {formatVnd(amount)}
              </div>
              <div>
                <b>Nội dung chuyển khoản:</b> <span style={{ fontWeight: 900 }}>{memo}</span>
              </div>
              <div>
                <b>Trạng thái thanh toán:</b> {order?.payment_status || qrInfo?.payment_status || "unpaid"}
              </div>
              {(order?.order_items || order?.items || []).map((item, idx) => {
                const fc = item?.design_data?.frameColor;
                const ft = item?.design_data?.frameTypeName;
                if (!fc && !ft) return null;
                return (
                  <div key={idx} style={{ background: "#f0f4ff", borderRadius: 8, padding: "6px 10px", fontSize: 13 }}>
                    <b>Sản phẩm {idx + 1}:</b>
                    {ft && <span> Loại khung: <strong>{ft}</strong></span>}
                    {fc && <span> · Màu khung: <strong>{fc === "white" ? "Khung trắng" : "Khung gỗ"}</strong></span>}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: "#666", lineHeight: 1.6 }}>
              Lưu ý: hãy nhập đúng <b>nội dung chuyển khoản</b> để shop đối soát nhanh.
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                onClick={() => router.push(`/order/${encodeURIComponent(orderId)}`)}
                style={{
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "1px solid #eee",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 900,
                  fontFamily: "inherit",
                }}
              >
                Xem đơn hàng
              </button>

              {/* Ẩn nút khi đã xác nhận thanh toán */}
              {order?.payment_status !== "paid" && (
                <button
                  onClick={handleMarkTransferred}
                  disabled={paying}
                  style={{
                    height: 40,
                    padding: "0 12px",
                    borderRadius: 12,
                    border: "1px solid #0b2d72",
                    background: "#0b2d72",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 900,
                    opacity: paying ? 0.7 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {paying ? "Đang cập nhật..." : "Tôi đã chuyển khoản"}
                </button>
              )}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Quét QR để chuyển khoản</div>

            <div
              style={{
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 12,
                background: "#fafafa",
                display: "grid",
                placeItems: "center",
                minHeight: 320,
              }}
            >
              {qrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrImageUrl}
                  alt="VietQR"
                  style={{ width: "100%", maxWidth: 360, height: "auto", borderRadius: 12 }}
                />
              ) : (
                <div style={{ color: "#666" }}>Không tạo được ảnh QR (amount = 0).</div>
              )}
            </div>

            <div style={{ marginTop: 10, fontSize: 13, color: "#666", lineHeight: 1.6 }}>
              <div>
                <b>Ngân hàng:</b> {bankCode}
              </div>
              <div>
                <b>Số tài khoản:</b> {accountNumber}
              </div>
              <div>
                <b>Chủ tài khoản:</b> {accountName}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const card = {
  marginTop: 12,
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
};

