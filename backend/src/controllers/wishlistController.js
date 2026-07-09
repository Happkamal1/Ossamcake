const wishlistService = require("../services/wishlistService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Protected
 */
const getWishlist = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await wishlistService.getWishlist(req.user._id, { page, limit });
  res.status(200).json(new ApiResponse(200, result, "Wishlist fetched successfully"));
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist
 * @access  Protected
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const productId = req.body.productId || req.body.cakeId;
  const wishlist = await wishlistService.addToWishlist(req.user._id, productId);
  res.status(201).json(new ApiResponse(201, wishlist, "Product added to wishlist"));
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Protected
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeFromWishlist(req.user._id, req.params.productId);
  res.status(200).json(new ApiResponse(200, wishlist, "Product removed from wishlist"));
});

/**
 * @desc    Clear user's wishlist
 * @route   DELETE /api/v1/wishlist
 * @access  Protected
 */
const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.clearWishlist(req.user._id);
  res.status(200).json(new ApiResponse(200, wishlist, "Wishlist cleared successfully"));
});

/**
 * @desc    Toggle cake in wishlist (legacy support)
 * @route   POST /api/v1/wishlist/toggle/:cakeId
 * @access  Protected
 */
const toggleWishlist = asyncHandler(async (req, res) => {
  const { action, wishlist } = await wishlistService.toggleWishlist(req.user._id, req.params.cakeId);
  const msg = action === "added" ? "Added to wishlist" : "Removed from wishlist";
  res.status(200).json(new ApiResponse(200, wishlist, msg));
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  toggleWishlist,
};
