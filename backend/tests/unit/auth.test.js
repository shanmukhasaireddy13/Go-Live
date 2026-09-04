const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const authController = require("../../controllers/authController");
const { requireAuth } = require("../../middleware/auth");

describe("Adversarial Backend Authentication & OAuth Tests", () => {
  it("getGithubAuthUrl should construct a valid GitHub OAuth URL with return path", async () => {
    const req = { query: { returnPath: "/manage?name=test-domain" } };
    let jsonResult = null;
    const res = {
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await authController.getGithubAuthUrl(req, res);
    assert.ok(jsonResult, "Should return JSON payload");
    assert.ok(jsonResult.authUrl, "Should contain authUrl");
    assert.ok(jsonResult.authUrl.includes("github.com/login/oauth/authorize"));
    assert.ok(jsonResult.authUrl.includes("client_id="));
    assert.ok(jsonResult.authUrl.includes("scope="));
  });

  it("getGithubAuthUrl should handle missing or empty returnPath safely", async () => {
    const req = { query: {} };
    let jsonResult = null;
    const res = {
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await authController.getGithubAuthUrl(req, res);
    assert.ok(jsonResult.authUrl);
  });

  it("requireAuth middleware should pass when valid Bearer token is provided", async () => {
    const req = {
      headers: {
        authorization: "Bearer valid_mock_token_12345",
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    requireAuth(req, {}, next);
    assert.equal(nextCalled, true, "next() must be called");
    assert.equal(req.authToken, "valid_mock_token_12345");
  });

  it("requireAuth middleware should reject missing authorization header and query params", async () => {
    const req = { headers: {} };
    let statusCode = null;
    let jsonResult = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResult = data;
            return data;
          },
        };
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    requireAuth(req, res, next);
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 401);
    assert.equal(jsonResult.authenticated, false);
  });
});
