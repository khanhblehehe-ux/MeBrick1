export function toMoneyVND(n) {
  const num = Number(n || 0);
  return num.toLocaleString("vi-VN") + " ₫";
}

export function safeJsonParse(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

export function exportOrdersToCSV(orders) {
  // Excel-friendly: UTF-8 BOM
  const bom = "\uFEFF";

  const header = [
    "id",
    "customer_name",
    "phone",
    "address",
    "total",
    "status",
    "created_at",
  ];

  const rows = orders.map((o) => [
    o.id,
    o.customer_name || "",
    o.phone || "",
    (o.address || "").replace(/\r?\n/g, " "),
    o.total ?? 0,
    o.status || "pending",
    o.created_at || "",
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export function printInvoice(order) {
  const items = safeJsonParse(order.items);
  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice #${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color:#111; }
    .top { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
    h1 { margin:0; font-size:20px; }
    .muted{ color:#666; font-size:12px; }
    .box{ border:1px solid #eee; border-radius:12px; padding:14px; margin-top:14px; }
    table{ width:100%; border-collapse:collapse; margin-top:10px; }
    th,td{ text-align:left; padding:10px; border-bottom:1px solid #eee; font-size:13px; }
    .right{ text-align:right; }
    @media print { .no-print{ display:none; } }
  </style>
</head>
<body>
  <div class="top">
    <div>
      <h1>Hoá đơn đơn hàng #${order.id}</h1>
      <div class="muted">Ngày: ${order.created_at || ""}</div>
      <div class="muted">Trạng thái: ${order.status || "pending"}</div>
    </div>
    <button class="no-print" onclick="window.print()" style="padding:10px 12px;border-radius:10px;border:1px solid #eee;background:#fff;cursor:pointer">
      In
    </button>
  </div>

  <div class="box">
    <b>Khách hàng</b>
    <div>${order.customer_name || "-"}</div>
    <div>${order.phone || "-"}</div>
    <div>${order.address || "-"}</div>
  </div>

  <div class="box">
    <b>Sản phẩm</b>
    <table>
      <thead>
        <tr>
          <th>Tên</th>
          <th class="right">SL</th>
          <th class="right">Giá</th>
          <th class="right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${
          items.length
            ? items
                .map((it) => {
                  const name = it.name || it.title || "Item";
                  const qty = Number(it.qty || it.quantity || 1);
                  const price = Number(it.price || 0);
                  return `<tr>
                    <td>${escapeHtml(name)}</td>
                    <td class="right">${qty}</td>
                    <td class="right">${toMoneyVND(price)}</td>
                    <td class="right">${toMoneyVND(price * qty)}</td>
                  </tr>`;
                })
                .join("")
            : `<tr><td colspan="4" class="muted">Không có items</td></tr>`
        }
      </tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin-top:10px;font-size:14px">
      <div><b>Tổng:</b> ${toMoneyVND(order.total || 0)}</div>
    </div>
  </div>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
