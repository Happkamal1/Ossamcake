const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");

// Public FAQ route
router.get("/", faqController.getPublicFaqs);

module.exports = router;
