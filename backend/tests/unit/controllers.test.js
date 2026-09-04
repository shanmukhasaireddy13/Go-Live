const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const dnsController = require("../../controllers/dnsController");
const integrationsController = require("../../controllers/integrationsController");
const domainsController = require("../../controllers/domainsController");

describe("Adversarial Backend Controllers Boundary Tests", () => {
  it("dnsController.verifyDnsRecord should return 4 Anycast edge PoP nodes for any target", async () => {
    const req = { query: { name: "test-node", target: "cname.vercel-dns.com" } };
    let jsonResult = null;
    const res = {
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await dnsController.verifyDnsRecord(req, res);
    assert.ok(jsonResult.nodes);
    assert.ok(Array.isArray(jsonResult.nodes));
    assert.equal(jsonResult.nodes.length, 4);
    for (const node of jsonResult.nodes) {
      assert.ok(node.city, "Each node must have a city");
      assert.ok(node.country, "Each node must have a country");
      assert.ok(typeof node.latencyMs === "number", "Latency must be a number");
    }
  });

  it("integrationsController.getVercelAuthUrl should construct valid Vercel OAuth URL when configured or safe fallback when unconfigured", async () => {
    const req = { query: { returnPath: "/manage?name=custom" } };
    let jsonResult = null;
    const res = {
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    const origSlug = process.env.VERCEL_INTEGRATION_SLUG;
    const origClient = process.env.VERCEL_CLIENT_ID;

    delete process.env.VERCEL_INTEGRATION_SLUG;
    delete process.env.VERCEL_CLIENT_ID;
    await integrationsController.getVercelAuthUrl(req, res);
    assert.equal(jsonResult.configured, false);
    assert.equal(jsonResult.authUrl, null);

    process.env.VERCEL_INTEGRATION_SLUG = "go-live";
    await integrationsController.getVercelAuthUrl(req, res);
    assert.ok(jsonResult.authUrl);
    assert.ok(jsonResult.authUrl.includes("vercel.com/integrations/"));

    if (origSlug) process.env.VERCEL_INTEGRATION_SLUG = origSlug;
    else delete process.env.VERCEL_INTEGRATION_SLUG;
    if (origClient) process.env.VERCEL_CLIENT_ID = origClient;
    else delete process.env.VERCEL_CLIENT_ID;
  });

  it("domainsController.checkAvailability should handle case sensitivity and special chars", async () => {
    const req = { query: { q: "  My-NEW-Project-2026!  " } };
    let jsonResult = null;
    const res = {
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await domainsController.checkAvailability(req, res);
    assert.ok(jsonResult);
    assert.equal(jsonResult.subdomain, "my-new-project-2026");
  });

  it("domainsController.claimSubdomain should pass validation error to next for invalid body", async () => {
    const invalidPayloads = [
      {},
      { name: "" },
      { name: "ok", user: null },
    ];

    for (const payload of invalidPayloads) {
      const req = { body: payload };
      let capturedError = null;
      const next = (err) => {
        capturedError = err;
      };

      await domainsController.claimSubdomain(req, {}, next);
      assert.ok(capturedError != null, `Should pass error to next() for invalid payload: ${JSON.stringify(payload)}`);
    }
  });
});
