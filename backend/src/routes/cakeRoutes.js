const express = require("express");
const router = express.Router();
const {
  getAllCakes, getBestSellers, getTodaySpecials, getCakeById, getCakeBySlug,
  createCake, updateCake, deleteCake,
  getTrendingCakes, getFeaturedCakes, getNewArrivalCakes, getRecommendedCakes,
  searchCakes, getRelatedCakes, getCakesByCategorySlug, getCakesByOccasionSlug,
  getCakesByCakeTypeSlug
} = require("../controllers/cakeController");
const { protect, restrictTo } = require("../middlewares/authMiddlewares");

// Public routes
router.get("/best-sellers", getBestSellers);
router.get("/today-specials", getTodaySpecials);
router.get("/trending", getTrendingCakes);
router.get("/featured", getFeaturedCakes);
router.get("/new-arrivals", getNewArrivalCakes);
router.get("/recommended", getRecommendedCakes);
router.get("/search", searchCakes);
router.get("/related/:id", getRelatedCakes);
router.get("/category/:slug", getCakesByCategorySlug);
router.get("/occasion/:slug", getCakesByOccasionSlug);
router.get("/cake-type/:slug", getCakesByCakeTypeSlug);
router.get("/slug/:slug", getCakeBySlug);
router.get("/:id", getCakeById);
router.get("/", getAllCakes);

// Review subroutes (GET product reviews, POST product review)
const { getProductReviews, createProductReview } = require("../controllers/reviewController");
router.get("/:productId/reviews", getProductReviews);
router.post("/:productId/reviews", protect, createProductReview);

// Admin-only routes (fallback for old admin actions)
router.post("/", protect, restrictTo("admin"), createCake);
router.put("/:id", protect, restrictTo("admin"), updateCake);
router.delete("/:id", protect, restrictTo("admin"), deleteCake);

module.exports = router;