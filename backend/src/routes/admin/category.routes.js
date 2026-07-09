const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/category.controller");
const { validateCreateCategory, validateUpdateCategory } = require("../../validators/category.validator");
const validate = require("../../middlewares/validate.middleware");

router.get("/", c.getAllCategories);
router.get("/:id", c.getCategoryById);
router.post("/", validateCreateCategory, validate, c.createCategory);
router.put("/:id", validateUpdateCategory, validate, c.updateCategory);
router.delete("/:id", c.deleteCategory);

module.exports = router;
