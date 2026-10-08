const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");

// Public Testimonial route
router.get("/", testimonialController.getPublicTestimonials);

module.exports = router;
