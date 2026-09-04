const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    hasStarred: {
      type: Boolean,
      default: false,
      index: true,
    },
    starredAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Instance Method: Update login session and timestamp
 */
UserSchema.methods.updateLoginSession = function (sessionData = {}) {
  this.lastLoginAt = new Date();
  if (sessionData.name) this.name = sessionData.name;
  if (sessionData.avatar) this.avatar = sessionData.avatar;
  if (sessionData.email) this.email = sessionData.email;
  if (typeof sessionData.hasStarred === "boolean") {
    this.hasStarred = sessionData.hasStarred;
    if (this.hasStarred && !this.starredAt) {
      this.starredAt = new Date();
    }
  }
  return this.save();
};

/**
 * Instance Method: Update star status
 */
UserSchema.methods.setStarred = function (hasStarred) {
  this.hasStarred = Boolean(hasStarred);
  if (this.hasStarred && !this.starredAt) {
    this.starredAt = new Date();
  }
  return this.save();
};

/**
 * Static Helper: Upsert user from GitHub OAuth profile
 */
UserSchema.statics.upsertFromGithub = async function (ghUser, hasStarred = false) {
  if (!ghUser || !ghUser.id) return null;

  const githubId = ghUser.id.toString();
  const username = (ghUser.login || "").toLowerCase().trim();

  let user = await this.findOne({ githubId });
  if (!user) {
    user = new this({
      githubId,
      username,
      name: ghUser.name || ghUser.login,
      avatar: ghUser.avatar_url || "",
      email: ghUser.email || "",
      hasStarred: Boolean(hasStarred),
      starredAt: hasStarred ? new Date() : null,
      lastLoginAt: new Date(),
    });
  } else {
    user.username = username;
    user.name = ghUser.name || user.name;
    user.avatar = ghUser.avatar_url || user.avatar;
    if (ghUser.email) user.email = ghUser.email;
    user.lastLoginAt = new Date();
    if (typeof hasStarred === "boolean") {
      user.hasStarred = hasStarred;
      if (hasStarred && !user.starredAt) user.starredAt = new Date();
    }
  }

  return user.save();
};

/**
 * Static Helper: Find user by case-insensitive GitHub username
 */
UserSchema.statics.findByUsername = function (username) {
  if (!username) return null;
  return this.findOne({
    username: username.toLowerCase().trim(),
  });
};

module.exports = mongoose.model("User", UserSchema);
