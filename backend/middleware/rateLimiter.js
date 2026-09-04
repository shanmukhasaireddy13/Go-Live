/**
 * In-Memory IP Rate Limiter Guard
 * Protects public endpoints from flooding and abuse.
 */
const rateLimitMap = new Map(); // ip -> { count: number, resetAt: number }
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 reqs/min per IP

function apiRateLimiter(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const now = Date.now();

  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "Too many requests. Please slow down and try again shortly.",
      retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
    });
  }

  next();
}

// Stale records cleanup every 10 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

if (cleanupInterval && typeof cleanupInterval.unref === "function") {
  cleanupInterval.unref();
}

module.exports = apiRateLimiter;
