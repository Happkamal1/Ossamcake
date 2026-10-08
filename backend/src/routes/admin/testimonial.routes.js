const express = require("express");
const router = express.Router();
const testimonialController = require("../../controllers/testimonialController");

// Admin Testimonial CRUD
router.get("/", testimonialController.getAdminTestimonials);
router.post("/", testimonialController.createTestimonial);
router.put("/:id", testimonialController.updateTestimonial);
router.delete("/:id", testimonialController.deleteTestimonial);
router.patch("/:id/toggle-status", testimonialController.toggleTestimonialStatus);

module.exports = router;
