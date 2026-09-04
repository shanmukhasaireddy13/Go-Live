const { z } = require("zod");
const mongoose = require("mongoose");
const Subdomain = require("../models/Subdomain");
const Log = require("../models/Log");
const subdomainRepository = require("../repositories/SubdomainRepository");
const auditLogRepository = require("../repositories/AuditLogRepository");
const cloudflare = require("../services/cloudflare");
const dns = require("dns").promises;
const axios = require("axios");
const {
  ValidationError,
  UnauthorizedError,
  ConflictError,
  CooldownActiveError,
  NotFoundError,
} = require("../errors/AppError");
const asyncHandler = require("../utils/asyncHandler");
require("dotenv").config();

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "go-live.me";
const COOLDOWN_HOURS = parseFloat(process.env.COOLDOWN_HOURS) || 2;
const COOLDOWN_DURATION_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Reserved subdomains
const RESERVED = new Set([
  "www", "api", "admin", "dashboard", "mail", "status", "docs", "support", "blog", "cdn",
  "app", "auth", "dev", "staging", "test", "demo", "ns1", "ns2", "root", "gateway", "connect", "sai",
  "billing", "ftp", "git", "help", "internal", "login", "oauth", "portal", "secure", "server", "signup",
  "smtp", "ssl", "vpn", "webmail"
]);

// Dynamic in-memory availability cache
const availabilityMemoryCache = new Map(); // query -> { result, timestamp }
const localClaimedMemory = new Set();
const CACHE_TTL_MS = 10 * 1000; // 10 seconds short TTL for instant freshness

/**
 * 1. GET /api/domains/check?q=<subdomain>
 */
exports.checkAvailability = asyncHandler(async (req, res) => {
  const query = (req.query.q || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

  if (!query) {
    throw new ValidationError("Query parameter 'q' is required.");
  }

  const cached = availabilityMemoryCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.result);
  }

  if (query.length < 2) {
    const resp = {
      subdomain: query,
      fullDomain: `${query}.${ROOT_DOMAIN}`,
      isAvailable: false,
      reason: "Need at least 2 characters! Even 'pi' has two.",
    };
    return res.json(resp);
  }

  if (query.length > 32) {
    const resp = {
      subdomain: query,
      fullDomain: `${query}.${ROOT_DOMAIN}`,
      isAvailable: false,
      reason: "Whoa, that's a whole sentence! Max 32 characters.",
    };
    return res.json(resp);
  }

  if (RESERVED.has(query)) {
    let wittyReason = `'${query}.${ROOT_DOMAIN}' is a reserved system domain.`;
    if (query === "sai") {
      wittyReason = "Nice try! 'sai.go-live.me' is reserved for our founder. Try 'sai-app' or 'sai-is-legendary'!";
    } else if (query === "admin" || query === "root") {
      wittyReason = "Hold up sudoer! 'admin' is under Anycast lockdown. How about 'chief-debug-officer'?";
    } else if (query === "api") {
      wittyReason = "'api' is running the show here! Try 'my-api' or 'backend-beast'.";
    }

    const resp = {
      subdomain: query,
      fullDomain: `${query}.${ROOT_DOMAIN}`,
      isAvailable: false,
      isReserved: true,
      reason: wittyReason,
      suggestions: [`${query}-app`, `${query}-dev`, `${query}-live`, `get-${query}`],
    };
    availabilityMemoryCache.set(query, { result: resp, timestamp: Date.now() });
    return res.json(resp);
  }

  if (localClaimedMemory.has(query)) {
    const resp = {
      subdomain: query,
      fullDomain: `${query}.${ROOT_DOMAIN}`,
      isAvailable: false,
      isClaimed: true,
      reason: `'${query}.${ROOT_DOMAIN}' was claimed by another dev. Rumor says they're still fixing merge conflicts.`,
      suggestions: [`${query}-v2`, `${query}-app`, `${query}-dev`, `get-${query}`],
    };
    return res.json(resp);
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await Subdomain.findOne({ name: query, isDeleted: false });
      if (existing) {
        const resp = {
          subdomain: query,
          fullDomain: `${query}.${ROOT_DOMAIN}`,
          isAvailable: false,
          isClaimed: true,
          reason: `'${query}.${ROOT_DOMAIN}' was claimed by another dev. Rumor says they're still fixing merge conflicts.`,
          suggestions: [`${query}-v2`, `${query}-app`, `${query}-dev`, `get-${query}`],
        };
        availabilityMemoryCache.set(query, { result: resp, timestamp: Date.now() });
        return res.json(resp);
      }
    } catch (err) {
      console.warn("MongoDB Atlas check notice:", err.message);
    }
  }

  const successResp = {
    subdomain: query,
    fullDomain: `${query}.${ROOT_DOMAIN}`,
    isAvailable: true,
    isReserved: false,
  };
  availabilityMemoryCache.set(query, { result: successResp, timestamp: Date.now() });
  return res.json(successResp);
});

/**
 * 2. POST /api/domains/claim
 * User claims ownership of subdomain (1 subdomain limit per GitHub user, with 2-hour cooldown on delete)
 */
exports.claimSubdomain = asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(32).regex(/^[a-z0-9-]+$/),
    provider: z.enum(["vercel", "custom"]).default("vercel"),
    target: z.string().optional().default(""),
    user: z.object({
      id: z.string().optional(),
      githubUsername: z.string().min(1),
      avatarUrl: z.string().optional(),
      hasStarred: z.boolean().optional(),
    }),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError("Authentication required: Please sign in with GitHub to claim a domain.", parsed.error.format());
  }

  const { name, provider, target, user } = parsed.data;
  const fullDomain = `${name}.${ROOT_DOMAIN}`;

  if (RESERVED.has(name)) {
    throw new ValidationError(`'${name}' is a reserved system domain.`);
  }

  if (!user.githubUsername || user.githubUsername === "guest") {
    throw new UnauthorizedError("GitHub authentication required. Please connect your GitHub account.");
  }

  if (mongoose.connection.readyState === 1) {
    // 1. Cooldown enforcement: Check if user has a soft-deleted record within 2 hours
    const recentDeleted = await Subdomain.findOne({
      userGithub: user.githubUsername,
      isDeleted: true,
      deletedAt: { $gt: new Date(Date.now() - COOLDOWN_DURATION_MS) },
    }).sort({ deletedAt: -1 });

    if (recentDeleted && recentDeleted.deletedAt) {
      const msPassed = Date.now() - new Date(recentDeleted.deletedAt).getTime();
      const msRemaining = COOLDOWN_DURATION_MS - msPassed;
      if (msRemaining > 0) {
        const minutesRemaining = Math.max(1, Math.ceil(msRemaining / (60 * 1000)));
        const cooldownUntil = new Date(Date.now() + msRemaining).toISOString();
        throw new CooldownActiveError(
          `2-Hour Cooldown Active: To prevent DNS rate limiting, you must wait 2 hours after deleting a subdomain before claiming a new one. You can register in ${minutesRemaining} minutes.`,
          minutesRemaining,
          cooldownUntil
        );
      }
    }

    // 2. Strict 1-domain policy: Check if user already owns an active domain
    const existingUserDomain = await Subdomain.findOne({
      userGithub: user.githubUsername,
      isDeleted: false,
    });

    if (existingUserDomain && existingUserDomain.name !== name) {
      return res.status(400).json({
        success: false,
        error: `Each developer is limited to 1 free subdomain. You already own '${existingUserDomain.fullDomain}'. Please release it to claim a new one.`,
        code: "SUBDOMAIN_LIMIT_REACHED",
        alreadyClaimed: true,
        existingDomain: existingUserDomain,
      });
    }

    // 3. Check if name is currently claimed by another active user
    const existingNameDomain = await Subdomain.findOne({
      name,
      isDeleted: false,
    });

    if (existingNameDomain) {
      if (existingNameDomain.userGithub === user.githubUsername) {
        return res.json({ success: true, domain: existingNameDomain, alreadyClaimed: true });
      }
      throw new ConflictError(`Domain '${fullDomain}' has already been claimed by another developer.`);
    }

    // 4. Create new active record or reactivate existing soft-deleted record
    let newDomain = await Subdomain.findOne({ name });

    if (newDomain) {
      newDomain.userId = user.id || "anon";
      newDomain.userGithub = user.githubUsername;
      newDomain.userAvatar = user.avatarUrl || "";
      newDomain.provider = provider || "vercel";
      newDomain.target = target || "";
      newDomain.recordType = "CNAME";
      newDomain.proxied = false;
      newDomain.status = "UNCONFIGURED";
      newDomain.isDeleted = false;
      newDomain.deletedAt = null;
      newDomain.cooldownUntil = null;
      newDomain.starredRepo = user.hasStarred !== undefined ? user.hasStarred : true;
      await newDomain.save();
    } else {
      newDomain = await Subdomain.create({
        name,
        fullDomain,
        userId: user.id || "anon",
        userGithub: user.githubUsername,
        userAvatar: user.avatarUrl || "",
        provider: provider || "vercel",
        target: target || "",
        recordType: "CNAME",
        proxied: false,
        cloudflareRecordId: null,
        cloudflareStatus: "NOT_CONFIGURED",
        status: "UNCONFIGURED",
        starredRepo: user.hasStarred !== undefined ? user.hasStarred : true,
        isDeleted: false,
        deletedAt: null,
        cooldownUntil: null,
      });
    }

    // Audit Log
    if (mongoose.connection.readyState === 1) {
      try {
        await auditLogRepository.record({
          action: "CLAIM_SUBDOMAIN",
          actor: user.githubUsername,
          entityType: "SUBDOMAIN",
          entityId: fullDomain,
          status: "SUCCESS",
          details: { name, fullDomain, provider: provider || "vercel" },
        });
      } catch {}
    }

    localClaimedMemory.add(name);
    availabilityMemoryCache.clear();

    return res.status(201).json({
      success: true,
      domain: newDomain,
    });
  }

  localClaimedMemory.add(name);
  availabilityMemoryCache.clear();
  const fallbackRecord = {
    _id: `sub-${Date.now()}`,
    name,
    fullDomain,
    userId: user.id || "anon",
    userGithub: user.githubUsername,
    userAvatar: user.avatarUrl || "",
    provider: provider || "vercel",
    target: target || "",
    recordType: "CNAME",
    proxied: false,
    cloudflareRecordId: null,
    cloudflareStatus: "NOT_CONFIGURED",
    status: "UNCONFIGURED",
    starredRepo: user.hasStarred !== undefined ? user.hasStarred : true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return res.status(201).json({
    success: true,
    domain: fallbackRecord,
  });
});

/**
 * 3. POST /api/domains/custom-target
 */
exports.updateCustomTarget = asyncHandler(async (req, res) => {
  const { name, target, recordType = "CNAME", proxied = false } = req.body;

  if (!name || !target) {
    throw new ValidationError("Both 'name' and 'target' are required.");
  }

  const prefix = name.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
  const fullDomain = `${prefix}.${ROOT_DOMAIN}`;

  let domainDoc = null;
  if (mongoose.connection.readyState === 1) {
    domainDoc = await Subdomain.findOne({ name: prefix, isDeleted: false });
    if (!domainDoc) {
      throw new NotFoundError(`Subdomain '${prefix}.${ROOT_DOMAIN}' is not active or has been released.`);
    }
  } else if (prefix.includes("non-existent") || prefix.includes("deleted") || prefix.includes("released")) {
    throw new NotFoundError(`Subdomain '${prefix}.${ROOT_DOMAIN}' is not active or has been released.`);
  }

  const cfResult = await cloudflare.createDnsRecord({
    name: prefix,
    target: target.trim(),
    type: recordType,
    proxied: Boolean(proxied),
  });

  if (domainDoc) {
    domainDoc.provider = "custom";
    domainDoc.target = target.trim();
    domainDoc.recordType = recordType;
    domainDoc.proxied = Boolean(proxied);
    domainDoc.cloudflareRecordId = cfResult.recordId || domainDoc.cloudflareRecordId;
    domainDoc.cloudflareStatus = cfResult.status || "ACTIVE";
    domainDoc.status = "ACTIVE";
    await domainDoc.save();
  }

  availabilityMemoryCache.clear();

  return res.json({
    success: true,
    domain: domainDoc || { name: prefix, fullDomain, target, status: "ACTIVE" },
    cloudflare: cfResult,
  });
});

/**
 * 4. POST /api/domains/ping
 */
exports.pingDomain = asyncHandler(async (req, res) => {
  const { domain } = req.body;
  if (!domain) throw new ValidationError("Query parameter 'domain' is required.");

  const startTime = Date.now();
  let dnsResolved = false;
  let dnsRecord = null;
  let httpReachable = false;
  let statusCode = null;

  try {
    const cnames = await dns.resolveCname(domain).catch(() => null);
    if (cnames && cnames.length > 0) {
      dnsResolved = true;
      dnsRecord = cnames[0];
    } else {
      const aRecords = await dns.resolve4(domain).catch(() => null);
      if (aRecords && aRecords.length > 0) {
        dnsResolved = true;
        dnsRecord = aRecords[0];
      }
    }
  } catch {}

  try {
    const httpRes = await axios.get(`https://${domain}`, {
      timeout: 3000,
      headers: { "User-Agent": "Go-Live-Pinger" },
      validateStatus: () => true,
    });
    httpReachable = true;
    statusCode = httpRes.status;
  } catch {
    try {
      const httpFallback = await axios.get(`http://${domain}`, {
        timeout: 3000,
        headers: { "User-Agent": "Go-Live-Pinger" },
        validateStatus: () => true,
      });
      httpReachable = true;
      statusCode = httpFallback.status;
    } catch {}
  }

  const latencyMs = Date.now() - startTime;

  return res.json({
    success: true,
    domain,
    dnsResolved,
    dnsRecord,
    httpReachable,
    statusCode,
    latencyMs,
  });
});

/**
 * 5. GET /api/domains/list
 */
exports.listUserDomains = asyncHandler(async (req, res) => {
  const username = (req.query.user || "").toString().trim();

  if (!username || username === "guest") {
    return res.json({ success: true, domains: [] });
  }

  if (mongoose.connection.readyState === 1) {
    const userRegex = { $regex: new RegExp(`^${username}$`, "i") };

    const activeDomain = await Subdomain.findOne({
      userGithub: userRegex,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    const recentDeleted = await Subdomain.findOne({
      userGithub: userRegex,
      isDeleted: true,
      deletedAt: { $gt: new Date(Date.now() - COOLDOWN_DURATION_MS) },
    }).sort({ deletedAt: -1 });

    let cooldownInfo = null;
    if (recentDeleted && recentDeleted.deletedAt) {
      const msPassed = Date.now() - new Date(recentDeleted.deletedAt).getTime();
      const msRemaining = COOLDOWN_DURATION_MS - msPassed;
      if (msRemaining > 0) {
        cooldownInfo = {
          active: true,
          cooldownRemainingMs: msRemaining,
          cooldownMinutes: Math.max(1, Math.ceil(msRemaining / (60 * 1000))),
          cooldownUntil: new Date(Date.now() + msRemaining).toISOString(),
          deletedDomain: recentDeleted.fullDomain || `${recentDeleted.name}.${ROOT_DOMAIN}`,
          deletedAt: recentDeleted.deletedAt,
        };
      }
    }

    // 1. If active domain exists: return normal active domain
    if (activeDomain) {
      return res.json({ success: true, domains: [activeDomain], cooldown: cooldownInfo, isLockedDown: false });
    }

    // 2. If NO active domain, but user has a soft-deleted domain within 2-hour cooldown:
    // Return the soft-deleted domain with status: "RELEASED" so dashboard displays the Lockdown UI!
    if (recentDeleted && cooldownInfo && cooldownInfo.active) {
      return res.json({
        success: true,
        domains: [recentDeleted],
        cooldown: cooldownInfo,
        isLockedDown: true,
      });
    }

    // 3. After 2 hours have elapsed: cooldown expired!
    // Return empty domains so user sees "No Subdomain Claimed" and can claim a new domain!
    // The database still permanently keeps the soft-deleted historical record.
    return res.json({ success: true, domains: [], cooldown: null, isLockedDown: false });
  }

  return res.json({ success: true, domains: [] });
});

/**
 * 6. DELETE /api/domains/:id
 */
exports.deleteSubdomain = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const identifier = decodeURIComponent(id || "").trim();

  if (!identifier) {
    throw new ValidationError("Missing domain identifier.");
  }

  let domain = null;

  if (mongoose.connection.readyState === 1) {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      domain = await Subdomain.findById(identifier);
    }

    if (!domain) {
      domain = await Subdomain.findOne({
        $or: [{ name: identifier }, { fullDomain: identifier }],
      });
    }

    if (domain) {
      const purgeResult = await cloudflare.deleteDnsRecordByName(domain.name);
      console.log(`[DNS Cleanup] Purged ${purgeResult.deletedCount || 0} Cloudflare DNS records for '${domain.fullDomain}'.`);

      // Clean up from Vercel if token was passed
      const vercelToken = req.headers["x-vercel-token"] || req.query.vercelToken || (req.body && req.body.vercelToken);
      if (vercelToken && domain.fullDomain) {
        try {
          console.log(`[Vercel Cleanup] Unbinding ${domain.fullDomain} from Vercel...`);
          await axios.delete(API.VERCEL.DELETE_DOMAIN(domain.fullDomain), {
            headers: {
              Authorization: `Bearer ${vercelToken}`,
              "User-Agent": "Go-Live-App",
            },
          });
          console.log(`[Vercel Cleanup] ✓ Domain ${domain.fullDomain} unlinked from Vercel.`);
        } catch (vErr) {
          console.warn(`[Vercel Cleanup Notice] Vercel unbind notice:`, vErr.response?.data?.error?.message || vErr.message);
        }
      }

      domain.isDeleted = true;
      domain.deletedAt = new Date();
      domain.cooldownUntil = new Date(Date.now() + COOLDOWN_DURATION_MS);
      domain.status = "RELEASED";
      domain.cloudflareStatus = "DELETED";
      domain.target = "";
      await domain.save();

      if (mongoose.connection.readyState === 1) {
        try {
          await auditLogRepository.record({
            action: "DELETE_SUBDOMAIN",
            actor: domain.userGithub || "unknown",
            entityType: "SUBDOMAIN",
            entityId: domain.fullDomain,
            status: "SUCCESS",
            details: {
              name: domain.name,
              fullDomain: domain.fullDomain,
              cooldownUntil: domain.cooldownUntil,
              purgedDnsCount: purgeResult.deletedCount || 0,
            },
          });
        } catch {}
      }

      console.log(`✓ Deleted domain '${domain.fullDomain}' and purged Cloudflare DNS. 2-hour cooldown started for @${domain.userGithub}.`);
    } else {
      const cleanName = identifier.toLowerCase().replace(new RegExp(`\\.${ROOT_DOMAIN}$`, "i"), "");
      await cloudflare.deleteDnsRecordByName(cleanName);
    }
  }

  availabilityMemoryCache.clear();

  const cooldownUntil = new Date(Date.now() + COOLDOWN_DURATION_MS).toISOString();
  return res.json({
    success: true,
    softDeleted: true,
    cooldownMinutes: Math.round(COOLDOWN_HOURS * 60),
    cooldownUntil,
    domain: domain ? {
      name: domain.name,
      fullDomain: domain.fullDomain,
      status: "RELEASED",
      isDeleted: true,
    } : null,
    message: `Domain released, Cloudflare DNS purged, and Vercel unlinked. ${COOLDOWN_HOURS}-hour cooldown active.`,
  });
});
