const express = require("express");
const router = express.Router();
const faqController = require("../../controllers/faqController");

// Admin FAQ CRUD
router.get("/", faqController.getAdminFaqs);
router.post("/", faqController.createFaq);
router.put("/:id", faqController.updateFaq);
router.delete("/:id", faqController.deleteFaq);
router.patch("/:id/toggle-status", faqController.toggleFaqStatus);

module.exports = router;
