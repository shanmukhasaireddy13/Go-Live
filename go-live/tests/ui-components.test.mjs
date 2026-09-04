import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

describe("Frontend UI Components & Adversarial Cleanliness Tests", () => {
  it("No component should contain technical 'soft delete' or internal DB jargon", () => {
    const componentsDir = path.join(ROOT_DIR, "components");
    const appDir = path.join(ROOT_DIR, "app");

    function scanFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanFiles(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
          const content = fs.readFileSync(fullPath, "utf-8");
          assert.ok(
            !content.includes("Soft-deleted in database"),
            `File ${fullPath} contains user-facing 'Soft-deleted in database' text`
          );
        }
      }
    }

    scanFiles(componentsDir);
    scanFiles(appDir);
  });

  it("VercelTab must render clean connected card without auto-rerouting when active", () => {
    const vercelTabPath = path.join(ROOT_DIR, "components", "manage", "VercelTab.tsx");
    const content = fs.readFileSync(vercelTabPath, "utf-8");

    assert.ok(content.includes("Successfully Connected to Vercel Project"), "Must have dedicated connected state");
    assert.ok(content.includes("Visit Live Site"), "Must provide direct live site link");
    assert.ok(content.includes("isChangingProject"), "Must support explicit project switching without auto loops");
  });

  it("CommonLockdownView must display clean Anycast slot release status and countdown", () => {
    const lockdownPath = path.join(ROOT_DIR, "components", "manage", "CommonLockdownView.tsx");
    const content = fs.readFileSync(lockdownPath, "utf-8");

    assert.ok(content.includes("CommonLockdownView"), "Must export CommonLockdownView");
    assert.ok(content.includes("COMMON LOCKOUT ACTIVE"), "Must display lockout banner");
    assert.ok(content.includes("RELEASED"), "Must show clean RELEASED badge");
  });

  it("ClaimLimitReachedCard must render existing owned domain with Direct Dashboard CTA", () => {
    const cardPath = path.join(ROOT_DIR, "components", "claim", "ClaimLimitReachedCard.tsx");
    const content = fs.readFileSync(cardPath, "utf-8");

    assert.ok(content.includes("Subdomain Limit Reached"), "Must render limit card title");
    assert.ok(content.includes("Go to Dashboard"), "Must provide Go to Dashboard CTA");
  });
});
