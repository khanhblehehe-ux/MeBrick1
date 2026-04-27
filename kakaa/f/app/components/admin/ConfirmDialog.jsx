"use client";

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div style={styles.backdrop} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ marginTop: 8, color: "#555" }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={onCancel} style={styles.btn}>Huỷ</button>
          <button onClick={onConfirm} style={styles.danger}>Xoá</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal: { width: 420, maxWidth: "90vw", background: "#fff", borderRadius: 14, padding: 16 },
  btn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #eee", background: "#fff", cursor: "pointer" },
  danger: { padding: "10px 12px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" },
};
