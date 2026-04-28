// killRapidPollers.js
// Middleware: detect rapid polling to /api/orders and terminate connection

const WINDOW_MS = 3000; // threshold per request (3 seconds)
const REQUIRED_CONSECUTIVE = 3; // number of consecutive fast requests to trigger kill

// Simple in-memory map: key -> { lastTs, consecutive }
// Keying by IP + user-agent to be a bit more specific
const clients = new Map();

function makeKey(req) {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "ua";
  return `${ip}::${ua}`;
}

module.exports = function killRapidPollers(req, res, next) {
  try {
    const key = makeKey(req);
    const now = Date.now();
    const entry = clients.get(key) || { lastTs: 0, consecutive: 0 };
    const delta = now - (entry.lastTs || 0);

    if (delta <= WINDOW_MS) {
      entry.consecutive = (entry.consecutive || 0) + 1;
    } else {
      entry.consecutive = 0;
    }
    entry.lastTs = now;
    clients.set(key, entry);

    if (entry.consecutive >= REQUIRED_CONSECUTIVE) {
      console.warn(`[killRapidPollers] Killing connection for ${key} after ${entry.consecutive} fast requests (delta=${delta}ms)`);
      // try respond with 429 then destroy socket
      try {
        res.status(429).send("Too many requests — connection terminated");
      } catch (e) {}
      try {
        // destroy underlying socket to stop egress immediately
        if (req.socket && typeof req.socket.destroy === "function") req.socket.destroy();
      } catch (e) {}
      // also clear entry to avoid repeated kills
      clients.delete(key);
      return; // do not call next()
    }

    // clean up old entries periodically (simple eviction)
    if (clients.size > 20000) {
      // remove entries older than 10 minutes
      const cutoff = Date.now() - 10 * 60 * 1000;
      for (const [k, v] of clients.entries()) {
        if ((v.lastTs || 0) < cutoff) clients.delete(k);
      }
    }

    next();
  } catch (err) {
    console.error("killRapidPollers middleware error:", err && err.message);
    next();
  }
};
