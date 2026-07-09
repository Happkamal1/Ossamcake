const express = require("express");
const router = express.Router();
const { placeOrder, getMyOrders, getOrder, updateOrderStatus } = require("../controllers/orderController");
const { protect, restrictTo } = require("../middlewares/authMiddlewares");

// Public — anyone with order number can track (TrackOrder.jsx)
router.get("/:orderNumber", getOrder);

// Protected
router.use(protect);
router.post("/", placeOrder);
router.get("/", getMyOrders);

// Admin
router.patch("/:id/status", restrictTo("admin"), updateOrderStatus);

module.exports = router;