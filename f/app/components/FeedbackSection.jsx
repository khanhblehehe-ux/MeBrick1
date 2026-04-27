"use client";

export default function FeedbackSection() {
  const feedbackImages = [
    "/feedback/fb1.jpg",
    "/feedback/fb2.jpg",
    "/feedback/fb3.jpg",
  ];

  return (
    <section style={{ padding: "80px 20px", backgroundColor: "#ffffff" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "36px",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "50px",
            color: "#0B2D72",
            fontFamily: "'Antonio', sans-serif",
            textTransform: "uppercase",
            textShadow: "3px 4px 10px rgba(0,102,197,0.18)",
          }}
        >
          Khách hàng nói gì về Mê Bricks
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
          }}
        >
          {feedbackImages.map((src, index) => (
            <div
              key={index}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                background: "#fff",
                aspectRatio: "1 / 1",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 15px 35px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(0,0,0,0.08)";
              }}
            >
              <img
                src={src}
                alt={`Feedback ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

