const express = require("express");
const router = express.Router();
const siteSettingsController = require("../../controllers/siteSettingsController");

// Admin Site Settings
router.get("/", siteSettingsController.getAdminSettings);
router.put("/", siteSettingsController.updateAdminSettings);

module.exports = router;
