const mongoose = require("mongoose");

const ReservedDomainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["SYSTEM", "SECURITY", "BRAND", "INFRASTRUCTURE"],
      default: "SYSTEM",
    },
    reason: {
      type: String,
      default: "Reserved system namespace",
    },
    reservedBy: {
      type: String,
      default: "SYSTEM",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * Static Helper: Check if domain name is in reserved database
 */
ReservedDomainSchema.statics.isReserved = async function (name) {
  if (!name) return false;
  const match = await this.findOne({
    name: name.toLowerCase().trim(),
    isActive: true,
  });
  return Boolean(match);
};

/**
 * Static Helper: Reserve a new name
 */
ReservedDomainSchema.statics.reserve = function (name, category = "SYSTEM", reason = "", reservedBy = "SYSTEM") {
  return this.findOneAndUpdate(
    { name: name.toLowerCase().trim() },
    { name: name.toLowerCase().trim(), category, reason, reservedBy, isActive: true },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model("ReservedDomain", ReservedDomainSchema);
