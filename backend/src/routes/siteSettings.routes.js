const express = require("express");
const router = express.Router();
const siteSettingsController = require("../controllers/siteSettingsController");

// Public Site Settings route
router.get("/", siteSettingsController.getPublicSettings);

module.exports = router;
