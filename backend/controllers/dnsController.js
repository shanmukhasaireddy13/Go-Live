const dns = require("dns").promises;
const { performance } = require("perf_hooks");
const axios = require("axios");
const mongoose = require("mongoose");
const Subdomain = require("../models/Subdomain");
const Log = require("../models/Log");

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "go-live.me";

/**
 * Perform a real DNS over HTTPS (DoH) query to an authoritative/anycast resolver
 */
async function queryDoH(url, hostname, type = "A") {
  const start = performance.now();
  try {
    const res = await axios.get(url, {
      params: { name: hostname, type },
      headers: { Accept: "application/dns-json" },
      timeout: 2500,
    });
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    const data = res.data;
    
    // Status 0 is NOERROR (success), 3 is NXDOMAIN (domain does not exist)
    if (data && data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) {
      const firstAnswer = data.Answer[0];
      const target = firstAnswer.data ? String(firstAnswer.data).replace(/\.$/, "") : "";
      return {
        resolved: true,
        status: "RESOLVED",
        responseValue: target || "Active",
        latencyMs,
      };
    }

    return {
      resolved: false,
      status: "PURGED",
      responseValue: "NXDOMAIN (DNS Purged / Not Found)",
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return {
      resolved: false,
      status: "UNREACHABLE",
      responseValue: "Offline (Unresolved)",
      latencyMs,
    };
  }
}

/**
 * Query local system DNS resolver
 */
async function queryLocalDns(hostname) {
  const start = performance.now();
  try {
    const cnames = await dns.resolveCname(hostname);
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return {
      resolved: true,
      status: "RESOLVED",
      responseValue: cnames[0] ? cnames[0].replace(/\.$/, "") : "Active",
      latencyMs,
    };
  } catch (e) {
    try {
      const ips = await dns.resolve4(hostname);
      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      return {
        resolved: true,
        status: "RESOLVED",
        responseValue: ips[0] || "Active",
        latencyMs,
      };
    } catch {
      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      return {
        resolved: false,
        status: "PURGED",
        responseValue: "None (DNS Record Purged)",
        latencyMs,
      };
    }
  }
}

/**
 * GET /api/dns/verify?name=<subdomain>
 * Real-time Anycast and Global DNS Verification
 */
exports.verifyDnsRecord = async (req, res) => {
  const name = (req.query.name || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
  const fullDomain = name ? `${name}.${ROOT_DOMAIN || "go-live.me"}` : (ROOT_DOMAIN || "go-live.me");

  // 1. Check real MongoDB state
  let isDeleted = false;
  let domainDoc = null;
  if (name) {
    try {
      domainDoc = await Subdomain.findOne({ name });
      if (domainDoc && (domainDoc.isDeleted || domainDoc.status === "RELEASED")) {
        isDeleted = true;
      }
    } catch (e) {}
  }

  // 2. Perform live, real-time DNS queries across global Anycast resolvers
  const [cfCheck, googleCheck, quad9Check, localCheck] = await Promise.all([
    queryDoH("https://cloudflare-dns.com/dns-query", fullDomain, "CNAME"),
    queryDoH("https://dns.google/resolve", fullDomain, "A"),
    queryDoH("https://dns.quad9.net/dns-query", fullDomain, "A"),
    queryLocalDns(fullDomain),
  ]);

  const nodes = [
    {
      nodeId: "node-cf-global",
      city: "Cloudflare Anycast",
      code: "CLOUDFLARE",
      country: "Global Edge",
      flag: "🌐",
      latencyMs: cfCheck.latencyMs,
      status: isDeleted ? "PURGED" : cfCheck.status,
      responseValue: isDeleted ? "None (DNS Purged)" : cfCheck.responseValue,
    },
    {
      nodeId: "node-google-dns",
      city: "Google Public DNS (8.8.8.8)",
      code: "GOOGLE",
      country: "Global Anycast",
      flag: "🇺🇸",
      latencyMs: googleCheck.latencyMs,
      status: isDeleted ? "PURGED" : googleCheck.status,
      responseValue: isDeleted ? "None (DNS Purged)" : googleCheck.responseValue,
    },
    {
      nodeId: "node-quad9-dns",
      city: "Quad9 Anycast (9.9.9.9)",
      code: "QUAD9",
      country: "Switzerland / Global",
      flag: "🇨🇭",
      latencyMs: quad9Check.latencyMs,
      status: isDeleted ? "PURGED" : quad9Check.status,
      responseValue: isDeleted ? "None (DNS Purged)" : quad9Check.responseValue,
    },
    {
      nodeId: "node-system-local",
      city: "Local Authoritative Resolver",
      code: "SYSTEM",
      country: "Local POP",
      flag: "⚡",
      latencyMs: localCheck.latencyMs,
      status: isDeleted ? "PURGED" : localCheck.status,
      responseValue: isDeleted ? "None (DNS Purged)" : localCheck.responseValue,
    },
  ];

  const anyResolved = nodes.some((n) => n.status === "RESOLVED");
  const isVerified = !isDeleted && anyResolved;

  if (mongoose.connection.readyState === 1) {
    try {
      await Log.create({
        type: "EDGE_TELEMETRY",
        subdomain: fullDomain,
        action: "REAL_DNS_VERIFY",
        status: isVerified ? "SUCCESS" : "OFFLINE",
        details: {
          isDeleted,
          verified: isVerified,
          nodes,
        },
      });
    } catch (err) {}
  }

  return res.json({
    subdomain: name,
    fullDomain,
    verified: isVerified,
    isDeleted,
    status: isDeleted ? "RELEASED" : isVerified ? "ACTIVE" : "OFFLINE",
    target: isDeleted ? "" : (domainDoc?.target || ""),
    nodes,
    syncedAt: new Date().toISOString(),
  });
};
