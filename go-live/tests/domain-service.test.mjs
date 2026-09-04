import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

describe("Frontend DomainService & API Client Unit Tests", () => {
  it("domain-service.ts should export all core subdomain lifecycle methods", () => {
    const servicePath = path.join(ROOT_DIR, "lib", "domain-service.ts");
    const content = fs.readFileSync(servicePath, "utf-8");

    assert.ok(content.includes("getStoredDomains"), "Must export getStoredDomains");
    assert.ok(content.includes("saveDomains"), "Must export saveDomains");
    assert.ok(content.includes("checkAvailabilityRemote"), "Must export checkAvailabilityRemote");
    assert.ok(content.includes("deleteSubdomainRemote"), "Must export deleteSubdomainRemote");
    assert.ok(content.includes("saveUserSession"), "Must export saveUserSession");
    assert.ok(content.includes("getCurrentUser"), "Must export getCurrentUser");
  });

  it("api.ts should export typed endpoints for auth, domains, vercel, and dns", () => {
    const apiPath = path.join(ROOT_DIR, "lib", "api.ts");
    const content = fs.readFileSync(apiPath, "utf-8");

    assert.ok(content.includes("ENDPOINTS"), "Must define ENDPOINTS dictionary");
    assert.ok(content.includes("domains: {"), "Must define domains API namespace");
    assert.ok(content.includes("vercel: {"), "Must define vercel API namespace");
    assert.ok(content.includes("dns: {"), "Must define dns API namespace");
    assert.ok(content.includes("auth: {"), "Must define auth API namespace");
  });

  it("constants.ts should declare correct domain and reserved list", () => {
    const constPath = path.join(ROOT_DIR, "lib", "constants.ts");
    const content = fs.readFileSync(constPath, "utf-8");

    assert.ok(content.includes("RESERVED_SUBDOMAINS"), "Must define RESERVED_SUBDOMAINS");
    assert.ok(content.includes("ROOT_DOMAIN"), "Must define ROOT_DOMAIN");
  });
});
