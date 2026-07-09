const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/coupon.controller");
const { validateCreateCoupon, validateUpdateCoupon } = require("../../validators/coupon.validator");
const validate = require("../../middlewares/validate.middleware");

router.get("/", c.getAllCoupons);
router.get("/:id", c.getCouponById);
router.post("/", validateCreateCoupon, validate, c.createCoupon);
router.put("/:id", validateUpdateCoupon, validate, c.updateCoupon);
router.delete("/:id", c.deleteCoupon);

module.exports = router;
