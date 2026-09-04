const BaseHostingProvider = require("./BaseHostingProvider");
const { ValidationError } = require("../errors/AppError");

class CustomDnsProvider extends BaseHostingProvider {
  constructor() {
    super("custom", "", "CNAME", false);
  }

  getDefaultTarget(metadata = {}) {
    return metadata.target || "";
  }

  async assignDomain(domainName, { target, recordType = "CNAME", proxied = false }) {
    if (!target || !domainName) {
      throw new ValidationError("Target destination and domain name are required for custom DNS");
    }

    const cleanTarget = this.formatTarget(target);
    const validTypes = ["CNAME", "A", "AAAA", "TXT"];
    const cleanType = (recordType || "CNAME").toUpperCase().trim();

    if (!validTypes.includes(cleanType)) {
      throw new ValidationError(`Invalid record type: ${recordType}. Must be one of ${validTypes.join(", ")}`);
    }

    return {
      success: true,
      provider: "custom",
      target: cleanTarget,
      recordType: cleanType,
      proxied: Boolean(proxied),
      fullDomain: domainName.toLowerCase().trim(),
    };
  }

  async verifyDomain(domainName, { target }) {
    return {
      success: true,
      verified: true,
      target: this.formatTarget(target),
    };
  }
}

module.exports = new CustomDnsProvider();
