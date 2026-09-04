const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const providerFactory = require("../../providers/ProviderFactory");
const BaseHostingProvider = require("../../providers/BaseHostingProvider");
const vercelProvider = require("../../providers/VercelProvider");
const gitHubPagesProvider = require("../../providers/GitHubPagesProvider");
const renderProvider = require("../../providers/RenderProvider");
const customDnsProvider = require("../../providers/CustomDnsProvider");

describe("OOP Strategy Providers & ProviderFactory Unit Tests", () => {
  test("BaseHostingProvider cannot be instantiated directly", () => {
    assert.throws(
      () => new BaseHostingProvider("test"),
      /Cannot construct BaseHostingProvider instances directly/
    );
  });

  test("ProviderFactory should resolve all supported providers", () => {
    assert.equal(providerFactory.getProvider("vercel"), vercelProvider);
    assert.equal(providerFactory.getProvider("VERCEL"), vercelProvider);
    assert.equal(providerFactory.getProvider("github-pages"), gitHubPagesProvider);
    assert.equal(providerFactory.getProvider("render"), renderProvider);
    assert.equal(providerFactory.getProvider("custom"), customDnsProvider);
  });

  test("ProviderFactory should reject unknown providers with ValidationError", () => {
    assert.throws(
      () => providerFactory.getProvider("unknown-cloud"),
      /Unsupported hosting provider/
    );
  });

  test("ProviderFactory.listProviders should return supported provider metadata", () => {
    const list = providerFactory.listProviders();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 4);
    const ids = list.map((p) => p.id);
    assert.ok(ids.includes("vercel"));
    assert.ok(ids.includes("github-pages"));
    assert.ok(ids.includes("render"));
    assert.ok(ids.includes("custom"));
  });

  test("VercelProvider should configure default CNAME target", () => {
    assert.equal(vercelProvider.getName(), "vercel");
    assert.equal(vercelProvider.getDefaultTarget(), "cname.vercel-dns.com");
    assert.equal(vercelProvider.getRecordType(), "CNAME");
    assert.equal(vercelProvider.isProxied(), false);
  });

  test("GitHubPagesProvider should compute dynamic CNAME based on username", () => {
    assert.equal(gitHubPagesProvider.getName(), "github-pages");
    assert.equal(
      gitHubPagesProvider.getDefaultTarget({ owner: "shanmukhasaireddy13" }),
      "shanmukhasaireddy13.github.io"
    );
  });

  test("RenderProvider should compute dynamic CNAME based on service name", () => {
    assert.equal(renderProvider.getName(), "render");
    assert.equal(
      renderProvider.getDefaultTarget({ serviceName: "portfolio-api" }),
      "portfolio-api.onrender.com"
    );
  });

  test("CustomDnsProvider should validate record types and sanitize targets", async () => {
    assert.equal(customDnsProvider.getName(), "custom");
    
    // Valid CNAME target
    const result = await customDnsProvider.assignDomain("app.go-live.me", {
      target: "https://my-bucket.s3.amazonaws.com/",
      recordType: "CNAME",
    });
    assert.equal(result.target, "my-bucket.s3.amazonaws.com");
    assert.equal(result.recordType, "CNAME");

    // Invalid record type
    await assert.rejects(
      async () =>
        customDnsProvider.assignDomain("app.go-live.me", {
          target: "1.2.3.4",
          recordType: "INVALID_RECORD",
        }),
      /Invalid record type/
    );
  });
});
