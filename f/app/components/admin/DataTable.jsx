"use client";

export default function DataTable({ columns, rows, rowKey, actions }) {
  return (
    <div style={styles.card}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={styles.th}>{c.label}</th>
            ))}
            {actions ? <th style={styles.th}>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} style={styles.tr}>
              {columns.map((c) => (
                <td key={c.key} style={styles.td}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
              {actions ? <td style={styles.td}>{actions(r)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  card: { background: "#fff", border: "1px solid #eee", borderRadius: 14, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 12, fontSize: 13, color: "#444", background: "#fafafa", borderBottom: "1px solid #eee" },
  td: { padding: 12, borderBottom: "1px solid #f0f0f0", fontSize: 14, verticalAlign: "top" },
  tr: {},
};
