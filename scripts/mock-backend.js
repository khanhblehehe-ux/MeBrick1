#!/usr/bin/env node
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// In-memory state to simulate orders
const orders = new Map();

function makeOrder(id) {
  const o = {
    id: id,
    payment_status: "unpaid",
    total_amount: 199000,
    customer_name: "Mock Customer",
  };
  orders.set(String(id), o);
  return o;
}

app.get("/", (req, res) => res.send("Mock backend running"));

// GET /api/orders/:id
app.get("/api/orders/:id", (req, res) => {
  const id = req.params.id;
  let o = orders.get(String(id));
  if (!o) o = makeOrder(id);
  return res.json(o);
});

// GET /api/orders/:id/vietqr
app.get("/api/orders/:id/vietqr", (req, res) => {
  const id = req.params.id;
  let o = orders.get(String(id));
  if (!o) o = makeOrder(id);
  return res.json({ orderId: o.id, amount: o.total_amount, memo: `Mock order ${o.id}`, paymentStatus: o.payment_status });
});

// POST /api/uploads/base64 - accept large base64 payload and return size
app.post("/api/uploads/base64", (req, res) => {
  const { dataUrl } = req.body || {};
  if (!dataUrl || typeof dataUrl !== "string") return res.status(400).json({ message: "Invalid dataUrl" });
  const m = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!m) return res.status(400).json({ message: "Invalid dataUrl" });
  const b64 = m[2];
  const bytes = Buffer.from(b64, "base64");
  // pretend we uploaded and return a fake URL
  return res.json({ url: `http://localhost:${process.env.PORT||5000}/uploads/mock-${Date.now()}.png`, bytes: bytes.length });
});

// GET /api/media/large.bin - serve a large binary to simulate heavy downloads
app.get("/api/media/large.bin", (req, res) => {
  const sizeMb = Number(req.query.mb || 2);
  const bytes = sizeMb * 1024 * 1024;
  // stream a buffer of zeros without allocating huge array at once
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", String(bytes));
  const chunk = Buffer.alloc(1024 * 64, 0);
  let sent = 0;
  function sendChunk() {
    if (sent >= bytes) return res.end();
    const remaining = Math.min(chunk.length, bytes - sent);
    res.write(chunk.slice(0, remaining), () => {
      sent += remaining;
      setImmediate(sendChunk);
    });
  }
  sendChunk();
});

// Simple endpoint to flip payment_status to paid (useful for tests)
app.post("/api/orders/:id/mark-paid", (req, res) => {
  const id = req.params.id;
  let o = orders.get(String(id));
  if (!o) o = makeOrder(id);
  o.payment_status = "paid";
  orders.set(String(id), o);
  return res.json(o);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Mock backend listening http://localhost:${port}`));
