const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/product.controller");
const { validateCreateProduct, validateUpdateProduct, validateToggleFlag } = require("../../validators/product.validator");
const validate = require("../../middlewares/validate.middleware");
const { uploadProductImage } = require("../../middlewares/uploadMiddleware");

// GET /api/v1/admin/products?page=&limit=&sort=&search=&status=&category=
router.get("/", c.getAllProducts);
router.get("/:id", c.getProductById);
router.post("/", validateCreateProduct, validate, c.createProduct);
router.put("/:id", validateUpdateProduct, validate, c.updateProduct);
router.patch("/:id/toggle-flag", validateToggleFlag, validate, c.toggleFlag);
router.delete("/:id", c.softDeleteProduct);
router.delete("/:id/permanent", c.hardDeleteProduct);
router.post("/upload", uploadProductImage, c.uploadImage);

module.exports = router;
