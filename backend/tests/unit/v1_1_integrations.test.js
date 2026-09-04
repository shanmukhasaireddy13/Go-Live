const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const integrationsController = require("../../controllers/integrationsController");

describe("v1.1.0 GitHub Pages & Render Integration Unit Tests", () => {
  it("getGitHubRepos should return 401 when token is missing", async () => {
    const req = { headers: {}, query: {} };
    let statusSent = 200;
    let jsonResult = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await integrationsController.getGitHubRepos(req, res);
    assert.equal(statusSent, 401);
    assert.equal(jsonResult.success, false);
    assert.ok(jsonResult.error.includes("GitHub authentication token is required"));
  });

  it("assignGitHubPagesDomain should reject missing required parameters", async () => {
    const invalidBodies = [
      {},
      { subdomain: "test" },
      { subdomain: "test", repoOwner: "octocat" },
      { repoOwner: "octocat", repoName: "docs" },
    ];

    for (const body of invalidBodies) {
      const req = { body, headers: {} };
      let statusSent = 200;
      let jsonResult = null;
      const res = {
        status: (code) => {
          statusSent = code;
          return res;
        },
        json: (data) => {
          jsonResult = data;
          return data;
        },
      };

      await integrationsController.assignGitHubPagesDomain(req, res);
      assert.equal(statusSent, 400);
      assert.equal(jsonResult.success, false);
    }
  });

  it("verifyGitHubPagesDomain should validate required repo parameters", async () => {
    const req = { body: {}, headers: {} };
    let statusSent = 200;
    let jsonResult = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await integrationsController.verifyGitHubPagesDomain(req, res);
    assert.equal(statusSent, 400);
    assert.equal(jsonResult.success, false);
  });

  it("getRenderServices should reject empty API key with 400", async () => {
    const req = { body: {} };
    let statusSent = 200;
    let jsonResult = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await integrationsController.getRenderServices(req, res);
    assert.equal(statusSent, 400);
    assert.equal(jsonResult.success, false);
    assert.ok(jsonResult.error.includes("Render API key is required"));
  });

  it("assignRenderDomain should reject missing service parameters", async () => {
    const invalidBodies = [
      {},
      { apiKey: "rnd_123" },
      { apiKey: "rnd_123", serviceId: "srv-456" },
      { serviceId: "srv-456", subdomain: "test" },
    ];

    for (const body of invalidBodies) {
      const req = { body };
      let statusSent = 200;
      let jsonResult = null;
      const res = {
        status: (code) => {
          statusSent = code;
          return res;
        },
        json: (data) => {
          jsonResult = data;
          return data;
        },
      };

      await integrationsController.assignRenderDomain(req, res);
      assert.equal(statusSent, 400);
      assert.equal(jsonResult.success, false);
    }
  });

  it("verifyRenderDomain should reject missing identification keys", async () => {
    const req = { body: { apiKey: "rnd_123" } };
    let statusSent = 200;
    let jsonResult = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonResult = data;
        return data;
      },
    };

    await integrationsController.verifyRenderDomain(req, res);
    assert.equal(statusSent, 400);
    assert.equal(jsonResult.success, false);
  });
});
