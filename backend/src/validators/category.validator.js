const { body } = require("express-validator");

const validateCreateCategory = [
  body("name").trim().notEmpty().withMessage("Category name is required").isLength({ min: 2, max: 100 }),
  body("slug").optional().trim().matches(/^[a-z0-9-]+$/).withMessage("Slug must be lowercase letters, numbers, and hyphens only"),
  body("displayOrder").optional().isInt({ min: 0 }),
];

const validateUpdateCategory = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("slug").optional().trim().matches(/^[a-z0-9-]+$/),
  body("displayOrder").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
];

module.exports = { validateCreateCategory, validateUpdateCategory };
