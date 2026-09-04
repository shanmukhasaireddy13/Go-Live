const express = require("express");
const router = express.Router();
const domainsController = require("../controllers/domainsController");

// Subdomain management endpoints
router.get("/check", domainsController.checkAvailability);
router.post("/claim", domainsController.claimSubdomain);
router.post("/custom-target", domainsController.updateCustomTarget);
router.post("/ping", domainsController.pingDomain);
router.get("/list", domainsController.listUserDomains);
router.delete("/:id", domainsController.deleteSubdomain);

module.exports = router;
