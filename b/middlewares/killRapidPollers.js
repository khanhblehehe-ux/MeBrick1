// killRapidPollers.js
// Middleware: aggressively detect rapid polling to GET /api/orders and block

const WINDOW_MS = 3000; // sliding window size (3 seconds)
const REQUIRED_CONSECUTIVE = 3; // number of requests inside window to trigger block
const BLOCK_FOR_MS = 10 * 60 * 1000; // block duration (10 minutes)

const requestTimes = new Map(); // key -> [timestamps]
const blacklist = new Map(); // key -> unblockTimestamp

function makeKey(req) {
  const ip = (req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(',')[0].trim();
  const ua = req.headers["user-agent"] || "ua";
  return `${ip}::${ua}`;
}

function shouldMonitor(req) {
  // only monitor GET requests to /api/orders (and subpaths)
  try {
    const method = (req.method || "").toUpperCase();
    const path = req.originalUrl || req.url || "";
    return method === "GET" && path.startsWith("/api/orders");
  } catch (e) {
    return false;
  }
}

module.exports = function killRapidPollers(req, res, next) {
  try {
    if (!shouldMonitor(req)) return next();

    const key = makeKey(req);
    const now = Date.now();

    // immediate reject if blacklisted
    const blockedUntil = blacklist.get(key);
    if (blockedUntil && blockedUntil > now) {
      try { res.status(429).send("Too many requests — temporarily blocked"); } catch (e) {}
      try { if (req.socket && typeof req.socket.destroy === "function") req.socket.destroy(); } catch (e) {}
      return;
    } else if (blockedUntil) {
      // expired
      blacklist.delete(key);
    }

    const times = requestTimes.get(key) || [];
    // push now and remove entries older than WINDOW_MS
    const cutoff = now - WINDOW_MS;
    const newTimes = times.filter((t) => t > cutoff);
    newTimes.push(now);
    requestTimes.set(key, newTimes);

    if (newTimes.length >= REQUIRED_CONSECUTIVE) {
      // trigger blacklist
      blacklist.set(key, now + BLOCK_FOR_MS);
      requestTimes.delete(key);
      console.warn(`[killRapidPollers] Blocking ${key} for ${BLOCK_FOR_MS}ms after ${newTimes.length} requests within ${WINDOW_MS}ms`);
      try { res.status(429).send("Too many requests — connection terminated"); } catch (e) {}
      try { if (req.socket && typeof req.socket.destroy === "function") req.socket.destroy(); } catch (e) {}
      return;
    }

    // lightweight eviction to avoid mem growth
    if (requestTimes.size > 20000) {
      const globalCutoff = Date.now() - 10 * 60 * 1000;
      for (const [k, v] of requestTimes.entries()) {
        if ((v[v.length - 1] || 0) < globalCutoff) requestTimes.delete(k);
      }
    }

    next();
  } catch (err) {
    console.error("killRapidPollers middleware error:", err && err.message);
    next();
  }
};
