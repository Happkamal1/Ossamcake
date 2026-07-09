const categoryService = require("../../services/admin/category.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getAllCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getAllCategories(req.query);
  res.status(200).json(new ApiResponse(200, result, MESSAGES.CATEGORIES_FETCHED));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json(new ApiResponse(200, category, "Category fetched successfully"));
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json(new ApiResponse(201, category, MESSAGES.CATEGORY_CREATED));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, category, MESSAGES.CATEGORY_UPDATED));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteCategory(req.params.id);
  res.status(200).json(new ApiResponse(200, category, MESSAGES.CATEGORY_DELETED));
});

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
