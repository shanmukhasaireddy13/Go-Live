const axios = require("axios");
const BaseHostingProvider = require("./BaseHostingProvider");
const API = require("../config/api");
const { ExternalServiceError, ValidationError } = require("../errors/AppError");

const VERCEL_CLIENT_ID = (process.env.VERCEL_CLIENT_ID || "").trim();
const VERCEL_REDIRECT_URI = (process.env.VERCEL_REDIRECT_URI || "http://localhost:5000/api/integrations/vercel/callback").trim();

class VercelProvider extends BaseHostingProvider {
  constructor() {
    super("vercel", "cname.vercel-dns.com", "CNAME", false);
  }

  getAuthUrl(returnTo = "/") {
    const state = Buffer.from(JSON.stringify({ returnTo, ts: Date.now() })).toString("base64");
    if (!VERCEL_CLIENT_ID) {
      return {
        authUrl: `${API.VERCEL.OAUTH_AUTHORIZE}?client_id=${VERCEL_CLIENT_ID}&redirect_uri=${encodeURIComponent(VERCEL_REDIRECT_URI)}&state=${state}`,
        configured: false,
      };
    }
    return {
      authUrl: `${API.VERCEL.OAUTH_AUTHORIZE}?client_id=${VERCEL_CLIENT_ID}&redirect_uri=${encodeURIComponent(VERCEL_REDIRECT_URI)}&state=${state}`,
      configured: true,
    };
  }

  async fetchProjects(token, teamId = null) {
    if (!token) {
      throw new ValidationError("Missing Vercel access token");
    }

    const url = API.VERCEL.PROJECTS(teamId);
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      return res.data.projects || [];
    } catch (err) {
      throw new ExternalServiceError(
        "Vercel API",
        `Failed to fetch projects: ${err.response?.data?.error?.message || err.message}`
      );
    }
  }

  async assignDomain(domainName, { projectId, teamId = null }, token) {
    if (!token || !projectId || !domainName) {
      throw new ValidationError("Missing required parameters for Vercel domain assignment");
    }

    const cleanDomain = domainName.toLowerCase().trim();
    const url = API.VERCEL.PROJECT_DOMAINS(projectId, teamId);

    try {
      const res = await axios.post(
        url,
        { name: cleanDomain },
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return {
        success: true,
        domain: res.data,
        target: this.defaultTarget,
        verified: res.data.verified || false,
      };
    } catch (err) {
      const errData = err.response?.data?.error;
      // If already added to this project, treat as success
      if (errData?.code === "domain_already_in_use" || errData?.code === "domain_taken") {
        return {
          success: true,
          alreadyAssigned: true,
          target: this.defaultTarget,
          verified: true,
        };
      }
      throw new ExternalServiceError(
        "Vercel API",
        errData?.message || err.message
      );
    }
  }

  async verifyDomain(domainName, { projectId, teamId = null }, token) {
    if (!token || !projectId || !domainName) {
      throw new ValidationError("Missing required parameters for Vercel verification");
    }

    const cleanDomain = domainName.toLowerCase().trim();
    const url = API.VERCEL.VERIFY_DOMAIN(projectId, cleanDomain, teamId);

    try {
      const res = await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token.trim()}` },
        }
      );
      return {
        success: true,
        verified: res.data.verified || false,
        data: res.data,
      };
    } catch (err) {
      return {
        success: false,
        verified: false,
        message: err.response?.data?.error?.message || err.message,
      };
    }
  }
}

module.exports = new VercelProvider();
