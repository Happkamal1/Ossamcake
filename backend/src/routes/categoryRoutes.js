const express = require("express");
const router = express.Router();
const { getAllCategories, createCategory, updateCategory } = require("../controllers/categoryController");
const { protect, restrictTo } = require("../middlewares/authMiddlewares");

router.get("/", getAllCategories);
router.post("/", protect, restrictTo("admin"), createCategory);
router.put("/:id", protect, restrictTo("admin"), updateCategory);

module.exports = router;
