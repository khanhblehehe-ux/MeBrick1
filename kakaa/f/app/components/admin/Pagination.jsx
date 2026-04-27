"use client";

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const go = (p) => {
    const next = Math.min(totalPages, Math.max(1, p));
    onPageChange(next);
  };

  if (total <= pageSize) return null;

  const pagesToShow = getPages(page, totalPages);

  return (
    <div style={styles.wrap}>
      <button style={styles.btn} onClick={() => go(1)} disabled={page === 1}>
        «
      </button>
      <button style={styles.btn} onClick={() => go(page - 1)} disabled={page === 1}>
        ‹
      </button>

      {pagesToShow.map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} style={styles.dots}>
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            style={{
              ...styles.btn,
              background: p === page ? "#eef2ff" : "#fff",
              borderColor: p === page ? "#c7d2fe" : "#eee",
              fontWeight: p === page ? 800 : 600,
            }}
          >
            {p}
          </button>
        )
      )}

      <button style={styles.btn} onClick={() => go(page + 1)} disabled={page === totalPages}>
        ›
      </button>
      <button style={styles.btn} onClick={() => go(totalPages)} disabled={page === totalPages}>
        »
      </button>

      <div style={styles.meta}>
        Trang <b>{page}</b>/<b>{totalPages}</b> · Tổng <b>{total}</b>
      </div>
    </div>
  );
}

function getPages(page, totalPages) {
  // hiển thị: 1 ... (page-1 page page+1) ... total
  const set = new Set([1, totalPages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages));
  const arr = Array.from(set).sort((a, b) => a - b);

  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]);
    if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push("...");
  }
  return out;
}

const styles = {
  wrap: { display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" },
  btn: { padding: "8px 10px", borderRadius: 10, border: "1px solid #eee", background: "#fff", cursor: "pointer" },
  dots: { padding: "0 6px", color: "#999" },
  meta: { marginLeft: 6, color: "#555", fontSize: 13 },
};
