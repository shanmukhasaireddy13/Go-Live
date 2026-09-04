/**
 * BaseHostingProvider - Abstract Strategy class for hosting platform integrations
 */
class BaseHostingProvider {
  /**
   * @param {string} name - Identifier of the provider (e.g., 'vercel', 'github-pages', 'render')
   * @param {string} defaultTarget - Default DNS CNAME target for the provider
   * @param {string} recordType - DNS record type ('CNAME', 'A', 'AAAA')
   * @param {boolean} proxied - Whether Cloudflare proxy should be enabled
   */
  constructor(name, defaultTarget = "", recordType = "CNAME", proxied = false) {
    if (new.target === BaseHostingProvider) {
      throw new TypeError("Cannot construct BaseHostingProvider instances directly");
    }
    this.name = name;
    this.defaultTarget = defaultTarget;
    this.recordType = recordType;
    this.proxied = proxied;
  }

  getName() {
    return this.name;
  }

  getDefaultTarget(metadata = {}) {
    return this.defaultTarget;
  }

  getRecordType() {
    return this.recordType;
  }

  isProxied() {
    return this.proxied;
  }

  /**
   * Abstract: Return OAuth authorization URL if provider supports OAuth
   */
  getAuthUrl(returnTo = "/") {
    return null;
  }

  /**
   * Abstract: Fetch user projects/services from the hosting provider
   */
  async fetchProjects(credentials) {
    throw new Error(`fetchProjects() not implemented for provider ${this.name}`);
  }

  /**
   * Abstract: Assign custom domain to the provider project/service
   */
  async assignDomain(domainName, projectData, credentials) {
    throw new Error(`assignDomain() not implemented for provider ${this.name}`);
  }

  /**
   * Abstract: Verify custom domain deployment status on the provider
   */
  async verifyDomain(domainName, projectData, credentials) {
    throw new Error(`verifyDomain() not implemented for provider ${this.name}`);
  }

  /**
   * Sanitize and format domain target strings
   */
  formatTarget(target) {
    if (!target) return "";
    return target.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase();
  }
}

module.exports = BaseHostingProvider;
