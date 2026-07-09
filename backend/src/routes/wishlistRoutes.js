const express = require("express");
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middlewares/authMiddlewares");

// All wishlist routes require authentication
router.use(protect);

router.route("/")
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.route("/:productId")
  .delete(removeFromWishlist);

// Keep legacy toggle endpoint for compatibility
router.post("/toggle/:cakeId", toggleWishlist);
router.post("/:cakeId", toggleWishlist); // Deprecated alias

module.exports = router;
