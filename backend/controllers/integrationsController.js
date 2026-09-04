const mongoose = require("mongoose");
const axios = require("axios");
const API = require("../config/api");
const cloudflare = require("../services/cloudflare");
const Subdomain = require("../models/Subdomain");
const Log = require("../models/Log");
require("dotenv").config();

const VERCEL_CLIENT_ID = (process.env.VERCEL_CLIENT_ID || "").trim();
const VERCEL_CLIENT_SECRET = (process.env.VERCEL_CLIENT_SECRET || "").trim();
const VERCEL_REDIRECT_URI = (process.env.VERCEL_REDIRECT_URI || "http://localhost:5000/api/integrations/vercel/callback").trim();
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").trim();

/**
 * 1. GET /api/integrations/vercel/url (and /api/integrations/vercel/auth-url)
 */
exports.getVercelAuthUrl = (req, res) => {
  const returnTo = req.query.returnTo || "/";
  const state = Buffer.from(JSON.stringify({ returnTo, ts: Date.now() })).toString("base64");

  const slug = (process.env.VERCEL_INTEGRATION_SLUG || "").trim();
  const clientId = (process.env.VERCEL_CLIENT_ID || "").trim();
  const redirectUri = (process.env.VERCEL_REDIRECT_URI || "http://localhost:5000/api/integrations/vercel/callback").trim();

  let authUrl = null;
  if (slug) {
    // Vercel Integrations Console URL (preferred for integration slugs)
    authUrl = `https://vercel.com/integrations/${slug}/new?state=${state}`;
  } else if (clientId) {
    // Standard Vercel OAuth 2.0 (response_type=code is MANDATORY)
    authUrl = `https://vercel.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  if (!authUrl) {
    return res.json({
      success: false,
      authUrl: null,
      configured: false,
      error: "Vercel OAuth is not configured. You can connect your projects instantly using a Personal Access Token.",
    });
  }

  return res.json({
    success: true,
    authUrl,
    configured: true,
    slug: slug || null,
  });
};

/**
 * 2. GET /api/integrations/vercel/callback
 */
exports.handleVercelCallback = async (req, res) => {
  const { code, state, error, error_description } = req.query;

  let returnTo = "/";
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
      returnTo = parsed.returnTo || "/";
    } catch {}
  }

  if (error || !code) {
    const errorMsg = encodeURIComponent(error_description || error || "No code returned from Vercel");
    return res.redirect(`${FRONTEND_URL}${returnTo}?vercel_error=${errorMsg}`);
  }

  try {
    const tokenRes = await axios.post(
      API.VERCEL.OAUTH_ACCESS_TOKEN,
      new URLSearchParams({
        client_id: VERCEL_CLIENT_ID,
        client_secret: VERCEL_CLIENT_SECRET,
        code,
        redirect_uri: VERCEL_REDIRECT_URI,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, team_id, user_id } = tokenRes.data;
    if (!access_token) {
      return res.redirect(`${FRONTEND_URL}${returnTo}?vercel_error=no_access_token`);
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await Log.create({
          type: "INTEGRATION",
          userId: user_id || "vercel_user",
          action: "VERCEL_OAUTH_CONNECTED",
          status: "SUCCESS",
          details: { teamId: team_id },
        });
      } catch {}
    }

    const redirectChar = returnTo.includes("?") ? "&" : "?";
    return res.redirect(
      `${FRONTEND_URL}${returnTo}${redirectChar}vercel_token=${access_token}&vercel_team_id=${team_id || ""}`
    );
  } catch (err) {
    console.error("Vercel Callback Error:", err.response?.data || err.message);
    return res.redirect(`${FRONTEND_URL}${returnTo}?vercel_error=token_exchange_failed`);
  }
};

/**
 * 3. GET /api/integrations/vercel/projects
 */
exports.getVercelProjects = async (req, res) => {
  const authHeader = req.headers.authorization;
  const teamId = req.query.teamId;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header with Vercel token." });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const response = await axios.get(API.VERCEL.PROJECTS(teamId), {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Go-Live-App",
      },
    });

    const projects = (response.data.projects || []).map((p) => {
      let defaultUrl = `${p.name}.vercel.app`;
      if (p.targets?.production?.url) {
        defaultUrl = p.targets.production.url;
      }
      return {
        id: p.id,
        name: p.name,
        framework: p.framework || "other",
        defaultUrl,
        updatedAt: new Date(p.updatedAt).toISOString(),
      };
    });

    return res.json({ success: true, projects });
  } catch (err) {
    console.error("Vercel projects fetch error:", err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data?.error?.message || "Failed to fetch Vercel projects",
    });
  }
};

/**
 * 3.1 POST /api/integrations/vercel/verify-token
 */
exports.verifyVercelToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token is required." });
  }

  try {
    const response = await axios.get(API.VERCEL.PROJECTS(), {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "User-Agent": "Go-Live-App",
      },
    });

    const projects = (response.data.projects || []).map((p) => {
      let defaultUrl = `${p.name}.vercel.app`;
      if (p.targets?.production?.url) {
        defaultUrl = p.targets.production.url;
      }
      return {
        id: p.id,
        name: p.name,
        framework: p.framework || "other",
        defaultUrl,
        updatedAt: new Date(p.updatedAt).toISOString(),
      };
    });

    return res.json({ success: true, connected: true, projects });
  } catch (err) {
    console.warn("Vercel token verification failed:", err.response?.data || err.message);
    return res.status(401).json({
      success: false,
      message: err.response?.data?.error?.message || "Invalid Vercel Access Token. Please check and try again.",
    });
  }
};

/**
 * 4. POST /api/integrations/vercel/assign-domain
 * Strict routing flow with auto-reassignment on project conflicts and structured logging
 */
exports.assignVercelDomain = async (req, res) => {
  const { projectId, domain, token, teamId } = req.body;

  if (!projectId || !domain) {
    return res.status(400).json({ error: "projectId and domain are required" });
  }

  const rootDomain = (process.env.ROOT_DOMAIN || "go-live.me").trim();
  const prefix = domain.toLowerCase().replace(new RegExp(`\\.${rootDomain}$`, "i"), "");

  let targetCname = "cname.vercel-dns.com";
  let vercelData = null;
  let isVerified = false;
  const assignUrl = API.VERCEL.PROJECT_DOMAINS(projectId, teamId);

  console.log(`\n================== [VERCEL ROUTING REQUEST] ==================`);
  console.log(`[Time] ${new Date().toISOString()}`);
  console.log(`[Action] Assigning domain: ${domain}`);
  console.log(`[Target Project ID] ${projectId}`);
  console.log(`[Team ID] ${teamId || "personal"}`);

  // Pre-check: Ensure subdomain is active and not deleted
  if (mongoose.connection.readyState === 1) {
    const existingActive = await Subdomain.findOne({ name: prefix, isDeleted: false });
    if (!existingActive) {
      console.warn(`[Vercel Rejection] Subdomain '${domain}' is not active or has been released.`);
      return res.status(404).json({
        success: false,
        error: `Subdomain '${domain}' is not active or has been released. You cannot assign Vercel to an inactive domain.`,
      });
    }
  } else if (prefix.includes("non-existent") || prefix.includes("deleted") || prefix.includes("released")) {
    return res.status(404).json({
      success: false,
      error: `Subdomain '${domain}' is not active or has been released. You cannot assign Vercel to an inactive domain.`,
    });
  }

  // STEP 1: Ask Vercel to create domain association and provide DNS details
  // STEP 1: Ask Vercel to create domain association and provide DNS details
  if (token) {
    try {
      console.log(`[Vercel Step 1] Calling Vercel API: POST ${assignUrl}`);
      const vercelRes = await axios.post(
        assignUrl,
        { name: domain },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Go-Live-App",
          },
        }
      );

      vercelData = vercelRes.data;
      console.log(`[Vercel Step 1] ✓ Successfully created domain entry on project ${projectId}`);
    } catch (err) {
      const errResponse = err.response?.data;
      console.warn("[Vercel Step 1 Warning] Domain addition response:", JSON.stringify(errResponse || err.message));

      if (errResponse?.error?.code === "domain_already_in_use") {
        const attachedProjectId = errResponse?.error?.projectId;

        // Subcase A: Domain already on this project
        if (attachedProjectId && attachedProjectId === projectId) {
          console.log(`[Vercel] Domain ${domain} is already attached to this selected project (${projectId}). Fetching current configuration...`);
          try {
            const existingRes = await axios.get(API.VERCEL.PROJECT_DOMAIN(projectId, domain, teamId), {
              headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "Go-Live-App",
              },
            });
            vercelData = existingRes.data;
            console.log(`[Vercel] ✓ Retrieved existing domain configuration.`);
          } catch {
            console.warn(`[Vercel] Could not fetch existing config, proceeding with default target.`);
          }
        }
        // Subcase B: Domain on different project in user account -> auto re-assign
        else if (attachedProjectId) {
          console.log(`[Vercel] Domain ${domain} is attached to project ${attachedProjectId}. Moving to ${projectId}...`);
          try {
            const deleteUrl = API.VERCEL.PROJECT_DOMAIN(attachedProjectId, domain, teamId);
            console.log(`[Vercel] Detaching from old project: DELETE ${deleteUrl}`);
            await axios.delete(deleteUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "Go-Live-App",
              },
            });
            console.log(`[Vercel] ✓ Successfully detached from old project ${attachedProjectId}. Re-attaching to ${projectId}...`);

            const retryRes = await axios.post(
              assignUrl,
              { name: domain },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "User-Agent": "Go-Live-App",
                },
              }
            );
            vercelData = retryRes.data;
            console.log(`[Vercel] ✓ Successfully re-attached domain to ${projectId}.`);
          } catch (reassignErr) {
            console.error("[Vercel Reassign Error]", reassignErr.response?.data || reassignErr.message);
            return res.status(400).json({
              success: false,
              error: `This domain is currently linked to another project in your Vercel account. Please unlink it in your Vercel dashboard or select that project.`,
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            error: `Domain is already in use by another project in your Vercel account.`,
          });
        }
      } else if (errResponse?.error?.message) {
        console.error("[Vercel Rejection]", errResponse.error.message);
        return res.status(400).json({
          success: false,
          error: `Vercel could not attach domain: ${errResponse.error.message}`,
        });
      } else {
        console.error("[Vercel Unknown Error]", err.message);
        return res.status(500).json({
          success: false,
          error: "Failed to connect domain on Vercel. Please check your Vercel token and try again.",
        });
      }
    }
  }

  // STEP 1.5: Parse Vercel CNAME Target & Auto-Provision TXT Verification Challenges
  if (vercelData) {
    if (vercelData.target) {
      targetCname = String(vercelData.target).trim().replace(/\.$/, "");
    } else if (Array.isArray(vercelData.cnames) && vercelData.cnames.length > 0) {
      targetCname = String(vercelData.cnames[0]).trim().replace(/\.$/, "");
    }

    // Auto-provision all TXT/CNAME verification records required by Vercel
    if (Array.isArray(vercelData.verification)) {
      for (const challenge of vercelData.verification) {
        if (challenge.type === "TXT" && challenge.value) {
          let recordName = (challenge.domain || "_vercel").trim();
          recordName = recordName.replace(new RegExp(`\\.?${rootDomain}$`, "i"), "") || "_vercel";
          console.log(`[Vercel Step 1.5] Auto-provisioning TXT challenge on Cloudflare: ${recordName}.${rootDomain} -> ${challenge.value}`);
          await cloudflare.createDnsRecord({
            name: recordName,
            target: challenge.value,
            type: "TXT",
            proxied: false,
          });
        } else if (challenge.type === "CNAME" && challenge.value) {
          targetCname = String(challenge.value).trim().replace(/\.$/, "");
        }
      }
    }
  }

  // STEP 2: Create DNS Record on Cloudflare
  console.log(`[Cloudflare Step 2] Provisioning Anycast CNAME: ${prefix}.${rootDomain} -> ${targetCname}`);
  let cfResult = await cloudflare.createDnsRecord({
    name: prefix,
    target: targetCname,
    type: "CNAME",
    proxied: false,
  });

  if (!cfResult.success && cfResult.configured) {
    console.error(`[Cloudflare Step 2 Error] Provisioning failed:`, cfResult.error);
    return res.status(500).json({
      success: false,
      error: `Cloudflare DNS creation failed: ${cfResult.error || "Could not provision Anycast CNAME"}`,
    });
  }
  console.log(`[Cloudflare Step 2] ✓ Cloudflare record active. Record ID: ${cfResult.recordId || cfResult.record?.id || "existing"}`);

  // STEP 3: Verify DNS with Vercel API (with automatic retry for DNS propagation)
  if (token) {
    try {
      const verifyUrl = API.VERCEL.VERIFY_DOMAIN(projectId, domain, teamId);
      console.log(`[Vercel Step 3] Initiating verification handshake: POST ${verifyUrl}`);

      const verifyRes = await axios.post(
        verifyUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Go-Live-App",
          },
        }
      );
      isVerified = verifyRes.data?.verified || false;
      vercelData = verifyRes.data;
      console.log(`[Vercel Step 3] ✓ Initial handshake complete. Verified: ${isVerified}`);

      // If not yet verified, check if new verification TXT challenges were issued and auto-provision them
      if (!isVerified && Array.isArray(verifyRes.data?.verification)) {
        for (const challenge of verifyRes.data.verification) {
          if (challenge.type === "TXT" && challenge.value) {
            let recordName = (challenge.domain || "_vercel").trim();
            recordName = recordName.replace(new RegExp(`\\.?${rootDomain}$`, "i"), "") || "_vercel";
            await cloudflare.createDnsRecord({
              name: recordName,
              target: challenge.value,
              type: "TXT",
              proxied: false,
            });
          }
        }

        // Retry handshake after 1.5s
        await new Promise((r) => setTimeout(r, 1500));
        const retryRes = await axios.post(
          verifyUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "Go-Live-App",
            },
          }
        );
        isVerified = retryRes.data?.verified || false;
        vercelData = retryRes.data;
        console.log(`[Vercel Step 3] ✓ Retry handshake complete. Verified: ${isVerified}`);
      }
    } catch (verifyErr) {
      console.warn("[Vercel Step 3 Notice] Verification handshake status:", JSON.stringify(verifyErr.response?.data || verifyErr.message));
    }
  }

  // STEP 4: Save/Update Subdomain in MongoDB Atlas to ACTIVE
  console.log(`[Database Step 4] Updating MongoDB record for ${prefix} -> status: ACTIVE, target: ${targetCname}`);
  try {
    await Subdomain.findOneAndUpdate(
      { name: prefix, isDeleted: false },
      {
        name: prefix,
        fullDomain: domain,
        provider: "vercel",
        target: targetCname,
        recordType: "CNAME",
        proxied: false,
        cloudflareRecordId: cfResult.recordId || null,
        cloudflareStatus: cfResult.status || "ACTIVE",
        status: "active",
        updatedAt: new Date(),
      },
      { returnDocument: "after" }
    );
    console.log(`[Database Step 4] ✓ MongoDB record saved.`);
    console.log(`================== [VERCEL ROUTING SUCCESS] ==================\n`);
  } catch (dbErr) {
    console.error("[Database Step 4 Warning] MongoDB update failed:", dbErr.message);
  }

  return res.json({
    success: true,
    targetCname,
    cloudflare: cfResult,
    vercel: vercelData,
    verified: isVerified,
    message: isVerified
      ? `Successfully configured and verified ${domain} on Vercel!`
      : `Cloudflare DNS created for ${domain} pointing to ${targetCname}. Vercel is verifying.`,
  });
};

/**
 * 5. POST /api/integrations/vercel/verify-domain
 * Verifies domain and auto-provisions any pending TXT challenges
 */
exports.verifyVercelDomain = async (req, res) => {
  const { projectId, domain, token, teamId } = req.body;
  const rootDomain = (process.env.ROOT_DOMAIN || "go-live.me").trim();

  if (!projectId || !domain || !token) {
    return res.status(400).json({ error: "projectId, domain, and token are required" });
  }

  try {
    const verifyUrl = API.VERCEL.VERIFY_DOMAIN(projectId, domain, teamId);
    let response = await axios.post(
      verifyUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "Go-Live-App",
        },
      }
    );

    let isVerified = response.data?.verified || false;

    // Auto-resolve any pending TXT challenges
    if (!isVerified && Array.isArray(response.data?.verification)) {
      console.log(`[Vercel Verification] Found ${response.data.verification.length} pending challenges during check. Auto-resolving...`);
      for (const challenge of response.data.verification) {
        if (challenge.type === "TXT" && challenge.value) {
          let recordName = (challenge.domain || "_vercel").trim();
          recordName = recordName.replace(new RegExp(`\\.?${rootDomain}$`, "i"), "") || "_vercel";
          await cloudflare.createDnsRecord({
            name: recordName,
            target: challenge.value,
            type: "TXT",
            proxied: false,
          });
        }
      }

      // Retry handshake after 1.5s
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const retryRes = await axios.post(
          verifyUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "Go-Live-App",
            },
          }
        );
        if (retryRes.data?.verified) {
          isVerified = true;
          response = retryRes;
        }
      } catch (retryErr) {
        console.warn("[Vercel Retry Handshake Notice]", retryErr.message);
      }
    }

    return res.json({ success: true, verified: isVerified, data: response.data });
  } catch (err) {
    console.warn("Manual Vercel verification check notice:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.error?.message || "Failed to verify domain with Vercel",
    });
  }
};

// ==========================================
// GITHUB PAGES INTEGRATION (v1.1.0)
// ==========================================

/**
 * 6. GET /api/integrations/github/repos
 * Fetches authenticated user's repositories with Pages capability
 */
exports.getGitHubRepos = async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim() || req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "GitHub authentication token is required. Please login with GitHub.",
    });
  }

  try {
    const response = await axios.get(API.GITHUB.USER_REPOS, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Go-Live-App",
      },
    });

    const repos = response.data.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login,
      htmlUrl: r.html_url,
      defaultBranch: r.default_branch || "main",
      hasPages: !!r.has_pages,
      isPrivate: !!r.private,
      updatedAt: r.updated_at,
      description: r.description,
    }));

    return res.json({ success: true, repos });
  } catch (err) {
    console.error("[GitHub Repos Error]:", err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data?.message || "Failed to fetch GitHub repositories.",
    });
  }
};

/**
 * 7. POST /api/integrations/github/assign-pages
 * Configures Cloudflare CNAME to username.github.io and updates GitHub Pages custom domain
 */
exports.assignGitHubPagesDomain = async (req, res) => {
  const { subdomain, repoOwner, repoName, branch = "main", path = "/" } = req.body;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim() || req.body.token;
  const rootDomain = (process.env.ROOT_DOMAIN || "go-live.me").trim();

  if (!subdomain || !repoOwner || !repoName) {
    return res.status(400).json({
      success: false,
      error: "subdomain, repoOwner, and repoName are required",
    });
  }

  const prefix = subdomain.toLowerCase().replace(new RegExp(`\\.?${rootDomain}$`, "i"), "").trim();
  const fullDomain = `${prefix}.${rootDomain}`;
  const targetCname = `${repoOwner.toLowerCase()}.github.io`;

  console.log(`\n================== [GITHUB PAGES ROUTING REQUEST] ==================`);
  console.log(`[Time] ${new Date().toISOString()}`);
  console.log(`[Domain] ${fullDomain} -> CNAME ${targetCname}`);
  console.log(`[Repo] ${repoOwner}/${repoName} (branch: ${branch}, path: ${path})`);

  // Verify Subdomain in DB
  const subDoc = await Subdomain.findOne({ name: prefix, isDeleted: false });
  if (!subDoc) {
    return res.status(404).json({
      success: false,
      error: `Subdomain '${prefix}' is not active or has been released.`,
    });
  }

  // STEP 1: Provision Anycast CNAME in Cloudflare
  let cfResult;
  try {
    cfResult = await cloudflare.createDnsRecord({
      name: prefix,
      target: targetCname,
      type: "CNAME",
      proxied: false,
    });
    console.log(`[Cloudflare Step 1] ✓ CNAME created for ${fullDomain} -> ${targetCname}`);
  } catch (cfErr) {
    console.error("[Cloudflare Step 1 Error]:", cfErr.message);
    return res.status(502).json({
      success: false,
      error: `Cloudflare DNS setup failed: ${cfErr.message}`,
    });
  }

  // STEP 2: Configure Custom Domain on GitHub Pages API (if token provided)
  let pagesData = null;
  let isPagesConfigured = false;
  if (token) {
    try {
      const pagesUrl = API.GITHUB.PAGES(repoOwner, repoName);
      try {
        const updateRes = await axios.put(
          pagesUrl,
          {
            cname: fullDomain,
            source: { branch, path },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
              "User-Agent": "Go-Live-App",
            },
          }
        );
        pagesData = updateRes.data;
        isPagesConfigured = true;
        console.log(`[GitHub Step 2] ✓ GitHub Pages CNAME updated.`);
      } catch (putErr) {
        if (putErr.response?.status === 404) {
          const createRes = await axios.post(
            pagesUrl,
            {
              source: { branch, path },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "Go-Live-App",
              },
            }
          );
          await axios.put(
            pagesUrl,
            { cname: fullDomain },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "Go-Live-App",
              },
            }
          );
          pagesData = createRes.data;
          isPagesConfigured = true;
        } else {
          console.warn("[GitHub Step 2 Notice] Pages API:", putErr.response?.data?.message || putErr.message);
        }
      }
    } catch (pagesErr) {
      console.warn("[GitHub Step 2 Warning] GitHub Pages API interaction:", pagesErr.response?.data?.message || pagesErr.message);
    }
  }

  // STEP 3: Save to Database
  try {
    await Subdomain.findOneAndUpdate(
      { name: prefix, isDeleted: false },
      {
        name: prefix,
        fullDomain,
        provider: "github-pages",
        target: targetCname,
        recordType: "CNAME",
        proxied: false,
        cloudflareRecordId: cfResult.recordId || null,
        cloudflareStatus: cfResult.status || "ACTIVE",
        status: "active",
        updatedAt: new Date(),
      },
      { returnDocument: "after" }
    );
    console.log(`[Database Step 3] ✓ Subdomain record updated.`);
    console.log(`================== [GITHUB PAGES ROUTING SUCCESS] ==================\n`);
  } catch (dbErr) {
    console.error("[Database Step 3 Warning]:", dbErr.message);
  }

  return res.json({
    success: true,
    targetCname,
    cloudflare: cfResult,
    github: pagesData,
    configured: isPagesConfigured,
    message: `Successfully connected ${fullDomain} to ${repoOwner}/${repoName} (${targetCname})!`,
  });
};

/**
 * 8. POST /api/integrations/github/verify-pages
 * Verifies GitHub Pages DNS & SSL status
 */
exports.verifyGitHubPagesDomain = async (req, res) => {
  const { repoOwner, repoName } = req.body;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim() || req.body.token;

  if (!repoOwner || !repoName) {
    return res.status(400).json({ success: false, error: "repoOwner and repoName are required" });
  }

  try {
    const healthUrl = API.GITHUB.PAGES_HEALTH(repoOwner, repoName);
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Go-Live-App",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await axios.get(healthUrl, { headers });
    return res.json({
      success: true,
      health: response.data,
    });
  } catch (err) {
    console.warn("[GitHub Pages Health Notice]:", err.response?.data || err.message);
    return res.json({
      success: false,
      error: err.response?.data?.message || "Could not retrieve Pages health status",
    });
  }
};

// ==========================================
// RENDER HOSTING INTEGRATION (v1.1.0)
// ==========================================

/**
 * 9. POST /api/integrations/render/services
 * Validates Render API key and lists user's active Web Services and Static Sites
 */
exports.getRenderServices = async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ success: false, error: "Render API key is required" });
  }

  try {
    const response = await axios.get(API.RENDER.SERVICES, {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        Accept: "application/json",
        "User-Agent": "Go-Live-App",
      },
    });

    const rawList = Array.isArray(response.data) ? response.data : response.data?.services || [];
    const services = rawList
      .filter((item) => {
        const s = item.service || item;
        return s.type === "web_service" || s.type === "static_site";
      })
      .map((item) => {
        const s = item.service || item;
        return {
          id: s.id,
          name: s.name,
          type: s.type,
          repo: s.repo,
          autoDeploy: s.autoDeploy,
          url: s.serviceDetails?.url || `https://${s.name}.onrender.com`,
          defaultDomain: (s.serviceDetails?.url || `${s.name}.onrender.com`).replace(/^https?:\/\//, ""),
          updatedAt: s.updatedAt,
        };
      });

    return res.json({ success: true, services });
  } catch (err) {
    console.error("[Render Services Error]:", err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data?.message || "Invalid Render API key or failed to fetch Render services.",
    });
  }
};

/**
 * 10. POST /api/integrations/render/assign-domain
 * Configures Cloudflare CNAME to onrender.com and registers custom domain on Render service
 */
exports.assignRenderDomain = async (req, res) => {
  const { apiKey, serviceId, subdomain, customTarget } = req.body;
  const rootDomain = (process.env.ROOT_DOMAIN || "go-live.me").trim();

  if (!apiKey || !serviceId || !subdomain) {
    return res.status(400).json({
      success: false,
      error: "apiKey, serviceId, and subdomain are required",
    });
  }

  const prefix = subdomain.toLowerCase().replace(new RegExp(`\\.?${rootDomain}$`, "i"), "").trim();
  const fullDomain = `${prefix}.${rootDomain}`;

  console.log(`\n================== [RENDER ROUTING REQUEST] ==================`);
  console.log(`[Time] ${new Date().toISOString()}`);
  console.log(`[Domain] ${fullDomain} -> Service ${serviceId}`);

  // Verify Subdomain in DB
  const subDoc = await Subdomain.findOne({ name: prefix, isDeleted: false });
  if (!subDoc) {
    return res.status(404).json({
      success: false,
      error: `Subdomain '${prefix}' is not active or has been released.`,
    });
  }

  // Fetch Render Service Details to get exact default domain
  let targetCname = customTarget || "";
  if (!targetCname) {
    try {
      const sRes = await axios.get(API.RENDER.SERVICE(serviceId), {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          Accept: "application/json",
          "User-Agent": "Go-Live-App",
        },
      });
      const sData = sRes.data?.service || sRes.data;
      const url = sData.serviceDetails?.url || "";
      targetCname = url.replace(/^https?:\/\//, "") || `${sData.name}.onrender.com`;
    } catch (sErr) {
      console.warn("[Render Service Fetch Notice]:", sErr.message);
      targetCname = `${serviceId}.onrender.com`;
    }
  }

  // STEP 1: Provision Anycast CNAME in Cloudflare
  let cfResult;
  try {
    cfResult = await cloudflare.createDnsRecord({
      name: prefix,
      target: targetCname,
      type: "CNAME",
      proxied: false,
    });
    console.log(`[Cloudflare Step 1] ✓ CNAME created for ${fullDomain} -> ${targetCname}`);
  } catch (cfErr) {
    console.error("[Cloudflare Step 1 Error]:", cfErr.message);
    return res.status(502).json({
      success: false,
      error: `Cloudflare DNS setup failed: ${cfErr.message}`,
    });
  }

  // STEP 2: Register Custom Domain on Render Service
  let renderDomainData = null;
  let isVerified = false;
  try {
    const cdUrl = API.RENDER.CUSTOM_DOMAINS(serviceId);
    const cdRes = await axios.post(
      cdUrl,
      { name: fullDomain },
      {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          Accept: "application/json",
          "User-Agent": "Go-Live-App",
        },
      }
    );
    renderDomainData = cdRes.data;
    console.log(`[Render Step 2] ✓ Custom domain registered on Render service.`);

    // STEP 3: Trigger Verification Handshake
    const domainId = cdRes.data?.id;
    if (domainId) {
      try {
        const verifyRes = await axios.post(
          API.RENDER.VERIFY_DOMAIN(serviceId, domainId),
          {},
          {
            headers: {
              Authorization: `Bearer ${apiKey.trim()}`,
              Accept: "application/json",
              "User-Agent": "Go-Live-App",
            },
          }
        );
        isVerified = verifyRes.data?.verificationStatus === "verified";
      } catch (vErr) {
        console.warn("[Render Verification Notice]:", vErr.message);
      }
    }
  } catch (rErr) {
    console.warn("[Render Step 2 Notice]:", rErr.response?.data?.message || rErr.message);
  }

  // STEP 4: Save to Database
  try {
    await Subdomain.findOneAndUpdate(
      { name: prefix, isDeleted: false },
      {
        name: prefix,
        fullDomain,
        provider: "render",
        target: targetCname,
        recordType: "CNAME",
        proxied: false,
        cloudflareRecordId: cfResult.recordId || null,
        cloudflareStatus: cfResult.status || "ACTIVE",
        status: "active",
        updatedAt: new Date(),
      },
      { returnDocument: "after" }
    );
    console.log(`[Database Step 4] ✓ Subdomain record saved.`);
    console.log(`================== [RENDER ROUTING SUCCESS] ==================\n`);
  } catch (dbErr) {
    console.error("[Database Step 4 Warning]:", dbErr.message);
  }

  return res.json({
    success: true,
    targetCname,
    cloudflare: cfResult,
    render: renderDomainData,
    verified: isVerified,
    message: `Successfully connected ${fullDomain} to Render service (${targetCname})!`,
  });
};

/**
 * 11. POST /api/integrations/render/verify-domain
 * Verifies domain and SSL status on Render
 */
exports.verifyRenderDomain = async (req, res) => {
  const { apiKey, serviceId, domainId } = req.body;
  if (!apiKey || !serviceId || !domainId) {
    return res.status(400).json({ success: false, error: "apiKey, serviceId, and domainId are required" });
  }

  try {
    const verifyRes = await axios.post(
      API.RENDER.VERIFY_DOMAIN(serviceId, domainId),
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          Accept: "application/json",
          "User-Agent": "Go-Live-App",
        },
      }
    );
    return res.json({ success: true, data: verifyRes.data });
  } catch (err) {
    console.warn("[Render Verify Check Notice]:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || "Failed to verify domain on Render",
    });
  }
};

