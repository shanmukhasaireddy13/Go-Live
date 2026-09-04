const express = require("express");
const router = express.Router();
const socialProofController = require("../controllers/socialProofController");

// Public social proof endpoint
router.get("/", socialProofController.getSocialProof);

module.exports = router;
