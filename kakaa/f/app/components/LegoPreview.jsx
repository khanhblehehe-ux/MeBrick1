"use client";

export default function LegoPreview({ body, clothes, face, hair }) {
  return (
    <div
      style={{
        position: "relative",
        width: 180,
        height: 260
      }}
    >
      {/* BODY */}
      <img
        src={body}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          left: 0,
          top: 0
        }}
      />

      {/* CLOTHES */}
      {clothes && (
        <img
          src={clothes}
          style={{
            position: "absolute",
            width: "100%",
            left: 0,
            top: "35%"
          }}
        />
      )}

      {/* FACE */}
      {face && (
        <img
          src={face}
          style={{
            position: "absolute",
            width: "38%",
            left: "31%",
            top: "22%"
          }}
        />
      )}

      {/* HAIR */}
      {hair && (
        <img
          src={hair}
          style={{
            position: "absolute",
            width: "50%",
            left: "25%",
            top: "10%"
          }}
        />
      )}
    </div>
  );
}
