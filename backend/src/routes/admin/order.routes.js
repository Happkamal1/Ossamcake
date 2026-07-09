const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/order.controller");

router.get("/", c.getAllOrders);
router.get("/stats", c.getOrderStats);
router.get("/:id", c.getOrderById);
router.patch("/:id/status", c.updateOrderStatus);

module.exports = router;
