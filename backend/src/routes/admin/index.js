const express = require("express");
const { protect, authorize } = require("../../middlewares/authMiddlewares");
const ROLES = require("../../constants/roles");

const adminRouter = express.Router();

// ── Global Admin Guards ────────────────────────────────────────────────────────
// Every route mounted below requires:
//   1. A valid JWT (protect)
//   2. The user to have role "admin" or "super_admin" (authorize)
adminRouter.use(protect);
adminRouter.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// ── Admin Sub-Routers ─────────────────────────────────────────────────────────
adminRouter.use("/dashboard",   require("./dashboard.routes"));
adminRouter.use("/products",    require("./product.routes"));
adminRouter.use("/categories",  require("./category.routes"));
adminRouter.use("/occasions",   require("./occasion.routes"));
adminRouter.use("/cake-types",  require("./cakeType.routes"));
adminRouter.use("/orders",      require("./order.routes"));
adminRouter.use("/users",       require("./user.routes"));
adminRouter.use("/reviews",     require("./review.routes"));
adminRouter.use("/coupons",     require("./coupon.routes"));
adminRouter.use("/banners",     require("./banner.routes"));
adminRouter.use("/notifications", require("./notification.routes"));
adminRouter.use("/faqs",          require("./faq.routes"));
adminRouter.use("/testimonials",  require("./testimonial.routes"));
adminRouter.use("/settings",      require("./siteSettings.routes"));

module.exports = adminRouter;
