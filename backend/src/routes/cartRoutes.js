const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon } = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddlewares");

// All cart routes are protected
router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/coupon", applyCoupon);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;