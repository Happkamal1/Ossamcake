const { body } = require("express-validator");

const validateCreateCoupon = [
  body("code").trim().notEmpty().withMessage("Coupon code is required").isAlphanumeric(),
  body("discountType").isIn(["percentage", "flat"]).withMessage("Discount type must be percentage or flat"),
  body("discountValue").isNumeric({ min: 0 }).withMessage("Discount value must be a positive number"),
  body("maxDiscountAmount").optional().isNumeric({ min: 0 }),
  body("minOrderAmount").optional().isNumeric({ min: 0 }),
  body("usageLimit").optional().isInt({ min: 1 }),
  body("perUserLimit").optional().isInt({ min: 1 }),
  body("expiresAt").optional().isISO8601().withMessage("Expiry date must be a valid ISO date"),
];

const validateUpdateCoupon = [
  body("discountType").optional().isIn(["percentage", "flat"]),
  body("discountValue").optional().isNumeric({ min: 0 }),
  body("isActive").optional().isBoolean(),
  body("expiresAt").optional().isISO8601(),
];

module.exports = { validateCreateCoupon, validateUpdateCoupon };
