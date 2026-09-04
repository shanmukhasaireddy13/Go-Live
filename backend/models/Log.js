const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["DOMAIN_CLAIM", "DNS_SYNC", "VERCEL_CONNECT", "PROVISIONING_STEP", "EDGE_TELEMETRY", "AUDIT"],
      required: true,
      index: true,
    },
    subdomain: {
      type: String,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING", "WARNING"],
      default: "SUCCESS",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
    expireAfterSeconds: 60 * 60 * 24 * 90, // Auto-expire logs after 90 days
  }
);

module.exports = mongoose.model("Log", LogSchema);
