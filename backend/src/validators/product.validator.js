const { body, param } = require("express-validator");

const validateCreateProduct = [
  body("name").trim().notEmpty().withMessage("Product name is required").isLength({ min: 3, max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("basePrice").isNumeric({ min: 0 }).withMessage("Base price must be a positive number"),
  body("discount").optional().isInt({ min: 0, max: 100 }).withMessage("Discount must be between 0 and 100"),
  body("thumbnail").trim().notEmpty().withMessage("Thumbnail image URL is required"),
  body("variants").isArray({ min: 1 }).withMessage("At least one variant is required"),
  body("variants.*.flavor").trim().notEmpty().withMessage("Each variant must have a flavor"),
  body("variants.*.size").trim().notEmpty().withMessage("Each variant must have a size"),
  body("variants.*.price").isNumeric({ min: 0 }).withMessage("Each variant must have a valid price"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Status must be active or inactive"),
];

const validateUpdateProduct = [
  body("name").optional().trim().isLength({ min: 3, max: 200 }),
  body("basePrice").optional().isNumeric({ min: 0 }),
  body("discount").optional().isInt({ min: 0, max: 100 }),
  body("status").optional().isIn(["active", "inactive"]),
];

const validateToggleFlag = [
  body("flag")
    .notEmpty()
    .isIn(["isBestSeller", "isTodaySpecial", "isFeatured", "isTrending", "isNewArrival"])
    .withMessage("Invalid flag name"),
  body("value").isBoolean().withMessage("Value must be a boolean"),
];

module.exports = { validateCreateProduct, validateUpdateProduct, validateToggleFlag };
