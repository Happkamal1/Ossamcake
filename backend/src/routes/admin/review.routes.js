const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/review.controller");

router.get("/", c.getAllReviews);
router.patch("/:id/approve", c.approveReview);
router.patch("/:id", c.approveReview);
router.delete("/:id", c.deleteReview);

module.exports = router;
