const BaseRepository = require("./BaseRepository");
const Subdomain = require("../models/Subdomain");
const ReservedDomain = require("../models/ReservedDomain");
const { RESERVED_SUBDOMAINS, ROOT_DOMAIN } = require("../config/domains");

class SubdomainRepository extends BaseRepository {
  constructor() {
    super(Subdomain);
  }

  /**
   * Find active domain by subdomain name
   */
  async findActiveByName(name) {
    if (!name) return null;
    return this.model.findActiveByName(name);
  }

  /**
   * Find active domain for a GitHub username
   */
  async findActiveByUser(username) {
    if (!username) return null;
    return this.model.findActiveByUser(username);
  }

  /**
   * Comprehensive availability check against reserved lists and database
   */
  async checkAvailability(name) {
    const cleanName = (name || "").toLowerCase().trim();

    // 1. Static config reserved check
    if (RESERVED_SUBDOMAINS.includes(cleanName)) {
      return { isAvailable: false, isReserved: true, reason: "RESERVED_SYSTEM_NAME" };
    }

    // 2. Dynamic database reserved check
    const isDbReserved = await ReservedDomain.isReserved(cleanName);
    if (isDbReserved) {
      return { isAvailable: false, isReserved: true, reason: "RESERVED_SYSTEM_NAME" };
    }

    // 3. Database existing record check
    const existing = await this.model.findOne({ name: cleanName });
    if (!existing) {
      return { isAvailable: true, isReserved: false, isCooldown: false };
    }

    // If currently active and not deleted
    if (!existing.isDeleted) {
      return { isAvailable: false, isReserved: false, isCooldown: false, claimedBy: existing.userGithub };
    }

    // If released and still within cooldown period
    if (existing.isCooldownActive()) {
      return {
        isAvailable: false,
        isReserved: false,
        isCooldown: true,
        cooldownRemainingMinutes: existing.getCooldownRemainingMinutes(),
      };
    }

    // Released and cooldown expired -> Available for registration
    return { isAvailable: true, isReserved: false, isCooldown: false };
  }

  /**
   * Atomic claim/reclaim of a subdomain
   */
  async claimSubdomain({
    name,
    userGithub,
    userAvatar = "",
    target = "",
    recordType = "CNAME",
    proxied = false,
    cloudflareRecordId = null,
    provider = "vercel",
    providerMetadata = {},
    starredRepo = false,
  }) {
    const cleanName = name.toLowerCase().trim();
    const fullDomain = `${cleanName}.${ROOT_DOMAIN}`;

    const updatePayload = {
      name: cleanName,
      fullDomain,
      userGithub,
      userAvatar,
      target,
      recordType,
      proxied,
      cloudflareRecordId,
      cloudflareStatus: cloudflareRecordId ? "ACTIVE" : "NOT_CONFIGURED",
      provider,
      providerMetadata,
      status: "ACTIVE",
      starredRepo: Boolean(starredRepo),
      isDeleted: false,
      deletedAt: null,
      cooldownUntil: null,
      $push: {
        history: {
          action: "SUBDOMAIN_CLAIMED",
          performedBy: userGithub,
          details: { fullDomain, provider, target, recordType },
        },
      },
    };

    return this.model.findOneAndUpdate(
      { name: cleanName },
      updatePayload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Release subdomain with cooldown
   */
  async releaseSubdomain(name, userGithub, cooldownHours = 2) {
    const cleanName = name.toLowerCase().trim();
    const domain = await this.model.findOne({
      name: cleanName,
      userGithub: { $regex: new RegExp(`^${userGithub.trim()}$`, "i") },
      isDeleted: false,
    });

    if (!domain) return null;
    return domain.releaseSubdomain(cooldownHours, "USER_RELEASED");
  }

  /**
   * Update DNS routing & provider configuration
   */
  async updateRouting(name, userGithub, {
    target,
    recordType = "CNAME",
    proxied = false,
    cloudflareRecordId = null,
    provider = "custom",
    providerMetadata = {},
  }) {
    const domain = await this.model.findOne({
      name: name.toLowerCase().trim(),
      userGithub: { $regex: new RegExp(`^${userGithub.trim()}$`, "i") },
      isDeleted: false,
    });

    if (!domain) return null;

    return domain.attachProvider(
      provider,
      target,
      recordType,
      proxied,
      cloudflareRecordId,
      providerMetadata
    );
  }

  /**
   * Fetch social proof statistics (count + top recent claimed)
   */
  async getSocialProofStats(limit = 5) {
    const [totalClaimed, recentDomains] = await Promise.all([
      this.model.findClaimedCount(),
      this.model.findRecentClaimed(limit),
    ]);

    return {
      totalClaimed,
      domains: recentDomains.map((d) => ({
        name: d.name,
        fullDomain: d.fullDomain,
        claimedAt: d.createdAt,
      })),
    };
  }
}

module.exports = new SubdomainRepository();
