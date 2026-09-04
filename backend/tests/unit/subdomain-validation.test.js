const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const RESERVED_WORDS = new Set([
  "www", "api", "admin", "dashboard", "mail", "status", "docs", "support", "blog", "cdn",
  "app", "auth", "dev", "staging", "test", "demo", "ns1", "ns2", "root", "gateway", "connect", "sai",
  "billing", "ftp", "git", "help", "internal", "login", "oauth", "portal", "secure", "server", "signup",
  "smtp", "ssl", "vpn", "webmail"
]);

function validateSubdomainInput(raw) {
  const query = (raw || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

  if (!query) {
    return { valid: false, error: "Subdomain query is required" };
  }
  if (query.length < 2) {
    return { valid: false, error: "Need at least 2 characters! Even 'pi' has two." };
  }
  if (query.length > 32) {
    return { valid: false, error: "Whoa, that's a whole sentence! Max 32 characters." };
  }
  if (RESERVED_WORDS.has(query)) {
    return { valid: false, isReserved: true, error: `'${query}' is a reserved system domain.` };
  }
  if (!/^[a-z0-9-]+$/.test(query) || query.startsWith("-") || query.endsWith("-")) {
    return { valid: false, error: "Subdomain cannot begin or end with a hyphen" };
  }

  return { valid: true, sanitized: query };
}

describe("Subdomain Validation Unit Tests", () => {
  it("should accept valid alphanumeric subdomains", () => {
    const validNames = ["my-app", "portfolio2026", "analytics", "go", "cool-project-v2"];
    for (const name of validNames) {
      const res = validateSubdomainInput(name);
      assert.equal(res.valid, true, `Expected '${name}' to be valid`);
      assert.equal(res.sanitized, name.toLowerCase());
    }
  });

  it("should reject empty or whitespace input", () => {
    assert.equal(validateSubdomainInput("").valid, false);
    assert.equal(validateSubdomainInput("   ").valid, false);
    assert.equal(validateSubdomainInput(null).valid, false);
  });

  it("should reject subdomains shorter than 2 characters", () => {
    const res = validateSubdomainInput("a");
    assert.equal(res.valid, false);
    assert.ok(res.error.includes("at least 2 characters"));
  });

  it("should reject subdomains longer than 32 characters", () => {
    const longName = "this-is-a-super-ridiculously-long-subdomain-that-should-fail";
    const res = validateSubdomainInput(longName);
    assert.equal(res.valid, false);
    assert.ok(res.error.includes("Max 32 characters"));
  });

  it("should flag reserved system domains", () => {
    const reserved = ["api", "admin", "dashboard", "sai", "root", "auth", "login"];
    for (const word of reserved) {
      const res = validateSubdomainInput(word);
      assert.equal(res.valid, false, `Expected reserved word '${word}' to be flagged`);
      assert.equal(res.isReserved, true);
    }
  });

  it("should sanitize uppercase characters and special symbols", () => {
    const res = validateSubdomainInput("My-Awesome_Project!#");
    assert.equal(res.valid, true);
    assert.equal(res.sanitized, "my-awesomeproject");
  });
});
