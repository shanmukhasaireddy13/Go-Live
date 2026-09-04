const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    actor: {
      type: String,
      default: "SYSTEM",
      index: true,
    },
    entityType: {
      type: String,
      enum: ["SUBDOMAIN", "DNS", "USER", "PROVIDER", "AUTH", "SYSTEM"],
      default: "SYSTEM",
      index: true,
    },
    entityId: {
      type: String,
      default: "",
      index: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "WARNING"],
      default: "SUCCESS",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for audit querying and security analysis
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ actor: 1, timestamp: -1 });

/**
 * Static Helper: Record an immutable audit log entry
 */
AuditLogSchema.statics.record = async function ({
  action,
  actor = "SYSTEM",
  entityType = "SYSTEM",
  entityId = "",
  status = "SUCCESS",
  details = {},
  ipAddress = "",
  userAgent = "",
}) {
  try {
    return await this.create({
      action,
      actor,
      entityType,
      entityId,
      status,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("[AuditLog] Failed to persist audit log entry:", err.message);
    return null;
  }
};

/**
 * Static Helper: Query recent logs for an entity
 */
AuditLogSchema.statics.findRecentByEntity = function (entityType, entityId, limit = 20) {
  return this.find({ entityType, entityId }).sort({ timestamp: -1 }).limit(limit);
};

/**
 * Static Helper: Query recent logs by actor
 */
AuditLogSchema.statics.findRecentByActor = function (actor, limit = 20) {
  return this.find({ actor: { $regex: new RegExp(`^${actor}$`, "i") } })
    .sort({ timestamp: -1 })
    .limit(limit);
};

module.exports = mongoose.model("AuditLog", AuditLogSchema);
