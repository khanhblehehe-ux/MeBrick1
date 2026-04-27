"use client";

export default function LayerPreview({ layer, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "60px",
        height: "60px",
        backgroundColor: "#f8f9fa",
        backgroundImage: layer.thumbnail ? `url(${layer.thumbnail})` : "none",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderRadius: "8px",
        border: `2px solid ${isActive ? "#007bff" : "#ddd"}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
      title={layer.name}
    >
      {!layer.thumbnail && (
        <span style={{ fontSize: "12px", textAlign: "center", padding: "4px" }}>
          {layer.name}
        </span>
      )}
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "12px",
            height: "12px",
            backgroundColor: "#007bff",
            borderRadius: "50%",
            border: "1px solid white",
          }}
        />
      )}
    </div>
  );
}
