const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const axios = require("axios");
const mongoose = require("mongoose");
const app = require("../../server");

let server;
let BASE_URL;

describe("Go-Live Backend API Integration Tests", () => {
  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        BASE_URL = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch (e) {}
  });

  it("GET /health should return 200 with healthy status and service name", async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    assert.equal(res.data.status, "healthy");
    assert.equal(res.data.service, "go-live-backend");
    assert.ok(typeof res.data.uptime === "number");
  });

  it("GET /api/domains/check should reject requests missing query param 'q' with 400 VALIDATION_ERROR", async () => {
    try {
      await axios.get(`${BASE_URL}/api/domains/check`);
      assert.fail("Expected request to fail with 400");
    } catch (err) {
      assert.equal(err.response.status, 400);
      assert.equal(err.response.data.success, false);
      assert.equal(err.response.data.code, "VALIDATION_ERROR");
      assert.ok(err.response.data.error.includes("Query parameter 'q' is required"));
    }
  });

  it("GET /api/domains/check?q=sai should return isAvailable=false and reserved status", async () => {
    const res = await axios.get(`${BASE_URL}/api/domains/check?q=sai`);
    assert.equal(res.status, 200);
    assert.equal(res.data.isAvailable, false);
    assert.equal(res.data.isReserved, true);
    assert.ok(res.data.reason.includes("sai.go-live.me"));
  });

  it("GET /api/domains/check?q=cool-new-unclaimed-project-xyz should return isAvailable=true", async () => {
    const res = await axios.get(`${BASE_URL}/api/domains/check?q=cool-new-unclaimed-project-xyz`);
    assert.equal(res.status, 200);
    assert.equal(res.data.isAvailable, true);
    assert.equal(res.data.subdomain, "cool-new-unclaimed-project-xyz");
    assert.equal(res.data.fullDomain, "cool-new-unclaimed-project-xyz.go-live.me");
  });

  it("GET /api/auth/github/url should return a valid GitHub OAuth authorization URL", async () => {
    const res = await axios.get(`${BASE_URL}/api/auth/github/url`);
    assert.equal(res.status, 200);
    assert.ok(res.data.authUrl);
    assert.ok(res.data.authUrl.includes("github.com/login/oauth/authorize"));
  });

  it("GET /api/dns/verify?name=test should return real Anycast edge node telemetry", async () => {
    const res = await axios.get(`${BASE_URL}/api/dns/verify?name=test`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.nodes));
    assert.ok(res.data.nodes.length >= 4);
    assert.ok(typeof res.data.nodes[0].latencyMs === "number");
  });

  it("GET /api/nonexistent-route should return 404 with standard NOT_FOUND error JSON", async () => {
    try {
      await axios.get(`${BASE_URL}/api/nonexistent-route`);
      assert.fail("Expected request to fail with 404");
    } catch (err) {
      assert.equal(err.response.status, 404);
      assert.equal(err.response.data.success, false);
      assert.equal(err.response.data.code, "NOT_FOUND");
    }
  });

  it("Cross-Origin: should allow requests from FRONTEND_URL with Access-Control-Allow-Origin", async () => {
    const res = await axios.get(`${BASE_URL}/api/domains/check?q=cors-test-valid`, {
      headers: { Origin: "http://localhost:3000" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers["access-control-allow-origin"], "http://localhost:3000");
    assert.equal(res.headers["access-control-allow-credentials"], "true");
  });

  it("POST /api/integrations/vercel/assign-domain should reject an inactive or deleted domain with 404", async () => {
    try {
      await axios.post(`${BASE_URL}/api/integrations/vercel/assign-domain`, {
        projectId: "prj_test_dummy",
        domain: "non-existent-released-domain.go-live.me",
      });
      assert.fail("Expected request to fail with 404");
    } catch (err) {
      assert.equal(err.response.status, 404);
      assert.equal(err.response.data.success, false);
      assert.ok(err.response.data.error.includes("not active or has been released"));
    }
  });

  it("POST /api/domains/custom-target should reject an inactive or deleted domain with 404 NOT_FOUND", async () => {
    try {
      await axios.post(`${BASE_URL}/api/domains/custom-target`, {
        name: "non-existent-released-domain",
        target: "cname.test.com",
      });
      assert.fail("Expected request to fail with 404");
    } catch (err) {
      assert.equal(err.response.status, 404);
      assert.equal(err.response.data.code, "NOT_FOUND");
    }
  });

  it("Cross-Origin: should block unauthorized origin with 403 Forbidden", async () => {
    try {
      await axios.get(`${BASE_URL}/api/domains/check?q=cors-test-invalid`, {
        headers: { Origin: "http://malicious-site.xyz" },
      });
      assert.fail("Expected request to be rejected by CORS");
    } catch (err) {
      assert.equal(err.response.status, 403);
      assert.equal(err.response.data.code, "FORBIDDEN");
      assert.ok(err.response.data.error.includes("CORS Access Denied"));
    }
  });
});
