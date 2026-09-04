const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const strictCors = require("../../middleware/cors");

describe("Strict CORS Middleware Unit Tests", () => {
  it("should allow requests with no Origin header (same-origin / server-to-server)", () => {
    const req = { headers: {} };
    const res = { setHeader: () => {} };
    let nextCalled = false;

    strictCors(req, res, (err) => {
      assert.equal(err, undefined);
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  });

  it("should set CORS headers for authorized FRONTEND_URL origin", () => {
    const headersSet = {};
    const req = {
      headers: { origin: "http://localhost:3000" },
      method: "GET",
    };
    const res = {
      setHeader: (name, val) => {
        headersSet[name] = val;
      },
    };

    let nextCalled = false;
    strictCors(req, res, (err) => {
      assert.equal(err, undefined);
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(headersSet["Access-Control-Allow-Origin"], "http://localhost:3000");
    assert.equal(headersSet["Access-Control-Allow-Credentials"], "true");
    assert.ok(headersSet["Access-Control-Allow-Methods"].includes("GET"));
  });

  it("should immediately return 204 for preflight OPTIONS requests from authorized origin", () => {
    let statusCode = null;
    let ended = false;
    const req = {
      headers: { origin: "http://localhost:3000" },
      method: "OPTIONS",
    };
    const res = {
      setHeader: () => {},
      status: (code) => {
        statusCode = code;
        return {
          end: () => {
            ended = true;
          },
        };
      },
    };

    strictCors(req, res, () => {
      assert.fail("Next should not be called for preflight OPTIONS");
    });

    assert.equal(statusCode, 204);
    assert.equal(ended, true);
  });

  it("should block unauthorized origins with ForbiddenError (403)", () => {
    const req = {
      headers: { origin: "http://evil-attacker.com" },
      method: "GET",
    };
    const res = { setHeader: () => {} };

    let caughtError = null;
    strictCors(req, res, (err) => {
      caughtError = err;
    });

    assert.ok(caughtError);
    assert.equal(caughtError.statusCode, 403);
    assert.equal(caughtError.code, "FORBIDDEN");
    assert.ok(caughtError.message.includes("CORS Access Denied"));
  });
});
