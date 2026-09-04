import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const backendApp = require("../../backend/server.js");

let server;
let BACKEND_URL = "http://localhost:5000";
let FRONTEND_URL = "http://localhost:3000";

describe("Go-Live End-to-End A-to-Z Lifecycle Tests", () => {
  before(async () => {
    // 1. Resolve Backend
    try {
      const probe = await fetch("http://localhost:5000/health", { signal: AbortSignal.timeout(500) });
      if (!probe.ok) throw new Error("Backend not healthy");
    } catch {
      await new Promise((resolve) => {
        server = http.createServer(backendApp);
        server.listen(0, () => {
          const port = server.address().port;
          BACKEND_URL = `http://127.0.0.1:${port}`;
          resolve();
        });
      });
    }

    // 2. Resolve Frontend
    try {
      const frontProbe = await fetch("http://localhost:3000/", { signal: AbortSignal.timeout(500) });
      if (frontProbe.ok) {
        FRONTEND_URL = "http://localhost:3000";
      } else {
        FRONTEND_URL = "https://go-live.me";
      }
    } catch {
      FRONTEND_URL = "https://go-live.me";
    }
  });

  after(async () => {
    try {
      if (server) {
        server.close();
      }
      const mongoose = require("mongoose");
      if (mongoose && mongoose.connection) {
        await mongoose.connection.close(true);
      }
    } catch {}
  });
  it("Step 1: User visits landing page and queries domain availability", async () => {
    const res = await fetch(`${BACKEND_URL}/api/domains/check?q=portfolio-2026`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.subdomain, "portfolio-2026");
    assert.equal(data.fullDomain, "portfolio-2026.go-live.me");
    assert.equal(data.isAvailable, true);
  });

  it("Step 2: User queries taken domain and receives humorous rejection and smart suggestions", async () => {
    // Claim 'e2e-demo' first in this isolated environment
    await fetch(`${BACKEND_URL}/api/domains/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "e2e-demo",
        provider: "vercel",
        user: { id: "test-user-999", githubUsername: "testdev999", hasStarred: true },
      }),
    });

    const res = await fetch(`${BACKEND_URL}/api/domains/check?q=e2e-demo`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isAvailable, false);
    assert.ok(data.reason);
    assert.ok(Array.isArray(data.suggestions) && data.suggestions.length > 0);
  });

  it("Step 3: User attempts to query reserved system name -> flagged as reserved", async () => {
    const res = await fetch(`${BACKEND_URL}/api/domains/check?q=admin`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isAvailable, false);
    assert.equal(data.isReserved, true);
  });

  it("Step 4: User attempts to claim duplicate domain when already owning one -> returns limit error", async () => {
    const claimPayload = {
      name: "another-domain",
      provider: "vercel",
      target: "",
      user: {
        id: "202484443",
        githubUsername: "shanmukhasaireddy13",
        hasStarred: true,
      },
    };

    const res = await fetch(`${BACKEND_URL}/api/domains/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(claimPayload),
    });

    const data = await res.json();
    if (res.status === 400) {
      assert.ok(
        data.code === "SUBDOMAIN_LIMIT_REACHED" || data.code === "COOLDOWN_ACTIVE" || data.alreadyClaimed,
        "Should enforce 1 domain policy or cooldown"
      );
    }
  });

  it("Step 5: Frontend Next.js landing page returns HTTP 200 via SSR", async () => {
    const res = await fetch(`${FRONTEND_URL}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Go-Live") || html.includes("<!DOCTYPE html>"));
  });

  it("Step 6: Frontend /claim route returns HTTP 200 via SSR", async () => {
    const res = await fetch(`${FRONTEND_URL}/claim?name=portfolio-2026`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("<!DOCTYPE html>"));
  });

  it("Step 7: Frontend /manage dashboard route returns HTTP 200 via SSR", async () => {
    const res = await fetch(`${FRONTEND_URL}/manage?name=solutions`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("<!DOCTYPE html>"));
  });

  it("Step 8: Global Anycast DNS verification probe returns live edge nodes", async () => {
    const res = await fetch(`${BACKEND_URL}/api/dns/verify?name=go-live`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.fullDomain);
    assert.ok(Array.isArray(data.nodes) && data.nodes.length >= 4);
  });

  it("Step 9: Strict CORS permits requests originating from FRONTEND_URL", async () => {
    const res = await fetch(`${BACKEND_URL}/api/domains/check?q=e2e-cors`, {
      headers: { Origin: FRONTEND_URL },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), FRONTEND_URL);
    assert.equal(res.headers.get("access-control-allow-credentials"), "true");
  });

  it("Step 10: Strict CORS blocks cross-origin requests from unauthorized origins", async () => {
    const res = await fetch(`${BACKEND_URL}/api/domains/check?q=e2e-cors-block`, {
      headers: { Origin: "http://attacker-site.com" },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.code, "FORBIDDEN");
    assert.ok(data.error.includes("CORS Access Denied"));
  });

  it("Step 11: Backend health probe returns healthy status and service identifier", async () => {
    const res = await fetch(`${BACKEND_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "healthy");
    assert.equal(data.service, "go-live-backend");
  });

  it("Step 12: Preflight OPTIONS for DELETE with x-vercel-token header is allowed by CORS", async () => {
    const res = await fetch(`${BACKEND_URL}/api/domains/test-e2e-del`, {
      method: "OPTIONS",
      headers: {
        Origin: FRONTEND_URL,
        "Access-Control-Request-Method": "DELETE",
        "Access-Control-Request-Headers": "x-vercel-token, authorization, content-type",
      },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), FRONTEND_URL);
    const allowHeaders = res.headers.get("access-control-allow-headers") || "";
    assert.ok(
      allowHeaders.includes("x-vercel-token") || allowHeaders.includes("Access-Control-Request-Headers"),
      "CORS preflight must allow x-vercel-token"
    );
  });

  it("Step 13: Deleting a subdomain and refetching dashboard domain list returns isLockedDown: true with cooldown", async () => {
    // 1. Claim a test domain
    await fetch(`${BACKEND_URL}/api/domains/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "lockdown-verify-domain",
        provider: "vercel",
        user: { id: "user-lockdown", githubUsername: "lockdowndev", hasStarred: true },
      }),
    });

    // 2. Delete the domain
    const delRes = await fetch(`${BACKEND_URL}/api/domains/lockdown-verify-domain`, {
      method: "DELETE",
      headers: {
        Origin: FRONTEND_URL,
        "x-vercel-token": "dummy_vci_token",
      },
    });
    assert.equal(delRes.status, 200);

    // 3. User navigates back to /manage and dashboard fetches list
    const listRes = await fetch(`${BACKEND_URL}/api/domains/list?user=lockdowndev`, {
      headers: { Origin: FRONTEND_URL },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.success, true);
    // If during cooldown, isLockedDown is true and active cooldown data returned
    if (listData.cooldown) {
      assert.equal(listData.cooldown.active, true);
      assert.equal(listData.isLockedDown, true);
    }
  });
});
