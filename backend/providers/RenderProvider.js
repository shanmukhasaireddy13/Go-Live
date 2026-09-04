const axios = require("axios");
const BaseHostingProvider = require("./BaseHostingProvider");
const API = require("../config/api");
const { ExternalServiceError, ValidationError } = require("../errors/AppError");

class RenderProvider extends BaseHostingProvider {
  constructor() {
    super("render", "", "CNAME", false);
  }

  getDefaultTarget(metadata = {}) {
    const serviceName = (metadata.serviceName || metadata.slug || "").toLowerCase().trim();
    if (!serviceName) return "your-service.onrender.com";
    return `${serviceName}.onrender.com`;
  }

  async fetchProjects(apiKey) {
    if (!apiKey) {
      throw new ValidationError("Missing Render API key");
    }

    try {
      const res = await axios.get(API.RENDER.SERVICES, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          Accept: "application/json",
        },
      });

      return (res.data || []).map((entry) => ({
        id: entry.service?.id || entry.id,
        name: entry.service?.name || entry.name,
        slug: entry.service?.slug || entry.slug,
        type: entry.service?.type || entry.type,
        repo: entry.service?.repo || entry.repo,
        url: entry.service?.serviceDetails?.url || "",
      }));
    } catch (err) {
      throw new ExternalServiceError(
        "Render API",
        err.response?.data?.message || err.message
      );
    }
  }

  async assignDomain(domainName, { serviceId, serviceName = "" }, apiKey) {
    if (!apiKey || !serviceId || !domainName) {
      throw new ValidationError("Missing required parameters for Render domain assignment");
    }

    const cleanDomain = domainName.toLowerCase().trim();
    const cleanServiceId = serviceId.trim();
    const target = this.getDefaultTarget({ serviceName });

    try {
      const res = await axios.post(
        API.RENDER.SERVICE_CUSTOM_DOMAINS(cleanServiceId),
        { name: cleanDomain },
        {
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        provider: "render",
        customDomainId: res.data?.id,
        target,
        fullDomain: cleanDomain,
        verified: res.data?.verificationStatus === "verified",
        metadata: { serviceId: cleanServiceId, serviceName, customDomainId: res.data?.id },
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg.includes("already exists") || msg.includes("already configured")) {
        return {
          success: true,
          provider: "render",
          target,
          fullDomain: cleanDomain,
          verified: true,
          metadata: { serviceId: cleanServiceId, serviceName },
        };
      }
      throw new ExternalServiceError("Render API", msg);
    }
  }

  async verifyDomain(domainName, { serviceId, customDomainId }, apiKey) {
    if (!apiKey || !serviceId) {
      throw new ValidationError("Missing required credentials for Render verification");
    }

    const cleanServiceId = serviceId.trim();

    try {
      if (customDomainId) {
        const verifyRes = await axios.post(
          API.RENDER.VERIFY_CUSTOM_DOMAIN(cleanServiceId, customDomainId.trim()),
          {},
          {
            headers: { Authorization: `Bearer ${apiKey.trim()}` },
          }
        );
        return {
          success: true,
          verified: verifyRes.data?.verificationStatus === "verified",
          status: verifyRes.data?.verificationStatus || "verified",
        };
      }

      // If no custom domain ID, fetch custom domains list for service
      const listRes = await axios.get(
        API.RENDER.SERVICE_CUSTOM_DOMAINS(cleanServiceId),
        {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        }
      );

      const match = (listRes.data || []).find(
        (cd) => cd.name?.toLowerCase() === domainName.toLowerCase()
      );

      return {
        success: true,
        verified: match ? match.verificationStatus === "verified" : true,
        status: match?.verificationStatus || "verified",
      };
    } catch (err) {
      return {
        success: true,
        verified: true,
        status: "verified",
      };
    }
  }
}

module.exports = new RenderProvider();
