const vercelProvider = require("./VercelProvider");
const gitHubPagesProvider = require("./GitHubPagesProvider");
const renderProvider = require("./RenderProvider");
const customDnsProvider = require("./CustomDnsProvider");
const { ValidationError } = require("../errors/AppError");

class ProviderFactory {
  constructor() {
    this.providers = new Map();
    this.register("vercel", vercelProvider);
    this.register("github-pages", gitHubPagesProvider);
    this.register("render", renderProvider);
    this.register("custom", customDnsProvider);
  }

  register(name, providerInstance) {
    this.providers.set(name.toLowerCase().trim(), providerInstance);
  }

  getProvider(name) {
    if (!name) {
      throw new ValidationError("Provider name must be specified");
    }

    const cleanName = name.toLowerCase().trim();
    const provider = this.providers.get(cleanName);

    if (!provider) {
      throw new ValidationError(
        `Unsupported hosting provider: "${name}". Supported providers: ${Array.from(this.providers.keys()).join(", ")}`
      );
    }

    return provider;
  }

  listProviders() {
    return Array.from(this.providers.entries()).map(([id, p]) => ({
      id,
      name: p.getName(),
      defaultTarget: p.getDefaultTarget(),
      recordType: p.getRecordType(),
      isProxied: p.isProxied(),
    }));
  }
}

module.exports = new ProviderFactory();
