import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime()) || diffSecs < 0) return "recently";
  if (diffSecs < 60) return "just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

describe("Social Proof Component Architecture & Privacy Tests", () => {
  it("SocialProofSection.tsx must exist, limit domains to top 5, and contain minimal social proof elements", () => {
    const compPath = path.join(ROOT_DIR, "components", "SocialProofSection.tsx");
    assert.ok(fs.existsSync(compPath), "SocialProofSection.tsx file must exist");

    const content = fs.readFileSync(compPath, "utf-8");

    // Must include exact header string
    assert.ok(
      content.includes("Developers going live"),
      "SocialProofSection must include header text"
    );

    // Must include top 5 slicing restriction
    assert.ok(
      content.includes("slice(0, 5)"),
      "SocialProofSection must explicitly restrict rendering to top 5 domains"
    );

    // Assert strictly NO status badge or provider details in component UI
    assert.ok(
      !content.includes("ACTIVE") && !content.includes("INACTIVE"),
      "SocialProofSection must NOT render ACTIVE/INACTIVE status badges"
    );
    assert.ok(
      !content.includes("provider") && !content.includes("vercel"),
      "SocialProofSection must NOT include provider or hosting data"
    );
    assert.ok(
      !content.includes("userGithub") && !content.includes("userId"),
      "SocialProofSection must NOT include user identity fields"
    );
  });

  it("formatRelativeTime should accurately format timestamps into compact relative strings", () => {
    const now = new Date();

    const justNowISO = new Date(now.getTime() - 1000 * 10).toISOString();
    assert.equal(formatRelativeTime(justNowISO), "just now");

    const minsAgoISO = new Date(now.getTime() - 1000 * 60 * 5).toISOString();
    assert.equal(formatRelativeTime(minsAgoISO), "5m ago");

    const hoursAgoISO = new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString();
    assert.equal(formatRelativeTime(hoursAgoISO), "3h ago");

    const yesterdayISO = new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString();
    assert.equal(formatRelativeTime(yesterdayISO), "1d ago");

    const daysAgoISO = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString();
    assert.equal(formatRelativeTime(daysAgoISO), "4d ago");
  });
});
