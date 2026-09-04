const subdomainRepository = require("../repositories/SubdomainRepository");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

// In-memory cache to prevent database load on frequent landing page visits
let cacheData = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL

/**
 * GET /api/social-proof
 * Public privacy-safe endpoint returning overall adoption stats and recent claims.
 */
exports.getSocialProof = asyncHandler(async (req, res) => {
  const now = Date.now();

  // Return cached result if still valid
  if (cacheData && now - cacheTimestamp < CACHE_TTL_MS) {
    return res.json(cacheData);
  }

  let totalClaimed = 0;
  let domains = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const stats = await subdomainRepository.getSocialProofStats(5);
      totalClaimed = stats.totalClaimed;
      domains = stats.domains.map((d) => ({
        fullDomain: d.fullDomain,
        claimedAt: d.claimedAt ? new Date(d.claimedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.warn("MongoDB Social Proof query notice:", err.message);
    }
  }

  const responsePayload = {
    success: true,
    stats: {
      totalClaimed,
    },
    domains,
  };

  // Cache response payload
  cacheData = responsePayload;
  cacheTimestamp = now;

  return res.json(responsePayload);
});

/**
 * Helper to clear cache (used in unit tests)
 */
exports.clearCache = exports._clearCache = () => {
  cacheData = null;
  cacheTimestamp = 0;
};
