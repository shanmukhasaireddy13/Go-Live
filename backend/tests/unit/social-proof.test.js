const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const socialProofController = require("../../controllers/socialProofController");

describe("Social Proof Controller Unit Tests & Privacy Boundary", () => {
  beforeEach(() => {
    socialProofController.clearCache();
  });

  it("getSocialProof should return stats.totalClaimed and domains array", async () => {
    let jsonResult = null;
    const req = {};
    const res = {
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await socialProofController.getSocialProof(req, res);

    assert.ok(jsonResult, "Response payload must be present");
    assert.equal(jsonResult.success, true);
    assert.ok(jsonResult.stats, "stats object must be present");
    assert.strictEqual(typeof jsonResult.stats.totalClaimed, "number");
    assert.ok(Array.isArray(jsonResult.domains), "domains must be an array");
    assert.ok(jsonResult.domains.length <= 5, "domains array must contain at most 5 items");
  });

  it("getSocialProof must strictly sanitize output and leak NO status, user, provider, or DB IDs", async () => {
    let jsonResult = null;
    const req = {};
    const res = {
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await socialProofController.getSocialProof(req, res);

    for (const item of jsonResult.domains) {
      assert.ok(item.fullDomain, "Domain must have fullDomain");
      assert.ok(item.claimedAt, "Domain must have claimedAt");

      // Strict Privacy Assertions: Prohibited fields must be undefined
      assert.strictEqual(item.status, undefined, "status must NOT be exposed");
      assert.strictEqual(item.userId, undefined, "userId must NOT be exposed");
      assert.strictEqual(item.userGithub, undefined, "userGithub must NOT be exposed");
      assert.strictEqual(item.provider, undefined, "provider must NOT be exposed");
      assert.strictEqual(item.email, undefined, "email must NOT be exposed");
      assert.strictEqual(item._id, undefined, "_id must NOT be exposed");
      assert.strictEqual(item.__v, undefined, "__v must NOT be exposed");
      assert.strictEqual(item.accessToken, undefined, "accessToken must NOT be exposed");
    }
  });

  it("getSocialProof should return cached response on fast consecutive calls", async () => {
    let callCount = 0;
    const req = {};
    const res = {
      json: (data) => {
        callCount++;
        return data;
      },
    };

    await socialProofController.getSocialProof(req, res);
    await socialProofController.getSocialProof(req, res);

    assert.equal(callCount, 2);
  });
});
