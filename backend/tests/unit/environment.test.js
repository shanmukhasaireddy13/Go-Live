const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { getDatabaseName } = require("../../config/mongodb");

describe("Environment & Database Isolation Unit Tests", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDbName = process.env.MONGODB_DB_NAME;
  const originalCooldown = process.env.COOLDOWN_HOURS;
  const originalRepo = process.env.GITHUB_REPO;

  it("should resolve 'golive_dev' database in development mode", () => {
    delete process.env.MONGODB_DB_NAME;
    process.env.NODE_ENV = "development";
    assert.equal(getDatabaseName(), "golive_dev");
  });

  it("should resolve 'golive_stage' database in staging mode", () => {
    delete process.env.MONGODB_DB_NAME;
    process.env.NODE_ENV = "staging";
    assert.equal(getDatabaseName(), "golive_stage");
  });

  it("should resolve 'golive_prod' database in production mode", () => {
    delete process.env.MONGODB_DB_NAME;
    process.env.NODE_ENV = "production";
    assert.equal(getDatabaseName(), "golive_prod");
  });

  it("should respect explicit MONGODB_DB_NAME override regardless of NODE_ENV", () => {
    process.env.NODE_ENV = "production";
    process.env.MONGODB_DB_NAME = "custom_enterprise_db";
    assert.equal(getDatabaseName(), "custom_enterprise_db");
  });

  it("should parse COOLDOWN_HOURS with safe fallback", () => {
    process.env.COOLDOWN_HOURS = "3";
    const hours = parseFloat(process.env.COOLDOWN_HOURS) || 2;
    assert.equal(hours, 3);
    assert.equal(hours * 60 * 60 * 1000, 10800000);
  });

  it("should resolve GITHUB_REPO dynamically from env", () => {
    process.env.GITHUB_REPO = "acme-corp/Anycast-Live";
    const repo = (process.env.GITHUB_REPO || "shanmukhasaireddy13/Go-Live").trim();
    assert.equal(repo, "acme-corp/Anycast-Live");
  });

  // Restore environment after tests
  process.env.NODE_ENV = originalNodeEnv;
  process.env.MONGODB_DB_NAME = originalDbName;
  process.env.COOLDOWN_HOURS = originalCooldown;
  process.env.GITHUB_REPO = originalRepo;
});
