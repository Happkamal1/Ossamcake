const express = require("express");
const router = express.Router();
const { updateReview, deleteReview } = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddlewares");

// All routes are protected
router.use(protect);

router.route("/:reviewId")
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
