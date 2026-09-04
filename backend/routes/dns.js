const express = require("express");
const router = express.Router();
const dnsController = require("../controllers/dnsController");

// DNS Anycast verification endpoint
router.get("/verify", dnsController.verifyDnsRecord);

module.exports = router;
