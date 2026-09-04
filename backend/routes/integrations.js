const express = require("express");
const router = express.Router();
const integrationsController = require("../controllers/integrationsController");

// ==========================================
// 1. Vercel Integration Endpoints
// ==========================================
router.get("/vercel/url", integrationsController.getVercelAuthUrl);
router.get("/vercel/auth-url", integrationsController.getVercelAuthUrl);
router.get("/vercel/callback", integrationsController.handleVercelCallback);
router.get("/vercel/projects", integrationsController.getVercelProjects);
router.post("/vercel/verify-token", integrationsController.verifyVercelToken);
router.post("/vercel/assign-domain", integrationsController.assignVercelDomain);
router.post("/vercel/verify-domain", integrationsController.verifyVercelDomain);

// ==========================================
// 2. GitHub Pages Integration Endpoints (v1.1.0)
// ==========================================
router.get("/github/repos", integrationsController.getGitHubRepos);
router.post("/github/assign-pages", integrationsController.assignGitHubPagesDomain);
router.post("/github/verify-pages", integrationsController.verifyGitHubPagesDomain);

// ==========================================
// 3. Render Hosting Integration Endpoints (v1.1.0)
// ==========================================
router.post("/render/services", integrationsController.getRenderServices);
router.post("/render/assign-domain", integrationsController.assignRenderDomain);
router.post("/render/verify-domain", integrationsController.verifyRenderDomain);

module.exports = router;
