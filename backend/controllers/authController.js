const axios = require("axios");
const mongoose = require("mongoose");
const Log = require("../models/Log");
const API = require("../config/api");
require("dotenv").config();

const asyncHandler = require("../utils/asyncHandler");
const { ValidationError, UnauthorizedError } = require("../errors/AppError");

const GITHUB_CLIENT_ID = (process.env.GITHUB_CLIENT_ID || "").trim();
const GITHUB_CLIENT_SECRET = (process.env.GITHUB_CLIENT_SECRET || "").trim();
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").trim();
const TARGET_REPO = (process.env.GITHUB_REPO || "shanmukhasaireddy13/Go-Live").trim();

const Subdomain = require("../models/Subdomain");
const userRepository = require("../repositories/UserRepository");
const auditLogRepository = require("../repositories/AuditLogRepository");

// In-memory active user session store
const userSessions = new Map();

/**
 * Helper: Safely build redirect URL with proper query separator
 */
function buildRedirectUrl(baseUrl, returnPath, queryKey, queryValue) {
  const cleanBase = (baseUrl || "").replace(/\/+$/, "");
  const cleanPath = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
  const sep = cleanPath.includes("?") ? "&" : "?";
  return `${cleanBase}${cleanPath}${sep}${queryKey}=${queryValue}`;
}

/**
 * Helper: Check if user has starred the target repository on GitHub
 * Uses official GitHub API: GET /user/starred/{owner}/{repo} (204 = Starred, 404 = Not Starred)
 */
async function checkGitHubStar(token, username) {
  if (!token && !username) return false;

  // 1. Direct authenticated star check
  if (token && typeof token === "string" && token.trim().length > 5) {
    try {
      const res = await axios.get(API.GITHUB.USER_STARRED_REPO(TARGET_REPO), {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "User-Agent": "Go-Live-App",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        validateStatus: (status) => status === 204 || status === 404,
      });
      if (res.status === 204) return true;
    } catch {
      try {
        const fallback = await axios.get(API.GITHUB.USER_STARRED_REPO(TARGET_REPO), {
          headers: {
            Authorization: `token ${token.trim()}`,
            "User-Agent": "Go-Live-App",
            Accept: "application/vnd.github+json",
          },
          validateStatus: (status) => status === 204 || status === 404,
        });
        if (fallback.status === 204) return true;
      } catch {}
    }
  }

  // 2. Direct public starred check for user if token is missing
  if (username) {
    try {
      const res = await axios.get(
        `https://api.github.com/users/${encodeURIComponent(username.trim())}/starred?per_page=100`,
        {
          headers: {
            "User-Agent": "Go-Live-App",
            Accept: "application/vnd.github+json",
          },
          timeout: 4000,
        }
      );
      if (Array.isArray(res.data)) {
        return res.data.some(
          (r) => r.full_name?.toLowerCase() === TARGET_REPO.toLowerCase()
        );
      }
    } catch {}
  }

  return false;
}

/**
 * 1. GET /api/auth/github/url
 * Returns GitHub OAuth authorization URL
 */
exports.getGithubAuthUrl = (req, res) => {
  const returnTo = req.query.returnTo || "/";
  const state = Buffer.from(JSON.stringify({ returnTo, ts: Date.now() })).toString("base64");

  if (!GITHUB_CLIENT_ID) {
    return res.json({
      authUrl: `${API.GITHUB.OAUTH_AUTHORIZE}?client_id=${GITHUB_CLIENT_ID}&scope=read:user,user:email,public_repo&state=${state}`,
      configured: false,
    });
  }

  const authUrl = `${API.GITHUB.OAUTH_AUTHORIZE}?client_id=${GITHUB_CLIENT_ID}&scope=read:user,user:email,public_repo&state=${state}`;
  return res.json({ authUrl, configured: true });
};

/**
 * 2. GET /api/auth/github/callback
 * Handles GitHub OAuth callback, checks star status directly, and syncs MongoDB immediately
 */
exports.handleGithubCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  let returnTo = "/";
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
      returnTo = parsed.returnTo || "/";
    } catch {}
  }

  if (error || !code) {
    return res.redirect(buildRedirectUrl(FRONTEND_URL, returnTo, "auth_error", encodeURIComponent(error || "No_code")));
  }

  try {
    // Exchange code for Access Token
    const tokenRes = await axios.post(
      API.GITHUB.OAUTH_ACCESS_TOKEN,
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      console.error("GitHub Token Error:", tokenRes.data);
      return res.redirect(buildRedirectUrl(FRONTEND_URL, returnTo, "auth_error", "token_exchange_failed"));
    }

    // Fetch user profile from GitHub API
    const userRes = await axios.get(API.GITHUB.USER, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Go-Live-App",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const ghUser = userRes.data;
    const hasStarred = await checkGitHubStar(accessToken, ghUser.login);

    const sessionData = {
      id: ghUser.id.toString(),
      username: ghUser.login,
      name: ghUser.name || ghUser.login,
      avatar: ghUser.avatar_url,
      accessToken,
      hasStarred,
      connectedAt: new Date().toISOString(),
    };

    // Sync star status directly to MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await Subdomain.updateMany(
          { userGithub: { $regex: new RegExp(`^${sessionData.username}$`, "i") }, isDeleted: false },
          { starredRepo: hasStarred }
        );
        // Persist User profile in User collection
        await userRepository.upsertFromGithub(ghUser, hasStarred);
      } catch {}
    }

    userSessions.set(sessionData.id, sessionData);

    // Audit Log in MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await auditLogRepository.record({
          action: "GITHUB_OAUTH_LOGIN",
          actor: sessionData.username,
          entityType: "AUTH",
          entityId: sessionData.id,
          status: "SUCCESS",
          details: { avatar: sessionData.avatar, hasStarred },
        });
      } catch (logErr) {}
    }

    const sessionPayload = encodeURIComponent(
      JSON.stringify({
        id: sessionData.id,
        username: sessionData.username,
        name: sessionData.name,
        avatar: sessionData.avatar,
        token: accessToken,
        hasStarred,
      })
    );

    return res.redirect(buildRedirectUrl(FRONTEND_URL, returnTo, "gh_session", sessionPayload));
  } catch (err) {
    console.error("GitHub Auth Error:", err.response?.data || err.message);
    return res.redirect(buildRedirectUrl(FRONTEND_URL, returnTo, "auth_error", "authentication_failed"));
  }
});

/**
 * 3. POST /api/auth/github/verify-star
 * Direct star verification endpoint with instant MongoDB synchronization
 */
exports.verifyStar = asyncHandler(async (req, res) => {
  const { token, username } = req.body;

  if (!token && !username) {
    throw new ValidationError("Missing GitHub credentials.");
  }

  const cleanUsername = (username || "").trim();
  const cleanToken = (token || "").trim();

  // Directly check GitHub star status
  const hasStarred = await checkGitHubStar(cleanToken, cleanUsername);

  // Sync to database immediately
  if (mongoose.connection.readyState === 1 && cleanUsername) {
    try {
      await Subdomain.updateMany(
        { userGithub: { $regex: new RegExp(`^${cleanUsername}$`, "i") }, isDeleted: false },
        { starredRepo: hasStarred }
      );
    } catch {}
  }

  if (hasStarred) {
    return res.json({ success: true, hasStarred: true, verified: true });
  }

  return res.json({
    success: false,
    hasStarred: false,
    message: `Star not found on ${TARGET_REPO} for @${cleanUsername || "you"}. Please star the repo on GitHub and try again!`,
  });
});

/**
 * 4. GET /api/auth/me
 */
exports.getCurrentUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ authenticated: false, message: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "");
  for (const session of userSessions.values()) {
    if (session.accessToken === token) {
      return res.json({ authenticated: true, user: session });
    }
  }

  return res.json({ authenticated: false, message: "Session expired or invalid" });
};
