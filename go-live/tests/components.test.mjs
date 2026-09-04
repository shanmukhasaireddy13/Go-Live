import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

describe("Frontend Components Architecture & Layout Tests", () => {
  it("ManageSidebar should have sticky stationary layout and 7 primary tabs", () => {
    const sidebarPath = path.join(ROOT_DIR, "components", "manage", "ManageSidebar.tsx");
    const content = fs.readFileSync(sidebarPath, "utf-8");

    // Check sticky positioning
    assert.ok(
      content.includes("md:sticky") && content.includes("md:top-14"),
      "ManageSidebar must have md:sticky md:top-14 so it does not scroll away"
    );

    // Check tabs
    assert.ok(content.includes('onSelectTab("overview")'), "Sidebar must have overview tab");
    assert.ok(content.includes('onSelectTab("vercel")'), "Sidebar must have vercel tab");
    assert.ok(content.includes('onSelectTab("github-pages")'), "Sidebar must have github-pages tab");
    assert.ok(content.includes('onSelectTab("render")'), "Sidebar must have render tab");
    assert.ok(content.includes('onSelectTab("custom")'), "Sidebar must have custom DNS tab");
    assert.ok(content.includes('onSelectTab("health")'), "Sidebar must have health tab");
    assert.ok(content.includes('onSelectTab("danger")'), "Sidebar must have danger/release tab");

    // Verify removed duplicate user footer
    assert.ok(
      !content.includes("@{user.githubUsername}"),
      "Sidebar footer should not duplicate the username already in the topbar"
    );
  });

  it("v1.1.0 should export GitHubPagesTab and RenderTab components", () => {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "components", "manage", "GitHubPagesTab.tsx")), "GitHubPagesTab.tsx must exist");
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "components", "manage", "RenderTab.tsx")), "RenderTab.tsx must exist");
  });

  it("ManageHeader should display breadcrumbs, active domain, and star CTA", () => {
    const headerPath = path.join(ROOT_DIR, "components", "manage", "ManageHeader.tsx");
    const content = fs.readFileSync(headerPath, "utf-8");

    assert.ok(content.includes("Go-Live"), "Header must include brand logo");
    assert.ok(content.includes("Visit Site"), "Header must include Visit Site action");
    assert.ok(content.includes("Star"), "Header must include Star button");
    assert.ok(content.includes("GITHUB_REPO_URL"), "Header must link to GitHub repository");
  });

  it("Manage Page should not render any marketing footer", () => {
    const managePagePath = fs.existsSync(path.join(ROOT_DIR, "app", "(dashboard)", "manage", "page.tsx"))
      ? path.join(ROOT_DIR, "app", "(dashboard)", "manage", "page.tsx")
      : path.join(ROOT_DIR, "app", "manage", "page.tsx");
    const content = fs.readFileSync(managePagePath, "utf-8");

    assert.ok(
      !content.includes("<footer"),
      "Dashboard manage page should not have a marketing footer cluttering vertical space"
    );
  });

  it("Claim Page should include dedicated Subdomain Limit Reached state", () => {
    const claimPagePath = fs.existsSync(path.join(ROOT_DIR, "app", "(auth)", "claim", "page.tsx"))
      ? path.join(ROOT_DIR, "app", "(auth)", "claim", "page.tsx")
      : path.join(ROOT_DIR, "app", "claim", "page.tsx");
    const cardPath = path.join(ROOT_DIR, "components", "claim", "ClaimLimitReachedCard.tsx");
    const content = fs.readFileSync(claimPagePath, "utf-8");
    const cardContent = fs.existsSync(cardPath) ? fs.readFileSync(cardPath, "utf-8") : "";

    assert.ok(content.includes("isAlreadyClaimedState"), "Claim page must track isAlreadyClaimedState");
    assert.ok(
      content.includes("Subdomain Limit Reached") || cardContent.includes("Subdomain Limit Reached"),
      "Claim page must display Subdomain Limit Reached card"
    );
    assert.ok(content.includes("existingSubdomain"), "Claim page must track existingSubdomain");
  });

  it("Toaster notification must be configured to appear top-center", () => {
    const layoutPath = path.join(ROOT_DIR, "app", "layout.tsx");
    const sonnerPath = path.join(ROOT_DIR, "components", "ui", "sonner.tsx");

    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    const sonnerContent = fs.readFileSync(sonnerPath, "utf-8");

    assert.ok(
      layoutContent.includes('position="top-center"'),
      "layout.tsx Toaster must have position='top-center'"
    );
    assert.ok(
      sonnerContent.includes('position="top-center"'),
      "sonner.tsx Toaster must default to position='top-center'"
    );
  });

  it("All routes must follow Next.js App Router Route Groups ((auth), (dashboard), (marketing))", () => {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "app", "(auth)", "claim", "page.tsx")), "Claim route must be under (auth) group");
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "app", "(dashboard)", "manage", "page.tsx")), "Manage dashboard route must be under (dashboard) group");
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "app", "(marketing)", "page.tsx")), "Home landing page must be under (marketing) group");
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "app", "(marketing)", "terms", "page.tsx")), "Terms route must be under (marketing) group");
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "app", "(marketing)", "privacy", "page.tsx")), "Privacy route must be under (marketing) group");
  });

  it("Manage Page must render NoSubdomainCard when domain is null and lock out configuration", () => {
    const managePagePath = path.join(ROOT_DIR, "app", "(dashboard)", "manage", "page.tsx");
    const content = fs.readFileSync(managePagePath, "utf-8");

    assert.ok(content.includes("NoSubdomainCard"), "Must import and render NoSubdomainCard");
    assert.ok(content.includes("cooldownData"), "Must pass cooldownData to lock out deleted subdomains");
    assert.ok(!content.includes("else if (name) {\n            // Auto-claim"), "Must NOT auto-claim deleted domains on manage page");
  });

  it("Root Layout must define rich metadata, OpenGraph, Twitter cards, and SVG icons", () => {
    const layoutPath = path.join(ROOT_DIR, "app", "layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    assert.ok(content.includes("icon.svg"), "Layout must configure icon.svg favicon");
    assert.ok(content.includes("openGraph"), "Layout must configure OpenGraph metadata");
    assert.ok(content.includes("twitter"), "Layout must configure Twitter card metadata");
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "public", "icon.svg")), "public/icon.svg must exist");
    assert.ok(fs.existsSync(path.join(ROOT_DIR, "app", "icon.svg")), "app/icon.svg must exist");
  });
});

