require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const normalizeOrigin = (origin) => String(origin || "").trim().replace(/\/+$/, "");
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);
const defaultOrigins = [
  "http://localhost:3000",
  "https://me-brick.vercel.app",
  "https://khakk.vercel.app",
  "https://mebricks.vn",
  "https://www.mebricks.vn",
];
const originAllowlist = [...new Set([...defaultOrigins, ...allowedOrigins].map(normalizeOrigin))];

console.log("Allowed origins:", originAllowlist);

// CORS configuration - must be before routes
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);
      console.log(`CORS request from: ${origin} (normalized: ${normalizedOrigin})`);

      const isAllowed = 
        originAllowlist.includes(normalizedOrigin) || 
        /\.vercel\.app$/.test(normalizedOrigin) ||
        /\.mebricks\.vn$/.test(normalizedOrigin) ||
        origin === "https://www.mebricks.vn" ||
        origin === "https://mebricks.vn";

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        callback(new Error("CORS Not Allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
    maxAge: 3600,
  })
);

// Explicitly handle preflight requests
app.options("*", cors());


// ✅ tăng limit để nhận base64 preview lớn
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// serve uploaded preview images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});
app.use("/api/designs", require("./routes/design.route"));

// routes
app.use("/api/products", require("./routes/product.route"));
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/orders", require("./routes/order.route"));
app.use("/api/admin", require("./routes/admin.route"));


// upload route
app.use("/api/uploads", require("./routes/upload.route"));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Backend running on http://localhost:${process.env.PORT || 5000}`);
});
