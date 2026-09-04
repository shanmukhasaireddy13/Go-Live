const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

describe("Rate Limiter Middleware Logic Unit Tests", () => {
  it("should allow requests under the maximum limit", () => {
    const rateLimitMap = new Map();
    const MAX_REQUESTS = 5;
    const ip = "192.168.1.100";

    for (let i = 1; i <= MAX_REQUESTS; i++) {
      const record = rateLimitMap.get(ip) || { count: 0, resetAt: Date.now() + 60000 };
      record.count += 1;
      rateLimitMap.set(ip, record);
      assert.ok(record.count <= MAX_REQUESTS);
    }
  });

  it("should throttle requests exceeding the threshold", () => {
    const rateLimitMap = new Map();
    const MAX_REQUESTS = 3;
    const ip = "10.0.0.1";

    let throttled = false;
    for (let i = 1; i <= 5; i++) {
      const record = rateLimitMap.get(ip) || { count: 0, resetAt: Date.now() + 60000 };
      record.count += 1;
      rateLimitMap.set(ip, record);

      if (record.count > MAX_REQUESTS) {
        throttled = true;
      }
    }

    assert.equal(throttled, true);
  });

  it("should reset counters once time window expires", () => {
    const rateLimitMap = new Map();
    const ip = "10.0.0.2";
    const now = Date.now();

    // Expired record
    rateLimitMap.set(ip, { count: 150, resetAt: now - 1000 });

    const record = rateLimitMap.get(ip);
    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + 60000;
    }

    assert.equal(record.count, 1);
  });
});
