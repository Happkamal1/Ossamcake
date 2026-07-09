const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/dashboard.controller");

router.get("/stats", c.getStats);
router.get("/recent-orders", c.getRecentOrders);
router.get("/revenue-chart", c.getRevenueChart);
router.get("/top-products", c.getTopProducts);

module.exports = router;
