const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// GitHub OAuth endpoints
router.get("/github/url", authController.getGithubAuthUrl);
router.get("/github/callback", authController.handleGithubCallback);
router.post("/github/verify-star", authController.verifyStar);
router.get("/me", authController.getCurrentUser);

module.exports = router;
