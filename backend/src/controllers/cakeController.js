const cakeService = require("../services/cakeService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get all cakes — supports filter, search, sort, pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
const getAllCakes = asyncHandler(async (req, res) => {
  const result = await cakeService.getAllCakes(req.query);
  res.status(200).json(new ApiResponse(200, result, "Cakes fetched successfully"));
});

/**
 * @desc    Get best seller cakes (Home page)
 * @route   GET /api/v1/products/best-sellers
 * @access  Public
 */
const getBestSellers = asyncHandler(async (req, res) => {
  const result = await cakeService.getAllCakes({ isBestSeller: "true", limit: 8 });
  res.status(200).json(new ApiResponse(200, result.cakes, "Best sellers fetched successfully"));
});

/**
 * @desc    Get today's specials (Home page)
 * @route   GET /api/v1/products/today-specials
 * @access  Public
 */
const getTodaySpecials = asyncHandler(async (req, res) => {
  const result = await cakeService.getAllCakes({ isTodaySpecial: "true", limit: 8 });
  res.status(200).json(new ApiResponse(200, result.cakes, "Today's specials fetched successfully"));
});

/**
 * @desc    Get single cake by MongoDB id
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getCakeById = asyncHandler(async (req, res) => {
  const cake = await cakeService.getCakeById(req.params.id);
  res.status(200).json(new ApiResponse(200, cake, "Cake fetched successfully"));
});

/**
 * @desc    Get single cake by slug
 * @route   GET /api/v1/products/slug/:slug
 * @access  Public
 */
const getCakeBySlug = asyncHandler(async (req, res) => {
  const cake = await cakeService.getCakeBySlug(req.params.slug);
  res.status(200).json(new ApiResponse(200, cake, "Cake fetched by slug successfully"));
});

/**
 * @desc    Admin: Create cake
 */
const createCake = asyncHandler(async (req, res) => {
  const cake = await cakeService.createCake(req.body);
  res.status(201).json(new ApiResponse(201, cake, "Cake created successfully"));
});

/**
 * @desc    Admin: Update cake
 */
const updateCake = asyncHandler(async (req, res) => {
  const cake = await cakeService.updateCake(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, cake, "Cake updated successfully"));
});

/**
 * @desc    Admin: Delete cake (soft delete)
 */
const deleteCake = asyncHandler(async (req, res) => {
  await cakeService.deleteCake(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Cake deleted successfully"));
});

const getTrendingCakes = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 4;
  const cakes = await cakeService.getTrendingCakes(limit);
  res.status(200).json(new ApiResponse(200, cakes, "Trending cakes fetched successfully"));
});

const getFeaturedCakes = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 8;
  const cakes = await cakeService.getFeaturedCakes(limit);
  res.status(200).json(new ApiResponse(200, cakes, "Featured cakes fetched successfully"));
});

const getNewArrivalCakes = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 8;
  const cakes = await cakeService.getNewArrivalCakes(limit);
  res.status(200).json(new ApiResponse(200, cakes, "New arrival cakes fetched successfully"));
});

const getRecommendedCakes = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 6;
  const cakes = await cakeService.getRecommendedCakes(limit);
  res.status(200).json(new ApiResponse(200, cakes, "Recommended cakes fetched successfully"));
});

const searchCakes = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const cakes = await cakeService.searchCakes(req.query.q, limit);
  res.status(200).json(new ApiResponse(200, cakes, "Cakes searched successfully"));
});

const getRelatedCakes = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 4;
  const cakes = await cakeService.getRelatedCakes(req.params.id, limit);
  res.status(200).json(new ApiResponse(200, cakes, "Related cakes fetched successfully"));
});

const getCakesByCategorySlug = asyncHandler(async (req, res) => {
  const result = await cakeService.getCakesByCategorySlug(req.params.slug, req.query);
  res.status(200).json(new ApiResponse(200, result, "Cakes in category fetched successfully"));
});

const getCakesByOccasionSlug = asyncHandler(async (req, res) => {
  const result = await cakeService.getCakesByOccasionSlug(req.params.slug, req.query);
  res.status(200).json(new ApiResponse(200, result, "Cakes in occasion fetched successfully"));
});

const getCakesByCakeTypeSlug = asyncHandler(async (req, res) => {
  const result = await cakeService.getCakesByCakeTypeSlug(req.params.slug, req.query);
  res.status(200).json(new ApiResponse(200, result, "Cakes of type fetched successfully"));
});

module.exports = {
  getAllCakes,
  getBestSellers,
  getTodaySpecials,
  getCakeById,
  getCakeBySlug,
  createCake,
  updateCake,
  deleteCake,
  getTrendingCakes,
  getFeaturedCakes,
  getNewArrivalCakes,
  getRecommendedCakes,
  searchCakes,
  getRelatedCakes,
  getCakesByCategorySlug,
  getCakesByOccasionSlug,
  getCakesByCakeTypeSlug
};