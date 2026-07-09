const Category = require("../models/Category");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get all active categories (Shop.jsx filter sidebar)
 * @route   GET /api/v1/categories
 * @access  Public
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
  res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

/**
 * @desc    Admin: Create category
 * @route   POST /api/v1/categories
 * @access  Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, image, displayOrder } = req.body;
  const existing = await Category.findOne({ slug });
  if (existing) throw new ApiError(409, "Category with this slug already exists");

  const category = await Category.create({ name, slug, image, displayOrder });
  res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

/**
 * @desc    Admin: Update category
 * @route   PUT /api/v1/categories/:id
 * @access  Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

module.exports = { getAllCategories, createCategory, updateCategory };
