const mongoose = require("mongoose");

const SubdomainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullDomain: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: "guest",
    },
    userGithub: {
      type: String,
      default: "guest",
      index: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["vercel", "github-pages", "render", "custom", "none"],
      default: "vercel",
    },
    providerMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    target: {
      type: String,
      default: "",
    },
    recordType: {
      type: String,
      enum: ["CNAME", "A", "AAAA", "TXT"],
      default: "CNAME",
    },
    proxied: {
      type: Boolean,
      default: false,
    },
    cloudflareRecordId: {
      type: String,
      default: null,
    },
    cloudflareStatus: {
      type: String,
      enum: ["NOT_CONFIGURED", "PENDING", "ACTIVE", "SKIPPED", "ERROR", "RELEASED", "DELETED"],
      default: "NOT_CONFIGURED",
    },
    status: {
      type: String,
      enum: ["UNCONFIGURED", "ACTIVE", "PAUSED", "SUSPENDED", "RELEASED"],
      default: "UNCONFIGURED",
    },
    description: {
      type: String,
      default: "Free wildcard developer subdomain",
    },
    starredRepo: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    cooldownUntil: {
      type: Date,
      default: null,
    },
    history: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, default: "system" },
        timestamp: { type: Date, default: Date.now },
        details: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for high-throughput queries & social proof
SubdomainSchema.index({ isDeleted: 1, createdAt: -1 });
SubdomainSchema.index({ userGithub: 1, isDeleted: 1 });
SubdomainSchema.index({ name: 1, isDeleted: 1 });
SubdomainSchema.index({ isDeleted: 1, starredRepo: 1, createdAt: -1 });

/**
 * Instance Method: Check if subdomain cooldown is currently active
 */
SubdomainSchema.methods.isCooldownActive = function () {
  if (!this.cooldownUntil) return false;
  return new Date() < new Date(this.cooldownUntil);
};

/**
 * Instance Method: Get remaining cooldown time in minutes
 */
SubdomainSchema.methods.getCooldownRemainingMinutes = function () {
  if (!this.isCooldownActive()) return 0;
  const diffMs = new Date(this.cooldownUntil).getTime() - Date.now();
  return Math.max(1, Math.ceil(diffMs / (60 * 1000)));
};

/**
 * Instance Method: Release subdomain cleanly with cooldown
 */
SubdomainSchema.methods.releaseSubdomain = function (cooldownHours = 2, reason = "USER_RELEASED") {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = "RELEASED";
  this.cloudflareStatus = "RELEASED";
  this.cooldownUntil = new Date(Date.now() + cooldownHours * 60 * 60 * 1000);
  this.history.push({
    action: "SUBDOMAIN_RELEASED",
    performedBy: this.userGithub || "system",
    details: { reason, cooldownHours, cooldownUntil: this.cooldownUntil },
  });
  return this.save();
};

/**
 * Instance Method: Attach a hosting provider configuration
 */
SubdomainSchema.methods.attachProvider = function (
  providerName,
  target,
  recordType = "CNAME",
  proxied = false,
  cloudflareRecordId = null,
  metadata = {}
) {
  this.provider = providerName;
  this.target = target;
  this.recordType = recordType;
  this.proxied = proxied;
  if (cloudflareRecordId) {
    this.cloudflareRecordId = cloudflareRecordId;
    this.cloudflareStatus = "ACTIVE";
  }
  this.providerMetadata = { ...(this.providerMetadata || {}), ...metadata };
  this.status = "ACTIVE";
  this.history.push({
    action: "PROVIDER_ATTACHED",
    performedBy: this.userGithub || "system",
    details: { provider: providerName, target, recordType, proxied, cloudflareRecordId },
  });
  return this.save();
};

/**
 * Static Helper: Find active domain by exact name (case-insensitive)
 */
SubdomainSchema.statics.findActiveByName = function (name) {
  if (!name) return null;
  return this.findOne({
    name: name.toLowerCase().trim(),
    isDeleted: false,
  });
};

/**
 * Static Helper: Find active domain for a GitHub username (case-insensitive)
 */
SubdomainSchema.statics.findActiveByUser = function (username) {
  if (!username) return null;
  return this.findOne({
    userGithub: { $regex: new RegExp(`^${username.trim()}$`, "i") },
    isDeleted: false,
  });
};

/**
 * Static Helper: Get total claimed active domain count for social proof
 */
SubdomainSchema.statics.findClaimedCount = function () {
  return this.countDocuments({ isDeleted: false });
};

/**
 * Static Helper: Find recent claimed domains for social proof banner (sanitized projection)
 */
SubdomainSchema.statics.findRecentClaimed = function (limit = 5) {
  return this.find(
    { isDeleted: false, starredRepo: true },
    { name: 1, fullDomain: 1, createdAt: 1, _id: 0 }
  )
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model("Subdomain", SubdomainSchema);
