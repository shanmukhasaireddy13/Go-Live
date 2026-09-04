const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const cloudflare = require("../../services/cloudflare");

describe("Adversarial Cloudflare DNS Service Unit Tests", () => {
  it("verifyCloudflareConnection should return connectivity status object", async () => {
    const result = await cloudflare.verifyCloudflareConnection();
    assert.ok(result);
    assert.equal(typeof result, "object");
    assert.equal(typeof result.configured, "boolean");
  });

  it("createDnsRecord should gracefully handle invalid domain names", async () => {
    const result = await cloudflare.createDnsRecord({
      name: "",
      target: "cname.vercel-dns.com",
      type: "CNAME",
    });
    assert.ok(result);
    assert.equal(typeof result, "object");
  });

  it("createDnsRecord should handle missing or empty targets safely", async () => {
    const result = await cloudflare.createDnsRecord({
      name: "safe-test",
      target: "",
      type: "CNAME",
    });
    assert.ok(result);
  });

  it("deleteDnsRecordByName should sanitize uppercase and invalid symbols without throwing", async () => {
    const dirtyNames = [
      "MY_PROJECT!!",
      "UPPERCASE-DOMAIN",
      "test..domain",
      "../../../etc/passwd",
      "domain-with-spaces   ",
    ];

    for (const name of dirtyNames) {
      const result = await cloudflare.deleteDnsRecordByName(name);
      assert.ok(result, `Should return safe result object for '${name}'`);
      assert.equal(typeof result.success, "boolean");
    }
  });

  it("updateDnsRecord should handle missing recordId safely", async () => {
    const result = await cloudflare.updateDnsRecord({
      recordId: null,
      name: "test",
      target: "1.1.1.1",
    });
    assert.ok(result);
  });
});
