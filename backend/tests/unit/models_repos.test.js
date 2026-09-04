const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const Subdomain = require("../../models/Subdomain");
const User = require("../../models/User");
const ReservedDomain = require("../../models/ReservedDomain");
const AuditLog = require("../../models/AuditLog");
const subdomainRepository = require("../../repositories/SubdomainRepository");
const userRepository = require("../../repositories/UserRepository");
const auditLogRepository = require("../../repositories/AuditLogRepository");

describe("Database Models & Repositories Unit Tests", () => {
  test("Subdomain model methods: isCooldownActive & getCooldownRemainingMinutes", () => {
    const doc = new Subdomain({
      name: "test-cooldown",
      fullDomain: "test-cooldown.go-live.me",
      userGithub: "testuser",
    });

    // Not on cooldown
    assert.equal(doc.isCooldownActive(), false);
    assert.equal(doc.getCooldownRemainingMinutes(), 0);

    // Set future cooldown
    doc.cooldownUntil = new Date(Date.now() + 45 * 60 * 1000); // 45 mins in future
    assert.equal(doc.isCooldownActive(), true);
    assert.ok(doc.getCooldownRemainingMinutes() >= 44 && doc.getCooldownRemainingMinutes() <= 46);

    // Set past cooldown
    doc.cooldownUntil = new Date(Date.now() - 10 * 60 * 1000); // 10 mins ago
    assert.equal(doc.isCooldownActive(), false);
    assert.equal(doc.getCooldownRemainingMinutes(), 0);
  });

  test("Subdomain model methods: attachProvider updates document state", async () => {
    const doc = new Subdomain({
      name: "awesome-site",
      fullDomain: "awesome-site.go-live.me",
      userGithub: "octocat",
    });

    doc.attachProvider(
      "vercel",
      "cname.vercel-dns.com",
      "CNAME",
      false,
      "cf_rec_12345",
      { projectId: "prj_test" }
    );

    assert.equal(doc.provider, "vercel");
    assert.equal(doc.target, "cname.vercel-dns.com");
    assert.equal(doc.recordType, "CNAME");
    assert.equal(doc.proxied, false);
    assert.equal(doc.cloudflareRecordId, "cf_rec_12345");
    assert.equal(doc.cloudflareStatus, "ACTIVE");
    assert.equal(doc.status, "ACTIVE");
    assert.equal(doc.providerMetadata.projectId, "prj_test");
    assert.ok(doc.history.length > 0);
    assert.equal(doc.history[0].action, "PROVIDER_ATTACHED");
  });

  test("User model methods: updateLoginSession and setStarred", () => {
    const user = new User({
      githubId: "123456",
      username: "coder123",
      hasStarred: false,
    });

    user.updateLoginSession({
      name: "Coder One",
      avatar: "https://github.com/coder123.png",
      email: "coder@example.com",
      hasStarred: true,
    });

    assert.equal(user.name, "Coder One");
    assert.equal(user.avatar, "https://github.com/coder123.png");
    assert.equal(user.email, "coder@example.com");
    assert.equal(user.hasStarred, true);
    assert.ok(user.starredAt instanceof Date);

    user.setStarred(false);
    assert.equal(user.hasStarred, false);
  });

  test("SubdomainRepository: checkAvailability recognizes static and format rules", async () => {
    // 1. Reserved system domain
    const resReserved = await subdomainRepository.checkAvailability("admin");
    assert.equal(resReserved.isAvailable, false);
    assert.equal(resReserved.isReserved, true);

    const resSai = await subdomainRepository.checkAvailability("sai");
    assert.equal(resSai.isAvailable, false);
    assert.equal(resSai.isReserved, true);
  });

  test("Repositories are singletons wrapping Mongoose models", () => {
    assert.ok(subdomainRepository.model === Subdomain);
    assert.ok(userRepository.model === User);
    assert.ok(auditLogRepository.model === AuditLog);
  });
});
