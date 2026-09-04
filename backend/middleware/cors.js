const { ForbiddenError } = require("../errors/AppError");
require("dotenv").config();

/**
 * Strict CORS Middleware
 * Restricts cross-origin requests exclusively to configured FRONTEND_URL and ALLOWED_ORIGINS.
 */
function getAllowedOrigins() {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").trim();
  const rootDomain = (process.env.ROOT_DOMAIN || "go-live.me").trim();
  const additionalOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const defaults = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    `https://${rootDomain}`,
    `https://www.${rootDomain}`,
    "https://go-live-app-omega.vercel.app",
  ];

  const originsSet = new Set([frontendUrl, ...defaults, ...additionalOrigins]);
  return Array.from(originsSet);
}

function strictCors(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  // Non-browser or same-origin requests (e.g., server-to-server, curl, test scripts)
  if (!origin) {
    return next();
  }

  // Check if origin is explicitly allowed or matches Vercel/Go-Live preview subdomains
  const isAllowed =
    allowedOrigins.includes(origin) ||
    /^https:\/\/[a-z0-9-]+-omega\.vercel\.app$/i.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.go-live\.me$/i.test(origin);

  if (isAllowed) {
    const requestedHeaders = req.headers["access-control-request-headers"];
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      requestedHeaders ||
        "Content-Type, Authorization, User-Agent, X-Requested-With, Accept, x-vercel-token, x-github-token, Cache-Control"
    );
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours cache for preflight

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    return next();
  }

  // Reject unauthorized origins with custom ForbiddenError
  return next(
    new ForbiddenError(`CORS Access Denied: Origin '${origin}' is not authorized to access this API.`)
  );
}

module.exports = strictCors;
module.exports.getAllowedOrigins = getAllowedOrigins;
