const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const axios = require("axios");
const mongoose = require("mongoose");
const app = require("../../server");

let server;
let BASE_URL;

describe("Social Proof Integration Test Suite", () => {
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
  });

  it("GET /api/social-proof should return HTTP 200 with sanitized totalClaimed and domains array", async () => {
    const res = await axios.get(`${BASE_URL}/api/social-proof`);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.stats);
    assert.strictEqual(typeof res.data.stats.totalClaimed, "number");
    assert.ok(Array.isArray(res.data.domains));
    assert.ok(res.data.domains.length <= 5, "domains array must contain at most 5 items");

    for (const item of res.data.domains) {
      assert.ok(item.fullDomain);
      assert.ok(item.claimedAt);

      // Verify privacy filtering over HTTP API
      assert.strictEqual(item.status, undefined);
      assert.strictEqual(item.userId, undefined);
      assert.strictEqual(item.userGithub, undefined);
      assert.strictEqual(item.provider, undefined);
      assert.strictEqual(item.email, undefined);
      assert.strictEqual(item._id, undefined);
      assert.strictEqual(item.accessToken, undefined);
    }
  });
});
